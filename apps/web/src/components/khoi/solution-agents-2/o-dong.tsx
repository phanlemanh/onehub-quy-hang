"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "cn";

// Chuyển thể từ @reui/solution-agents-2 (run-queue-columns: RunActionsCell, ô tên hai tầng) cho Hôm nay đầu chủ (hàng 92,
// quyết định 14A): giữ ô hai tầng và trình đơn ⋯ của dòng; thêm một nút viền cố định bề rộng là việc chính của dòng. Bỏ
// avatar, badge môi trường, IconPlaceholder (→ lucide), dữ liệu demo.

/** Ô hai tầng: dòng trên đậm, dòng dưới nhỏ; `duoi` vắng thì một tầng. */
export function OHaiTang({ tren, duoi, duoiClassName }: { tren: ReactNode; duoi?: ReactNode; duoiClassName?: string }) {
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span className="text-foreground truncate text-sm font-semibold">{tren}</span>
      {duoi != null && duoi !== false && <span className={cn("text-muted-foreground truncate text-xs", duoiClassName)}>{duoi}</span>}
    </span>
  );
}

export type MucMenu = { khoa: string; nhan: string; onClick?: () => void; href?: string; disabled?: boolean };

/** Ô thao tác của dòng: đúng một nút viền cùng bề rộng ở mọi dòng, việc còn lại trong ⋯. */
export function OThaoTac({ chinh, phu, nhanMenu }: { chinh: ReactNode; phu: readonly MucMenu[]; nhanMenu: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      {chinh}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" size="icon-sm" variant="ghost" aria-label={nhanMenu} disabled={phu.length === 0} />}>
          <MoreHorizontalIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            {phu.map((m) =>
              m.href ? (
                <DropdownMenuItem key={m.khoa} disabled={m.disabled} render={<a href={m.href} />}>
                  {m.nhan}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem key={m.khoa} disabled={m.disabled} onClick={m.onClick}>
                  {m.nhan}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Bề rộng cố định của nút chính — mọi dòng một bề rộng (ngưỡng hàng 92). */
export const RONG_NUT_CHINH = "w-36";
