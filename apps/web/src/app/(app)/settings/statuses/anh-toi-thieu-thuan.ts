// Phần thuần của ô «Số ảnh thật tối thiểu» ở Cài đặt › Trạng thái (anh-khong-chan-ban, AC-8): khoảng lấy từ sổ điểm của
// lõi, thân gửi lối chung `PATCH /api/v1/company/settings`, câu lỗi nói khoảng. Không React, không mạng.
import { KHOA_ANH_THAT_TOI_THIEU, KHOANG_ANH_THAT_TOI_THIEU } from "@quy-hang/core/listing";

export const NHAN_O = "Số ảnh thật tối thiểu để căn vào Đang bán";
export const CAU_NGHIA = "0 — căn lên Đang bán khi chưa có ảnh; ảnh hiện là việc cần bổ sung. Đặt 1–20 thì căn phải đủ số ảnh thật mới lên.";
export const { min: TOI_THIEU_NHO, max: TOI_THIEU_LON } = KHOANG_ANH_THAT_TOI_THIEU;

/** Lỗi của giá trị gõ, hay `null` khi hợp lệ. */
export function loiToiThieu(n: number | null): string | null {
  if (n === null || !Number.isInteger(n) || n < TOI_THIEU_NHO || n > TOI_THIEU_LON) return `Cần số nguyên ${TOI_THIEU_NHO}–${TOI_THIEU_LON}`;
  return null;
}

export const thanLuuToiThieu = (n: number) => ({ [KHOA_ANH_THAT_TOI_THIEU]: n });

/** Giá trị đang áp từ phản hồi `GET /api/v1/company/settings`. */
export function toiThieuTuBan(ban: { items: { key: string; value: unknown }[] }): number {
  const v = ban.items.find((x) => x.key === KHOA_ANH_THAT_TOI_THIEU)?.value;
  return typeof v === "number" ? v : KHOANG_ANH_THAT_TOI_THIEU.min;
}
