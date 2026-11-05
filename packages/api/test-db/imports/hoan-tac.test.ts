// Hoàn tác cả lần nhập qua API trên Postgres thật (hàng 66 nhap-hoan-tac, E1, E2, E3b, E4b, E5, E6, E7b, E7d). Lần nhập ghi
// bằng đường thật (POST /imports rồi /rows), dòng dựng bằng lõi thật (`readTable` + `planFromDictionary`); tên `[Tên]`, số
// `0900 000 0xx`.
import { foldListing } from "@quy-hang/core/listing";
import { planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { withCompany } from "../../src/db";
import { API_ERRORS } from "../../src/errors";
import { loadEvents, STATE_COLUMNS, voidListing } from "../../src/listings/store";
import { docVaoDungTin } from "../../src/today-buyer/store";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN, themAnhThat } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const send = (method: string, path: string, body: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

type Nguoi = { userId: string; cookie: string };
async function sanMoi(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} ht ${ten}]`, mail(`ht-${ten}-qt`));
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`ht-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return {
    companyId: s.companyId,
    dauChu: await them(["listing_agent"], "dc"),
    dauChuB: await them(["listing_agent"], "dc2"),
    dauKhach: await them(["buyer_agent"], "dk"),
    truongNhom: await them(["team_lead"], "tn"),
  };
}

const TIEU_DE = ["Toà", "Mã căn", "Giá", "Phí", "Tình trạng", "Chủ nhà", "SĐT chủ", "Ngày xác nhận"];
type Dong = { ma: string; gia?: Cell; phi?: Cell; tt?: Cell; chu?: Cell; so?: Cell; ngay?: Cell; boQua?: boolean };
const toaCua = (ma: string) => (ma.startsWith("B") ? "Toà B" : "Toà A");
const o = (d: Dong): Cell[] => [toaCua(d.ma), d.ma, d.gia === undefined ? "3,2 tỷ" : d.gia, d.phi === undefined ? "bao phí" : d.phi, d.tt ?? null, d.chu ?? null, d.so ?? null, d.ngay ?? null];

const CAN = ["A", "B"].flatMap((t) => Array.from({ length: 90 }, (_, i) => `${t}-${String(Math.floor(i / 6) + 1).padStart(2, "0")}.${String((i % 6) + 1).padStart(2, "0")}`));
let soCan = 0;
const maMoi = () => CAN[soCan++ % CAN.length]!;

let soTep = 0;
/** Ghi một lần nhập trọn (mở, ghi mọi dòng) bằng đường thật; trả mã lần nhập và kết quả từng dòng. */
async function nhap(cookie: string, dong: Dong[]) {
  const luoi: Cell[][] = [TIEU_DE, ...dong.map(o)];
  const bang = readTable(luoi);
  const mo = await send(
    "POST",
    "/api/v1/imports",
    {
      fileName: `[Tệp ht ${++soTep}].xlsx`,
      fileHash: createHash("sha256").update(`${RUN}-ht-${soTep}`).digest("hex"),
      fileKind: "xlsx",
      headers: bang.headers,
      headerRow: 0,
      plan: planFromDictionary(bang),
      units: dong.map((d, i) => ({ row: i + 2, buildingName: toaCua(d.ma), unitNumber: d.ma })),
    },
    cookie,
  );
  assert.equal(mo.status, 201, await mo.clone().text());
  const id = ((await mo.json()) as { id: string }).id;
  const rows = dong.map((d, i) => ({ row: i + 2, cells: o(d), ...(d.boQua && { skip: true }) }));
  const r = await send("POST", `/api/v1/imports/${id}/rows`, { dryRun: false, rows }, cookie);
  assert.equal(r.status, 200, await r.clone().text());
  const kq = (await r.json()) as { rows: { row: number; action: string; listingId?: string }[] };
  return { id, rows: kq.rows };
}

type KetQua = { importId: string; status: string; go: number; traGia: number; khongDuoc: number; danhSach: { rowNumber: number; buildingName: string | null; unitNumber: string | null; lyDo: string }[] };
const hoanTac = (cookie: string, id: string, dryRun = false) => send("POST", `/api/v1/imports/${id}/undo`, { dryRun }, cookie);
async function hoanTacOk(cookie: string, id: string, dryRun = false): Promise<KetQua> {
  const r = await hoanTac(cookie, id, dryRun);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as KetQua;
}

