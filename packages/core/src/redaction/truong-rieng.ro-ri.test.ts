// Rò rỉ trường riêng (hàng 47, E5, bất biến 4): giá trị và chữ trường riêng là lớp custom_field — căn mang trường riêng ra
// trang khách và bản phát hàng như căn không có, không mang mã, chữ hay giá trị trường riêng (kèm khi phát hàng để hàng sau).
import assert from "node:assert/strict";
import { test } from "node:test";
import { xuatBang, type CotGocNhin } from "../export";
import { banRaNgoai, canMoi, type CanNoiBo } from ".";

const TODAY = "2026-11-06";
// Mồi ngoài khuôn — chỉ để quét chuỗi; dựng tay trên bản nội bộ.
const MOI_MA = "moi_truong_rieng";
const MOI_GIA = "moi_gia_tri_rieng";
const MOI_TEN = "MOI-TEN-TRUONG";
const COT: readonly CotGocNhin[] = ["buildingName", "unitNumber", "livingArea", "listPrice", "feeInclusion", "standardStatus", { id: `custom:${MOI_MA}`, nhan: MOI_TEN }];
const canTruong = (): CanNoiBo => ({ ...canMoi(), customFields: { [MOI_MA]: MOI_GIA }, custom: { [MOI_MA]: MOI_GIA } }) as unknown as CanNoiBo;

/** Bộ quét: một bản ra có mang trường riêng không. */
const lot = (ban: unknown) => {
  const s = JSON.stringify(ban);
  return [MOI_MA, MOI_GIA, MOI_TEN].some((m) => s.includes(m)) || (typeof ban === "object" && ban !== null && ("custom" in ban || "customFields" in ban));
};

test("rò rỉ: trường riêng không ra ngoài", () => {
  for (const nguoiNhan of ["khach_rieng", "nhom_moi_gioi"] as const) {
    const ban = banRaNgoai(canTruong(), { cua: "gui_link", nguoiNhan, today: TODAY });
    assert.equal(lot(ban), false, `${nguoiNhan}: bản ra mang trường riêng`);
  }
  const xuat = xuatBang([canTruong()], { mau: "post_zalo", nguoiNhan: "nhom_moi_gioi", cot: COT, today: TODAY, tenSan: "[Tên sàn]" });
  assert.ok(xuat.boQua.includes(MOI_TEN), "cột trường riêng của góc nhìn phải bị bỏ qua");
  const { boQua: _bo, ...thanXuat } = xuat;
  void _bo;
  assert.equal(lot(thanXuat), false, "bản phát hàng mang trường riêng");

  // Đối chứng dương: một cửa ra lỡ chép custom thì bộ quét bắt được.
  const hong = { ...banRaNgoai(canTruong(), { cua: "gui_link", nguoiNhan: "khach_rieng", today: TODAY }), custom: { [MOI_MA]: MOI_GIA } };
  assert.equal(lot(hong), true);
});
