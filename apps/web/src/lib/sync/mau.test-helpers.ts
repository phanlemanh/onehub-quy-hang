// Dữ liệu mẫu cho ca kiểm thuần của bộ đồng bộ. Không dữ liệu thật: toà, mã căn mẫu.
import { foldListing, type EventType, type ListingEvent } from "@quy-hang/core/listing";
import type { ListingView } from "./types";

export const NGAY = "2026-10-31T08:00:00.000Z";

export function suKien(seq: number, type: EventType, payload: Record<string, unknown>, actorUserId = "u-x"): ListingEvent {
  return { seq, type, payload, actorUserId, actorRoles: ["listing_agent"], confirmedWithOwner: type === "price_changed" || type === "status_changed" || type === "owner_confirmed", occurredAt: NGAY };
}

/** Căn mẫu: created + các sự kiện thêm, gấp bằng lõi. */
export function canMau(id: string, toa: string, them: ListingEvent[] = []): { view: ListingView; events: ListingEvent[] } {
  const events = [suKien(1, "created", { buildingName: toa, unitNumber: `${id}-01` }), ...them];
  return { view: { id, ...foldListing(events), visibility: "Company" }, events };
}

/** Căn đang bán: giá, chi tiết, Active — phiên bản 4. */
export function canDangBan(id: string, toa: string): { view: ListingView; events: ListingEvent[] } {
  return canMau(id, toa, [
    suKien(2, "price_changed", { listPrice: 3_500_000_000, feeInclusion: "excluded" }),
    suKien(3, "details_changed", { legalStatus: "pink_book", occupantType: "vacant" }),
    suKien(4, "status_changed", { to: "Active" }),
  ]);
}
