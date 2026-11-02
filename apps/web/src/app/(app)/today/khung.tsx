import type { ReactNode } from "react";

// Khuôn của nhóm `hom-nay-dau-chu` (design/patterns/hom-nay-dau-chu.md): Hôm nay theo vai là một cột các vùng xếp theo
// vai, Hôm nay của đầu chủ trước, vùng Lead đã nhập của telesales sau (Tham chiếu §10). Mỗi vùng tự là một Frame; khuôn
// không thêm Frame nào để không lồng Frame trong Frame. Vùng đầu chủ dựng theo lối ReUI được duyệt ở Cổng Phạm vi hàng 22.
export function KhungHomNay({ children }: { children: ReactNode }) {
  return <div className="flex w-full min-w-0 flex-col gap-6">{children}</div>;
}