const suKien = async (id: string) =>
  (await appPool.query<{ seq: number; type: string; payload: unknown; confirmed_with_owner: boolean; import_id: string | null }>(
    "select seq, type, payload, confirmed_with_owner, import_id from listing_events where listing_id = $1 order by seq",
    [id],
  )).rows;
const hang = async (id: string) =>
  (await appPool.query<{ standard_status: string; voided: boolean; list_price: string | null; fee_inclusion: string | null; last_confirmed_at: Date | null; version: number }>(
    "select standard_status, voided, list_price, fee_inclusion, last_confirmed_at, version from listings where id = $1",
    [id],
  )).rows[0]!;
const demSuKienSan = async (companyId: string) => (await appPool.query<{ n: number }>("select count(*)::int n from listing_events where company_id = $1", [companyId])).rows[0]!.n;
const idCua = (rows: { row: number; listingId?: string }[], row: number) => rows.find((r) => r.row === row)!.listingId!;
const bangHang = async (cookie: string) => ((await (await send("GET", "/api/v1/listings", undefined, cookie)).json()) as { id: string }[]).map((h) => h.id);

/** Hàng có sẵn qua API, người tạo giữ căn; `dangBan` thì lên Đang bán (giá 3 tỷ, không bao phí). */
async function hangCo(cookie: string, ma: string, dangBan: boolean): Promise<string> {
  const tao = await send("POST", "/api/v1/listings", { buildingName: toaCua(ma), unitNumber: ma }, cookie);
  assert.equal(tao.status, 201);
  let h = (await tao.json()) as { id: string; version: number };
  const id = h.id;
  const buoc = async (type: string, payload: Record<string, unknown>) => {
    const r = await send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: h.version }, cookie);
    assert.equal(r.status, 200, await r.clone().text());
    h = (await r.json()) as { id: string; version: number };
  };
  const chu = await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên] Có sẵn" }, cookie);
  assert.equal(chu.status, 200, await chu.clone().text());
  if (dangBan) {
    await themAnhThat(id);
    await buoc("price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" });
    await buoc("details_changed", { legalStatus: "pink_book", occupantType: "vacant" });
    await buoc("status_changed", { to: "Active" });
  }
  return id;
}
const lenh = async (cookie: string, id: string, type: string, payload: Record<string, unknown>) => {
  const v = (await hang(id)).version;
  return send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: v }, cookie);
};

test("hoàn tác: gỡ hàng lần nhập tạo", async () => {
  const s = await sanMoi("e1");
  const { id, rows } = await nhap(s.dauChu.cookie, [{ ma: maMoi() }, { ma: maMoi(), gia: null, phi: null }, { ma: maMoi(), tt: "Tạm ngừng" }]);
  const ids = [idCua(rows, 2), idCua(rows, 3), idCua(rows, 4)];
  const trangThai = await Promise.all(ids.map(async (h) => (await hang(h)).standard_status));
  assert.deepEqual(trangThai, ["Incomplete", "Incomplete", "Hold"], "trạng thái do lần nhập đặt, đọc lại trước khi hoàn tác");
  const truoc = await Promise.all(ids.map(suKien));
  const thu = (await hangCo(s.dauChu.cookie, maMoi(), false)) as string;
  await hoanTacOk(s.dauChu.cookie, id);
  for (const [i, h] of ids.entries()) {
    const sau = await suKien(h);
    assert.equal(sau.length, truoc[i]!.length + 1, `hàng ${i + 1}: đúng một sự kiện mới`);
    assert.deepEqual([sau.at(-1)!.type, sau.at(-1)!.payload], ["voided", {}], `hàng ${i + 1}: sự kiện cuối là voided {}`);
    assert.deepEqual(sau.slice(0, -1), truoc[i], `hàng ${i + 1}: sự kiện cũ giữ nguyên`);
    assert.equal((await hang(h)).standard_status, trangThai[i], `hàng ${i + 1}: trạng thái không đổi`);
    assert.equal((await hang(h)).voided, true, `hàng ${i + 1}: voided`);
  }
  const bh = await bangHang(s.dauChu.cookie);
  for (const h of ids) assert.ok(!bh.includes(h), `Bảng hàng không còn ${h}`);
  assert.ok(bh.includes(thu), "đối chứng: hàng tạo tay vẫn ở Bảng hàng");
});

