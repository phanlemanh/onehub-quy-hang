/**
 * Ngưỡng hỏi lại khi đổi giá (hàng 15, luật 7 «đổi quá khoảng 20% thì hỏi lại»). Thuần — trình sửa trên ô và bài kiểm
 * cùng đọc một hàm.
 */
import { CAU_HINH_SAN_MAC_DINH, laySo, macDinhSo, type CauHinhSan } from "../config/giai";
import type { FeeInclusion } from "./types";

/** Khoá phần trăm đổi giá vượt mức này thì hỏi lại (sổ điểm biến thiên #7, khoảng 5–50). */
export const KHOA_HOI_LAI_DOI_GIA = "price.change_confirm_pct";

/** Mặc định của sàn (20%) — số lấy từ sổ điểm biến thiên. */
export const MUC_HOI_LAI_DOI_GIA_PHAN_TRAM = macDinhSo(KHOA_HOI_LAI_DOI_GIA);

export type GiaKemPhi = { listPrice: number | null; feeInclusion: FeeInclusion | null };

export type HoiLai = {
  hoi: boolean;
  /** Đổi điều kiện phí — luôn hỏi: không so giá bao phí với không bao phí (luật 12). */
  doiPhi: boolean;
  /** Phần trăm đổi làm tròn tới số nguyên; null khi chưa có giá cũ. */
  phanTram: number | null;
};

/** `cauHinh` là cấu hình đã giải của sàn; vắng là mặc định của sổ. */
export function canHoiLai(
  cu: GiaKemPhi,
  moi: { listPrice: number; feeInclusion: FeeInclusion },
  cauHinh: CauHinhSan = CAU_HINH_SAN_MAC_DINH,
): HoiLai {
  if (cu.listPrice === null || cu.listPrice <= 0) return { hoi: false, doiPhi: false, phanTram: null };
  const phanTram = Math.round(((moi.listPrice - cu.listPrice) / cu.listPrice) * 100);
  const doiPhi = cu.feeInclusion !== null && cu.feeInclusion !== moi.feeInclusion;
  // So bằng số nguyên để biên 20% không lệch vì số thực: |mới − cũ| × 100 > ngưỡng × cũ.
  const vuot = Math.abs(moi.listPrice - cu.listPrice) * 100 > laySo(cauHinh, KHOA_HOI_LAI_DOI_GIA) * cu.listPrice;
  return { hoi: doiPhi || vuot, doiPhi, phanTram };
}

/** «+50%» · «−25%» · «0%». */
export function vietPhanTram(phanTram: number): string {
  if (phanTram > 0) return `+${phanTram}%`;
  if (phanTram < 0) return `−${Math.abs(phanTram)}%`;
  return "0%";
}
