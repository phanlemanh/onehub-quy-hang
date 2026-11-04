/**
 * Độ tươi (luật 15): ngày xác nhận gần nhất với chủ nhà; căn nhạt dần theo tuổi. Lõi không đọc đồng hồ — «hôm nay»
 * truyền vào, nên bộ ca kiểm cho cùng số ở mọi máy.
 */

import { CAU_HINH_SAN_MAC_DINH, laySo, macDinhSo, type CauHinhSan } from "../config/giai";

/** Khoá «cần gọi lại» sau số ngày chưa xác nhận (luật 18, sổ điểm biến thiên #4). */
export const KHOA_GOI_LAI = "queue.call_back_after_days";

/** Mặc định «cần gọi lại» (14 ngày) — số lấy từ sổ điểm biến thiên. */
export const CALL_BACK_AFTER_DAYS = macDinhSo(KHOA_GOI_LAI);

export type Freshness =
  | { confirmed: false }
  | { confirmed: true; lastConfirmedAt: string; ageDays: number; needsCallBack: boolean };

const NGAY_MS = 24 * 60 * 60 * 1000;
const ngayUtc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

/** `today` là YYYY-MM-DD; tuổi tính theo ngày lịch UTC. `cauHinh` là cấu hình đã giải của sàn; vắng là mặc định của sổ. */
export function freshness(lastConfirmedAt: string | null, today: string, cauHinh: CauHinhSan = CAU_HINH_SAN_MAC_DINH): Freshness {
  if (!lastConfirmedAt) return { confirmed: false };
  const ageDays = Math.max(0, Math.round((ngayUtc(today) - ngayUtc(lastConfirmedAt)) / NGAY_MS));
  return { confirmed: true, lastConfirmedAt, ageDays, needsCallBack: ageDays >= laySo(cauHinh, KHOA_GOI_LAI) };
}