test("hoàn tác: căn đã gỡ ra khỏi Hôm nay, Đã gửi, trang khách", async () => {
  // Hàng do lần nhập tạo không lên được Đang bán khi chưa ai sửa (lần nhập không ghi pháp lý, hiện trạng) — chỗ đọc của căn
  // Đang bán được thử bằng cách gỡ thẳng qua cửa gỡ của store hàng, cùng cửa đường hoàn tác gọi.
  const s = await sanMoi("e1b");
  const goId = await hangCo(s.dauChu.cookie, maMoi(), true);
  const conId = await hangCo(s.dauChu.cookie, maMoi(), true);
  const g = await send("POST", "/api/v1/shares", { audience: "agents", prospectId: null, listingIds: [goId, conId] }, s.dauKhach.cookie);
  assert.equal(g.status, 201, await g.clone().text());
  const lanGui = (await g.json()) as { id: string; code: string };
  const v = (await hang(goId)).version;
  await withCompany(appPool, { userId: s.dauChu.userId, companyId: s.companyId }, (tx) => voidListing(tx, goId, v));
  // Hôm nay của đầu khách: căn vừa lên Đang bán mà máy gợi ý — đọc thẳng đầu vào của bộ dựng tin.
  const vao = await withCompany(appPool, { userId: s.dauKhach.userId, companyId: s.companyId }, (tx) => docVaoDungTin(tx, s.dauKhach.userId, new Date()));
  const homNayIds = vao.activeSau.map((c) => c.id);
  assert.ok(!homNayIds.includes(goId), "Hôm nay của đầu khách không còn căn đã gỡ");
  assert.ok(homNayIds.includes(conId), "đối chứng: Hôm nay còn căn kia");
  const ct = (await (await send("GET", `/api/v1/shares/${lanGui.id}`, undefined, s.dauKhach.cookie)).json()) as { listings: { id: string }[] };
  assert.deepEqual(ct.listings.map((l) => l.id), [conId], "Đã gửi không còn căn đã gỡ");
  const trang = await send("GET", `/api/v1/public/shares/${lanGui.code}`, undefined);
  assert.equal(trang.status, 200);
  const than = JSON.stringify(await trang.json());
  assert.ok(than.includes("unavailable"), "trang khách báo căn không còn");
  assert.ok(!than.includes("3000000000") || than.split("3000000000").length - 1 === 1, "căn đã gỡ không ra giá");
});

test("hoàn tác: trả giá cũ cho hàng có sẵn", async () => {
  const s = await sanMoi("e2");
  const ma = maMoi();
  const h = await hangCo(s.dauChu.cookie, ma, true);
  const t0 = (await hang(h)).last_confirmed_at;
  const { id } = await nhap(s.dauChu.cookie, [{ ma }]);
  assert.equal(Number((await hang(h)).list_price), 3_200_000_000, "lần nhập đã đổi giá");
  const ma2 = maMoi();
  const h2 = await hangCo(s.dauChu.cookie, ma2, true);
  const lan2 = await nhap(s.dauChu.cookie, [{ ma: ma2, gia: null, phi: null, ngay: "2026-10-01" }]);
  const t2 = (await hang(h2)).last_confirmed_at;
  await hoanTacOk(s.dauChu.cookie, id);
  const cuoi = (await suKien(h)).at(-1)!;
  assert.deepEqual([cuoi.type, cuoi.payload], ["price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" }], "sự kiện bù trả giá cũ");
  assert.equal(cuoi.confirmed_with_owner, false, "sự kiện bù không xác nhận với chủ");
  assert.equal(cuoi.import_id, null, "sự kiện bù không mang import_id");
  assert.deepEqual((await hang(h)).last_confirmed_at, t0, "last_confirmed_at không đổi");
  assert.equal(Number((await hang(h)).list_price), 3_000_000_000);
  const kq2 = await hoanTacOk(s.dauChu.cookie, lan2.id);
  assert.deepEqual((await hang(h2)).last_confirmed_at, t2, "độ tươi của lần nhập có cột ngày giữ nguyên");
  assert.ok(kq2.danhSach.some((d) => d.lyDo === "Độ tươi theo ngày trong file vẫn giữ"), "liệt kê độ tươi vẫn giữ");
});

