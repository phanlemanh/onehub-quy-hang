import type { ReactNode } from "react";

import { Badge } from "@/components/reui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "cn";

import { initialsOf } from "./data";

// Phần của chuyển thể solution-users-8: mặt hiển thị của khối. Giữ CAP_BOX, chấm ngăn và cột danh tính (ảnh tròn, dòng
// chính, dòng phụ); ảnh tròn chỉ chữ đầu của email vì Quỹ hàng không giữ ảnh hay tên. Dòng phụ chở nhãn vai thay email.
// Bỏ mặt đăng nhập, hạn khách, hạn lời mời — không có dữ liệu.

/** Trims a label to its caps, so `items-center` centres the letters exactly. Needs a fixed-height row. */
export const CAP_BOX = "[text-box:trim-both_cap_alphabetic]";
export const CAP_TRUNCATE = `${CAP_BOX} min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap`;

export function DotSeparator({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("bg-muted-foreground/40 size-1 shrink-0 rounded-full", className)} />;
}

export function Label({ variant, children }: { variant: "outline" | "secondary" | "info-light"; children: ReactNode }) {
  return (
    <Badge variant={variant}>
      <span className={CAP_BOX}>{children}</span>
    </Badge>
  );
}

/** Ảnh tròn, email và dòng phụ: cột danh tính của mỗi dòng. */
export function PersonFace({ email, detail, addon }: { email: string; detail?: ReactNode; addon?: ReactNode }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar>
        {/* The stock fallback tone sits just under 4.5:1 on its fill. */}
        <AvatarFallback className="text-foreground">{initialsOf(email)}</AvatarFallback>
      </Avatar>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="flex h-5 min-w-0 items-center gap-2 text-sm font-medium">
          <span className={CAP_TRUNCATE}>{email}</span>
          {addon}
        </span>
        {detail ? <span className="text-muted-foreground flex min-h-4 flex-wrap items-center gap-1 text-xs">{detail}</span> : null}
      </span>
    </span>
  );
}
