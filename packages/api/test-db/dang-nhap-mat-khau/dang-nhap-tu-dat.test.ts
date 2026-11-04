// Đăng nhập bằng mật khẩu tự đặt (E5, AC-5): phiên 30 ngày, sai và email lạ cùng một lỗi, mã 6 số vẫn chạy, không tự đăng ký.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { SESSION_EXPIRES_SEC } from "../../src/auth/constants";
import { cleanup, cookieOf, identityPool, mail } from "../helpers";
import { dangNhapMa, dangNhapMk, nguoiCoMatKhau, req, send } from "./chung";

after(cleanup);

test("đăng nhập mật khẩu: đúng có phiên 30 ngày", async () => {
  const s = await nguoiCoMatKhau("gió thổi qua đồi");
  const res = await dangNhapMk(s.email.toUpperCase(), "gió thổi qua đồi");
  assert.equal(res.status, 200);
  const cookie = cookieOf(res);
  assert.ok(cookie.includes("qh.session_token="));
  assert.equal((await req("/api/v1/me", cookie)).status, 200);
  const { rows } = await identityPool.query<{ expiresAt: Date }>(
    `select "expiresAt" from identity.session where "userId" = $1 order by "createdAt" desc limit 1`,
    [s.userId],
  );
  assert.ok(Math.abs(rows[0]!.expiresAt.getTime() - (Date.now() + SESSION_EXPIRES_SEC * 1000)) < 60_000);
});

test("đăng nhập mật khẩu: sai và email lạ cùng một lỗi", async () => {
  const s = await nguoiCoMatKhau("gió thổi qua đồi");
  const sai = await dangNhapMk(s.email, "gió thổi qua sông");
  const la = await dangNhapMk(mail("khong-co-ai"), "gió thổi qua sông");
  assert.equal(sai.status, 401);
  assert.equal(la.status, 401);
  assert.equal(await sai.text(), await la.text(), "thân lỗi khác nhau lộ email có tài khoản");
});

test("đăng nhập mật khẩu: mã 6 số vẫn chạy", async () => {
  const s = await nguoiCoMatKhau("gió thổi qua đồi");
  const cookie = await dangNhapMa(s.email);
  assert.equal((await req("/api/v1/me", cookie)).status, 200);
});

test("đăng nhập mật khẩu: tự đăng ký 404", async () => {
  const email = mail("tu-dang-ky");
  const res = await send("POST", "/api/v1/auth/sign-up/email", { email, password: "gió thổi qua đồi", name: "[Tên]" });
  assert.equal(res.status, 404);
  const { rowCount } = await identityPool.query(`select 1 from identity."user" where email = $1`, [email]);
  assert.equal(rowCount, 0);
});
