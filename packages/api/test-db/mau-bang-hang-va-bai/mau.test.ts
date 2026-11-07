// Mẫu của sàn qua API thật (hàng mau-bang-hang-va-bai): E1, E2b, E3, E4, E5d, E7b, E8, E9b và hai lần lưu chồng nhau.
// Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`.
import { canMoi, CAU_HINH_MAC_DINH, giaTriMoi, timRoRi } from "@quy-hang/core/redaction";
import { cotRa, xuatBang, type CotBangHang, type MauBang } from "@quy-hang/core/export";
import { CHO_LINK, soanTin } from "@quy-hang/core/sharing";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { createApi } from "../../src/app";
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

async function sanMoi(ten: string) {
  const emailQt = mail(`ms-${ten}-qt`);
  const s = await openCompany(`[Sàn ${RUN} ms ${ten}]`, emailQt);
  const them = async (vai: string[], nhan: string) => {
    const email = mail(`ms-${ten}-${nhan}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
  };
  return {
    companyId: s.companyId,
    quanTri: { cookie: `${await login(emailQt)}; qh_san=${s.companyId}` },
    dauChu: await them(["listing_agent"], "dc"),
    dauKhach: await them(["buyer_agent"], "dk"),
    truongNhom: await them(["team_lead"], "tn"),
    telesales: await them(["telesales"], "ts"),
  };
}
type San = Awaited<ReturnType<typeof sanMoi>>;

const BANG_DUONG = "/api/v1/company/templates/export";
const BAI_DUONG = "/api/v1/company/templates/posts";
const mau = (ten: string, cot: string[], id = randomUUID()): MauBang => ({ id, ten, cot: cot as CotBangHang[] });
async function docBang(cookie: string) {
  const r = await send("GET", BANG_DUONG, undefined, cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as { templates: MauBang[]; errors: string[] };
}
async function docBai(cookie: string) {
  const r = await send("GET", BAI_DUONG, undefined, cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as { templates: Record<string, { dau: string; cuoi: string }>; errors: string[] };
}
const ghiBang = (s: San, templates: unknown, cookie = s.quanTri.cookie) => send("PUT", BANG_DUONG, { templates }, cookie);
const ghiBai = (s: San, templates: unknown, cookie = s.quanTri.cookie) => send("PUT", BAI_DUONG, { templates }, cookie);

test("mẫu bảng: thêm, sửa, xoá", async () => {
  const s = await sanMoi("crud");
  const a = mau("[Tên] gửi đội", ["unitNumber", "listPrice", "livingArea"]);
  assert.equal((await ghiBang(s, [a])).status, 200);
  assert.deepEqual((await docBang(s.dauChu.cookie)).templates, [a], "đọc lại sau khi thêm");
  const sua = { ...a, ten: "[Tên] gửi nhóm", cot: ["livingArea", "unitNumber", "listPrice"] as CotBangHang[] };
  assert.equal((await ghiBang(s, [sua])).status, 200);
  assert.deepEqual((await docBang(s.dauChu.cookie)).templates.map((m) => [m.id, m.ten, m.cot]), [[a.id, sua.ten, sua.cot]], "thứ tự cột của mẫu không giữ");
  assert.equal((await ghiBang(s, [])).status, 200);
  assert.deepEqual((await docBang(s.dauChu.cookie)).templates.map((m) => m.id), [], "mẫu đã xoá vẫn còn");
  const dong = await appPool.query("select count(*)::int n from company_settings where company_id = $1 and key = 'export.templates'", [s.companyId]);
  assert.equal(dong.rows[0].n, 1, "đối chứng: đúng một dòng khoá export.templates của sàn");
});

test("mẫu bảng: sai khuôn bị từ chối", async () => {
  const s = await sanMoi("sai");
  const truoc = (await docBang(s.dauChu.cookie)).templates;
  const r = await ghiBang(s, [mau("Đúng", ["listPrice"]), mau("Sai", ["listPrice", "holderName"])]);
  assert.equal(r.status, 400);
  const loi = (await r.json()) as { reason?: unknown };
  assert.ok(typeof loi.reason === "string" && loi.reason.includes("export.templates[1].cot") && loi.reason.includes("holderName"), `lý do: ${loi.reason}`);
  assert.deepEqual((await docBang(s.dauChu.cookie)).templates, truoc, "lần lưu bị từ chối vẫn ghi một phần");
  const BANG: [string, unknown, string][] = [
    ["tên trùng", [mau("[Tên] A", ["listPrice"]), mau(" [tên] a ", ["listPrice"])], "export.templates[1].ten"],
    ["không cột", [mau("A", [])], "export.templates[0].cot"],
    ["21 mẫu", Array.from({ length: 21 }, (_, i) => mau(`M${i}`, ["listPrice"])), "export.templates"],
  ];
  let dem = 0;
  for (const [ca, v, khoa] of BANG) {
    const x = await ghiBang(s, v);
    assert.equal(x.status, 400, `ca ${ca}`);
    const b = (await x.json()) as { reason?: string };
    assert.ok(b.reason?.startsWith(khoa), `ca ${ca}: lý do «${b.reason}» không nêu ${khoa}`);
    dem++;
  }
  assert.equal(dem, 3);
});

test("mẫu bài: lưu và về mặc định", async () => {
  const s = await sanMoi("bai");
  const hai = { zalo: { dau: "[Tên sàn] gửi nhóm", cuoi: "Gọi em" }, facebook: { dau: "Bảng hàng tuần", cuoi: "Hẹn xem nhà" } };
  assert.equal((await ghiBai(s, hai)).status, 200);
  assert.deepEqual((await docBai(s.dauKhach.cookie)).templates, hai);
  assert.equal((await ghiBai(s, { zalo: hai.zalo })).status, 200);
  assert.deepEqual((await docBai(s.dauKhach.cookie)).templates, { zalo: hai.zalo }, "về mặc định phải bỏ kênh, giữ kênh kia");
  const BANG: [string, unknown, string][] = [
    ["501 ký tự", { zalo: { dau: "a".repeat(501), cuoi: "" } }, "share.post_templates.zalo.dau"],
    ["kênh lạ", { tiktok: { dau: "a", cuoi: "" } }, "share.post_templates.tiktok"],
    ["không phải đối tượng", [1], "share.post_templates"],
  ];
  let dem = 0;
  for (const [ca, v, khoa] of BANG) {
    const x = await ghiBai(s, v);
    assert.equal(x.status, 400, `ca ${ca}`);
    const b = (await x.json()) as { reason?: string };
    assert.ok(b.reason?.startsWith(khoa), `ca ${ca}: lý do «${b.reason}» không nêu ${khoa}`);
    dem++;
  }
  assert.equal(dem, 3);
  assert.equal((await ghiBai(s, { zalo: { dau: "a".repeat(500), cuoi: "" } })).status, 200, "đối chứng: 500 ký tự đúng biên");
});

test("mẫu: quyền và cách ly", async () => {
  const a = await sanMoi("qa");
  const b = await sanMoi("qb");
  assert.equal((await ghiBang(a, [mau("[Tên] A", ["listPrice"])])).status, 200);
  const VAI: [string, string, boolean][] = [
    ["Quản trị", a.quanTri.cookie, true],
    ["Đầu chủ", a.dauChu.cookie, false],
    ["Đầu khách", a.dauKhach.cookie, false],
    ["Trưởng nhóm", a.truongNhom.cookie, false],
    ["Telesales", a.telesales.cookie, false],
  ];
  let dem = 0;
  for (const [ten, cookie, ghi] of VAI) {
    for (const duong of [BANG_DUONG, BAI_DUONG]) {
      assert.equal((await send("GET", duong, undefined, cookie)).status, 200, `${ten} không đọc được ${duong}`);
      const r = await send("PUT", duong, { templates: duong === BANG_DUONG ? (await docBang(a.quanTri.cookie)).templates : {} }, cookie);
      assert.equal(r.status, ghi ? 200 : 403, `${ten} ghi ${duong}: ${r.status}`);
      dem += 2;
    }
  }
  assert.equal(dem, VAI.length * 2 * 2);
  assert.equal((await send("GET", BANG_DUONG, undefined)).status, 401, "chưa đăng nhập");
  assert.deepEqual((await docBang(b.quanTri.cookie)).templates, [], "sàn B thấy mẫu của sàn A");
  const truoc = (await docBang(a.quanTri.cookie)).templates;
  assert.equal((await ghiBang(b, [mau("[Tên] B", ["livingArea"])])).status, 200);
  assert.deepEqual((await docBang(a.quanTri.cookie)).templates, truoc, "sàn B ghi đè mẫu của sàn A");
});

test("hai lần lưu chồng nhau", async () => {
  const s = await sanMoi("chong");
  const x = [mau("[Tên] X", ["listPrice"])];
  const y = [mau("[Tên] Y", ["livingArea"]), mau("[Tên] Z", ["unitNumber"])];
  await Promise.all([ghiBang(s, x), ghiBang(s, y)]);
  const doc = (await docBang(s.quanTri.cookie)).templates;
  assert.ok(JSON.stringify(doc) === JSON.stringify(x) || JSON.stringify(doc) === JSON.stringify(y), `hai lần lưu bị trộn: ${JSON.stringify(doc)}`);
});

test("Xuất: Đầu chủ đọc mẫu của sàn", async () => {
  const s = await sanMoi("xuat");
  assert.deepEqual((await docBang(s.dauChu.cookie)).templates, [], "đối chứng: sàn chưa có mẫu");
  const hai = [mau("[Tên] một", ["unitNumber", "listPrice", "livingArea"]), mau("[Tên] hai", ["livingArea"])];
  assert.equal((await ghiBang(s, hai)).status, 200);
  const doc = (await docBang(s.dauChu.cookie)).templates;
  assert.deepEqual(doc.map((m) => [m.ten, m.cot]), hai.map((m) => [m.ten, m.cot]), "thứ tự mẫu không giữ");
  const ban = xuatBang([canMoi()], { mau: "xlsx", nguoiNhan: "khach_rieng", cot: doc[0]!.cot, today: "2026-11-07", tenSan: "[Tên sàn]" });
  assert.deepEqual(ban.cot, cotRa(doc[0]!.cot, "khach_rieng", CAU_HINH_MAC_DINH).ra.map((c) => c.nhan));
  assert.equal(ban.khoa[0], "floorBand", "khách riêng: mã căn thành nấc tầng");
});

test("Gửi: tin mang mẫu Zalo", async () => {
  const s = await sanMoi("gui");
  const b = await sanMoi("gui-b");
  assert.deepEqual((await docBai(s.dauKhach.cookie)).templates, {}, "đối chứng: sàn chưa đặt mẫu");
  assert.equal((await ghiBai(b, { zalo: { dau: "Của sàn B", cuoi: "" } })).status, 200);
  const D = "Hàng mới tuần này";
  const C = "Cần thêm căn cứ nhắn em";
  assert.equal((await ghiBai(s, { zalo: { dau: D, cuoi: C } })).status, 200);
  const mauZalo = (await docBai(s.dauKhach.cookie)).templates.zalo;
  assert.deepEqual(mauZalo, { dau: D, cuoi: C }, "tin mang mẫu sàn khác");
  const tin = soanTin({ ban: [], nguoiNhan: "nhom_moi_gioi", mauZalo });
  assert.ok(tin.indexOf(D) < tin.indexOf("Em gửi") && tin.indexOf(C) > tin.indexOf(CHO_LINK), tin);
});

const CAN = Array.from({ length: 30 }, (_, i) => `S-${String(i + 1).padStart(2, "0")}.01`);
let soCan = 0;
async function canDangBan(cookie: string) {
  const tao = await send("POST", "/api/v1/listings", { buildingName: "Toà S", unitNumber: CAN[soCan++ % CAN.length] }, cookie);
  assert.equal(tao.status, 201);
  let h = (await tao.json()) as { id: string; version: number };
  const id = h.id;
  const buoc = async (type: string, payload: Record<string, unknown>) => {
    const r = await send("POST", `/api/v1/listings/${id}/events`, { type, payload, expectedVersion: h.version }, cookie);
    assert.equal(r.status, 200, await r.clone().text());
    h = (await r.json()) as { id: string; version: number };
  };
  assert.equal((await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên] Chủ" }, cookie)).status, 200);
  await themAnhThat(id);
  await buoc("price_changed", { listPrice: 3_000_000_000, feeInclusion: "included" });
  await buoc("details_changed", { legalStatus: "pink_book", occupantType: "vacant" });
  await buoc("status_changed", { to: "Active" });
  return id;
}

test("mẫu: hiệu lực lần sau", async () => {
  const s = await sanMoi("lan-sau");
  assert.equal((await ghiBang(s, [mau("[Tên] cũ", ["listPrice"])])).status, 200);
  assert.equal((await ghiBai(s, { zalo: { dau: "Cũ", cuoi: "" } })).status, 200);
  const ids = [await canDangBan(s.dauChu.cookie)];
  const tao = await send("POST", "/api/v1/shares", { audience: "agents", prospectId: null, listingIds: ids }, s.dauKhach.cookie);
  assert.equal(tao.status, 201, await tao.clone().text());
  const { code } = (await tao.json()) as { code: string };
  const moCong = async () => {
    const r = await send("GET", `/api/v1/public/shares/${code}`, undefined);
    assert.equal(r.status, 200);
    return r.json();
  };
  const xuat = await send("POST", "/api/v1/exports", { format: "xlsx", recipient: "nhom_moi_gioi", listingCount: 1 }, s.dauChu.cookie);
  assert.equal(xuat.status, 201, await xuat.clone().text());
  const { id: xuatId } = (await xuat.json()) as { id: string };
  const dongXuat = async () => (await appPool.query("select * from exports where id = $1", [xuatId])).rows[0];
  const truocCong = await moCong();
  const truocXuat = await dongXuat();
  const moi = mau("[Tên] mới", ["livingArea", "unitNumber"]);
  assert.equal((await ghiBang(s, [moi])).status, 200);
  assert.equal((await ghiBai(s, { zalo: { dau: "Mới", cuoi: "Kết" } })).status, 200);
  assert.deepEqual((await docBang(s.dauChu.cookie)).templates, [moi], "lần kế không đọc bản mới");
  assert.deepEqual((await docBai(s.dauKhach.cookie)).templates, { zalo: { dau: "Mới", cuoi: "Kết" } });
  assert.equal((await ghiBang(s, [])).status, 200);
  assert.deepEqual(await moCong(), truocCong, "Lần gửi cũ đổi theo mẫu");
  assert.deepEqual(await dongXuat(), truocXuat, "lần xuất cũ đổi theo mẫu");
});

test("mẫu ghi thẳng mang cột nội bộ", async () => {
  const s = await sanMoi("ghi-thang");
  await appPool.query(
    `insert into company_settings (company_id, key, value, data_class, updated_by) values ($1, 'export.templates', $2::jsonb, 'company_internal', $3)
     on conflict (company_id, key) do update set value = excluded.value`,
    [s.companyId, JSON.stringify([{ id: randomUUID(), ten: "[Tên] ghi thẳng", cot: ["listPrice", "holderName", "closePrice"] }]), s.dauChu.userId],
  );
  const doc = await docBang(s.dauChu.cookie);
  assert.deepEqual(doc.templates.map((m) => m.cot), [["listPrice"]], "cột nội bộ ra khỏi kho mẫu");
  assert.ok(doc.errors.some((e) => e.startsWith("export.templates")), `errors: ${doc.errors.join(" | ")}`);
  const moi = giaTriMoi(canMoi(), "nhom_moi_gioi", CAU_HINH_MAC_DINH);
  const ban = xuatBang([canMoi()], { mau: "post_zalo", nguoiNhan: "nhom_moi_gioi", cot: doc.templates[0]!.cot, today: "2026-11-07", tenSan: "[Tên sàn]" });
  assert.deepEqual(timRoRi(JSON.stringify({ cot: ban.cot, dong: ban.dong, bai: ban.bai }), moi), [], "chuỗi mồi lọt");
});
