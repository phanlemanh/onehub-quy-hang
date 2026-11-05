import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";

import { CHU } from "./lien-he";

// Khuôn của nhóm `lien-he` (design/patterns/lien-he.md): màn Liên hệ đi bố cục «Danh sách → chi tiết» (ADR-0024) — bảng liên
// hệ ở thân, hồ sơ người là cột phụ khai qua `chiTiet` của bố cục (không gọi ngăn nổi trong màn) — nên khi hàng 105 gộp, hồ
// sơ thành cột kéo chia (lối C) như Bảng hàng mà màn không đổi (luật đợt 62).
export function KhungLienHe({
  children,
  cotPhu,
  chiTiet,
}: {
  children: ReactNode;
  cotPhu?: ReactNode;
  chiTiet?: { mo: boolean; onMo: (mo: boolean) => void; tieuDe: ReactNode };
}) {
  return (
    <BoCuc
      kieu="danh-sach-chi-tiet"
      cotPhu={cotPhu}
      chiTiet={chiTiet}
      dauMan={
        <DauMan
          duongDan={[{ nhan: "Quỹ hàng", href: "/" }, { nhan: CHU.tieuDe }]}
          moTa={CHU.moTa}
        />
      }
    >
      {children}
    </BoCuc>
  );
}
