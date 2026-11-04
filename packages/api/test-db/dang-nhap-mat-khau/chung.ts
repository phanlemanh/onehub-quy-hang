// Đồ dùng chung của bộ kiểm mật khẩu do sàn cấp (hàng dang-nhap-mat-khau): app Hono trên Postgres thật, sàn có quản trị
// đăng nhập bằng mã, mời người, cấp mật khẩu tạm, đăng nhập bằng mật khẩu.
import assert from "node:assert/strict";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

export const { auth, sent } = makeAuth();
export const app = createApi({ appPool, identityPool, auth });

export const req = (path: string, cookie = "", init: RequestInit = {}) =>
  app.request(`${BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
  });
export const send = (method: string, path: string, body: unknown, cookie = "") => req(path, cookie, { method, body: JSON.stringify(body) });
export const loiCua = async (res: Response) => ((await res.clone().json()) as { error?: string }).error;

export async function dangNhapMa(email: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const ma = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(ma, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: ma.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}
export const vao = (cookie: string, companyId: string) => `${cookie}; qh_san=${companyId}`;

let dem = 0;
/** Sàn mới: quản trị đã đăng nhập (cookie đã chọn sàn) và một người chỉ thuộc sàn ấy. */
export async function sanCoNguoi(ten = `s${++dem}`) {
  const qtEmail = mail(`qt-${ten}`);
  const s = await openCompany(`[Sàn ${RUN} ${ten}]`, qtEmail);
  const qt = vao(await dangNhapMa(qtEmail), s.companyId);
  const email = mail(`nguoi-${ten}`);
  const r = await send("POST", "/api/v1/company/members", { email, roles: ["telesales"] }, qt);
  assert.equal(r.status, 201, `mời ${email}`);
  const userId = (await idCua(email))!;
  return { companyId: s.companyId, qt, qtEmail, email, userId };
}
export async function idCua(email: string): Promise<string | null> {
  const { rows } = await identityPool.query<{ id: string }>(`select id from identity."user" where email = $1`, [email]);
  return rows[0]?.id ?? null;
}

export async function capTam(qt: string, userId: string): Promise<{ status: number; tempPassword: string; expiresAt: string; res: Response }> {
  const res = await send("POST", `/api/v1/company/members/${userId}/temp-password`, {}, qt);
  const than = res.status === 200 ? ((await res.clone().json()) as { tempPassword: string; expiresAt: string }) : { tempPassword: "", expiresAt: "" };
  return { status: res.status, ...than, res };
}
export const dangNhapMk = (email: string, password: string) => send("POST", "/api/v1/auth/sign-in/email", { email, password });
export const datLanDau = (changeToken: string, newPassword: string) => send("POST", "/api/v1/auth/password/first", { changeToken, newPassword });

/** Người có mật khẩu tự đặt: cấp tạm, đăng nhập tạm, đặt lần đầu. Trả cookie phiên vừa tạo. */
export async function nguoiCoMatKhau(matKhau: string, ten?: string) {
  const s = await sanCoNguoi(ten);
  const t = await capTam(s.qt, s.userId);
  const d = await dangNhapMk(s.email, t.tempPassword);
  const { changeToken } = (await d.json()) as { changeToken: string };
  const r = await datLanDau(changeToken, matKhau);
  assert.equal(r.status, 200, "đặt lần đầu");
  return { ...s, cookie: cookieOf(r) };
}

export const trangThai = async (userId: string) =>
  (await identityPool.query("select * from identity.password_state where user_id = $1", [userId])).rows[0] as
    | { kind: string; origin: string; failed_streak: number; disabled_reason: string | null; temp_expires_at: Date | null }
    | undefined;
export const suKien = async (userId: string) =>
  (await identityPool.query<{ kind: string }>("select kind from identity.password_events where user_id = $1 order by id", [userId])).rows.map((r) => r.kind);
export const soPhien = async (userId: string) =>
  Number((await identityPool.query<{ n: string }>(`select count(*) as n from identity.session where "userId" = $1`, [userId])).rows[0]!.n);

/** Bắt mọi dòng console và stdout, stderr trong lúc chạy `fn` — để quét mật khẩu lọt vào nhật ký. */
export async function batNhatKy<T>(fn: () => Promise<T>): Promise<{ kq: T; dong: string[] }> {
  const dong: string[] = [];
  const goc = { log: console.log, info: console.info, warn: console.warn, error: console.error, debug: console.debug };
  const out = process.stdout.write.bind(process.stdout);
  const err = process.stderr.write.bind(process.stderr);
  const ghi = (...a: unknown[]) => void dong.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x, Object.getOwnPropertyNames(x ?? {})) ?? String(x))).join(" "));
  for (const k of Object.keys(goc) as (keyof typeof goc)[]) console[k] = ghi;
  process.stdout.write = ((s: string | Uint8Array) => (dong.push(String(s)), true)) as typeof process.stdout.write;
  process.stderr.write = ((s: string | Uint8Array) => (dong.push(String(s)), true)) as typeof process.stderr.write;
  try {
    return { kq: await fn(), dong };
  } finally {
    Object.assign(console, goc);
    process.stdout.write = out;
    process.stderr.write = err;
  }
}
