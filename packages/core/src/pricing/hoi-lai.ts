/**
 * Ngưỡng hỏi lại khi đổi giá (hàng 15, luật 7 «đổi quá khoảng 20% thì hỏi lại»). Thuần — trình sửa trên ô và bài kiểm
 * cùng đọc một hàm.
 */
import type { FeeInclusion } from "./types";

/**
 * Mặc định của sàn: phần trăm đổi giá vượt mức này thì hỏi lại (khoá `price.change_confirm_pct`,
 * `docs/architecture/so-diem-bien-thien.md`; sàn chỉnh trong 5–50 ở Cài đặt sàn — hàng cấu hình theo sàn đọc hằng này).
 */
export const MUC_HOI_LAI_DOI_GIA_PHAN_TRAM = 20;

export type GiaKemPhi = { listPrice: number | null; feeInclusion: FeeInclusion | null };

export type HoiLai = {
  hoi: boolean;
  /** Đổi điều kiện phí — luôn hỏi: không so giá bao phí với không bao phí (luật 12). */
  doiPhi: boolean;
  /** Phần trăm đổi làm tròn tới số nguyên; null khi chưa có giá cũ. */
  phanTram: number | null;
};

export function canHoiLai(cu: GiaKemPhi, moi: { listPrice: number; feeInclusion: FeeInclusion }): HoiLai {
  if (cu.listPrice === null || cu.listPrice <= 0) return { hoi: false, doiPhi: false, phanTram: null };
  const phanTram = Math.round(((moi.listPrice - cu.listPrice) / cu.listPrice) * 100);
  const doiPhi = cu.feeInclusion !== null && cu.feeInclusion !== moi.feeInclusion;
  // So bằng số nguyên để biên 20% không lệch vì số thực: |mới − cũ| × 100 > ngưỡng × cũ.
  const vuot = Math.abs(moi.listPrice - cu.listPrice) * 100 > MUC_HOI_LAI_DOI_GIA_PHAN_TRAM * cu.listPrice;
  return { hoi: doiPhi || vuot, doiPhi, phanTram };
}

/** «+50%» · «−25%» · «0%». */
export function vietPhanTram(phanTram: number): string {
  if (phanTram > 0) return `+${phanTram}%`;
  if (phanTram < 0) return `−${Math.abs(phanTram)}%`;
  return "0%";
}
