import { redirect } from "next/navigation";

// Menu Tạo giữ địa chỉ «Xuất bảng hàng» (hàng 43, design §2): hộp thoại mở TRÊN bảng hàng, đọc thẳng cách xem đang dùng.
export default function Page() {
  redirect("/inventory?phat-hang=1");
}
