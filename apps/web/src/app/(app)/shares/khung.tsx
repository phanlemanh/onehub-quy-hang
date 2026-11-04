import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";

// Khuôn của nhóm `da-gui` (design/patterns/da-gui.md): Đã gửi đi bố cục «Danh sách → chi tiết» (ADR-0024) — lưới thẻ Lần gửi
// theo lối ReUI `wishlist-4` (vo-va-ia §2, chủ kho chọn ở Cổng Phạm vi hàng 36); chi tiết một link mở ngăn nổi.
export function KhungDaGui({ children }: { children: ReactNode }) {
  return (
    <BoCuc
      kieu="danh-sach-chi-tiet"
      dauMan={
        <DauMan
          duongDan={[
            { nhan: "Đã gửi", href: "/shares" },
            { nhan: "Link đã gửi" },
          ]}
          tieuDe="Link đã gửi"
          moTa="Khách nào đã mở, thích căn nào, căn nào vừa đổi"
        />
      }
    >
      {children}
    </BoCuc>
  );
}
