import type { ReactNode } from "react";

import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";

// Khuôn của nhóm `o-nhan-lead` (design/patterns/o-nhan-lead.md): ô nhận lead là một Frame trong cột nội dung của vỏ,
// ghép theo khối đích `form-2` (vo-va-ia §2). Cột phải «lead đã nhập + bốn nấc» (`list-11`) là hàng 27.
export function KhungLead({ children }: { children: ReactNode }) {
  return (
    <Frame className="w-full max-w-3xl">
      <FrameHeader>
        <FrameTitle>Ô nhận lead</FrameTitle>
        <FrameDescription>Năm mục bắt buộc. Gửi là máy kiểm trùng theo số chủ nhà và theo căn.</FrameDescription>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
