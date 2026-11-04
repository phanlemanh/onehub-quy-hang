"use client";

// Chuyển thể settings-2 (ReUI Pro, hàng 38): dòng cài đặt của khối PrivacySettings — ô biểu tượng, tiêu đề, mô tả, hành
// động bên phải; giữ cấu trúc và lớp. Đổi: hành động thành children (công tắc, nút hay chữ trạng thái), bỏ huy hiệu
// Pro/Beta và dữ liệu demo; gỡ bóng `shadow-[…rgba]` của ô biểu tượng (luật quy-hang-ui no-hardcoded-color) — giữ viền.
import type { ReactNode } from "react";

import { Item, ItemMedia } from "@/components/ui/item";

export function SettingRow({ icon, title, description, children }: { icon: ReactNode; title: string; description?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b p-3.5 last:border-b-0">
      <Item className="bg-muted/60 border-background flex size-10 shrink-0 items-center justify-center border-2 p-0 dark:border [&_svg]:size-4.5 [&_svg]:opacity-50">
        <ItemMedia variant="icon" className="size-auto">
          {icon}
        </ItemMedia>
      </Item>
      <div className="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-0.5">
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? <div className="text-muted-foreground text-sm">{description}</div> : null}
        </div>
        {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
      </div>
    </div>
  );
}
