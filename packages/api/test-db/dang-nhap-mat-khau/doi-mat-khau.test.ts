// Đổi mật khẩu ở Cá nhân và «Báo mất máy» (E7, AC-7).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup, cookieOf } from "../helpers";
import { dangNhapMa, dangNhapMk, loiCua, nguoiCoMatKhau, req, sanCoNguoi, send, suKien } from "./chung";

after(cleanup);

const MK = "gió thổi qua đồi";
const MK2 = "nắng vàng trên phố";
const doi = (cookie: string, body: unknown) => send("PUT", "/api/v1/me/password", body, cookie);

test("đổi mật khẩu: cần mật khẩu hiện tại", async () => {
  const s = await nguoiCoMatKhau(MK);
  const may2 = cookieOf(await dangNhapMk(s.email, MK));
  const sai = await doi(s.cookie, { currentPassword: "sai hoàn toàn rồi", newPassword: MK2 });
  assert.deepEqual([sai.status, await loiCua(sai)], [403, "invalid-current-password"]);
  const thieu = await doi(s.cookie, { newPassword: MK2 });
  assert.equal(thieu.status, 403, "thiếu mật khẩu hiện tại vẫn đổi được");
  assert.equal((await doi(s.cookie, { currentPassword: MK, newPassword: MK2 })).status, 200);
  assert.equal((await req("/api/v1/me", may2)).status, 401, "phiên máy kia còn");
  assert.equal((await req("/api/v1/me", s.cookie)).status, 200, "phiên máy này bị thu");
  assert.ok((await suKien(s.userId)).includes("doi"));
  assert.equal((await dangNhapMk(s.email, MK2)).status, 200);
});

test("đổi mật khẩu: chưa có thì đặt không cần", async () => {
  const s = await sanCoNguoi();
  const cookie = await dangNhapMa(s.email);
  assert.equal(((await (await req("/api/v1/me", cookie)).json()) as { password: string }).password, "khong");
  assert.equal((await doi(cookie, { newPassword: MK })).status, 200);
  assert.equal(((await (await req("/api/v1/me", cookie)).json()) as { password: string }).password, "co");
  assert.equal((await dangNhapMk(s.email, MK)).status, 200);
});

test("đổi mật khẩu: cùng luật độ dài", async () => {
  const s = await nguoiCoMatKhau(MK);
  const res = await doi(s.cookie, { currentPassword: MK, newPassword: "bienxan" });
  assert.deepEqual([res.status, await loiCua(res)], [400, "password-too-short"]);
});

test("báo mất máy: vô hiệu mật khẩu", async () => {
  const s = await nguoiCoMatKhau(MK);
  const res = await send("POST", "/api/v1/me/devices/report-lost", {}, s.cookie);
  assert.equal(res.status, 200);
  const dn = await dangNhapMk(s.email, MK);
  assert.deepEqual([dn.status, await loiCua(dn)], [403, "password-disabled"]);
  assert.ok((await suKien(s.userId)).includes("vo-hieu-bao-mat"));
  assert.equal(((await (await req("/api/v1/me", s.cookie)).json()) as { password: string }).password, "vo-hieu");
  // Đặt lại ở Cá nhân không cần mật khẩu cũ (đã vô hiệu), rồi đăng nhập được.
  assert.equal((await doi(s.cookie, { newPassword: MK2 })).status, 200);
  assert.equal((await dangNhapMk(s.email, MK2)).status, 200);
});
