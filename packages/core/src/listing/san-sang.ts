import { khoangCua } from "../config/giai";
import { MAC_DINH_ANH_THAT_TOI_THIEU } from "./status";

/**
 * Cấu hình «Sẵn sàng bán» của sàn (hàng 23, Sổ điểm biến thiên): số ảnh thật tối thiểu để vào Đang bán. Sàn nâng được,
 * không bỏ được — khoảng bắt đầu từ 1 giữ nghĩa «Đang bán» của điều khoá K7.
 */
export const KHOA_ANH_THAT_TOI_THIEU = "listing.ready_min_real_photos";
export const KHOANG_ANH_THAT_TOI_THIEU = khoangCua(KHOA_ANH_THAT_TOI_THIEU);

export type CauHinhSanSang = { minRealPhotos: number; loi: string | null };

/** Đọc từ các dòng `company_settings` của sàn; khoá vắng → mặc định; giá trị ngoài khoảng hay sai kiểu → mặc định kèm lỗi nêu khoá. */
export function docCauHinhSanSang(rows: readonly { key: string; value: unknown }[]): CauHinhSanSang {
  const dong = rows.find((r) => r.key === KHOA_ANH_THAT_TOI_THIEU);
  if (!dong) return { minRealPhotos: MAC_DINH_ANH_THAT_TOI_THIEU, loi: null };
  const v = dong.value;
  const { min, max } = KHOANG_ANH_THAT_TOI_THIEU;
  if (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max) return { minRealPhotos: v, loi: null };
  return { minRealPhotos: MAC_DINH_ANH_THAT_TOI_THIEU, loi: `${KHOA_ANH_THAT_TOI_THIEU}: cần số nguyên ${min}–${max}, nhận ${JSON.stringify(v)}` };
}
