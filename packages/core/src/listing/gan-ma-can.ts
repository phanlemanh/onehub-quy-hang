/**
 * Gắn mã căn cho hàng (ADR-0026). Hàng tạo từ lead có thể mới biết toà; mã căn gắn sau, đúng một lần. Mã căn là thuộc
 * tính căn: đã có thì khoá (Tham chiếu luật 6) — sửa mã đặt nhầm là việc khác.
 */
import type { ListingState } from "./fold";
import type { StandardStatus } from "./status";

/** Mã từ chối khi hàng đã có mã căn — máy chủ và hàng đợi trên máy cùng dùng. */
export const MA_CAN_DA_CO = "unit-number-already-set";

/** Lý do kèm mã từ chối ấy — «Cần xem» trên máy in câu này. */
export const LY_DO_MA_CAN_DA_CO = "Hàng này đã có mã căn";

/** Hàng nhận sự kiện `unit_number_assigned` không: chưa có mã thì nhận (`null`), đã có thì trả mã từ chối. */
export function kiemGanMaCan(hang: Pick<ListingState, "unitNumber">): typeof MA_CAN_DA_CO | null {
  return hang.unitNumber !== null && hang.unitNumber.trim() !== "" ? MA_CAN_DA_CO : null;
}

/** Nhãn trạng thái chuẩn theo `CONTEXT.md` — chữ của lý do từ chối trùng căn. */
const NHAN_TRANG_THAI: Record<StandardStatus, string> = {
  Incomplete: "Chưa đủ để rao",
  Active: "Đang bán",
  Pending: "Đang giao dịch",
  Closed: "Đã bán",
  Hold: "Tạm ngừng",
  Withdrawn: "Ngừng hẳn",
};

/**
 * Lý do khi căn đã có hàng đang mở khác của sàn (Tham chiếu §4: mỗi sàn tối đa một hàng đang mở trên một căn). Nêu trạng
 * thái hàng kia; mã hàng kia đi riêng trong thân trả lời, không in ra chữ (Gate 1.5).
 */
export function lyDoCanDangMo(trangThai: StandardStatus): string {
  return `Căn này đã có hàng đang mở (${NHAN_TRANG_THAI[trangThai]})`;
}
