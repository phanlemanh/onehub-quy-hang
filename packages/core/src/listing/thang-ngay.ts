/**
 * Luật «thắng ngay» (Tham chiếu luật 10, hàng doi-nhan-so-phien-ban): lệnh ĐƯA căn vào Đang giao dịch hay Đã bán được ghi
 * dù phiên bản lệnh khai đã cũ. Lệnh không đưa căn đi đâu — đổi nhãn tại chỗ, lệnh soạn trên bản đã ở đích, lệnh tới khi
 * căn đã ở đích — đi qua phép so phiên bản như mọi lệnh. Một nguồn cho máy chủ (`applyCommand`) và bộ đồng bộ (`doiChieu`).
 */
import type { ListingEvent } from "./events";
import { foldListing } from "./fold";
import { WINS_IMMEDIATELY, type StandardStatus } from "./status";

/**
 * Lệnh `status_changed` có đích `to` được thắng ngay khi đích thuộc `WINS_IMMEDIATELY`, bản gốc của lệnh (trạng thái ở
 * phiên bản lệnh khai; `null` = không biết) khác đích, và bản hiện tại khác đích.
 */
export function thangNgay(to: unknown, goc: StandardStatus | null, hienTai: StandardStatus): boolean {
  if (!WINS_IMMEDIATELY.includes(to as StandardStatus)) return false;
  return goc !== to && hienTai !== to;
}

/**
 * Bản gốc của lệnh: trạng thái căn sau sự kiện `seq = expectedVersion`. Phiên bản không phải số nguyên, nhỏ hơn 1 hay vượt
 * sự kiện cuối → `null` (không biết).
 */
export function trangThaiGoc(events: readonly ListingEvent[], expectedVersion: unknown): StandardStatus | null {
  if (typeof expectedVersion !== "number" || !Number.isInteger(expectedVersion) || expectedVersion < 1) return null;
  const truoc = events.filter((e) => e.seq <= expectedVersion);
  if (!truoc.some((e) => e.seq === expectedVersion)) return null;
  return foldListing(truoc).standardStatus;
}

/**
 * Sự kiện đã ghi `e` là thắng ngay khi nó là `status_changed` có đích thuộc `WINS_IMMEDIATELY` và trạng thái ngay trước nó
 * khác đích — nó thật sự đưa căn vào trạng thái ấy. Đổi nhãn tại chỗ trong Đang giao dịch / Đã bán không phải.
 */
export function suKienThangNgay(events: readonly ListingEvent[], e: ListingEvent): boolean {
  if (e.type !== "status_changed" || !WINS_IMMEDIATELY.includes(e.payload.to as StandardStatus)) return false;
  const truoc = events.filter((x) => x.seq < e.seq);
  if (truoc.length === 0) return false;
  return foldListing(truoc).standardStatus !== e.payload.to;
}
