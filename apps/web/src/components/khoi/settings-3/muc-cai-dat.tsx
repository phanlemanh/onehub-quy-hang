import type { ReactNode } from "react";

import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { FieldGroup } from "@/components/ui/field";

// Chuyển thể settings-3 (ReUI Pro, hàng 91): khung gốc GeneralSettings của khối — Frame, đầu khung, FramePanel không lề
// chứa FieldGroup các dòng SettingField, chân căn phải. Giữ cấu trúc và lớp; gỡ max-w-3xl ở gốc (ReUI dặn, bề rộng thuộc
// bố cục). Bỏ ô chọn màu, tuỳ chọn trình soạn và dữ liệu demo — Quỹ hàng không cần (bậc 1 của thang dùng lại).
export function MucCaiDatKhoi({
  tieuDe,
  moTa,
  chan,
  children,
}: {
  tieuDe: string;
  moTa?: string;
  chan?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Frame className="w-full">
      <FrameHeader className="px-2! py-2.5!">
        <FrameTitle>{tieuDe}</FrameTitle>
        {moTa && <FrameDescription>{moTa}</FrameDescription>}
      </FrameHeader>
      <FramePanel className="p-0">
        <FieldGroup className="gap-0">{children}</FieldGroup>
      </FramePanel>
      {chan && <FrameFooter className="flex flex-row justify-end gap-3">{chan}</FrameFooter>}
    </Frame>
  );
}
