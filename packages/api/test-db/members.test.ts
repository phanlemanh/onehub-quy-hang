// Quản người của sàn (hàng 7: AC-1..AC-7, nửa máy AC-10) qua app Hono trên Postgres thật.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const req = (path: string, cookie = "", init: RequestInit = {}) =>
  app.request(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
  });
const send = (method: string, path: string, body: unknown, cookie = "") => req(path, cookie, { method, body: JSON.stringify(body) });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
const vao = (cookie: string, companyId: string) => `${cookie}; qh_san=${companyId}`;
const me = async (cookie: string) =>
  (await (await req("/api/v1/me", cookie)).json()) as { companies: { id: string; roles: string[] }[]; activeCompany: { id: string; roles: string[] } | null };

/** Sàn mới với một quản trị đã đăng nhập; trả cookie đã chọn sàn. */
async function sanMoi(ten: string) {
  const email = mail(`qt-${ten}`);
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, email);
  return { ...s, email, cookie: vao(await login(email), s.companyId) };
}
const moi = (cookie: string, body: unknown) => send("POST", "/api/v1/san/thanh-vien", body, cookie);

test("mời: email chưa có tài khoản vào thẳng sàn với hai vai", async () => {
  const a = await sanMoi("m1");
  const email = mail("moi-1");
  assert.equal((await moi(a.cookie, { email, roles: ["listing_agent", "buyer_agent"] })).status, 201);
  const m = await me(await login(email));
  assert.equal(m.activeCompany?.id, a.companyId);
  assert.deepEqual(m.activeCompany?.roles, ["listing_agent", "buyer_agent"]);
});

test("mời: người ở sàn B vào thêm sàn A, vẫn một tài khoản", async () => {
  const a = await sanMoi("m2a");
  const b = await sanMoi("m2b");
  assert.equal((await moi(a.cookie, { email: b.email, roles: ["buyer_agent"] })).status, 201);
  const n = await identityPool.query('select count(*)::int n from identity."user" where email = $1', [b.email]);
  assert.equal(n.rows[0].n, 1);
  const ids = (await me(await login(b.email))).companies.map((c) => c.id).sort();
  assert.deepEqual(ids, [a.companyId, b.companyId].sort());
});

test("mời: email đã là thành viên trả 409 da-la-thanh-vien, không đổi gì", async () => {
  const a = await sanMoi("m3");
  const email = mail("moi-3");
  await moi(a.cookie, { email, roles: ["telesales"] });
  const truoc = await appPool.query("select count(*)::int n from company_members where company_id = $1", [a.companyId]);
  const res = await moi(a.cookie, { email, roles: ["team_lead"] });
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { error: "da-la-thanh-vien" });
  const sau = await appPool.query("select count(*)::int n from company_members where company_id = $1", [a.companyId]);
  assert.equal(sau.rows[0].n, truoc.rows[0].n);
});

test("mời: email mới và email đã có tài khoản trả cùng mã và cùng hình dạng thân", async () => {
  const a = await sanMoi("m4");
  const b = await sanMoi("m4b");
  const r1 = await moi(a.cookie, { email: mail("moi-4-moi"), roles: ["telesales"] });
  const r2 = await moi(a.cookie, { email: b.email, roles: ["telesales"] });
  assert.equal(r1.status, r2.status);
  assert.deepEqual(Object.keys((await r1.json()) as object).sort(), Object.keys((await r2.json()) as object).sort());
});

test("mời: email viết hoa có khoảng trắng gắn vào cùng tài khoản", async () => {
  const a = await sanMoi("m5");
  const b = await sanMoi("m5b");
  assert.equal((await moi(a.cookie, { email: `  ${b.email.toUpperCase()} `.trim(), roles: ["telesales"] })).status, 201);
  const n = await identityPool.query('select count(*)::int n from identity."user" where lower(email) = $1', [b.email]);
  assert.equal(n.rows[0].n, 1);
});

