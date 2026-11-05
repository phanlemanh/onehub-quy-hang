// Vào sàn khác (hàng va-dang-nhap-mat-khau, E2, E3): mật khẩu gốc sàn cấp bị khoá thì mọi phiên của người cũng bị thu;
// không có gì để khoá thì phiên và mật khẩu giữ nguyên.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup, cookieOf, identityPool } from "../helpers";
import { dangNhapMa, dangNhapMk, nguoiCoMatKhau, req, sanCoNguoi, send, soPhien } from "../dang-nhap-mat-khau/chung";

after(cleanup);

const MK = "gió thổi qua đồi";
const moi = (qt: string, email: string) => send("POST", "/api/v1/company/members", { email, roles: ["telesales"] }, qt);
const lyDo = async (userId: string) =>
  ((await identityPool.query("select disabled_reason from identity.password_state where user_id = $1", [userId])).rows[0] as
    | { disabled_reason: string | null }
    | undefined);

test("vào sàn khác: phiên cũ bị thu qua đường mời của API", async () => {
  const a = await nguoiCoMatKhau(MK);
  const may2 = cookieOf(await dangNhapMk(a.email, MK));
  const b = await sanCoNguoi();
  assert.equal((await moi(b.qt, a.email)).status, 201);
  for (const [ten, cookie] of [["máy một", a.cookie], ["máy hai", may2]] as const) {
    assert.equal((await req("/api/v1/me", cookie)).status, 401, `${ten}: GET /me còn sống`);
    assert.equal((await send("PUT", "/api/v1/me/password", { newPassword: "nắng vàng trên phố" }, cookie)).status, 401, `${ten}: đặt được mật khẩu mới`);
  }
  assert.equal(await soPhien(a.userId), 0);
  const cookie = await dangNhapMa(a.email);
  assert.equal((await req("/api/v1/me", cookie)).status, 200, "đăng nhập bằng mã sau đó không vào được");
});

test("vào sàn khác: giữ phiên khi không có gì để khoá", async () => {
  const hinh = ["tự đổi ở Cá nhân", "chưa có mật khẩu", "mời lại vào đúng sàn đã cấp"] as const;
  assert.equal(hinh.length, 3);
  for (const h of hinh) {
    let email: string, userId: string, cookie: string, mk: string | null, qtVao: string;
    if (h === "tự đổi ở Cá nhân") {
      const a = await nguoiCoMatKhau(MK);
      assert.equal((await send("PUT", "/api/v1/me/password", { currentPassword: MK, newPassword: "nắng vàng trên phố" }, a.cookie)).status, 200);
      ({ email, userId, cookie } = a);
      mk = "nắng vàng trên phố";
      qtVao = (await sanCoNguoi()).qt;
    } else if (h === "chưa có mật khẩu") {
      const a = await sanCoNguoi();
      ({ email, userId } = a);
      cookie = await dangNhapMa(email);
      mk = null;
      qtVao = (await sanCoNguoi()).qt;
    } else {
      const a = await nguoiCoMatKhau(MK);
      ({ email, userId, cookie } = a);
      mk = MK;
      assert.equal((await send("DELETE", `/api/v1/company/members/${userId}`, {}, a.qt)).status, 204);
      qtVao = a.qt;
    }
    const truoc = await soPhien(userId);
    assert.equal((await moi(qtVao, email)).status, 201, `hình «${h}»: lời mời`);
    assert.equal((await req("/api/v1/me", cookie)).status, 200, `hình «${h}»: phiên bị thu`);
    assert.equal(await soPhien(userId), truoc, `hình «${h}»: số phiên đổi`);
    const ld = await lyDo(userId);
    if (h === "chưa có mật khẩu") assert.equal(ld, undefined, `hình «${h}»: có dòng password_state`);
    else assert.equal(ld?.disabled_reason ?? null, null, `hình «${h}»: mật khẩu bị khoá`);
    if (mk) assert.equal((await dangNhapMk(email, mk)).status, 200, `hình «${h}»: đăng nhập bằng mật khẩu cũ`);
  }
});
