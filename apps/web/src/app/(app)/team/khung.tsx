import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";

// Khuôn của nhóm `hom-nay-truong-nhom` (design/patterns/hom-nay-truong-nhom.md): nhà Đội trong bố cục Bảng điều khiển
// (ADR-0024) — khối dashboard-6 mang Frame của nó, đường dẫn ở đầu màn.
export function KhungDoi({ children }: { children: ReactNode }) {
  return (
    <BoCuc kieu="bang-dieu-khien" dauMan={<DauMan duongDan={[{ nhan: "Đội", href: "/team" }, { nhan: "Tổng quan" }]} tieuDe="Tổng quan" moTa="Đội đang chạy thế nào" />}>
      {children}
    </BoCuc>
  );
}
