import type { ReactNode } from "react";

import { PHAM_VI } from "@/app/(app)/settings/cai-dat";
import { BoCuc, DauMan } from "@/components/bo-cuc";

// Khuôn của nhóm `toi` (design/patterns/toi.md, hàng 38): Cài đặt › Cá nhân đi bố cục Đọc — đầu màn «Cá nhân» kèm câu
// phạm vi (hàng cai-dat-hop-nhat), thân là các nhóm dòng.
// Bề rộng và lề thuộc bố cục, màn không tự đặt.
export function KhungToi({ children }: { children: ReactNode }) {
  return (
    <BoCuc kieu="doc" dauMan={<DauMan duongDan={[{ nhan: "Cài đặt", href: "/settings" }, { nhan: "Cá nhân" }]} tieuDe="Cá nhân" moTa={PHAM_VI.caNhan} />}>
      {children}
    </BoCuc>
  );
}
