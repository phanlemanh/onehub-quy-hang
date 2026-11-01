import type { ReactNode } from "react";

// Khuôn TẠM của nhóm `lead-cua-toi` (design/patterns/lead-cua-toi.md): vùng «Lead đã nhập» của telesales. Trung tính
// với ba lối của trang ba lối hàng 27 (ADR-0019) — chỉ giữ chỗ và nhãn vùng; Frame và bảng là của từng lối. Lối được
// duyệt ở Cổng Phạm vi thì khuôn thật thay tệp này (Frame stacked của khối đã chọn) và rời thư mục proto.
export function KhungLeadCuaToi({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Lead đã nhập" className="flex w-full flex-col">
      {children}
    </section>
  );
}
