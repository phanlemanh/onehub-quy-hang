import type { ReactNode } from "react";

import { Frame, FramePanel } from "@/components/reui/frame";
import { cn } from "@/lib/utils";

// Khuôn của nhóm `ho-so-can` (design/patterns/ho-so-can.md): hồ sơ một căn toàn màn (`/units/<mã>`) là đúng một Frame; ở
// cột phải của Bảng hàng (`/inventory?unit=`) nó là một FramePanel trong Frame của Bảng hàng, cạnh lưới. Lối dựng bên
// trong: `solution-crm-4` chuyển thành cột (Cổng Phạm vi hàng 17, Hỏi-2).
export function KhungHoSoCan({ cot = false, children }: { cot?: boolean; children: ReactNode }) {
  if (cot) {
    return (
      <FramePanel className="flex h-[calc(100svh-10.5rem)] min-h-96 flex-col overflow-y-auto p-0" aria-label="Hồ sơ căn">
        {children}
      </FramePanel>
    );
  }
  return (
    <Frame className={cn("mx-auto w-full max-w-3xl")}>
      <FramePanel className="flex flex-col p-0" aria-label="Hồ sơ căn">
        {children}
      </FramePanel>
    </Frame>
  );
}
