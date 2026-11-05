// Không mật khẩu, mật khẩu tạm hay mã đổi nào lọt vào nhật ký của máy chủ (E21, AC-1): bảng viết trước chín lời gọi.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { cleanup } from "../helpers";
import { batNhatKy, capTam, dangNhapMk, datLanDau, loiCua, nguoiCoMatKhau, sanCoNguoi, send } from "./chung";

after(cleanup);

const MK = "gió thổi qua đồi";

test("nhật ký: chín lời gọi mang mật khẩu không in mật khẩu", async () => {
  const a = await sanCoNguoi();
  const b = await nguoiCoMatKhau(MK);
  let tam = "";
  let ma = "";
  // Mỗi dòng ghim kết cục nó mang tên (status và mã lỗi): dòng rơi nhầm nhánh thì đỏ, không để phép quét âm tính xanh suông.
  const bang: [ten: string, goi: () => Promise<Response>, ket: [number, string | null], bi: () => string[]][] = [
    ["cấp mật khẩu tạm", async () => { const t = await capTam(a.qt, a.userId); tam = t.tempPassword; return t.res; }, [200, null], () => [tam]],
    ["đăng nhập mật khẩu đúng", async () => dangNhapMk(b.email, MK), [200, null], () => [MK]],
    ["đăng nhập mật khẩu sai", async () => dangNhapMk(b.email, "sai mất rồi nhé"), [401, "invalid-email-or-password"], () => ["sai mất rồi nhé"]],
    ["đăng nhập bằng mật khẩu tạm", async () => { const r = await dangNhapMk(a.email, tam); ma = ((await r.clone().json()) as { changeToken: string }).changeToken; return r; }, [200, null], () => [tam, ma]],
    ["đặt lần đầu từ chối 400", async () => datLanDau(ma, "ngắn!"), [400, "password-too-short"], () => [ma, "ngắn!"]],
    ["đặt lần đầu nhận", async () => datLanDau(ma, "mây trôi lững lờ"), [200, null], () => [ma, "mây trôi lững lờ"]],
    ["đổi ở Cá nhân từ chối 400", async () => send("PUT", "/api/v1/me/password", { currentPassword: MK, newPassword: "ngắn!" }, b.cookie), [400, "password-too-short"], () => [MK, "ngắn!"]],
    ["đổi ở Cá nhân sai mật khẩu hiện tại 403", async () => send("PUT", "/api/v1/me/password", { currentPassword: "không phải nó", newPassword: "nắng vàng trên phố" }, b.cookie), [403, "invalid-current-password"], () => ["không phải nó", "nắng vàng trên phố"]],
    ["đổi ở Cá nhân nhận", async () => send("PUT", "/api/v1/me/password", { currentPassword: MK, newPassword: "nắng vàng trên phố" }, b.cookie), [200, null], () => [MK, "nắng vàng trên phố"]],
  ];
  assert.equal(bang.length, 9);
  for (const [ten, goi, [status, ma], bi] of bang) {
    const { kq, dong } = await batNhatKy(goi);
    assert.equal(kq.status, status, `${ten}: đi nhầm nhánh (status ${kq.status})`);
    if (ma) assert.equal(await loiCua(kq), ma, `${ten}: đi nhầm nhánh (mã lỗi)`);
    for (const s of bi()) {
      assert.ok(s.length > 0, `${ten}: thiếu chuỗi để quét`);
      const lot = dong.find((d) => d.includes(s));
      assert.equal(lot, undefined, `${ten}: nhật ký có chuỗi bí mật`);
    }
  }
});

test("nhật ký: đối chứng dương — bộ bắt ghi được dòng console.error", async () => {
  const { dong } = await batNhatKy(async () => console.error("mồi-nhật-ký-E21"));
  assert.ok(dong.some((d) => d.includes("mồi-nhật-ký-E21")));
});
