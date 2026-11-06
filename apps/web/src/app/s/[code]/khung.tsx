import type { ReactNode } from "react";

// Khuôn của nhóm `trang-khach` (design/patterns/trang-khach.md): trang công khai không vỏ, điện thoại trước — đầu trang mảnh
// tên sàn + người gửi, dưới là bộ căn hay chi tiết một căn (lối ReUI `wishlist-3` + `product-detail-5`, vo-va-ia §2).
// `rong` (hàng 44): trang nhóm môi giới là bảng đọc trên máy tính — khuôn tràn ngang thay khổ điện thoại.
export function KhungTrangKhach({ dau, rong = false, children }: { dau?: { san: string; nguoi: string; soCan: number }; rong?: boolean; children: ReactNode }) {
  return (
    <main className={rong ? "bg-background mx-auto min-h-svh max-w-7xl" : "bg-background mx-auto min-h-svh max-w-3xl"}>
      {dau ? (
        <header className="border-b px-4 py-3">
          <p className="text-foreground text-sm font-semibold">{dau.san}</p>
          <p className="text-muted-foreground text-xs">
            {dau.nguoi ? `${dau.nguoi} gửi bạn` : "Gửi bạn"} {dau.soCan} căn
          </p>
        </header>
      ) : null}
      {children}
    </main>
  );
}
