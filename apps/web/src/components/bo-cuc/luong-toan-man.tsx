"use client";

import type { ReactNode } from "react";

import { useIsMobile } from "@/hooks/use-mobile";

import { NganNoi } from "./ngan-noi";

// Luồng nhiều bước trên điện thoại mở ngăn phủ toàn màn (ADR-0024 §5): đầu màn và các bước nằm trong ngăn, thanh tab của vỏ
// bị che để người làm trọn một luồng. Đóng ngăn là rời luồng — quay về trang trước nếu màn không nói khác. Máy tính giữ
// nguyên trong trang.
export function LuongToanMan({ tieuDe, onDong, children }: { tieuDe: ReactNode; onDong?: () => void; children: ReactNode }) {
  const dienThoai = useIsMobile();
  if (!dienThoai) return children;
  return (
    <NganNoi
      toanMan
      mo
      onMo={(mo) => {
        if (!mo) (onDong ?? (() => window.history.back()))();
      }}
      tieuDe={tieuDe}
    >
      <div className="flex min-w-0 flex-col gap-khung p-trang">{children}</div>
    </NganNoi>
  );
}
