// Quản trị sàn mang đủ vai và luật «vai kéo theo vai» qua API trên Postgres thật (hàng chu-san-du-vai: AC-3, AC-4, AC-5, AC-6).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { navigationFor } from "@quy-hang/core";
import { moSan } from "../../../db/scripts/mo-san.mjs";
import { apDoiVai } from "../../../../apps/web/src/app/(app)/settings/users/vai-trong-hop";
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

const NAM = ["buyer_agent", "company_admin", "listing_agent", "team_lead", "telesales"];
/** Câu lệch giữa vai đọc lại và vai mong — rỗng là khớp. */
const lech = (thuc: readonly string[], mong: readonly string[]) => [
  ...mong.filter((v) => !thuc.includes(v)).map((v) => `thiếu vai: ${v}`),
  ...thuc.filter((v) => !mong.includes(v)).map((v) => `thừa vai: ${v}`),
];
const vaiCua = async (companyId: string, userId: string) =>
  (await appPool.query<{ roles: string[] }>("select roles from company_members where company_id = $1 and user_id = $2", [companyId, userId])).rows[0]!.roles;
const idCua = async (email: string) => (await identityPool.query<{ id: string }>('select id from identity."user" where email = $1', [email])).rows[0]!.id;

async function sanCoQuanTri(ten: string) {
  const email = mail(`dv-${ten}-qt`);
  const s = await openCompany(`[Sàn ${RUN} đủ vai ${ten}]`, email);
  return { ...s, cookie: `${await login(email)}; qh_san=${s.companyId}` };
}
const moi = async (cookie: string, email: string, roles: string[]) => {
  const res = await send("POST", "/api/v1/company/members", { email, roles, zoneIds: [] }, cookie);
  assert.equal(res.status, 201, await res.clone().text());
  return ((await res.json()) as { userId: string }).userId;
};
const sua = async (cookie: string, userId: string, roles: string[]) => {
  const res = await send("PATCH", `/api/v1/company/members/${userId}`, { roles }, cookie);
  assert.equal(res.status, 200, await res.clone().text());
};

// ---- AC-4: máy chủ lưu đúng điều được gửi ----
test("lưu đúng mảng đã gửi: POST một vai, POST năm vai, PATCH từ năm xuống một", async () => {
  const s = await sanCoQuanTri("luu");
  const motVai = await moi(s.cookie, mail("dv-mot"), ["company_admin"]);
  assert.deepEqual(lech(await vaiCua(s.companyId, motVai), ["company_admin"]), [], "POST một vai không được tự thêm");
  const duVai = await moi(s.cookie, mail("dv-nam"), NAM);
  assert.deepEqual(lech(await vaiCua(s.companyId, duVai), NAM), [], "POST năm vai");
  await sua(s.cookie, duVai, ["company_admin"]);
  assert.deepEqual(await vaiCua(s.companyId, duVai), ["company_admin"], "PATCH phải thay thế, không gộp");
});

test("đối chứng đỏ của phép so vai: bản giả tự thêm vai và bản giả gộp mảng đều bị bắt, nêu đúng vai", () => {
  const giaTuThem = (gui: string[]) => [...gui, "telesales"];
  const giaGop = (cu: string[], gui: string[]) => [...new Set([...cu, ...gui])];
  assert.deepEqual(lech(giaTuThem(["company_admin"]), ["company_admin"]), ["thừa vai: telesales"]);
  assert.deepEqual(lech(giaGop(["telesales", "company_admin"], ["company_admin"]), ["company_admin"]), ["thừa vai: telesales"]);
});

// ---- AC-3: chuỗi thao tác của hộp tới cơ sở dữ liệu ----
const bam = (vai: string[], ma: string, ap = apDoiVai) => ap(vai, vai.includes(ma) ? vai.filter((x) => x !== ma) : [...vai, ma]);

test("chuỗi thao tác của hộp tới cơ sở dữ liệu: Mời, Sửa thêm vai, Sửa gỡ bớt", async () => {
  const s = await sanCoQuanTri("hop");
  const hopMoi = bam(bam([], "company_admin"), "telesales");
  const nguoiMoi = await moi(s.cookie, mail("dv-hop-moi"), hopMoi);
  assert.deepEqual(lech(await vaiCua(s.companyId, nguoiMoi), ["buyer_agent", "company_admin", "listing_agent", "team_lead"]), []);

  const ts = await moi(s.cookie, mail("dv-hop-ts"), ["telesales"]);
  await sua(s.cookie, ts, bam(["telesales"], "team_lead"));
  assert.deepEqual(lech(await vaiCua(s.companyId, ts), ["telesales", "team_lead", "listing_agent", "buyer_agent"]), []);

  const du = await moi(s.cookie, mail("dv-hop-du"), NAM);
  let vai = NAM;
  for (const ma of ["telesales", "listing_agent", "buyer_agent", "team_lead"]) vai = bam(vai, ma);
  await sua(s.cookie, du, vai);
  assert.deepEqual(await vaiCua(s.companyId, du), ["company_admin"]);
});

test("đối chứng đỏ: hộp không gọi kéo theo thì chuỗi Mời lệch, nêu đúng vai thiếu", () => {
  const giaKhongKeo = (_t: string[], sau: string[]) => sau;
  assert.deepEqual(lech(bam([], "company_admin", giaKhongKeo), NAM), ["thiếu vai: buyer_agent", "thiếu vai: listing_agent", "thiếu vai: team_lead", "thiếu vai: telesales"]);
});

