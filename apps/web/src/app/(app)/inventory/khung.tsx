"use client";

import type { ReactNode } from "react";

import { TU_VUNG_RONG, type TuVung } from "@quy-hang/core/labels";

import { BoCuc } from "@/components/bo-cuc";
import { Frame, FrameDescription, FrameHeader, FrameTitle } from "@/components/reui/frame";
import { TrangThai } from "@/components/trang-thai";
import { BangCoHoSoCtx, useHoSoCanhBang } from "../units/ho-so/bang-co-ho-so";
import { TuVungProvider } from "./tu-vung";

// Khuôn của nhóm `bang-hang` (design/patterns/bang-hang.md): Bảng hàng trên máy tính dựng trong bố cục «Danh sách – chi
// tiết» (ADR-0024 sửa đổi 05/11, hàng 105) — thân là đúng một Frame cao hết vùng làm việc, lưới cuộn trong khung; hồ sơ căn
// đang mở theo URL (`hoSo`) là cột kéo chia đứng cạnh, ngoài khung bảng. Thanh công cụ và lưới nằm trong khe `children`.
// Dưới `md` là khe `dienThoai`: bảng thẻ của mục 32 (`cards/bang-the.tsx`) và hồ sơ toàn màn — không dựng trong nhóm panel
// (bảng thẻ cuộn theo vùng làm việc của vỏ); trang không trao khe thì khối báo.
const BAO_DIEN_THOAI = <TrangThai kind="notice" title="Bảng hàng trên điện thoại chưa có ở trang này" />;

export function KhungBangHang({
  title,
  children,
  dienThoai,
  hoSo,
  tuVung,
}: {
  title: string;
  children: ReactNode;
  dienThoai?: ReactNode;
  /** Mở hồ sơ căn ở cột cạnh bảng theo `?unit=` (Bảng hàng); góc nhìn đã lưu không trao. */
  hoSo?: { nguoi: string; san: string };
  /** Cách gọi riêng của sàn cho cột hồ sơ: cột dựng ở đây, ngoài phần con mà trang đã bọc từ vựng. */
  tuVung?: TuVung;
}) {
  const cot = useHoSoCanhBang(hoSo);
  return (
    <>
      <div className="hidden md:contents">
        <BoCuc kieu="danh-sach-chi-tiet" dauMan={null} chiTiet={{ mo: cot.mo }} cotPhu={cot.cotPhu ? <TuVungProvider tuVung={tuVung ?? TU_VUNG_RONG}>{cot.cotPhu}</TuVungProvider> : cot.cotPhu}>
          <Frame dense className="min-h-0 w-full flex-1">
            <FrameHeader>
              <FrameTitle>{title}</FrameTitle>
              <FrameDescription>Có hàng gì, ở đâu?</FrameDescription>
            </FrameHeader>
            <BangCoHoSoCtx.Provider value={cot.ctx}>{children}</BangCoHoSoCtx.Provider>
          </Frame>
        </BoCuc>
      </div>
      {/* Điện thoại: bảng thẻ và hồ sơ đang mở theo URL (hàng 32, ADR-0026); lề như lề của vỏ cho màn ngoài bố cục. */}
      <div className="p-trang md:hidden">{dienThoai ?? BAO_DIEN_THOAI}</div>
    </>
  );
}