test("hoàn tác: căn sửa sau lần nhập được liệt kê, không gỡ", async () => {
  const s = await sanMoi("e3");
  const ma3 = maMoi();
  const h3 = await hangCo(s.dauChu.cookie, ma3, true);
  const [ma1, ma2] = [maMoi(), maMoi()];
  const { id, rows } = await nhap(s.dauChu.cookie, [{ ma: ma1 }, { ma: ma2 }, { ma: ma3 }]);
  const [h1, h2] = [idCua(rows, 2), idCua(rows, 3)];
  // Sửa sau lần nhập — kể cả của chính người nhập (Hỏi-4).
  assert.equal((await lenh(s.dauChu.cookie, h1, "details_changed", { furnished: "Cơ bản" })).status, 200);
  assert.equal((await lenh(s.dauChu.cookie, h3, "price_changed", { listPrice: 3_100_000_000, feeInclusion: "excluded" })).status, 200);
  const [n1, n3] = [(await suKien(h1)).length, (await suKien(h3)).length];
  const kq = await hoanTacOk(s.dauChu.cookie, id);
  assert.equal((await suKien(h1)).length, n1, "H1 không có sự kiện mới");
  assert.equal((await suKien(h3)).length, n3, "H3 không có sự kiện mới");
  assert.equal((await hang(h2)).voided, true, "H2 vẫn được gỡ");
  assert.deepEqual(
    kq.danhSach,
    [
      { rowNumber: 2, buildingName: toaCua(ma1), unitNumber: ma1, lyDo: "Đã có người sửa sau lần nhập" },
      { rowNumber: 4, buildingName: toaCua(ma3), unitNumber: ma3, lyDo: "Đã có người sửa sau lần nhập" },
    ],
    "liệt kê H1, H3",
  );
});

test("hoàn tác: phần không hoàn tác được qua đường ghi thật", async () => {
  const s = await sanMoi("e4");
  const maChuaGia = maMoi();
  const hChuaGia = await hangCo(s.dauChu.cookie, maChuaGia, false);
  const maKhac = maMoi();
  await hangCo(s.dauChuB.cookie, maKhac, true);
  const maNgay = maMoi();
  await hangCo(s.dauChu.cookie, maNgay, true);
  const { id } = await nhap(s.dauChu.cookie, [
    { ma: maKhac, so: "0900 000 012" },
    { ma: maNgay, gia: null, phi: null, ngay: "2026-10-01" },
    { ma: maChuaGia },
    { ma: maMoi(), boQua: true },
  ]);
  const hd = (await appPool.query<{ action: string }>("select action from import_rows where import_id = $1 order by row_number", [id])).rows.map((r) => r.action);
  assert.deepEqual(hd, ["supplement", "update", "update", "skip"], "hành động từng dòng do lần nhập ghi");
  const lead = (await appPool.query<{ n: number }>("select count(*)::int n from import_rows r join leads l on l.id = r.lead_id where r.import_id = $1", [id])).rows[0]!.n;
  const truoc = await demSuKienSan(s.companyId);
  const kq = await hoanTacOk(s.dauChu.cookie, id);
  assert.equal(kq.danhSach.find((d) => d.rowNumber === 4)?.lyDo, "Trước lần nhập căn chưa có giá", "dòng đổi giá cho căn chưa có giá");
  assert.deepEqual(
    kq.danhSach.map((d) => [d.rowNumber, d.lyDo]),
    [
      [2, "Tin bổ sung đã gửi — không thu lại"],
      [3, "Độ tươi theo ngày trong file vẫn giữ"],
      [4, "Trước lần nhập căn chưa có giá"],
    ],
  );
  assert.ok(!kq.danhSach.some((d) => d.rowNumber === 5), "dòng bỏ qua không liệt kê");
  assert.equal(await demSuKienSan(s.companyId), truoc, "không sự kiện mới");
  assert.equal(
    (await appPool.query<{ n: number }>("select count(*)::int n from import_rows r join leads l on l.id = r.lead_id where r.import_id = $1", [id])).rows[0]!.n,
    lead,
    "lead của tin bổ sung còn nguyên",
  );
  assert.equal((await hang(hChuaGia)).list_price !== null, true, "giá lần nhập ghi cho căn chưa có giá vẫn giữ");
});

test("hoàn tác: xem thử không ghi, ghi khớp xem thử", async () => {
  const s = await sanMoi("e5");
  const maCo = maMoi();
  await hangCo(s.dauChu.cookie, maCo, true);
  const maKhac = maMoi();
  await hangCo(s.dauChuB.cookie, maKhac, true);
  const { id } = await nhap(s.dauChu.cookie, [{ ma: maMoi() }, { ma: maMoi() }, { ma: maCo }, { ma: maKhac, so: "0900 000 013" }]);
  const truoc = await demSuKienSan(s.companyId);
  const xem = await hoanTacOk(s.dauChu.cookie, id, true);
  assert.deepEqual([xem.go, xem.traGia, xem.khongDuoc, xem.danhSach.length], [2, 1, 1, 1], "xem thử: gỡ 2, trả giá 1, 1 không được");
  assert.equal(await demSuKienSan(s.companyId), truoc, "xem thử: số sự kiện của sàn trước = sau");
  assert.equal((await appPool.query<{ status: string }>("select status from imports where id = $1", [id])).rows[0]!.status, "committed");
  const ghi = await hoanTacOk(s.dauChu.cookie, id);
  assert.deepEqual([ghi.go, ghi.traGia, ghi.khongDuoc, ghi.danhSach], [xem.go, xem.traGia, xem.khongDuoc, xem.danhSach], "ghi khớp xem thử");
  assert.equal(await demSuKienSan(s.companyId), truoc + 3, "ghi: đúng 3 sự kiện mới");
});

