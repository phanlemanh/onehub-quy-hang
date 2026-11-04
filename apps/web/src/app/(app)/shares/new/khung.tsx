import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";

// Khuôn của nhóm `gui` (design/patterns/gui.md): màn Gửi đi bố cục «Luồng nhiều bước» (ADR-0024) — điện thoại phủ toàn
// màn, đường dẫn về Bảng hàng; nội dung là một lần cuộn với thanh dính đáy (lối ReUI `wishlist-1`, vo-va-ia §2).
export function KhungGui({ children }: { children: ReactNode }) {
  return (
    <BoCuc
      kieu="luong-nhieu-buoc"
      luong={{ tieuDe: "Gửi căn" }}
      dauMan={<DauMan duongDan={[{ nhan: "Bảng hàng", href: "/inventory" }, { nhan: "Gửi" }]} tieuDe="Gửi căn" moTa="Chọn người nhận, xem trước rồi mở bảng chia sẻ" />}
    >
      {children}
    </BoCuc>
  );
}
