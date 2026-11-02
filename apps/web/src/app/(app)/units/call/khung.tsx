import type { ReactNode } from "react";

import { BoCuc } from "@/components/bo-cuc";
import { Frame } from "@/components/reui/frame";

// Khuôn của nhóm `cuoc-goi` (design/patterns/cuoc-goi.md): chế độ cuộc gọi dựng trong bố cục «Hồ sơ» của ADR-0024 (hàng 29,
// Hỏi-1) — đầu màn rồi thân một cột căn giữa; thân là đúng một Frame, mỗi vùng (căn hay lead, kết quả gọi, lịch sử, danh
// sách hỏi, tính giá, so giá toà) là một FramePanel xếp dọc.
export function KhungCuocGoi({ dauMan, children }: { dauMan: ReactNode; children: ReactNode }) {
  return (
    <BoCuc kieu="ho-so" dauMan={dauMan}>
      <Frame className="w-full" aria-label="Chế độ cuộc gọi">
        {children}
      </Frame>
    </BoCuc>
  );
}