test("hoàn tác: một lần, gọi lại được, chỉ người nhập", async () => {
  const s = await sanMoi("e6");
  const B = await sanMoi("e6b");
  const { id, rows } = await nhap(s.dauChu.cookie, [{ ma: maMoi() }, { ma: maMoi() }, { ma: maMoi() }]);
  const ids = [2, 3, 4].map((r) => idCua(rows, r));
  const demVoided = async (h: string) => (await suKien(h)).filter((e) => e.type === "voided").length;
  const cu = { env: process.env.NODE_ENV, dut: process.env.QH_THU_DUT_HOAN_TAC_SAU };
  process.env.NODE_ENV = "test";
  process.env.QH_THU_DUT_HOAN_TAC_SAU = "2";
  try {
    const r = await hoanTac(s.dauChu.cookie, id);
    assert.equal(r.status, 503, "đứt giữa chừng");
    assert.deepEqual(await r.json(), { error: API_ERRORS.importUndoIncomplete.code });
  } finally {
    process.env.NODE_ENV = cu.env;
    if (cu.dut === undefined) delete process.env.QH_THU_DUT_HOAN_TAC_SAU;
    else process.env.QH_THU_DUT_HOAN_TAC_SAU = cu.dut;
  }
  assert.deepEqual(await Promise.all(ids.map(demVoided)), [1, 1, 0], "đứt sau dòng 2: H1, H2 đã gỡ, H3 chưa");
  assert.equal((await appPool.query<{ status: string }>("select status from imports where id = $1", [id])).rows[0]!.status, "committed");
  await hoanTacOk(s.dauChu.cookie, id);
  assert.deepEqual(await Promise.all(ids.map(demVoided)), [1, 1, 1], "gọi lại: H3 gỡ, H1, H2 vẫn đúng một voided");
  const lan = (await appPool.query<{ status: string; undone_by: string }>("select status, undone_by from imports where id = $1", [id])).rows[0]!;
  assert.deepEqual([lan.status, lan.undone_by], ["undone", s.dauChu.userId]);
  const truoc = await demSuKienSan(s.companyId);
  const lan2 = await hoanTacOk(s.dauChu.cookie, id);
  const lan3 = await hoanTacOk(s.dauChu.cookie, id);
  assert.equal(await demSuKienSan(s.companyId), truoc, "gọi lần ba: không sự kiện mới");
  assert.deepEqual(lan3, lan2);
  for (const [ten, nguoi] of [["Đầu chủ khác", s.dauChuB], ["Trưởng nhóm", s.truongNhom]] as const) {
    assert.equal((await hoanTac(nguoi.cookie, id)).status, 404, `${ten}: hoàn tác`);
    assert.equal((await hoanTac(nguoi.cookie, id, true)).status, 404, `${ten}: xem thử`);
  }
  assert.equal((await hoanTac(B.dauChu.cookie, id)).status, 404, "sàn khác");
  const dk = await hoanTac(s.dauKhach.cookie, id);
  assert.equal(dk.status, 403);
  assert.deepEqual(await dk.json(), { error: API_ERRORS.importRoleRequired.code });
});

test("hoàn tác: lần nhập nhiều gói đứt giữa chừng rồi làm tiếp", async () => {
  const s = await sanMoi("rf1");
  const dong = Array.from({ length: 120 }, () => ({ ma: maMoi() }));
  const { id, rows } = await nhap(s.dauChu.cookie, dong);
  const tao = rows.filter((r) => r.action === "create").map((r) => r.listingId!);
  const cu = { env: process.env.NODE_ENV };
  process.env.NODE_ENV = "test";
  process.env.QH_THU_DUT_HOAN_TAC_SAU = "70";
  try {
    assert.equal((await hoanTac(s.dauChu.cookie, id)).status, 503);
  } finally {
    process.env.NODE_ENV = cu.env;
    delete process.env.QH_THU_DUT_HOAN_TAC_SAU;
  }
  const daGo = async () => (await appPool.query<{ n: number }>("select count(*)::int n from listings where id = any($1) and voided", [tao])).rows[0]!.n;
  assert.equal(await daGo(), 70, "hai gói đầu (50 + 20) giữ nguyên");
  const kq = await hoanTacOk(s.dauChu.cookie, id);
  assert.equal(await daGo(), tao.length, "gọi lại: mọi hàng đã gỡ");
  assert.equal(kq.status, "undone");
});

