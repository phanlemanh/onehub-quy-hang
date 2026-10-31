// Phiên 30 ngày, trượt theo ngày dùng (hồ sơ phien-dang-nhap-30-ngay, AC-1..AC-5). Tuổi phiên giả bằng cách dời
// expiresAt của dòng phiên qua kết nối chủ, như ca «mã quá hạn» của ADR-0005.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { NextRequest, NextResponse } from "next/server";
import { proxy } from "../../../apps/web/src/proxy";
import { refreshSessionCookie } from "../../../apps/web/src/lib/session-refresh";
import { createApi } from "../src/app";
import { createAuth } from "../src/auth/auth";
import { SESSION_EXPIRES_SEC } from "../src/auth/constants";
import { captureSender } from "../src/auth/sender";
import { appPool, cleanup, identityPool, mail, openCompany, RUN } from "./helpers";

after(cleanup);

const THIRTY_DAYS_MS = SESSION_EXPIRES_SEC * 1000;
const SLACK_MS = 2 * 60 * 1000;

/** Auth và API trên một gốc — http như máy dev, https như bản thật (cookie mang tiền tố __Secure-). */
function stack(baseURL: string) {
  const capture = captureSender();
  const auth = createAuth({ identityPool, secret: "test-secret-".padEnd(40, "x"), baseURL, sender: capture.sender });
  const api = createApi({ appPool, identityPool, auth });
  return { baseURL, auth, api, sent: capture.sent };
}
type Stack = ReturnType<typeof stack>;

