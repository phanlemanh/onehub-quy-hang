import type { ReactNode } from "react";

import { BoCuc } from "@/components/bo-cuc";

import { DauManHomNay } from "./dau-man";

// Khuôn của nhóm `hom-nay-dau-chu` (design/patterns/hom-nay-dau-chu.md): Hôm nay là một danh sách việc trong bố cục Tràn
// (ADR-0024), đường dẫn và số việc ở đầu màn. Danh sách tự là một Frame; khuôn không thêm Frame nào.
export function KhungHomNay({ children }: { children: ReactNode }) {
  return (
    <BoCuc kieu="tran" dauMan={<DauManHomNay />}>
      {children}
    </BoCuc>
  );
}
