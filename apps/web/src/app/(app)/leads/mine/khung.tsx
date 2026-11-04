import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";
import { Frame, FramePanel } from "@/components/reui/frame";

// Khuôn của nhóm `lead-cua-toi` (design/patterns/lead-cua-toi.md): vùng «Lead đã nhập» là một Frame stacked theo khối
// đích `@reui/list-11` (vo-va-ia §2, lối ReUI duyệt ở Cổng Phạm vi hàng 27). Thanh đầu giữ tên vùng; thân
// (bảng, đang tải, trống, lỗi) là các FramePanel do màn đặt vào. Nút tạo ở đầu khung đã bỏ (hàng 91, ADR-0024 quyết định
// 13): việc tạo chỉ ở menu Tạo trên vỏ; trạng thái trống vẫn giữ hành động «+ Lead».
export function KhungLeadCuaToi({ children, trang }: { children: ReactNode; trang?: boolean }) {
  const vung = (
    <section aria-label="Lead đã nhập" className="flex w-full flex-col">
      <Frame stacked className="@container w-full">
        <FramePanel className="flex items-center justify-between p-3.5!">
          <h2 className="text-foreground text-base font-medium">Lead đã nhập</h2>
        </FramePanel>
        {children}
      </Frame>
    </section>
  );
  // Trang riêng /leads/mine đi bố cục Danh sách – chi tiết (ADR-0024, hàng 51); Hôm nay của telesales và tab Lead đặt vùng
  // vào bố cục của chính màn ấy.
  if (!trang) return vung;
  return (
    <BoCuc kieu="danh-sach-chi-tiet" dauMan={<DauMan duongDan={[{ nhan: "Quỹ hàng", href: "/" }, { nhan: "Lead đã nhập" }]} tieuDe="Lead đã nhập" moTa="Lead bạn nhập, mới nhất trước, kèm nấc đầu chủ đã tới." />}>
      {vung}
    </BoCuc>
  );
}
