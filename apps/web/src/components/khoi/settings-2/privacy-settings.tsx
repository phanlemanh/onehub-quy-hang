// Chuyển thể settings-2 (ReUI Pro, hàng 38): khung gốc PrivacySettings — Frame, đầu khung có tiêu đề và mô tả, FramePanel
// không lề chứa các dòng. Đổi: tiêu đề, mô tả thành prop; bỏ chân «Cancel / Save changes» (mỗi dòng tự làm việc của nó);
// gỡ `max-w-2xl` ở gốc — bề rộng thuộc bố cục.
import type { ReactNode } from "react";

import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";

export function PrivacySettings({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Frame className="w-full">
      <FrameHeader>
        <FrameTitle>{title}</FrameTitle>
        {description ? <FrameDescription>{description}</FrameDescription> : null}
      </FrameHeader>
      <FramePanel className="p-0">{children}</FramePanel>
    </Frame>
  );
}
