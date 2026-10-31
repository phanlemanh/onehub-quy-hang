import type { ReactNode } from "react";

import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";

// Khuôn của nhóm `cai-dat-san` (design/patterns/cai-dat-san.md): mỗi mục Cài đặt sàn là một Frame trong cột nội dung
// của vỏ — vỏ đã giữ chiều cao màn, mục không tự dựng <main> hay kéo cao cả màn.
export function MucCaiDat({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <Frame className="w-full max-w-3xl">
      <FrameHeader>
        <FrameTitle>{title}</FrameTitle>
        {description && <FrameDescription>{description}</FrameDescription>}
      </FrameHeader>
      <FramePanel className="flex flex-col gap-6">{children}</FramePanel>
    </Frame>
  );
}
