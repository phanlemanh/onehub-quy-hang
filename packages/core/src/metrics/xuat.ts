/**
 * Số đo «Số lần xuất bảng hàng» (hàng 43 phat-hang, Tham chiếu §11 ô «Số lần xuất bảng hàng; …»): đếm lần xuất bảng hàng
 * có lúc xuất trong kỳ nửa mở `[tu, den)` — cận dưới tính, cận trên không. Kỳ không có lần xuất nào ra 0, không ra «chưa
 * có sự kiện». Ngưỡng không đặt ở đây (luật đợt 24).
 */
import { trongKy, type Ky } from "./hang";
import type { GiaTriSoDo, LanXuat } from "./kieu";

/**
 * Xuất bảng hàng (hàng 43): tên loại sự kiện của một lần xuất — mỗi dòng bảng `exports` là một sự kiện loại này. Luật
 * đợt 35: hàng 52 (bảng số đo) đọc theo hằng này, không gõ lại chữ.
 */
export const SU_KIEN_XUAT_BANG_HANG = "export_created";

/** Số lần xuất bảng hàng có `createdAt` trong `[tu, den)`. */
export function soLanXuat(lanXuat: readonly LanXuat[], ky: Ky): GiaTriSoDo {
  let so = 0;
  for (const l of lanXuat) if (trongKy(ky, l.createdAt)) so++;
  return { kieu: "dem", so, chiTiet: {} };
}
