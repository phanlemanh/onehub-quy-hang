import type { ReactNode } from "react";

import { Frame, FrameDescription, FrameHeader, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";

// Khuôn của nhóm `bang-hang` (design/patterns/bang-hang.md): Bảng hàng trên máy tính là đúng một Frame lấp cột nội dung
// của vỏ — thanh công cụ và lưới nằm trong khe `children`. Dưới `md` là khe `dienThoai`: bảng thẻ của mục 32
// (`cards/bang-the.tsx`) thay vì nhồi lưới mười chín cột vào màn điện thoại (Tham chiếu §9); trang không trao khe thì khối báo.
const BAO_DIEN_THOAI = <TrangThai kind="notice" title="Bảng hàng trên điện thoại chưa có ở trang này" />;

export function KhungBangHang({ title, children, dienThoai }: { title: string; children: ReactNode; dienThoai?: (bao: ReactNode) => ReactNode }) {
  return (
    <>
      <Frame dense className="hidden w-full md:flex">
        <FrameHeader>
          <FrameTitle>{title}</FrameTitle>
          <FrameDescription>Có hàng gì, ở đâu?</FrameDescription>
        </FrameHeader>
        {children}
      </Frame>
      {/* Điện thoại: bảng thẻ và hồ sơ đang mở theo URL (hàng 32, ADR-0026) — `dienThoai` nhận khối báo để trả lại khi không có. */}
      <div className="md:hidden">{dienThoai ? dienThoai(BAO_DIEN_THOAI) : BAO_DIEN_THOAI}</div>
    </>
  );
}
