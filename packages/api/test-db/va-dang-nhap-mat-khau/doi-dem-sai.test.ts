// Đổi mật khẩu ở Cá nhân đếm sai chung bộ đếm với đăng nhập (hàng va-dang-nhap-mat-khau, E4, E5, E6).
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup, cookieOf, identityPool } from "../helpers";
import { batNhatKy, dangNhapMk, loiCua, nguoiCoMatKhau, req, send, soPhien, suKien } from "../dang-nhap-mat-khau/chung";

after(cleanup);

const MK = "gió thổi qua đồi";
const MOI = "nắng vàng trên phố";
const doi = (cookie: string, body: unknown) => send("PUT", "/api/v1/me/password", body, cookie);
const soSai = async (email: string) =>
  Number((await identityPool.query<{ n: string }>("select count(*) as n from identity.password_failures where email = $1", [email.toLowerCase()])).rows[0]!.n);
const chuoi = async (userId: string) =>
  (await identityPool.query<{ failed_streak: number; disabled_reason: string | null }>(
    "select failed_streak, disabled_reason from identity.password_state where user_id = $1",
    [userId],
  )).rows[0]!;
const donCuaSo = (email: string) => identityPool.query("delete from identity.password_failures where email = $1", [email.toLowerCase()]);

test("đổi: sai mật khẩu hiện tại thì ghi một lần sai", async () => {
  const s = await nguoiCoMatKhau(MK);
  const truocSai = await soSai(s.email);
  const truocChuoi = (await chuoi(s.userId)).failed_streak;
  const res = await doi(s.cookie, { currentPassword: "sai hoàn toàn rồi", newPassword: MOI });
  assert.deepEqual([res.status, await loiCua(res)], [403, "invalid-current-password"]);
  assert.equal(await soSai(s.email), truocSai + 1);
  assert.equal((await chuoi(s.userId)).failed_streak, truocChuoi + 1);
});

test("đổi: 5 sai trong 15 phút thì chờ", async () => {
  const s = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 5; i++) assert.equal((await doi(s.cookie, { currentPassword: `sai lần ${i} rồi nhé`, newPassword: MOI })).status, 403, `lần ${i}`);
  const res = await doi(s.cookie, { currentPassword: MK, newPassword: MOI });
  assert.deepEqual([res.status, await loiCua(res)], [429, "password-rate-limited"]);
  await donCuaSo(s.email);
  assert.equal((await dangNhapMk(s.email, MK)).status, 200, "mật khẩu đổi dù bị chặn");
});

test("đổi: bộ đếm chung với đăng nhập", async () => {
  const s = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 3; i++) await dangNhapMk(s.email, "sai ở đăng nhập nhé");
  for (let i = 1; i <= 2; i++) await doi(s.cookie, { currentPassword: "sai ở đổi rồi nhé", newPassword: MOI });
  const res = await doi(s.cookie, { currentPassword: MK, newPassword: MOI });
  assert.deepEqual([res.status, await loiCua(res)], [429, "password-rate-limited"]);
});

test("đổi: chiều ngược — sai ở đổi thì đăng nhập chờ", async () => {
  const bon = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 4; i++) await doi(bon.cookie, { currentPassword: "sai ở đổi rồi nhé", newPassword: MOI });
  assert.equal((await dangNhapMk(bon.email.toUpperCase(), MK)).status, 200, "đối chứng: 4 lần đổi sai mà đăng nhập bị chặn");
  const nam = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 5; i++) await doi(nam.cookie, { currentPassword: "sai ở đổi rồi nhé", newPassword: MOI });
  const res = await dangNhapMk(nam.email.toUpperCase(), MK);
  assert.deepEqual([res.status, await loiCua(res)], [429, "password-rate-limited"]);
});

