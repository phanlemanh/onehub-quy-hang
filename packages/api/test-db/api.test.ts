// Sàn đang làm và đường /me, /company qua app Hono (AC-3, AC-4, AC-5, AC-6, AC-8 thời chạy, AC-10 nửa máy).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { createApi } from "../src/app";
import {
  appPool,
  BASE_URL,
  identityPool,
  cleanup,
  cookieOf,
  createLoneUser,
  makeAuth,
  mail,
  openCompany,
  recordingPool,
  RUN,
} from "./helpers";
import { API_ERRORS } from "../src/errors";

after(cleanup);

const rec = recordingPool(appPool);
const { auth, sent } = makeAuth();
const app = createApi({ appPool: rec.pool, identityPool, auth });

const req = (path: string, cookie = "", init: RequestInit = {}) =>
  app.request(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}), ...(init.headers ?? {}) },
  });
const post = (path: string, body: unknown, cookie = "") => req(path, cookie, { method: "POST", body: JSON.stringify(body) });

/** Đi trọn đăng nhập qua HTTP, trả cookie phiên. */
async function login(email: string): Promise<string> {
  const before = sent.length;
  assert.equal((await post("/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" })).status, 200);
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await post("/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
const withSan = (cookie: string, companyId: string) => `${cookie}; qh_san=${companyId}`;

test("một sàn: /company trả sàn A", async () => {
  const email = mail("a1");
  const a = await openCompany(`[Sàn ${RUN} A1]`, email);
  const cookie = await login(email);
  const res = await req("/api/v1/company", cookie);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { id: a.companyId, name: `[Sàn ${RUN} A1]` });
  const read = rec.records.filter((r) => /from companies where id = app\.current_company_id\(\)/.test(r.sql));
  assert.ok(read.length > 0 && read.every((r) => r.currentUser === "quy_hang_app"), JSON.stringify(read));
});

test("đường cũ trả 404", async () => {
  const email = mail("cu");
  const a = await openCompany(`[Sàn ${RUN} Cũ]`, email);
  const cookie = withSan(await login(email), a.companyId);
  assert.equal((await req("/api/v1/company", cookie)).status, 200, "đối chứng: cùng phiên vào được đường mới");
  const cu = [
    await req("/api/v1/san", cookie),
    await req("/api/v1/san/thanh-vien", cookie),
    await req("/api/v1/san/khu", cookie),
    await post("/api/v1/me/san", { companyId: a.companyId }, cookie),
  ];
  for (const [i, res] of cu.entries()) assert.equal(res.status, 404, `đường cũ thứ ${i + 1} còn phục vụ (${res.status})`);
});

test("chưa gắn sàn: /company 403 no-company, /me sàn rỗng", async () => {
  await openCompany(`[Sàn ${RUN} khác]`, mail("nguoi-khac"));
  const email = mail("le");
  await createLoneUser(email);
  const cookie = await login(email);
  const san = await req("/api/v1/company", cookie);
  assert.equal(san.status, 403);
  const body = await san.text();
  assert.deepEqual(JSON.parse(body), { error: API_ERRORS.noCompany.code });
  assert.doesNotMatch(body, new RegExp(RUN));
  const me = (await (await req("/api/v1/me", cookie)).json()) as { companies: unknown[]; activeCompany: unknown };
  assert.deepEqual(me.companies, []);
  assert.equal(me.activeCompany, null);
});

