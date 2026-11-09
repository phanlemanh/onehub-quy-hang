import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";

// Khuôn của nhóm `hom-nay-dau-khach` (design/patterns/hom-nay-dau-khach.md): tin 7 ngày về link đã gửi, bố cục Dòng tin
// (ADR-0024) — một cột cuộn 48rem căn giữa. Mỗi tin tự là một Frame của khối `solution-crm-5`.
export function KhungTinKhach({ children }: { children: ReactNode }) {
  return (
    <BoCuc kieu="dong-tin" dauMan={<DauMan duongDan={[{ nhan: "Đã gửi", href: "/shares" }, { nhan: "Tin của khách" }]} tieuDe="Tin của khách" moTa="Khách phản ứng, căn đã gửi vừa đổi, căn mới khớp trong 7 ngày" />}>
      {children}
    </BoCuc>
  );
}
