import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";

import { CHU } from "./lien-he";

// Khuôn của nhóm `lien-he` (design/patterns/lien-he.md): màn Liên hệ đi bố cục «Danh sách → chi tiết» (ADR-0024) — bảng liên
// hệ ở thân, hồ sơ người mở cạnh bảng. Khi hàng 105 gộp, ngăn cạnh bảng thành cột kéo chia (lối C) mà màn không đổi (luật đợt 62).
export function KhungLienHe({ children }: { children: ReactNode }) {
  return (
    <BoCuc
      kieu="danh-sach-chi-tiet"
      dauMan={
        <DauMan
          duongDan={[
            { nhan: "Quỹ hàng", href: "/" },
            { nhan: CHU.tieuDe },
          ]}
          moTa={CHU.moTa}
        />
      }
    >
      {children}
    </BoCuc>
  );
}
