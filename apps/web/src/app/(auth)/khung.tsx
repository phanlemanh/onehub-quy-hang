import type { ReactNode } from "react";

import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";

// Khung tạm của màn đăng nhập, chọn sàn, chưa gắn sàn — không vỏ (Tham chiếu §9). Ghép từ thành phần đã cài (Frame);
// khối đích `auth-15` chuyển thể ở việc riêng (ADR-0005, Hỏi-3).
export function Khung({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <Frame className="w-full max-w-sm">
        <FrameHeader>
          <FrameTitle>{title}</FrameTitle>
          {description && <FrameDescription>{description}</FrameDescription>}
        </FrameHeader>
        <FramePanel className="flex flex-col gap-4">{children}</FramePanel>
      </Frame>
    </main>
  );
}
