// Đường ghi lần nhập qua API trên Postgres thật (hàng 65a nhap-excel-xem-truoc-ghi, E4–E11). Dòng dựng bằng lõi thật
// (`readTable` + `planFromDictionary`) trên lưới viết tay; tên `[Tên]`, số `0900 000 0xx`.
import { LY_DO_DONG_NHAP, planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { API_ERRORS } from "../../src/errors";
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
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, mail(`ln-${ten.toLowerCase()}-qt`));
  const them = async (vai: string[], nhan: string): Promise<Nguoi> => {
    const email = mail(`ln-${ten.toLowerCase()}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return {
    companyId: s.companyId,
    quanTri: { userId: s.userId, cookie: `${await login(mail(`ln-${ten.toLowerCase()}-qt`))}; qh_san=${s.companyId}` },
    dauChu: await them(["listing_agent"], "dc"),
    dauChuB: await them(["listing_agent"], "dc2"),
    dauKhach: await them(["buyer_agent"], "dk"),
    telesales: await them(["telesales"], "ts"),
    truongNhom: await them(["team_lead"], "tn"),
  };
}

const TIEU_DE = ["Toà", "Mã căn", "Giá", "Phí", "Tình trạng", "Chủ nhà", "SĐT chủ", "Ngày xác nhận"];
type Dong = { toa?: string; ma: string; gia?: Cell; phi?: Cell; tt?: Cell; chu?: Cell; so?: Cell; ngay?: Cell };
/** Toà của một mã căn trong danh mục mẫu (`SAMPLE_CATALOG`): «A-…» ở Toà A, «B-…» ở Toà B. */
const toaCua = (ma: string) => (ma.startsWith("B") ? "Toà B" : "Toà A");
const o = (d: Dong): Cell[] => [d.toa ?? toaCua(d.ma), d.ma, d.gia ?? "3,5 tỷ", d.phi ?? "bao phí", d.tt ?? null, d.chu ?? null, d.so ?? null, d.ngay ?? null];

let soTep = 0;
/** Mở một lần nhập cho cả file (số dòng file = chỉ số + 2, như bảng tính có tiêu đề ở dòng 1). */
async function moLanNhap(cookie: string, dong: Dong[], tieuDe = TIEU_DE) {
  const luoi: Cell[][] = [tieuDe, ...dong.map((d) => o(d).slice(0, tieuDe.length))];
  const bang = readTable(luoi);
  const plan = planFromDictionary(bang);
  const res = await send(
    "POST",
    "/api/v1/imports",
    {
      fileName: `[Tệp ${++soTep}].xlsx`,
      fileHash: createHash("sha256").update(`${RUN}-${soTep}`).digest("hex"),
      fileKind: "xlsx",
      headers: bang.headers,
      headerRow: 0,
      plan,
      units: dong.map((d, i) => ({ row: i + 2, buildingName: d.toa ?? toaCua(d.ma), unitNumber: d.ma })),
    },
    cookie,
  );
  return { res, rows: dong.map((d, i) => ({ row: i + 2, cells: o(d).slice(0, tieuDe.length) })) };
}
async function lanNhap(cookie: string, dong: Dong[], tieuDe = TIEU_DE) {
  const { res, rows } = await moLanNhap(cookie, dong, tieuDe);
  assert.equal(res.status, 201, await res.clone().text());
  return { id: ((await res.json()) as { id: string }).id, rows };
}
type KetQua = { importId: string; rows: { row: number; action: string; reason: string; listingId?: string }[]; summary: Record<string, number> };
const gui = async (cookie: string, id: string, rows: unknown[], dryRun = false) => send("POST", `/api/v1/imports/${id}/rows`, { dryRun, rows }, cookie);
async function ghi(cookie: string, id: string, rows: unknown[], dryRun = false): Promise<KetQua> {
  const r = await gui(cookie, id, rows, dryRun);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as KetQua;
}

const dem = async (bang: string, where = "true", args: unknown[] = []) =>
  (await appPool.query<{ n: number }>(`select count(*)::int n from ${bang} where ${where}`, args)).rows[0]!.n;
const demSan = async (companyId: string) => ({
  listings: await dem("listings", "company_id = $1", [companyId]),
  listing_events: await dem("listing_events", "company_id = $1", [companyId]),
  leads: await dem("leads", "company_id = $1", [companyId]),
  contacts: await dem("contacts", "company_id = $1", [companyId]),
  import_rows: await dem("import_rows", "company_id = $1", [companyId]),
  listing_owners: await dem("listing_owners", "company_id = $1", [companyId]),
});

// Căn của danh mục mẫu: lần nhập đối chiếu danh mục theo mã căn, căn ngoài danh mục là ô cần người (hàng 64).
const CAN = ["A", "B"].flatMap((t) => Array.from({ length: 90 }, (_, i) => `${t}-${String(Math.floor(i / 6) + 1).padStart(2, "0")}.${String((i % 6) + 1).padStart(2, "0")}`));
let soCan = 0;
const maMoi = () => CAN[soCan++ % CAN.length]!;
/** Hàng mở có sẵn qua API: «Chỉ tôi» của người tạo, hay Đang bán (Toàn sàn). Trả id. */
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
  // Người tạo giữ căn qua cửa chủ nhà (Đầu chủ ghi chủ nhà đầu tiên thì giữ căn).
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
const giuCan = async (id: string) => (await appPool.query<{ user_id: string }>("select user_id from listing_agent_assignments where listing_id = $1 order by seq desc limit 1", [id])).rows[0]?.user_id;

test("lần nhập: dòng mới thành hàng qua một cửa", async () => {
  const s = await sanMoi("E4");
  const dong: Dong[] = [{ ma: maMoi() }, { ma: maMoi() }, { ma: maMoi(), tt: "Đang bán" }];
  const { id, rows } = await lanNhap(s.dauChu.cookie, dong);
  const truoc = await dem("listings", "company_id = $1", [s.companyId]);
  const kq = await ghi(s.dauChu.cookie, id, rows);
  assert.deepEqual(kq.rows.map((r) => r.action), ["create", "create", "create"]);
  assert.equal(await dem("listings", "company_id = $1", [s.companyId]), truoc + 3, "đúng ba hàng mới");
  for (const r of kq.rows) {
    const hang = await send("GET", `/api/v1/listings/${r.listingId}`, undefined, s.dauChu.cookie);
    assert.equal(hang.status, 200);
    assert.equal(((await hang.json()) as { standardStatus: string }).standardStatus, "Incomplete");
    assert.equal((await send("GET", `/api/v1/listings/${r.listingId}`, undefined, s.dauKhach.cookie)).status, 404, "Chỉ tôi của người nhập");
    assert.equal(await giuCan(r.listingId!), s.dauChu.userId, "người nhập giữ căn");
  }
  const ids = kq.rows.map((r) => r.listingId);
  const sk = await appPool.query<{ import_id: string | null; confirmed_with_owner: boolean }>(
    "select import_id, confirmed_with_owner from listing_events where listing_id = any ($1)",
    [ids],
  );
  assert.ok(sk.rows.length >= 3);
  assert.equal(sk.rows.filter((e) => e.import_id === id && !e.confirmed_with_owner).length, sk.rows.length, "mọi sự kiện mang lần nhập, không xác nhận");
  assert.match(kq.rows[2]!.reason, /ở Chưa đủ để rao — thiếu/, "Đang bán theo file mà thiếu điều kiện ghi lý do");
});

test("lần nhập: gửi lại gói không nhân đôi", async () => {
  const s = await sanMoi("E5a");
  const giu = await hangCo(s.dauChuB.cookie, maMoi(), true);
  const maGiu = ((await appPool.query<{ unit_number: string }>("select unit_number from listings where id = $1", [giu])).rows[0]!).unit_number;
  const dong: Dong[] = [{ ma: maMoi() }, { ma: maMoi() }, { ma: maGiu, so: "0900 000 051" }, { ma: maMoi(), chu: "[Tên] Năm", so: "0900 000 052" }];
  const { id, rows } = await lanNhap(s.dauChu.cookie, dong);
  const lan1 = await ghi(s.dauChu.cookie, id, rows);
  assert.deepEqual(lan1.rows.map((r) => r.action), ["create", "create", "supplement", "create"]);
  const sau1 = await demSan(s.companyId);
  const lan2 = await ghi(s.dauChu.cookie, id, rows);
  assert.deepEqual(await demSan(s.companyId), sau1, "gửi lại không thêm gì");
  assert.deepEqual(lan2, lan1, "trả đúng kết quả lần đầu");
});

test("lần nhập: gói quá 200 dòng bị từ chối", async () => {
  const s = await sanMoi("E5b");
  const dong: Dong[] = Array.from({ length: 201 }, (_, i) => ({ ma: `C-${i}` }));
  const { id, rows } = await lanNhap(s.dauChu.cookie, dong);
  const r = await gui(s.dauChu.cookie, id, rows, true);
  assert.deepEqual([r.status, ((await r.json()) as { error: string }).error], [422, API_ERRORS.importBatchTooLarge.code]);
  assert.equal(await dem("import_rows", "import_id = $1", [id]), 0);
  const ok = await gui(s.dauChu.cookie, id, rows.slice(0, 200), true);
  assert.equal(ok.status, 200, "đối chứng: 200 dòng thì qua");
});

test("lần nhập: một dòng lỗi không lùi gói", async () => {
  const s = await sanMoi("E5c");
  const { id, rows } = await lanNhap(s.dauChu.cookie, [{ ma: maMoi() }, { ma: maMoi(), gia: "-3 tỷ" }, { ma: maMoi() }]);
  const kq = await ghi(s.dauChu.cookie, id, rows);
  assert.deepEqual(kq.rows.map((r) => r.action), ["create", "skip", "create"]);
  assert.equal(kq.rows[1]!.reason, LY_DO_DONG_NHAP.oChan);
});

test("lần nhập: căn có hàng mở", async () => {
  const s = await sanMoi("E6");
  const [m1, m2, m3] = [maMoi(), maMoi(), maMoi()];
  const h1 = await hangCo(s.dauChu.cookie, m1, false);
  const h2 = await hangCo(s.dauChuB.cookie, m2, true);
  const h3 = await hangCo(s.dauChuB.cookie, m3, false);
  const sk = async (id: string) => dem("listing_events", "listing_id = $1", [id]);
  const [n2, n3] = [await sk(h2), await sk(h3)];
  const { id, rows } = await lanNhap(s.dauChu.cookie, [
    { ma: m1, gia: "4,2 tỷ" },
    { ma: m2, so: "0900 000 061" },
    { ma: m3, so: "0900 000 062" },
    { ma: m1, gia: "5 tỷ" },
    { ma: maMoi() },
  ]);
  const kq = await ghi(s.dauChu.cookie, id, rows);
  assert.deepEqual(kq.rows.map((r) => [r.row, r.action]), [[2, "update"], [3, "supplement"], [4, "supplement"], [5, "skip"], [6, "create"]]);
  const gh1 = (await (await send("GET", `/api/v1/listings/${h1}`, undefined, s.dauChu.cookie)).json()) as { listPrice: number; events: { type: string }[] };
  assert.equal(gh1.listPrice, 4_200_000_000, "H1 nhận giá mới");
  assert.equal((await appPool.query("select 1 from listing_events where listing_id = $1 and type = 'price_changed' and import_id = $2", [h1, id])).rowCount, 1);
  assert.equal(await sk(h2), n2, "H2 không thêm sự kiện");
  assert.equal(await sk(h3), n3, "H3 không thêm sự kiện");
  const lead = await appPool.query<{ outcome: string; matched_agent_user_id: string }>(
    "select outcome, matched_agent_user_id from leads where matched_listing_id = $1",
    [h2],
  );
  assert.deepEqual(lead.rows, [{ outcome: "unit_has_open_listing", matched_agent_user_id: s.dauChuB.userId }], "tin bổ sung gửi đầu chủ giữ H2");
  assert.equal(kq.rows[2]!.reason, LY_DO_DONG_NHAP.khongDoc);
  const than = JSON.stringify(kq);
  for (const lo of [h3, s.dauChuB.userId]) assert.ok(!than.includes(lo), `thân trả không chứa ${lo}`);
  assert.equal(kq.rows[3]!.reason, "trùng dòng 2 trong file");
});

test("lần nhập: chủ nhà qua cửa chủ nhà", async () => {
  const s = await sanMoi("E7");
  // Liên hệ có sẵn mang số 0900 000 072, tạo qua lead của telesales.
  const ld = await send("POST", "/api/v1/leads", { buildingName: "[Toà khác]", need: "sale", listPrice: 2_000_000_000, feeInclusion: "excluded", desiredListingTime: "now", ownerPhone: "0900 000 072" }, s.telesales.cookie);
  assert.equal(ld.status, 201, await ld.clone().text());
  const lienHeCo = (await appPool.query<{ contact_id: string }>("select contact_id from leads where company_id = $1", [s.companyId])).rows[0]!.contact_id;
  const truoc = await dem("contacts", "company_id = $1", [s.companyId]);
  const { id, rows } = await lanNhap(s.dauChu.cookie, [
    { ma: maMoi(), chu: "[Tên]", so: "0900 000 071" },
    { ma: maMoi(), chu: "[Tên]", so: "0900 000 071" },
    { ma: maMoi(), chu: "[Tên] Bảy", so: "0900 000 072" },
  ]);
  const kq = await ghi(s.dauChu.cookie, id, rows);
  const chu = await appPool.query<{ owner_phone: string | null; enc: boolean; hash: boolean; contact_id: string; owner_name: string }>(
    "select owner_phone, owner_phone_enc is not null enc, owner_phone_hash is not null hash, contact_id, owner_name from listing_owners where listing_id = any ($1) order by owner_name, listing_id",
    [kq.rows.map((r) => r.listingId)],
  );
  assert.equal(chu.rows.length, 3);
  for (const c of chu.rows) assert.deepEqual([c.owner_phone, c.enc, c.hash], [null, true, true], "số chỉ ở dạng bản mã");
  const [a, b, c] = chu.rows;
  assert.equal(a!.contact_id, b!.contact_id, "cùng số thì cùng liên hệ");
  assert.equal(c!.contact_id, lienHeCo, "số đã có thì gắn liên hệ có sẵn");
  assert.equal(await dem("contacts", "company_id = $1", [s.companyId]), truoc + 1, "chỉ thêm một liên hệ");
  assert.equal(a!.owner_name, "[Tên]", "đối chứng: tên chủ tới đúng chỗ của nó");
});

test("lần nhập: thân trả không mang nguồn", async () => {
  const s = await sanMoi("E7b");
  const { res, rows } = await moLanNhap(s.dauChu.cookie, [{ ma: maMoi(), chu: "[Tên]", so: "0900 000 001" }]);
  const mo = (await res.json()) as { id: string };
  const than = [JSON.stringify(mo)];
  than.push(JSON.stringify(await ghi(s.dauChu.cookie, mo.id, rows, true)));
  than.push(JSON.stringify(await ghi(s.dauChu.cookie, mo.id, rows)));
  than.push(await (await send("GET", `/api/v1/imports/${mo.id}`, undefined, s.dauChu.cookie)).text());
  const kh = await appPool.query<{ plan: string }>("select plan::text plan from imports where id = $1", [mo.id]);
  const dr = await appPool.query<{ t: string }>("select row_to_json(r)::text t from import_rows r where import_id = $1", [mo.id]);
  for (const [nhan, t] of [...than.map((t, i) => [`thân trả ${i}`, t]), ["imports.plan", kh.rows[0]!.plan], ...dr.rows.map((r) => ["import_rows", r.t])]) {
    for (const lo of ["0900000001", "0900 000 001", "[Tên]"]) assert.ok(!t!.includes(lo), `${nhan} không chứa ${lo}`);
  }
});

test("lần nhập: độ tươi theo ngày trong file", async () => {
  const s = await sanMoi("E8");
  const homNay = new Date();
  const ngay = (d: Date) => `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
  const mai = new Date(homNay.getTime() + 86_400_000);
  const xa = new Date(Date.UTC(homNay.getUTCFullYear() - 2, homNay.getUTCMonth(), homNay.getUTCDate() - 1));
  const { id, rows } = await lanNhap(s.dauChu.cookie, [{ ma: maMoi(), ngay: "01/06/2026" }, { ma: maMoi(), ngay: ngay(mai) }, { ma: maMoi(), ngay: ngay(xa) }]);
  const kq = await ghi(s.dauChu.cookie, id, rows);
  const doc = async (lid: string) => (await (await send("GET", `/api/v1/listings/${lid}`, undefined, s.dauChu.cookie)).json()) as { lastConfirmedAt: string | null };
  const xn = async (lid: string) => dem("listing_events", "listing_id = $1 and type = 'owner_confirmed'", [lid]);
  assert.equal(kq.rows[0]!.action, "create");
  assert.ok((await doc(kq.rows[0]!.listingId!)).lastConfirmedAt?.startsWith("2026-06-01"));
  assert.equal(await xn(kq.rows[0]!.listingId!), 1);
  // Ngày sau hôm nay / trước mốc hai năm: ô cần người — dòng vẫn tạo, không có sự kiện xác nhận.
  for (const r of kq.rows.slice(1)) {
    assert.equal(await xn(r.listingId!), 0, `dòng ${r.row} không có xác nhận`);
    assert.equal((await doc(r.listingId!)).lastConfirmedAt, null);
  }
  const khong = await lanNhap(s.dauChu.cookie, [{ ma: maMoi() }], TIEU_DE.slice(0, 7));
  const k2 = await ghi(s.dauChu.cookie, khong.id, khong.rows);
  assert.equal((await doc(k2.rows[0]!.listingId!)).lastConfirmedAt, null, "không cột ngày thì chưa xác nhận");
  const homNayIso = homNay.toISOString().slice(0, 10);
  for (const r of [...kq.rows, ...k2.rows]) assert.ok(!(await doc(r.listingId!)).lastConfirmedAt?.startsWith(homNayIso), "không dòng nào vừa xác nhận hôm nay");
});

