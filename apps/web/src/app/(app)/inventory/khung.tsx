import type { ReactNode } from "react";

import { Frame, FrameDescription, FrameHeader, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";

// Khuôn của nhóm `bang-hang` (design/patterns/bang-hang.md): Bảng hàng trên máy tính là đúng một Frame lấp cột nội dung
// của vỏ — thanh công cụ và lưới nằm trong khe `children`. Dưới `md` là bảng thẻ của mục 32, chưa dựng: khối báo thay
// vì nhồi lưới mười chín cột vào màn điện thoại (Tham chiếu §9).
export function KhungBangHang({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Frame dense className="hidden w-full md:flex">
        <FrameHeader>
          <FrameTitle>{title}</FrameTitle>
          <FrameDescription>Có hàng gì, ở đâu?</FrameDescription>
        </FrameHeader>
        {children}
      </Frame>
      <TrangThai kind="notice" title="Bảng hàng dạng thẻ trên điện thoại dựng ở mục 32" className="md:hidden" />
    </>
  );
}
