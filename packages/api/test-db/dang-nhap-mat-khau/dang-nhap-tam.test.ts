// Đăng nhập bằng mật khẩu tạm (E3, AC-3): không tạo phiên, chỉ cấp mã đổi; dùng lại được tới khi đặt xong hay hết hạn.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup, identityPool } from "../helpers";
import { capTam, dangNhapMk, datLanDau, loiCua, req, sanCoNguoi, soPhien } from "./chung";

after(cleanup);

test("đăng nhập tạm: không phiên", async () => {
  const s = await sanCoNguoi();
  const t = await capTam(s.qt, s.userId);
  const res = await dangNhapMk(s.email, t.tempPassword);
  assert.equal(res.status, 200);
  const than = (await res.json()) as { mustChange?: boolean; changeToken?: string };
  assert.equal(than.mustChange, true);
  assert.ok(than.changeToken && than.changeToken.length >= 32, "thiếu changeToken");
  assert.ok(!res.headers.getSetCookie().some((c) => c.includes("qh.session_token")), "đăng nhập tạm đặt cookie phiên");
  assert.equal((await req("/api/v1/me")).status, 401);
  assert.equal(await soPhien(s.userId), 0, "đăng nhập tạm tạo phiên");
});

test("đăng nhập tạm: dùng lại trước khi đặt xong", async () => {
  const s = await sanCoNguoi();
  const t = await capTam(s.qt, s.userId);
  const mot = ((await (await dangNhapMk(s.email, t.tempPassword)).json()) as { changeToken: string }).changeToken;
  const hai = ((await (await dangNhapMk(s.email, t.tempPassword)).json()) as { changeToken: string }).changeToken;
  assert.notEqual(mot, hai, "lần hai phải ra mã đổi mới");
  assert.equal((await datLanDau(mot, "mưa rơi trên mái nhà")).status, 403, "mã đổi lần một vẫn dùng được");
  assert.equal((await datLanDau(hai, "mưa rơi trên mái nhà")).status, 200);
  const sau = await dangNhapMk(s.email, t.tempPassword);
  assert.deepEqual([sau.status, await loiCua(sau)], [401, "invalid-email-or-password"], "mật khẩu tạm còn dùng sau khi đặt xong");
});

test("đăng nhập tạm: quá 72 giờ → 403 temp_password_expired", async () => {
  const s = await sanCoNguoi();
  const t = await capTam(s.qt, s.userId);
  await identityPool.query("update identity.password_state set temp_expires_at = now() - interval '1 minute' where user_id = $1", [s.userId]);
  const res = await dangNhapMk(s.email, t.tempPassword);
  assert.deepEqual([res.status, await loiCua(res)], [403, "temp-password-expired"]);
});

test("đăng nhập tạm: sai mật khẩu tạm → 401 invalid_email_or_password", async () => {
  const s = await sanCoNguoi();
  await capTam(s.qt, s.userId);
  const res = await dangNhapMk(s.email, "ABCDEFGHJKMNPQRS");
  assert.deepEqual([res.status, await loiCua(res)], [401, "invalid-email-or-password"]);
});

test("đăng nhập tạm: nhận dạng chia nhóm bằng gạch nối", async () => {
  const s = await sanCoNguoi();
  const t = await capTam(s.qt, s.userId);
  const res = await dangNhapMk(s.email, t.tempPassword.match(/.{4}/g)!.join("-"));
  assert.equal(res.status, 200);
});