// ---- AC-5: mở sàn thật rồi đọc lại quyền ----
test("mở sàn rồi đọc lại quyền: người đầu tiên có đủ năm vai, sáu nhà, ba nút; người chỉ cấu hình một nhà", async () => {
  const email = mail("dv-mo-san");
  const c = await appPool.connect();
  let companyId: string;
  try {
    await c.query("begin");
    companyId = (await moSan(c, { ten: `[Sàn ${RUN} mở thật]`, email })).companyId;
    await c.query("commit");
  } finally {
    c.release();
  }
  const res = await send("GET", "/api/v1/me", undefined, `${await login(email)}; qh_san=${companyId}`);
  assert.equal(res.status, 200);
  const me = (await res.json()) as { activeCompany: { id: string; roles: string[] } };
  assert.equal(me.activeCompany.id, companyId);
  assert.deepEqual(lech(me.activeCompany.roles, NAM), []);
  const nav = navigationFor(me.activeCompany.roles);
  assert.deepEqual(nav.homes, ["today", "inventory", "shares", "contacts", "team", "settings"]);
  assert.deepEqual(nav.actions, ["new_lead", "import", "export"]);
  const chiCauHinh = navigationFor(["company_admin"]);
  assert.deepEqual([chiCauHinh.homes, chiCauHinh.actions], [["settings"], []]);
});

// ---- AC-6: thấy chủ nhà, vết mở số, người chỉ cấu hình ----
const TEN = "[Tên chủ mẫu]";
const SO = "0900000012";
const CHU = { ownerName: TEN, ownerPhone: "0900 000 012", floorPrice: 3_200_000_000 };
const demVet = async (id: string) => (await appPool.query<{ n: number }>("select count(*)::int n from owner_phone_reveals where listing_id = $1", [id])).rows[0]!.n;
const tuChoiDung = (status: number, body: Record<string, unknown>) => status === 404 && body.error === "not-found";

async function hangCoChu(cookie: string) {
  const tao = await send("POST", "/api/v1/listings", { buildingName: "[Toà mẫu]", unitNumber: "A-1201" }, cookie);
  assert.equal(tao.status, 201);
  let h = (await tao.json()) as { id: string; version: number };
  await themAnhThat(h.id);
  for (const [type, payload] of [
    ["price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }],
    ["details_changed", { legalStatus: "pink_book", occupantType: "vacant" }],
    ["status_changed", { to: "Active" }],
  ] as const) {
    const res = await send("POST", `/api/v1/listings/${h.id}/events`, { type, payload, expectedVersion: h.version }, cookie);
    assert.equal(res.status, 200, await res.clone().text());
    h = (await res.json()) as { id: string; version: number };
  }
  assert.equal((await send("PUT", `/api/v1/listings/${h.id}/owner`, CHU, cookie)).status, 200);
  return h.id;
}

test("đủ vai thấy chủ nhà, mỗi lần mở số một vết; chỉ cấu hình bị từ chối, không vết, cùng phiên đọc được Người dùng", async () => {
  const s = await sanCoQuanTri("nguon");
  const emailDc = mail("dv-nguon-dc");
  const dc = await createLoneUser(emailDc);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, '{listing_agent}')", [s.companyId, dc]);
  const id = await hangCoChu(`${await login(emailDc)}; qh_san=${s.companyId}`);

  const emailDu = mail("dv-nguon-du");
  await moi(s.cookie, emailDu, NAM);
  assert.ok(await idCua(emailDu));
  const du = `${await login(emailDu)}; qh_san=${s.companyId}`;
  const doc = await send("GET", `/api/v1/listings/${id}/owner`, undefined, du);
  assert.equal(doc.status, 200, await doc.clone().text());
  assert.equal(((await doc.json()) as { ownerName?: string }).ownerName, TEN);
  const truoc = await demVet(id);
  for (const lan of [1, 2]) {
    const res = await send("POST", `/api/v1/listings/${id}/owner/phone-reveal`, undefined, du);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ownerPhone: SO });
    assert.equal(await demVet(id), truoc + lan, `lần mở ${lan} phải thêm đúng một dòng vết`);
  }

  const sauDu = await demVet(id);
  for (const duong of [["GET", `/api/v1/listings/${id}/owner`], ["POST", `/api/v1/listings/${id}/owner/phone-reveal`]] as const) {
    const res = await send(duong[0], duong[1], undefined, s.cookie);
    const than = (await res.json()) as Record<string, unknown>;
    assert.ok(tuChoiDung(res.status, than), `${duong[1]}: ${res.status} ${JSON.stringify(than)}`);
  }
  assert.equal(await demVet(id), sauDu, "người chỉ cấu hình không để lại vết");
  assert.equal((await send("GET", "/api/v1/company/members", undefined, s.cookie)).status, 200, "phiên của người chỉ cấu hình phải hợp lệ");
});

test("đối chứng đỏ của phép từ chối: bản giả cho xem nguồn, phiên hỏng đều không qua", () => {
  assert.equal(tuChoiDung(200, { ownerName: TEN }), false);
  assert.equal(tuChoiDung(401, { error: "unauthenticated" }), false);
  assert.equal(tuChoiDung(404, { error: "not-found" }), true);
});