test("đổi: lần sai thứ 20 khoá và thu mọi phiên", async () => {
  const s = await nguoiCoMatKhau(MK);
  cookieOf(await dangNhapMk(s.email, MK));
  await donCuaSo(s.email);
  await identityPool.query("update identity.password_state set failed_streak = 19 where user_id = $1", [s.userId]);
  assert.equal(await soPhien(s.userId), 2);
  const res = await doi(s.cookie, { currentPassword: "sai lần hai mươi nhé", newPassword: MOI });
  assert.equal(res.status, 403);
  assert.equal((await chuoi(s.userId)).disabled_reason, "khoa-20");
  assert.ok((await suKien(s.userId)).includes("khoa-20"));
  assert.equal(await soPhien(s.userId), 0, "phiên còn sau khi khoá");
  assert.equal((await doi(s.cookie, { newPassword: MOI })).status, 401, "phiên cũ đặt được mật khẩu mới sau khi khoá");
});

test("khoá qua đăng nhập cũng thu mọi phiên", async () => {
  const s = await nguoiCoMatKhau(MK);
  await donCuaSo(s.email);
  await identityPool.query("update identity.password_state set failed_streak = 19 where user_id = $1", [s.userId]);
  const res = await dangNhapMk(s.email, "sai lần hai mươi nhé");
  assert.equal(res.status, 401);
  assert.equal((await chuoi(s.userId)).disabled_reason, "khoa-20");
  assert.equal(await soPhien(s.userId), 0, "phiên còn sau khi khoá qua đăng nhập");
  assert.equal((await doi(s.cookie, { newPassword: MOI })).status, 401, "phiên cũ đặt được mật khẩu mới");
});

test("đổi: đúng giữa chừng thì về 0", async () => {
  const s = await nguoiCoMatKhau(MK);
  for (let i = 1; i <= 3; i++) await doi(s.cookie, { currentPassword: "sai giữa chừng nhé", newPassword: MOI });
  assert.equal((await doi(s.cookie, { currentPassword: MK, newPassword: MOI })).status, 200);
  assert.equal((await chuoi(s.userId)).failed_streak, 0);
});

test("đổi: không in mật khẩu ở nhánh mới", async () => {
  const a = await nguoiCoMatKhau(MK);
  const b = await nguoiCoMatKhau(MK);
  const bang: [ten: string, goi: () => Promise<Response>, ket: [number, string], bi: string[]][] = [
    ["sai mật khẩu hiện tại 403", async () => doi(a.cookie, { currentPassword: "bí mật sai một", newPassword: "bí mật mới một" }), [403, "invalid-current-password"], ["bí mật sai một", "bí mật mới một"]],
    ["chờ 429", async () => {
      for (let i = 0; i < 5; i++) await doi(b.cookie, { currentPassword: "lót đường nhé", newPassword: MOI });
      return doi(b.cookie, { currentPassword: "bí mật chờ hai", newPassword: "bí mật mới hai" });
    }, [429, "password-rate-limited"], ["bí mật chờ hai", "bí mật mới hai"]],
    ["lần sai khoá", async () => {
      await donCuaSo(a.email);
      await identityPool.query("update identity.password_state set failed_streak = 19 where user_id = $1", [a.userId]);
      return doi(a.cookie, { currentPassword: "bí mật khoá ba", newPassword: "bí mật mới ba" });
    }, [403, "invalid-current-password"], ["bí mật khoá ba", "bí mật mới ba"]],
  ];
  assert.equal(bang.length, 3);
  for (const [ten, goi, [status, ma], bi] of bang) {
    const { kq, dong } = await batNhatKy(goi);
    assert.equal(kq.status, status, `${ten}: đi nhầm nhánh`);
    assert.equal(await loiCua(kq), ma, `${ten}: mã lỗi`);
    for (const x of bi) assert.equal(dong.find((d) => d.includes(x)), undefined, `${ten}: nhật ký có chuỗi bí mật`);
  }
  const { dong } = await batNhatKy(async () => console.error("mồi-nhật-ký-va"));
  assert.ok(dong.some((d) => d.includes("mồi-nhật-ký-va")), "đối chứng dương: bộ bắt không ghi được");
});