test("lần nhập: ai được nhập", async () => {
  const s = await sanMoi("E9a");
  const CA: [string, Nguoi, number][] = [
    ["listing_agent", s.dauChu, 201],
    ["team_lead", s.truongNhom, 201],
    ["buyer_agent", s.dauKhach, 403],
    ["telesales", s.telesales, 403],
    ["company_admin", s.quanTri, 403],
  ];
  let so = 0;
  for (const [vai, ng, mong] of CA) {
    const { res } = await moLanNhap(ng.cookie, [{ ma: maMoi() }]);
    assert.equal(res.status, mong, vai);
    if (mong === 403) assert.equal(((await res.json()) as { error: string }).error, API_ERRORS.importRoleRequired.code);
    so++;
  }
  assert.equal(so, 5);
});

test("lần nhập: trưởng nhóm gán đầu chủ", async () => {
  const s = await sanMoi("E9b");
  const sanKhac = await sanMoi("E9c");
  const [mA, mB] = [maMoi(), maMoi()];
  const hA = await hangCo(s.dauChu.cookie, mA, true);
  const hB = await hangCo(s.dauChuB.cookie, mB, true);
  const { id, rows } = await lanNhap(s.truongNhom.cookie, [{ ma: maMoi() }, { ma: mA, gia: "4,4 tỷ" }, { ma: mB, so: "0900 000 091" }, { ma: maMoi() }, { ma: maMoi() }]);
  const gan = [s.dauChu.userId, s.dauChu.userId, s.dauChu.userId, s.dauKhach.userId, sanKhac.dauChu.userId];
  const kq = await ghi(s.truongNhom.cookie, id, rows.map((r, i) => ({ ...r, agentUserId: gan[i] })));
  assert.deepEqual(kq.rows.map((r) => r.action), ["create", "update", "supplement", "skip", "skip"]);
  assert.equal(await giuCan(kq.rows[0]!.listingId!), s.dauChu.userId, "đầu chủ được gán giữ căn");
  assert.equal(kq.rows[1]!.listingId, hA);
  assert.equal(await dem("leads", "matched_listing_id = $1", [hA]), 0, "căn A giữ: cập nhật, không lead");
  assert.equal(await dem("leads", "matched_listing_id = $1 and matched_agent_user_id = $2", [hB, s.dauChuB.userId]), 1, "căn B giữ: tin bổ sung tới B");
  for (const r of kq.rows.slice(3)) assert.equal(r.reason, LY_DO_DONG_NHAP.chuaDauChu);
});