const post = (s: Stack, path: string, body: unknown) =>
  s.auth.handler(
    new Request(`${s.baseURL}/api/v1/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: s.baseURL },
      body: JSON.stringify(body),
    }),
  );
const getSession = (s: Stack, cookie: string) =>
  s.auth.handler(new Request(`${s.baseURL}/api/v1/auth/get-session`, { headers: { cookie } }));

/** Đăng nhập trọn bằng mã, trả phản hồi nhập mã, cặp tên=giá trị của cookie phiên và token của dòng phiên. */
async function signIn(s: Stack, who: string) {
  const email = mail(who);
  await openCompany(`[Sàn ${RUN} ${who}]`, email);
  await post(s, "/email-otp/send-verification-otp", { email, type: "sign-in" });
  const res = await post(s, "/sign-in/email-otp", { email, otp: s.sent.at(-1)!.otp });
  assert.equal(res.status, 200, "đăng nhập không thành");
  const raw = sessionSetCookie(res);
  assert.ok(raw, "đăng nhập không đặt cookie phiên");
  const pair = raw.split(";")[0]!;
  const token = decodeURIComponent(pair.slice(pair.indexOf("=") + 1)).split(".")[0]!;
  return { email, res, cookie: pair, token, raw };
}

function sessionSetCookie(res: Response): string | undefined {
  return res.headers.getSetCookie().find((c) => /^(__Secure-)?qh\.session_token=/.test(c));
}
const maxAgeOf = (setCookie: string) => Number(/Max-Age=(\d+)/i.exec(setCookie)?.[1]);

async function row(token: string) {
  const { rows } = await identityPool.query<{ expiresAt: Date; updatedAt: Date }>(
    `select "expiresAt", "updatedAt" from identity.session where token = $1`,
    [token],
  );
  assert.equal(rows.length, 1, "không thấy dòng phiên");
  return rows[0]!;
}
/** Dời hạn sao cho lần làm mới cuối cách bây giờ đúng `hours` giờ. */
async function age(token: string, hours: number) {
  await identityPool.query(
    `update identity.session set "expiresAt" = now() + interval '30 days' - make_interval(hours => $2) where token = $1`,
    [token, hours],
  );
}
function assertThirtyDaysFromNow(expiresAt: Date, what: string) {
  const off = Math.abs(expiresAt.getTime() - (Date.now() + THIRTY_DAYS_MS));
  assert.ok(off <= SLACK_MS, `${what}: hạn lệch ${Math.round(off / 1000)} giây so với 30 ngày kể từ bây giờ`);
}

test("phiên: đăng nhập đặt cookie và hạn 30 ngày", async () => {
  const s = stack("http://localhost:3461");
  const { raw, token } = await signIn(s, "dang-nhap");
  assert.equal(maxAgeOf(raw), 2592000, `cookie phiên mang Max-Age=${maxAgeOf(raw)}, mong 2592000`);
  assertThirtyDaysFromNow((await row(token)).expiresAt, "dòng phiên sau đăng nhập");
});

test("phiên: dùng lại sau hơn một ngày thì trượt cả hai nơi", async () => {
  const s = stack("http://localhost:3461");
  const { cookie, token } = await signIn(s, "truot");
  await age(token, 25);
  const res = await getSession(s, cookie);
  assert.equal(res.status, 200);
  const set = sessionSetCookie(res);
  assert.ok(set, "không có Set-Cookie phiên khi phiên đã hơn một ngày");
  assert.equal(maxAgeOf(set), 2592000, `Set-Cookie mang Max-Age=${maxAgeOf(set)}, mong 2592000`);
  assertThirtyDaysFromNow((await row(token)).expiresAt, "dòng phiên sau khi trượt");
});

test("phiên: dùng lại trong ngày không ghi gì", async () => {
  const s = stack("http://localhost:3461");
  const { email, cookie, token } = await signIn(s, "trong-ngay");
  await age(token, 1);
  const before = await row(token);
  const res = await getSession(s, cookie);
  assert.equal(res.status, 200);
  const body = (await res.json()) as { user?: { email?: string } } | null;
  assert.equal(body?.user?.email, email, "phiên trong ngày không đọc được");
  assert.equal(sessionSetCookie(res), undefined, "dùng trong ngày mà vẫn đặt lại cookie phiên");
  const afterRow = await row(token);
  assert.equal(afterRow.expiresAt.getTime(), before.expiresAt.getTime(), "expiresAt đã đổi khi dùng trong ngày");
  assert.equal(afterRow.updatedAt.getTime(), before.updatedAt.getTime(), "updatedAt đã đổi khi dùng trong ngày");
});

test("phiên: quá hạn thì như chưa đăng nhập", async () => {
  const s = stack("http://localhost:3461");
  const { cookie, token } = await signIn(s, "qua-han");
  const me = (c: string) => s.api.request(`${s.baseURL}/api/v1/me`, { headers: { cookie: c } });
  assert.equal((await me(cookie)).status, 200, "phiên còn hạn mà /me không trả 200");
  await identityPool.query(`update identity.session set "expiresAt" = now() - interval '1 second' where token = $1`, [token]);
  assert.equal((await me(cookie)).status, 401, "phiên quá hạn mà /me không trả 401");
  assert.equal(await (await getSession(s, cookie)).json(), null, "phiên quá hạn mà get-session vẫn trả phiên");
});

async function pageRefresh(s: Stack, cookie: string) {
  const req = new NextRequest(`${s.baseURL}/`, { headers: { cookie } });
  return refreshSessionCookie(req, NextResponse.next(), s.api);
}

test("mở trang: bước chặn đầu đặt lại cookie khi phiên đã hơn một ngày", async () => {
  const s = stack("http://localhost:3461");
  const { cookie, token } = await signIn(s, "mo-trang");
  await age(token, 25);
  const page = await pageRefresh(s, cookie);
  const set = sessionSetCookie(page);
  assert.ok(set, "trang không đặt lại cookie khi phiên đã hơn một ngày");
  assert.equal(set.split(";")[0], cookie, "cookie trang mang token khác token đã gửi");
  assert.equal(maxAgeOf(set), 2592000, `cookie trang mang Max-Age=${maxAgeOf(set)}, mong 2592000`);
  for (const attr of [/;\s*HttpOnly/i, /;\s*SameSite=Lax/i, /;\s*Path=\/(;|$)/i]) {
    assert.match(set, attr, `cookie trang thiếu thuộc tính ${attr}`);
  }
  assertThirtyDaysFromNow((await row(token)).expiresAt, "dòng phiên sau khi mở trang");

  // Đối chứng: phiên vừa làm mới thì phản hồi trang không mang cookie phiên.
  const again = await pageRefresh(s, cookie);
  assert.equal(sessionSetCookie(again), undefined, "phiên vừa làm mới mà trang vẫn đặt lại cookie");

  // Không cookie phiên: bước chặn đầu vẫn chuyển về /login.
  const anon = await proxy(new NextRequest(`${s.baseURL}/listings`));
  assert.equal(anon.status, 307, "không cookie mà proxy không chuyển hướng");
  assert.equal(new URL(anon.headers.get("location")!).pathname, "/login");
});

test("mở trang: bản https đặt lại cookie __Secure-", async () => {
  const s = stack("https://quy-hang.example.test");
  const { cookie, token, raw } = await signIn(s, "https");
  assert.match(raw, /^__Secure-qh\.session_token=/, "bản https không đặt cookie có tiền tố __Secure-");
  await age(token, 25);
  const set = sessionSetCookie(await pageRefresh(s, cookie));
  assert.ok(set, "bản https: trang không đặt lại cookie __Secure-qh.session_token");
  assert.match(set, /^__Secure-qh\.session_token=/, "bản https: cookie trang sai tên");
  assert.equal(maxAgeOf(set), 2592000, `bản https: Max-Age=${maxAgeOf(set)}, mong 2592000`);
  for (const attr of [/;\s*Secure/i, /;\s*HttpOnly/i]) assert.match(set, attr, `bản https: cookie trang thiếu ${attr}`);
});
