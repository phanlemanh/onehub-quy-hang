import type { ReactNode } from "react";

import { Frame } from "@/components/reui/frame";

// Khuôn của nhóm `cuoc-goi` (design/patterns/cuoc-goi.md, hàng 28): chế độ cuộc gọi là đúng một Frame toàn bề ngang;
// các vùng bên trong (thẻ lead, danh sách hỏi, tính giá, so giá toà) là FramePanel, xếp theo lối chốt ở Cổng Phạm vi.
export function KhungCuocGoi({ children }: { children: ReactNode }) {
  return (
    <Frame className="w-full" aria-label="Chế độ cuộc gọi">
      {children}
    </Frame>
  );
}