test("lần nhập: file ghi đã bán, ngừng không nhập", async () => {
  const s = await sanMoi("E9d");
  const { id, rows } = await lanNhap(s.dauChu.cookie, [{ ma: maMoi(), tt: "Đã bán" }, { ma: maMoi(), tt: "Ngừng" }]);
  const truoc = await dem("listings", "company_id = $1", [s.companyId]);
  const kq = await ghi(s.dauChu.cookie, id, rows);
  assert.deepEqual(kq.rows.map((r) => r.reason), [LY_DO_DONG_NHAP.daBan, LY_DO_DONG_NHAP.ngung]);
  assert.equal(await dem("listings", "company_id = $1", [s.companyId]), truoc);
});

test("lần nhập: xem thử bằng ghi", async () => {
  const s = await sanMoi("E10");
  const [m1, m2, mX] = [maMoi(), maMoi(), maMoi()];
  await hangCo(s.dauChu.cookie, m1, false);
  await hangCo(s.dauChuB.cookie, m2, true);
  const { id, rows } = await lanNhap(s.dauChu.cookie, [
    { ma: mX },
    { ma: m1, gia: "4 tỷ" },
    { ma: m2, so: "0900 000 101" },
    { ma: maMoi() },
    { ma: mX },
    { ma: maMoi(), gia: "-1 tỷ" },
    { ma: maMoi() },
  ]);
  const [g1, g2] = [rows.slice(0, 3), rows.slice(3)];
  const truoc = await demSan(s.companyId);
  const xem = [await ghi(s.dauChu.cookie, id, g1, true), await ghi(s.dauChu.cookie, id, g2, true)];
  assert.deepEqual(await demSan(s.companyId), truoc, "xem thử không để lại gì");
  const that = [await ghi(s.dauChu.cookie, id, g1), await ghi(s.dauChu.cookie, id, g2)];
  const bo = (k: KetQua) => ({ rows: k.rows.map(({ row, action, reason }) => ({ row, action, reason })), summary: k.summary });
  assert.deepEqual(that.map(bo), xem.map(bo), "xem thử bằng ghi, từng gói");
  assert.deepEqual(xem[1]!.rows.find((r) => r.row === 6), { row: 6, action: "skip", reason: "trùng dòng 2 trong file" });
  assert.equal(await dem("listings", "company_id = $1 and app.unit_key(unit_number) = app.unit_key($2)", [s.companyId, mX]), 1);
});

test("lần nhập: hàng Trưởng nhóm nhập hiện cho đầu chủ giữ căn", async () => {
  const s = await sanMoi("E11");
  const { id, rows } = await lanNhap(s.truongNhom.cookie, [{ ma: maMoi() }]);
  const kq = await ghi(s.truongNhom.cookie, id, rows.map((r) => ({ ...r, agentUserId: s.dauChu.userId })));
  const h = kq.rows[0]!.listingId!;
  assert.equal((await send("GET", `/api/v1/listings/${h}`, undefined, s.dauChu.cookie)).status, 200, "đầu chủ giữ căn đọc được");
  assert.equal((await send("GET", `/api/v1/listings/${h}`, undefined, s.dauKhach.cookie)).status, 404, "đầu khách không");
  assert.equal((await send("GET", `/api/v1/listings/${h}`, undefined, s.dauChuB.cookie)).status, 404, "đầu chủ khác không");
  assert.equal((await send("GET", `/api/v1/listings/${h}`, undefined, s.telesales.cookie)).status, 404, "telesales không");
});
