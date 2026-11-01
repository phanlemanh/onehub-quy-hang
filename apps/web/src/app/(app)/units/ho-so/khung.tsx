import type { ReactNode } from "react";

import { Frame } from "@/components/reui/frame";
import { cn } from "@/lib/utils";

// Khuôn của nhóm `ho-so-can` (design/patterns/ho-so-can.md): hồ sơ một căn là đúng một Frame — cột phải cạnh Bảng hàng
// (`/inventory?unit=`) hay toàn màn (`/units/<mã>`). Lối dựng bên trong chốt ở Cổng Phạm vi hàng 17 (ADR-0019, Hỏi-2).
export function KhungHoSoCan({ toanMan = false, children }: { toanMan?: boolean; children: ReactNode }) {
  return <Frame className={cn("h-full min-h-0", toanMan && "mx-auto w-full max-w-3xl")}>{children}</Frame>;
}
