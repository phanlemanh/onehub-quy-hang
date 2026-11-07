// Sáu dãy sự kiện của hàng CŨ (chỉ mang `buildingName`) — hàng can-ngoai-khu E2. Ảnh bản tính của chúng ghim ở
// `anh-gap-cu.json`, sinh bằng `foldListing` TRƯỚC khi lõi nhận ba cách gọi căn: sau vòng, gấp lại phải ra đúng ảnh ấy.
import type { ListingEvent } from "./events";

const su = (seq: number, type: ListingEvent["type"], payload: Record<string, unknown>, confirmedWithOwner = false): ListingEvent => ({
  seq,
  type,
  payload,
  actorUserId: "00000000-0000-4000-8000-000000000001",
  actorRoles: ["listing_agent"],
  confirmedWithOwner,
  occurredAt: `2026-10-0${Math.min(seq, 9)}T08:00:00.000Z`,
});

export const DAY_CU: Record<string, ListingEvent[]> = {
  "chỉ tạo, chưa mã": [su(1, "created", { buildingName: "[Toà A]" })],
  "tạo có mã, đổi giá": [
    su(1, "created", { buildingName: "[Toà A]", unitNumber: "A-12.05" }),
    su(2, "price_changed", { listPrice: 3_200_000_000, feeInclusion: "included" }, true),
  ],
  "đổi chi tiết rồi lên Đang bán": [
    su(1, "created", { buildingName: "[Toà B]", unitNumber: "B-03.01" }),
    su(2, "details_changed", { furnished: "đủ đồ", legalStatus: "sổ hồng", occupantType: "trống" }),
    su(3, "price_changed", { listPrice: 2_500_000_000, feeInclusion: "excluded" }, true),
    su(4, "status_changed", { to: "Active" }, true),
  ],
  "giao dịch có nhãn rồi bán": [
    su(1, "created", { buildingName: "[Toà B]", unitNumber: "B-07.02" }),
    su(2, "status_changed", { to: "Active" }),
    su(3, "status_changed", { to: "Pending", label: "giu_cho" }),
    su(4, "status_changed", { to: "Closed", closePrice: 2_400_000_000, closeDate: "2026-10-06" }),
  ],
  "gắn mã sau, xác nhận chủ": [
    su(1, "created", { buildingName: "[Toà C]" }),
    su(2, "unit_number_assigned", { unitNumber: "C-01.09" }),
    su(3, "owner_confirmed", { confirmedAt: "2026-10-02" }, true),
    su(4, "custom_changed", { huong_ban_cong: "dong_nam" }),
  ],
  "gỡ khi hoàn tác nhập": [
    su(1, "created", { buildingName: "[Toà A]", unitNumber: "A-02.02" }),
    su(2, "status_changed", { to: "Withdrawn", withdrawnReason: "owner_changed_mind" }),
    su(3, "voided", {}),
  ],
};
