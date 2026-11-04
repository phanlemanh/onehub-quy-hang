/**
 * Đổi giá theo trạng thái (hàng va-doi-gia-can-da-ban, luật 31 của đợt dau-khach-nhap): căn Đã bán đã ghi giá chốt nên
 * không nhận lệnh đổi giá. Luật ở lõi để máy chủ từ chối cả khi lệnh mang đúng phiên bản — ô Bảng hàng chỉ là lớp nhìn.
 */
import type { ListingState } from "./fold";

/** Mã từ chối khi hàng đã bán — máy chủ dùng. */
export const DOI_GIA_DA_BAN = "price-locked-closed";

/** Lý do kèm mã từ chối ấy — «Cần xem» trên máy in câu này. */
export const LY_DO_DOI_GIA_DA_BAN = "Căn đã bán không đổi giá — giá chốt đã ghi";

/** Hàng nhận sự kiện `price_changed` không: Đã bán thì trả mã từ chối, năm trạng thái còn lại nhận (`null`). */
export function kiemDoiGia(hang: Pick<ListingState, "standardStatus">): typeof DOI_GIA_DA_BAN | null {
  return hang.standardStatus === "Closed" ? DOI_GIA_DA_BAN : null;
}
