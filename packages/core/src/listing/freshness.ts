/**
 * Độ tươi (luật 15): ngày xác nhận gần nhất với chủ nhà; căn nhạt dần theo tuổi. Lõi không đọc đồng hồ — «hôm nay»
 * truyền vào, nên bộ ca kiểm cho cùng số ở mọi máy.
 */

/** Mặc định «cần gọi lại» sau 14 ngày chưa xác nhận (luật 18); sàn chỉnh ở Cài đặt sàn sau. */
export const CALL_BACK_AFTER_DAYS = 14;

export type Freshness =
  | { confirmed: false }
  | { confirmed: true; lastConfirmedAt: string; ageDays: number; needsCallBack: boolean };

const NGAY_MS = 24 * 60 * 60 * 1000;
const ngayUtc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));

/** `today` là YYYY-MM-DD; tuổi tính theo ngày lịch UTC. */
export function freshness(lastConfirmedAt: string | null, today: string): Freshness {
  if (!lastConfirmedAt) return { confirmed: false };
  const ageDays = Math.max(0, Math.round((ngayUtc(today) - ngayUtc(lastConfirmedAt)) / NGAY_MS));
  return { confirmed: true, lastConfirmedAt, ageDays, needsCallBack: ageDays >= CALL_BACK_AFTER_DAYS };
}
