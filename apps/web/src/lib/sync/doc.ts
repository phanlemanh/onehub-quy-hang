/** Đọc từ kho trên máy (AC-2): không lời gọi mạng nào. */
import type { ListingEvent, StandardStatus } from "@quy-hang/core/listing";
import { banTrenMay } from "./ap-tren-may";
import type { ListingView, Ngan } from "./types";

export type BoLoc = { trangThai?: StandardStatus[]; toa?: string[] };

export function locDanhSach(n: Ngan, loc: BoLoc = {}): ListingView[] {
  return (n.listings ?? [])
    .map((l) => banTrenMay(l, n.queue))
    .filter((l) => !loc.trangThai || loc.trangThai.includes(l.standardStatus))
    .filter((l) => !loc.toa || loc.toa.includes(l.buildingName));
}

export function moHoSo(n: Ngan, id: string): { can: ListingView; lichSu: ListingEvent[] } | null {
  const l = n.listings?.find((x) => x.id === id);
  return l ? { can: banTrenMay(l, n.queue), lichSu: n.history[id] ?? [] } : null;
}