test("nhiều sàn: chưa chọn 409, chọn B, chọn C không thuộc 403, cookie giả, bỏ khỏi B", async (t) => {
  const email = mail("ab");
  const a = await openCompany(`[Sàn ${RUN} A2]`, email);
  const b = await openCompany(`[Sàn ${RUN} B2]`, email);
  const c = await openCompany(`[Sàn ${RUN} C2]`, mail("chu-c"));
  const cookie = await login(email);

  await t.test("nhiều sàn chưa chọn: /company 409 select-company", async () => {
    const res = await req("/api/v1/company", cookie);
    assert.equal(res.status, 409);
    assert.deepEqual(await res.json(), { error: API_ERRORS.selectCompany.code });
  });
  await t.test("chọn B: /company trả B", async () => {
    const pick = await post("/api/v1/me/company", { companyId: b.companyId }, cookie);
    assert.equal(pick.status, 200);
    assert.match(pick.headers.get("set-cookie") ?? "", new RegExp(`qh_san=${b.companyId}`));
    const res = await req("/api/v1/company", withSan(cookie, b.companyId));
    assert.equal(((await res.json()) as { id: string }).id, b.companyId);
  });
  await t.test("chọn C không thuộc: 403, /company không trả C", async () => {
    const pick = await post("/api/v1/me/company", { companyId: c.companyId }, cookie);
    assert.equal(pick.status, 403);
    assert.deepEqual(await pick.json(), { error: API_ERRORS.notAMember.code });
    assert.equal(pick.headers.get("set-cookie"), null);
  });
  await t.test("cookie qh_san giả mã C: không vào C", async () => {
    const res = await req("/api/v1/company", withSan(cookie, c.companyId));
    assert.equal(res.status, 409, "vào sàn không thuộc qua cookie giả");
  });
  await t.test("cookie qh_san không phải uuid: coi như chưa chọn", async () => {
    const res = await req("/api/v1/company", withSan(cookie, "khong-phai-uuid'; drop table companies;--"));
    assert.equal(res.status, 409);
  });
  await t.test("đổi sàn giữa hai lời gọi: lời gọi sau theo sàn mới", async () => {
    const first = (await (await req("/api/v1/company", withSan(cookie, a.companyId))).json()) as { id: string };
    const second = (await (await req("/api/v1/company", withSan(cookie, b.companyId))).json()) as { id: string };
    assert.deepEqual([first.id, second.id], [a.companyId, b.companyId]);
  });
  await t.test("bỏ khỏi B sau khi chọn: lời gọi kế không vào B", async () => {
    // Từ hàng 7 sàn phải còn một quản trị: dựng thêm quản trị cho B trước khi bỏ người này.
    await openCompany(`[Sàn ${RUN} B2]`, mail("qt-b2"));
    await appPool.query("delete from company_members where company_id = $1 and user_id = (select id from identity.\"user\" where email = $2)", [
      b.companyId,
      email,
    ]);
    const res = await req("/api/v1/company", withSan(cookie, b.companyId));
    assert.equal(res.status, 200);
    assert.equal(((await res.json()) as { id: string }).id, a.companyId, "vẫn vào B sau khi bị bỏ");
  });
});

test("chưa đăng nhập: /me, /company, POST /me/company đều 401", async () => {
  for (const res of [await req("/api/v1/me"), await req("/api/v1/company"), await post("/api/v1/me/company", { companyId: "x" })]) {
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: API_ERRORS.unauthenticated.code });
  }
});

test("sau đăng xuất: /me 401", async () => {
  const email = mail("dx");
  await openCompany(`[Sàn ${RUN} DX]`, email);
  const cookie = await login(email);
  assert.equal((await req("/api/v1/me", cookie)).status, 200);
  assert.equal((await post("/api/v1/auth/sign-out", {}, cookie)).status, 200);
  assert.equal((await req("/api/v1/me", cookie)).status, 401);
});

test("luồng trọn qua HTTP", async () => {
  const nonce = Math.random().toString(36).slice(2, 10);
  const name = `[Sàn E11 ${RUN} ${nonce}]`;
  const email = mail("e11");
  await openCompany(name, email);
  const cookie = await login(email);
  const san = (await (await req("/api/v1/company", cookie)).json()) as { name: string };
  assert.equal(san.name, name, `tên trả «${san.name}» khác tên ca dựng «${name}»`);
  assert.equal((await post("/api/v1/auth/sign-out", {}, cookie)).status, 200);
  assert.equal((await req("/api/v1/me", cookie)).status, 401);
});

test("một cửa truy vấn: thời chạy", async () => {
  // Các ca trên đã chạy qua pool bọc: một sàn, chưa gắn sàn, nhiều sàn, luồng trọn.
  assert.ok(rec.records.length > 0, "bộ ghi không ghi được câu nào — phép đo chưa chạy");
  const bad = rec.records.filter((r) => r.currentUser !== "quy_hang_app");
  assert.deepEqual(bad, [], "có truy vấn bảng public không chạy bằng quy_hang_app");
  // Đối chứng đỏ trên cùng bộ ghi: một câu chạy thẳng trên pool chủ phải bị đếm.
  const probe = recordingPool(appPool);
  await probe.pool.query("select 1 from companies limit 1");
  const caught = probe.records.filter((r) => r.currentUser !== "quy_hang_app");
  assert.equal(caught.length, 1, "bộ ghi không bắt được truy vấn ngoài cửa");
  assert.match(caught[0]!.sql, /select 1 from companies/);
});
