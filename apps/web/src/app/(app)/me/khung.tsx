import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";

// Khuôn của nhóm `toi` (design/patterns/toi.md, hàng 38): tab Tôi đi bố cục Đọc — đầu màn «Tôi», thân là các nhóm dòng.
// Bề rộng và lề thuộc bố cục, màn không tự đặt.
export function KhungToi({ children }: { children: ReactNode }) {
  return (
    <BoCuc kieu="doc" dauMan={<DauMan duongDan={[{ nhan: "Quỹ hàng", href: "/" }, { nhan: "Tôi" }]} tieuDe="Tôi" moTa="Tài khoản, sàn đang làm, cài lên màn hình chính, thông báo, máy đang đăng nhập" />}>
      {children}
    </BoCuc>
  );
}