test("mời: danh sách vai rỗng trả 400 can-it-nhat-mot-vai, không tạo tài khoản", async () => {
  const a = await sanMoi("m6");
  const email = mail("moi-6");
  const res = await moi(a.cookie, { email, roles: [] });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "can-it-nhat-mot-vai" });
  assert.equal((await identityPool.query('select 1 from identity."user" where email = $1', [email])).rowCount, 0);
});

test("vai: năm giá trị nhận, giá trị lạ API trả 400", async () => {
  const a = await sanMoi("v1");
  for (const vai of ["telesales", "listing_agent", "buyer_agent", "team_lead", "company_admin"]) {
    assert.equal((await moi(a.cookie, { email: mail(`vai-${vai}`), roles: [vai] })).status, 201, vai);
  }
  const res = await moi(a.cookie, { email: mail("vai-la"), roles: ["giam_doc"] });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "vai-khong-hop-le" });
});

test("vai: đổi vai có hiệu lực ở lời gọi kế", async () => {
  const a = await sanMoi("v2");
  const email = mail("vai-doi");
  const { userId } = (await (await moi(a.cookie, { email, roles: ["telesales"] })).json()) as { userId: string };
  const ck = await login(email);
  assert.deepEqual((await me(ck)).activeCompany?.roles, ["telesales"]);
  assert.equal((await send("PATCH", `/api/v1/san/thanh-vien/${userId}`, { roles: ["team_lead", "buyer_agent"] }, a.cookie)).status, 200);
  assert.deepEqual((await me(ck)).activeCompany?.roles, ["team_lead", "buyer_agent"]);
});

test("khu: tạo và giao khu, thành viên mang đúng khu", async () => {
  const a = await sanMoi("k1");
  const khu = (await (await send("POST", "/api/v1/san/khu", { name: `[Toà ${RUN} K1]` }, a.cookie)).json()) as { id: string; name: string };
  const email = mail("khu-1");
  await moi(a.cookie, { email, roles: ["listing_agent"], zoneIds: [khu.id] });
  const ds = (await (await req("/api/v1/san/thanh-vien", a.cookie)).json()) as { email: string; zones: { id: string }[] }[];
  assert.deepEqual(ds.find((m) => m.email === email)?.zones.map((z) => z.id), [khu.id]);
});

test("khu: tên trùng trong một sàn bị từ chối", async () => {
  const a = await sanMoi("k2");
  assert.equal((await send("POST", "/api/v1/san/khu", { name: "[Toà trùng]" }, a.cookie)).status, 201);
  const res = await send("POST", "/api/v1/san/khu", { name: "[Toà trùng]" }, a.cookie);
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { error: "khu-trung-ten" });
});

test("khu: giao khu của sàn B bị từ chối ở API (400) và ở cơ sở dữ liệu (khoá ngoại)", async () => {
  const a = await sanMoi("k3a");
  const b = await sanMoi("k3b");
  const khuB = (await (await send("POST", "/api/v1/san/khu", { name: "[Toà B]" }, b.cookie)).json()) as { id: string };
  const res = await moi(a.cookie, { email: mail("khu-3"), roles: ["telesales"], zoneIds: [khuB.id] });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "khu-khong-thuoc-san" });
});

test("bỏ khỏi sàn: lời gọi kế không vào A, khu ở A mất theo", async () => {
  const a = await sanMoi("b1");
  const khu = (await (await send("POST", "/api/v1/san/khu", { name: "[Toà bỏ]" }, a.cookie)).json()) as { id: string };
  const email = mail("bo-1");
  const { userId } = (await (await moi(a.cookie, { email, roles: ["buyer_agent"], zoneIds: [khu.id] })).json()) as { userId: string };
  const ck = vao(await login(email), a.companyId);
  assert.equal(((await (await req("/api/v1/san", ck)).json()) as { id: string }).id, a.companyId, "đối chứng: trước khi bỏ vào được A");
  assert.equal((await send("DELETE", `/api/v1/san/thanh-vien/${userId}`, {}, a.cookie)).status, 204);
  const sau = await req("/api/v1/san", ck);
  assert.equal(sau.status, 403);
  assert.deepEqual(await sau.json(), { error: "chua-gan-san" });
  assert.equal((await appPool.query("select 1 from member_zones where company_id = $1 and user_id = $2", [a.companyId, userId])).rowCount, 0);
});

