// Chữ của trạng thái thông báo lead trên thiết bị (hàng 26, hàng 38) — một bảng cho dải bật ở Hôm nay và dòng thông báo ở
// tab Tôi, để hai chỗ nói cùng một câu cho cùng một trạng thái.
import type { TrangThaiThietBi } from "./dang-ky";

export type TrangThaiDaBiet = Exclude<TrangThaiThietBi, "dang-kiem">;

export const NHAN_THONG_BAO: Readonly<Record<TrangThaiDaBiet, string>> = {
  "chua-bat": "Bật thông báo lead",
  "da-bat": "Đã bật thông báo lead",
  "loi-luu": "Chưa bật được thông báo — thử lại",
  "tu-choi": "Thông báo đang tắt trong trình duyệt",
  "ios-chua-cai": "Cài Quỹ hàng lên màn hình chính để nhận thông báo lead",
  "khong-ho-tro": "Trình duyệt này không nhận được thông báo",
  "chua-cau-hinh": "Thông báo chưa được cấu hình",
};

export const MO_THONG_BAO: Readonly<Partial<Record<TrangThaiDaBiet, string>>> = {
  "chua-bat": "Nhận thông báo khi lead về bạn, kể cả khi không mở Quỹ hàng.",
  "khong-ho-tro": "Mở Quỹ hàng bằng Chrome, Edge hay Safari bản mới.",
  "chua-cau-hinh": "Máy chủ chưa sẵn sàng gửi thông báo lead.",
};

/** Ba bước cài lên màn hình chính trên Safari của iPhone, iPad. */
export const BUOC_CAI_IOS = ["Bấm nút Chia sẻ ở thanh dưới của Safari", "Chọn «Thêm vào MH chính»", "Mở Quỹ hàng từ màn hình chính rồi bật thông báo"];
