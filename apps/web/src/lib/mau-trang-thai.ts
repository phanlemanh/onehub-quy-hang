// Màu huy hiệu của sáu trạng thái chuẩn — một chỗ cho Bảng hàng, màn Trạng thái (hàng 46) và mọi mặt hiện trạng thái.
// Nhãn riêng của sàn nhận màu của trạng thái neo (Tham chiếu §5), nên màu chỉ đọc theo trạng thái chuẩn.
import type { StandardStatus } from "@quy-hang/core/listing";

export type MauTrangThai = "success-light" | "info-light" | "primary-light" | "warning-light" | "destructive-light";

export const MAU_TRANG_THAI: Readonly<Record<StandardStatus, MauTrangThai>> = {
  Incomplete: "warning-light",
  Active: "success-light",
  Pending: "info-light",
  Closed: "primary-light",
  Hold: "warning-light",
  Withdrawn: "destructive-light",
};