test("gỡ vai quản trị: phiên cũ mất quyền ghi ngay", async () => {
  const a = await sanMoi("g1");
  const email = mail("qt-thu-hai");
  const { userId } = (await (await moi(a.cookie, { email, roles: ["company_admin"] })).json()) as { userId: string };
  const ck = vao(await login(email), a.companyId);
  assert.equal((await moi(ck, { email: mail("g1-truoc"), roles: ["telesales"] })).status, 201, "đối chứng: trước khi gỡ mời được");
  assert.equal((await send("PATCH", `/api/v1/san/thanh-vien/${userId}`, { roles: ["buyer_agent"] }, a.cookie)).status, 200);
  const sau = await moi(ck, { email: mail("g1-sau"), roles: ["telesales"] });
  assert.equal(sau.status, 403);
  assert.deepEqual(await sau.json(), { error: "can-quan-tri" });
});

test("không phải quản trị: năm đường quản người trả 403 can-quan-tri", async () => {
  const a = await sanMoi("q1");
  const email = mail("thuong-1");
  const { userId } = (await (await moi(a.cookie, { email, roles: ["buyer_agent"] })).json()) as { userId: string };
  const ck = vao(await login(email), a.companyId);
  const duong = (cookie: string) => [
    () => req("/api/v1/san/thanh-vien", cookie),
    () => moi(cookie, { email: mail(`q1-${cookie === ck ? "t" : "a"}`), roles: ["telesales"] }),
    () => send("PATCH", `/api/v1/san/thanh-vien/${userId}`, { roles: ["buyer_agent"] }, cookie),
    () => send("POST", "/api/v1/san/khu", { name: `[Toà q1 ${cookie === ck ? "t" : "a"}]` }, cookie),
  ];
  for (const [i, goi] of duong(ck).entries()) {
    const res = await goi();
    assert.equal(res.status, 403, `đường ${i}`);
    assert.deepEqual(await res.json(), { error: "can-quan-tri" });
  }
  const xoa = await send("DELETE", `/api/v1/san/thanh-vien/${a.userId}`, {}, ck);
  assert.equal(xoa.status, 403, "DELETE");
  assert.equal((await req("/api/v1/san/khu", ck)).status, 200, "GET khu vẫn đọc được");
  for (const [i, goi] of duong(a.cookie).entries()) assert.ok((await goi()).status < 300, `đối chứng quản trị: đường ${i}`);
});

test("quản trị cuối: bỏ khỏi sàn bị từ chối 409 can-mot-quan-tri", async () => {
  const a = await sanMoi("c1");
  const res = await send("DELETE", `/api/v1/san/thanh-vien/${a.userId}`, {}, a.cookie);
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { error: "can-mot-quan-tri" });
});

test("quản trị cuối: gỡ vai quản trị bị từ chối 409 can-mot-quan-tri", async () => {
  const a = await sanMoi("c2");
  const res = await send("PATCH", `/api/v1/san/thanh-vien/${a.userId}`, { roles: ["buyer_agent"] }, a.cookie);
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { error: "can-mot-quan-tri" });
});

test("hai quản trị: gỡ một người được", async () => {
  const a = await sanMoi("c3");
  await moi(a.cookie, { email: mail("qt-c3-2"), roles: ["company_admin"] });
  assert.equal((await send("PATCH", `/api/v1/san/thanh-vien/${a.userId}`, { roles: ["team_lead"] }, a.cookie)).status, 200);
});

