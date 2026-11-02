/**
 * Gắn mã căn cho hàng (ADR-0026). Hàng tạo từ lead có thể mới biết toà; mã căn gắn sau, đúng một lần. Mã căn là thuộc
 * tính căn: đã có thì khoá (Tham chiếu luật 6) — sửa mã đặt nhầm là việc khác.
 */
import type { ListingState } from "./fold";

/** Mã từ chối khi hàng đã có mã căn — máy chủ và hàng đợi trên máy cùng dùng. */
export const MA_CAN_DA_CO = "unit-number-already-set";

/** Hàng nhận sự kiện `unit_number_assigned` không: chưa có mã thì nhận (`null`), đã có thì trả mã từ chối. */
export function kiemGanMaCan(hang: Pick<ListingState, "unitNumber">): typeof MA_CAN_DA_CO | null {
  return hang.unitNumber !== null && hang.unitNumber.trim() !== "" ? MA_CAN_DA_CO : null;
}
