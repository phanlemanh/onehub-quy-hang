// Căn nhập lên bảng chung (hàng can-nhap-len-bang-chung: E2, E3, E4, E5, E6, E8, E10) qua API trên Postgres thật. Lần nhập
// dựng bằng lõi thật (`readTable` + `planFromDictionary`) như `lan-nhap.test.ts`; file không có cột pháp lý, tình trạng sử
// dụng. Tên `[Tên]`, số `0900 000 0xx`.
import { planFromDictionary, readTable, type Cell } from "@quy-hang/core/import";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";
import * as thu from "../san-thu";

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
  const nhan = `cn-${ten.toLowerCase()}`;
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, mail(`${nhan}-qt`));
  const them = async (vai: string[], k: string): Promise<Nguoi> => {
    const email = mail(`${nhan}-${k}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return { companyId: s.companyId, dauChu: await them(["listing_agent"], "dc"), dauKhach: await them(["buyer_agent"], "dk") };
}

const TIEU_DE = ["Toà", "Mã căn", "Giá", "Phí", "Tình trạng"];
type Dong = { ma: string; gia?: Cell; phi?: Cell; tt?: Cell };
const toaCua = (ma: string) => (ma.startsWith("B") ? "Toà B" : "Toà A");
const o = (d: Dong): Cell[] => [toaCua(d.ma), d.ma, d.gia === undefined ? "3,5 tỷ" : d.gia, d.phi === undefined ? "bao phí" : d.phi, d.tt ?? null];

let soTep = 0;
async function lanNhap(cookie: string, dong: Dong[]) {
  const bang = readTable([TIEU_DE, ...dong.map(o)]);
  const res = await send(
    "POST",
    "/api/v1/imports",
    {
      fileName: `[Tệp cn ${++soTep}].xlsx`,
      fileHash: createHash("sha256").update(`${RUN}-cn-${soTep}`).digest("hex"),
      fileKind: "xlsx",
      headers: bang.headers,
      headerRow: 0,
      plan: planFromDictionary(bang),
      units: dong.map((d, i) => ({ row: i + 2, buildingName: toaCua(d.ma), unitNumber: d.ma })),
    },
    cookie,
  );
  assert.equal(res.status, 201, await res.clone().text());
  return { id: ((await res.json()) as { id: string }).id, rows: dong.map((d, i) => ({ row: i + 2, cells: o(d) })) };
}
type KetQua = { importId: string; rows: { row: number; action: string; reason: string; listingId?: string; standardStatus?: string }[] };
async function ghi(cookie: string, d: Dong[]): Promise<KetQua> {
  const { id, rows } = await lanNhap(cookie, d);
  const r = await send("POST", `/api/v1/imports/${id}/rows`, { dryRun: false, rows }, cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as KetQua;
}

// Căn của danh mục mẫu (hàng 64): lần nhập đối chiếu danh mục theo mã căn. Mỗi sàn một bộ đếm, nên mã không trùng trong sàn.
const CAN = ["A", "B"].flatMap((t) => Array.from({ length: 90 }, (_, i) => `${t}-${String(Math.floor(i / 6) + 1).padStart(2, "0")}.${String((i % 6) + 1).padStart(2, "0")}`));
const boMa = () => {
  let i = 0;
  return () => CAN[i++]!;
};
const trangThai = async (id: string) => (await appPool.query<{ s: string }>("select standard_status s from listings where id = $1", [id])).rows[0]!.s;
const suKienTrangThai = async (id: string) =>
  (
    await appPool.query<{ to: string; import_id: string | null }>(
      "select payload ->> 'to' as to, import_id from listing_events where listing_id = $1 and type = 'status_changed' order by seq",
      [id],
    )
  ).rows;
const idsDauKhach = async (cookie: string) => ((await (await send("GET", "/api/v1/listings", undefined, cookie)).json()) as { id: string; standardStatus: string }[]);

test("dòng còn hàng thiếu pháp lý lên Đang bán (can-nhap-len-bang-chung E2)", async () => {
  const s = await sanMoi("E2");
  const ma = boMa();
  const kq = await ghi(s.dauChu.cookie, [{ ma: ma(), tt: "Đang bán" }, { ma: ma(), tt: null }]);
  const [len, trong] = kq.rows;
  assert.equal(len!.action, "create");
  assert.equal(await trangThai(len!.listingId!), "Active", "căn file ghi Đang bán lên Đang bán");
  assert.equal(len!.standardStatus, "Active", "dòng trả trạng thái căn");
  const sk = await suKienTrangThai(len!.listingId!);
  assert.equal(sk.filter((e) => e.to === "Active").length, 1, "đúng một sự kiện lên Đang bán");
  assert.equal(sk[0]!.import_id, kq.importId, "sự kiện mang mã lần nhập");
  assert.match(len!.reason, /Đang bán/);
  assert.match(len!.reason, /pháp lý/);
  assert.match(len!.reason, /tình trạng sử dụng/);
  assert.doesNotMatch(len!.reason, /legalStatus|occupantType|Chưa đủ để rao/, `lý do: ${len!.reason}`);
  // Đối chứng: dòng không ghi trạng thái thì căn ở Chưa đủ để rao như hôm nay.
  assert.equal(await trangThai(trong!.listingId!), "Incomplete", "dòng trạng thái trống");
});

test("Đã cọc đi qua Đang bán (can-nhap-len-bang-chung E3)", async () => {
  const s = await sanMoi("E3");
  const kq = await ghi(s.dauChu.cookie, [{ ma: boMa()(), tt: "Đã cọc" }]);
  const id = kq.rows[0]!.listingId!;
  assert.equal(await trangThai(id), "Pending");
  const sk = await suKienTrangThai(id);
  assert.deepEqual(
    sk.map((e) => e.to),
    ["Active", "Pending"],
    "Đang bán rồi Đang giao dịch",
  );
  assert.ok(sk.every((e) => e.import_id === kq.importId), "cả hai mang mã lần nhập");
});

test("giá vẫn chặn ở cửa nhập (can-nhap-len-bang-chung E4)", async () => {
  const s = await sanMoi("E4");
  const ma = boMa();
  const kq = await ghi(s.dauChu.cookie, [
    { ma: ma(), tt: "Đang bán", gia: null },
    { ma: ma(), tt: "Đang bán", phi: null },
    { ma: ma(), tt: "Đang bán" },
  ]);
  const [khongGia, khongPhi, du] = kq.rows;
  assert.equal(await trangThai(khongGia!.listingId!), "Incomplete", "không giá");
  assert.equal(await trangThai(khongPhi!.listingId!), "Incomplete", "không điều kiện phí");
  assert.match(khongGia!.reason, /giá/);
  assert.match(khongPhi!.reason, /giá chưa ghi vì thiếu điều kiện phí|điều kiện phí/);
  // Đối chứng dương: đủ giá, phí ở sàn tối thiểu 0 → Đang bán.
  assert.equal(await trangThai(du!.listingId!), "Active", "đủ giá, phí");
  // Sàn đặt tối thiểu 1 ảnh: căn 0 ảnh ở lại Chưa đủ để rao với «ảnh thật».
  const s2 = await sanMoi("E4b");
  await appPool.query("insert into company_settings (company_id, key, value, updated_by) values ($1, 'listing.ready_min_real_photos', '1'::jsonb, $2)", [s2.companyId, s2.dauChu.userId]);
  const kq2 = await ghi(s2.dauChu.cookie, [{ ma: boMa()(), tt: "Đang bán" }]);
  assert.equal(await trangThai(kq2.rows[0]!.listingId!), "Incomplete", "tối thiểu 1, 0 ảnh");
  assert.match(kq2.rows[0]!.reason, /ảnh thật/);
  for (const r of [...kq.rows, ...kq2.rows]) assert.doesNotMatch(r.reason, /listPrice|feeInclusion|realPhoto/, `mã thô: ${r.reason}`);
});

test("cửa khác vẫn đòi pháp lý (can-nhap-len-bang-chung E5)", async () => {
  const s = await thu.sanMoi({ ts: { vai: ["telesales"] }, dc: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const lenh = async (id: string, body: Record<string, unknown>) => {
    const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
    return thu.send("POST", `/api/v1/listings/${id}/events`, { ...body, expectedVersion: v }, s.nguoi.dc!.cookie);
  };
  /** Căn của đầu chủ đủ mã, giá kèm điều kiện phí, có tình trạng sử dụng, thiếu pháp lý. */
  const canThieu = async () => {
    const id = await thu.hangCoChu(s, "dc", thu.maMoi(s), thu.soMoi(s));
    for (const body of [
      { type: "price_changed", payload: { listPrice: 3_200_000_000, feeInclusion: "included" } },
      { type: "details_changed", payload: { occupantType: "vacant" } },
    ])
      assert.equal((await lenh(id, body)).status, 200);
    return id;
  };
  const len = { type: "status_changed", payload: { to: "Active" } };
  // Nút «Sẵn sàng bán» · ô Trạng thái có mạng · ô Trạng thái ghi lúc mất mạng · sửa hàng loạt (cùng thân lệnh trình sửa ô dựng).
  const cua: [string, Record<string, unknown>][] = [
    ["nút Sẵn sàng bán", len],
    ["ô Trạng thái, có mạng", { ...len, madeOffline: false }],
    ["ô Trạng thái, ghi lúc mất mạng", { ...len, madeOffline: true }],
    ["sửa hàng loạt", { ...len, madeOffline: false }],
  ];
  for (const [ten, body] of cua) {
    const id = await canThieu();
    const r = await lenh(id, body);
    assert.equal(r.status, 400, `${ten}: ${await r.clone().text()}`);
    const b = (await r.json()) as { error: string; missing: string[] };
    assert.equal(b.error, "missing-requirement", ten);
    assert.ok(b.missing.includes("legalStatus"), `${ten}: ${JSON.stringify(b.missing)}`);
    assert.equal(await trangThai(id), "Incomplete", `${ten}: trạng thái`);
  }
  // Căn tạo từ lead (lối chuyển lead thật) thiếu pháp lý.
  const lead = await thu.nhap(s, thu.nam(thu.soMoi(s), "Toà A", thu.maMoi(s)));
  await thu.nhip(new Date(), s);
  const tuLead = await thu.hangTuLead(s, "dc", lead.id);
  const rl = await lenh(tuLead, len);
  assert.equal(rl.status, 400, `căn từ lead: ${await rl.clone().text()}`);
  assert.ok(((await rl.json()) as { missing: string[] }).missing.includes("legalStatus"), "căn từ lead thiếu pháp lý");
  // Lệnh công khai giả mã lần nhập: khuôn lệnh từ chối khoá lạ, căn không đổi.
  const gia = await canThieu();
  const truoc = (await suKienTrangThai(gia)).length;
  const rg = await lenh(gia, { ...len, importId: "00000000-0000-0000-0000-000000000000" });
  assert.equal(rg.status, 400, "khoá importId lạ");
  assert.equal((await suKienTrangThai(gia)).length, truoc, "không sự kiện mới");
  // Đối chứng dương: điền pháp lý thì nút lên được.
  assert.equal((await lenh(gia, { type: "details_changed", payload: { legalStatus: "pink_book" } })).status, 200);
  assert.equal((await lenh(gia, len)).status, 200, "đủ pháp lý → Đang bán");
});

test("50 căn nhập, đầu khách thấy (can-nhap-len-bang-chung E6)", async () => {
  const s = await sanMoi("E6");
  const khac = await sanMoi("E6k");
  const ma = boMa();
  const kq = await ghi(s.dauChu.cookie, Array.from({ length: 50 }, () => ({ ma: ma(), tt: "Đang bán" })));
  assert.equal(kq.rows.filter((r) => r.action === "create").length, 50, "50 dòng tạo mới");
  const nhap = new Set(kq.rows.map((r) => r.listingId!));
  const thay = (await idsDauKhach(s.dauKhach.cookie)).filter((l) => nhap.has(l.id));
  assert.equal(thay.length, 50, "đầu khách thấy đủ 50 căn");
  assert.ok(thay.every((l) => l.standardStatus === "Active"), "cả 50 ở Đang bán");
  assert.equal((await idsDauKhach(khac.dauKhach.cookie)).filter((l) => nhap.has(l.id)).length, 0, "sàn khác không thấy");
});

test("hoàn tác gỡ căn đã lên Đang bán (can-nhap-len-bang-chung E8)", async () => {
  const s = await sanMoi("E8");
  const kq = await ghi(s.dauChu.cookie, [{ ma: boMa()(), tt: "Đang bán" }]);
  const id = kq.rows[0]!.listingId!;
  assert.equal(await trangThai(id), "Active");
  assert.ok((await idsDauKhach(s.dauKhach.cookie)).some((l) => l.id === id), "trước hoàn tác đầu khách thấy căn");
  const r = await send("POST", `/api/v1/imports/${kq.importId}/undo`, { dryRun: false }, s.dauChu.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal(((await r.json()) as { go: number }).go, 1, "kết cục gỡ");
  assert.ok(!(await idsDauKhach(s.dauKhach.cookie)).some((l) => l.id === id), "sau hoàn tác đầu khách không thấy");
});

test("điền dần mục thiếu, căn ở lại Đang bán (can-nhap-len-bang-chung E10)", async () => {
  const s = await sanMoi("E10");
  const id = (await ghi(s.dauChu.cookie, [{ ma: boMa()(), tt: "Đang bán" }])).rows[0]!.listingId!;
  const buoc = async (type: string, payload: Record<string, unknown>) => {
    const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [id])).rows[0]!.version;
    const r = await send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: v }, s.dauChu.cookie);
    assert.equal(r.status, 200, `${type}: ${await r.clone().text()}`);
    assert.equal(await trangThai(id), "Active", `${type}: căn ở lại Đang bán`);
    return ((await r.json()) as { completeness: { missing: string[] } }).completeness.missing;
  };
  const sau1 = await buoc("details_changed", { legalStatus: "pink_book" });
  assert.ok(!sau1.includes("legalStatus"), "đã điền pháp lý");
  assert.ok(sau1.includes("occupantType"), "còn tình trạng sử dụng");
  await buoc("price_changed", { listPrice: 3_300_000_000, feeInclusion: "included" });
  const sau3 = await buoc("details_changed", { occupantType: "vacant" });
  assert.ok(!sau3.includes("legalStatus") && !sau3.includes("occupantType"), `mức đủ: ${JSON.stringify(sau3)}`);
});