test("voided: gấp lại bảng, lệnh thường không ghi được, kiểm trùng", async () => {
  const s = await sanMoi("e7b");
  const ma = maMoi();
  const { id, rows } = await nhap(s.dauChu.cookie, [{ ma }]);
  const h = idCua(rows, 2);
  await hoanTacOk(s.dauChu.cookie, id);
  const cot = Object.entries(STATE_COLUMNS);
  const banGap = await withCompany(appPool, { userId: s.dauChu.userId, companyId: s.companyId }, async (tx) => foldListing(await loadEvents(tx, h)));
  const banBang = (await appPool.query(`select ${cot.map(([, c]) => c).join(", ")} from listings where id = $1`, [h])).rows[0] as Record<string, unknown>;
  for (const [k, c] of cot) {
    const v = banGap[k as keyof typeof banGap];
    const b = banBang[c];
    const chuan = (x: unknown) => (x instanceof Date ? x.toISOString() : x === null ? null : typeof x === "string" && /^\d+$/.test(x) ? Number(x) : x);
    assert.deepEqual(chuan(b), chuan(v), `cột ${c} gấp lại khớp bảng`);
  }
  const thuong = await hangCo(s.dauChu.cookie, maMoi(), false);
  const n = (await suKien(thuong)).length;
  const r = await lenh(s.dauChu.cookie, thuong, "voided", {});
  assert.ok(r.status >= 400 && r.status < 500, `lệnh voided thường bị từ chối (${r.status})`);
  assert.equal((await suKien(thuong)).length, n, "không sự kiện mới");
  const lai = await nhap(s.dauChu.cookie, [{ ma }]);
  assert.equal(lai.rows[0]!.action, "create", "lần nhập sau cùng căn tạo hàng mới");
  assert.notEqual(lai.rows[0]!.listingId, h);
});

test("voided: lệnh sửa lên hàng đã gỡ bị từ chối như hàng không có", async () => {
  const s = await sanMoi("e7d");
  const { id, rows } = await nhap(s.dauChu.cookie, [{ ma: maMoi() }, { ma: maMoi() }]);
  const ids = [idCua(rows, 2), idCua(rows, 3)];
  await hoanTacOk(s.dauChu.cookie, id);
  for (const h of ids) {
    const n = (await suKien(h)).length;
    assert.equal((await lenh(s.dauChu.cookie, h, "details_changed", { furnished: "Cơ bản" })).status, 404, `lệnh lên ${h}`);
    assert.equal((await suKien(h)).length, n, `${h}: không sự kiện mới`);
    assert.equal((await send("GET", `/api/v1/listings/${h}`, undefined, s.dauChu.cookie)).status, 404, `đọc ${h}`);
  }
  const thuong = await hangCo(s.dauChu.cookie, maMoi(), false);
  assert.equal((await lenh(s.dauChu.cookie, thuong, "details_changed", { furnished: "Cơ bản" })).status, 200, "đối chứng: hàng thường");
});

test("lần nhập gần đây: của người gọi, mới nhất trước", async () => {
  const s = await sanMoi("gd");
  const a = await nhap(s.dauChu.cookie, [{ ma: maMoi() }]);
  const b = await nhap(s.dauChu.cookie, [{ ma: maMoi() }]);
  await nhap(s.dauChuB.cookie, [{ ma: maMoi() }]);
  await hoanTacOk(s.dauChu.cookie, a.id);
  const r = await send("GET", "/api/v1/imports", undefined, s.dauChu.cookie);
  assert.equal(r.status, 200);
  const ds = (await r.json()) as { id: string; status: string; soDongGhi: number }[];
  assert.deepEqual(ds.map((d) => [d.id, d.status, d.soDongGhi]), [[b.id, "committed", 1], [a.id, "undone", 1]]);
  assert.equal((await send("GET", "/api/v1/imports", undefined, s.dauKhach.cookie)).status, 403);
});