test("hai quản trị: tự gỡ vai quản trị cùng lúc đổi khu, khu mang đúng các khu đã chọn", async () => {
  const a = await sanMoi("c4");
  await moi(a.cookie, { email: mail("qt-c4-2"), roles: ["company_admin"] });
  const tao = async (t: string) =>
    ((await (await send("POST", "/api/v1/san/khu", { name: `[Toà ${RUN} C4 ${t}]` }, a.cookie)).json()) as { id: string }).id;
  const [k1, k2] = [await tao("1"), await tao("2")];
  const khuCua = async (cookie: string) =>
    ((await (await req("/api/v1/san/thanh-vien", cookie)).json()) as { userId: string; zones: { id: string }[] }[])
      .find((m) => m.userId === a.userId)
      ?.zones.map((z) => z.id)
      .sort();
  // Đối chứng: còn quản trị thì giao khu được.
  assert.equal((await send("PATCH", `/api/v1/san/thanh-vien/${a.userId}`, { zoneIds: [k1] }, a.cookie)).status, 200);
  assert.deepEqual(await khuCua(a.cookie), [k1], "đối chứng: chưa giao được khu k1");
  // Tự gỡ vai quản trị và đổi khu trong cùng một lần lưu.
  const r = await send("PATCH", `/api/v1/san/thanh-vien/${a.userId}`, { roles: ["team_lead"], zoneIds: [k2] }, a.cookie);
  assert.equal(r.status, 200, `tự gỡ vai kèm đổi khu trả ${r.status}`);
  const qt2 = vao(await login(mail("qt-c4-2")), a.companyId);
  assert.deepEqual(await khuCua(qt2), [k2], "khu sau khi tự gỡ vai không phải các khu đã chọn");
});

test("hai quản trị: tự gỡ vai quản trị và bỏ hết khu, không còn khu cũ", async () => {
  const a = await sanMoi("c5");
  await moi(a.cookie, { email: mail("qt-c5-2"), roles: ["company_admin"] });
  const k = ((await (await send("POST", "/api/v1/san/khu", { name: `[Toà ${RUN} C5]` }, a.cookie)).json()) as { id: string }).id;
  assert.equal((await send("PATCH", `/api/v1/san/thanh-vien/${a.userId}`, { zoneIds: [k] }, a.cookie)).status, 200);
  assert.equal((await send("PATCH", `/api/v1/san/thanh-vien/${a.userId}`, { roles: ["team_lead"], zoneIds: [] }, a.cookie)).status, 200);
  const qt2 = vao(await login(mail("qt-c5-2")), a.companyId);
  const ds = (await (await req("/api/v1/san/thanh-vien", qt2)).json()) as { userId: string; zones: { id: string }[] }[];
  assert.deepEqual(ds.find((m) => m.userId === a.userId)?.zones, [], "khu cũ vẫn còn sau khi bỏ hết khu");
});

test("luồng quản người qua HTTP", async () => {
  const a = await sanMoi("l1");
  const tenKhu = `[Toà ${RUN} luồng]`;
  const khu = (await (await send("POST", "/api/v1/san/khu", { name: tenKhu }, a.cookie)).json()) as { id: string };
  const email = mail("luong");
  const { userId } = (await (await moi(a.cookie, { email, roles: ["listing_agent", "buyer_agent"], zoneIds: [khu.id] })).json()) as { userId: string };
  type M = { email: string; roles: string[]; zones: { name: string }[] };
  const tim = async () => ((await (await req("/api/v1/san/thanh-vien", a.cookie)).json()) as M[]).find((m) => m.email === email);
  const m = await tim();
  assert.deepEqual({ roles: m?.roles, khu: m?.zones.map((z) => z.name) }, { roles: ["listing_agent", "buyer_agent"], khu: [tenKhu] });
  await send("PATCH", `/api/v1/san/thanh-vien/${userId}`, { roles: ["team_lead"] }, a.cookie);
  assert.deepEqual((await tim())?.roles, ["team_lead"]);
  await send("DELETE", `/api/v1/san/thanh-vien/${userId}`, {}, a.cookie);
  assert.equal(await tim(), undefined, "vẫn còn trong danh sách sau khi bỏ");
});
