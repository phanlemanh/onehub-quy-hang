import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";
import { Frame, FramePanel } from "@/components/reui/frame";

// Khuôn của nhóm `o-nhan-lead` (design/patterns/o-nhan-lead.md): trang đi bố cục Đọc (ADR-0024, hàng 51) — đầu màn «Ô nhận
// lead», thân là các vùng, mỗi vùng một Frame. Bản ghép là khối đích (vo-va-ia §2, chủ kho 02/11). Điện thoại một cột.
export function KhungLead({ children }: { children: ReactNode }) {
  return (
    <BoCuc
      kieu="doc"
      dauMan={<DauMan duongDan={[{ nhan: "Quỹ hàng", href: "/" }, { nhan: "Ô nhận lead" }]} tieuDe="Ô nhận lead" moTa="Năm mục bắt buộc. Gửi là máy kiểm trùng theo số chủ nhà và theo căn." />}
    >
      {children}
    </BoCuc>
  );
}

/** Vùng nhập: đúng một Frame quanh biểu mẫu (KH-ol-mot-khung). */
export function VungNhapLead({ children }: { children: ReactNode }) {
  return (
    <Frame className="w-full">
      <FramePanel>{children}</FramePanel>
    </Frame>
  );
}
