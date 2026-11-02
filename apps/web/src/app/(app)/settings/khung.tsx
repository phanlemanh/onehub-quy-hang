import type { ReactNode } from "react";

import { BoCuc, DauMan } from "@/components/bo-cuc";
import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";

// Khuôn của nhóm `cai-dat-san` (design/patterns/cai-dat-san.md): mỗi mục Cài đặt sàn đi bố cục Đọc (hàng 91) — đầu màn
// có đường dẫn «Cài đặt sàn › mục», thân là khung của settings-3. Mục cần khối riêng (Người dùng) đặt khối vào thân với
// `khoi` thay cho khung settings-3; bề rộng và lề thuộc bố cục, mục không tự đặt.
export function MucCaiDat({
  title,
  description,
  khoi = false,
  children,
}: {
  title: string;
  description?: ReactNode;
  /** Khối ReUI mang Frame riêng (solution-users-8 ở Người dùng) — dựng thẳng trong thân, không bọc khung settings-3. */
  khoi?: boolean;
  children: ReactNode;
}) {
  return (
    <BoCuc
      kieu="doc"
      dauMan={<DauMan duongDan={[{ nhan: "Cài đặt sàn", href: "/settings" }, { nhan: title }]} tieuDe={title} moTa={description} />}
    >
      {khoi ? children : <MucCaiDatKhoi tieuDe={title}>{children}</MucCaiDatKhoi>}
    </BoCuc>
  );
}
