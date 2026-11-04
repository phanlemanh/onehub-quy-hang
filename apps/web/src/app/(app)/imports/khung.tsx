"use client";

import type { ReactNode } from "react";

import { BoCuc, DauMan, type DuongDan, type TrangThaiTai } from "@/components/bo-cuc";

// Khuôn của nhóm `nhap-excel` (design/patterns/nhap-excel.md): màn Nhập Excel là bố cục «Luồng nhiều bước» (ADR-0024) —
// trên máy tính luồng nằm trong trang, trên điện thoại mở ngăn toàn màn. Thân là khung năm bước chuyển thể từ
// `solution-crm-6` (components/khoi/solution-crm-6); trống, lỗi và không quyền đi qua `rong`/`loi` bằng TrangThai.
const DUONG: [DuongDan, DuongDan] = [{ nhan: "Bảng hàng", href: "/inventory" }, { nhan: "Nhập Excel" }];

export function KhungNhap({
  children,
  trangThai,
  rong,
  loi,
  onDong,
}: {
  children: ReactNode;
  trangThai?: TrangThaiTai;
  rong?: ReactNode;
  loi?: ReactNode;
  onDong?: () => void;
}) {
  return (
    <BoCuc
      kieu="luong-nhieu-buoc"
      trangThai={trangThai}
      rong={rong}
      loi={loi}
      luong={{ tieuDe: "Nhập Excel", onDong }}
      dauMan={<DauMan duongDan={DUONG} tieuDe="Nhập Excel" moTa="Đưa căn từ một tệp bảng tính vào Quỹ hàng" />}
    >
      {children}
    </BoCuc>
  );
}
