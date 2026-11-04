import type { ReactNode } from "react";

import { BoCuc } from "@/components/bo-cuc";
import { Frame, FramePanel } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";

import { CHU_DIEN_THOAI } from "./truong-nhom-trang-thai";

// Khuôn của nhóm `hom-nay-dau-chu` (design/patterns/hom-nay-dau-chu.md): Hôm nay theo vai là một cột các vùng xếp theo
// vai trong bố cục Tràn (ADR-0024) — Hôm nay của trưởng nhóm trên cùng, Hôm nay của đầu chủ, rồi vùng Lead đã nhập của
// telesales (Tham chiếu §10). Mỗi vùng tự là một Frame; khuôn không thêm Frame nào để không lồng Frame trong Frame.
export function KhungHomNay({ children }: { children: ReactNode }) {
  return (
    <BoCuc kieu="tran" dauMan={null}>
      {children}
    </BoCuc>
  );
}

// Khuôn của nhóm `hom-nay-truong-nhom` (design/patterns/hom-nay-truong-nhom.md): vùng Bảng điều khiển của trưởng nhóm
// đặt trong KhungHomNay. Khổ dưới `md` thay bảng điều khiển bằng một dòng «mở trên máy tính» (ADR-0024 §5: bảng điều
// khiển không có trên điện thoại) — vùng khác của /today vẫn hiện.
export function KhungTruongNhom({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Hôm nay của trưởng nhóm" className="flex w-full min-w-0 flex-col">
      <Frame stacked className="w-full min-w-0 md:hidden">
        <FramePanel className="p-0!">
          <TrangThai kind="notice" title={CHU_DIEN_THOAI} />
        </FramePanel>
      </Frame>
      <div className="flex w-full min-w-0 flex-col gap-khung max-md:hidden">{children}</div>
    </section>
  );
}
