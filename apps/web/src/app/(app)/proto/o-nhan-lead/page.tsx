import { notFound } from "next/navigation";

import { KhungLead } from "../../leads/new/khung";
import { TrangMau } from "./trang-mau";

// Trang mẫu của design-pass hàng 24: chính biểu mẫu của Ô nhận lead, máy chủ giả trả ba kết quả kiểm trùng. Không có
// lối vào trong điều hướng; chỉ chạy ở máy dev; gỡ khi màn thật qua Cổng Bằng chứng.
export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <KhungLead>
      <TrangMau />
    </KhungLead>
  );
}
