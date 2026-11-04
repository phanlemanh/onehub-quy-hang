"use client";

// Chuyển thể @reui/dialog-5 (ReUI Pro, hàng 43) — khung `TemplateLibraryDialog`: DialogContent rộng cao cố định, đầu hộp
// (tiêu đề, mô tả), Separator, thân hai cột (cột trái RayBuoc, khung phải ScrollArea ẩn thanh cuộn), DialogFooter có dòng
// tóm tắt (chấm ngăn) và hàng nút. Đổi: hộp nhiều bước — khung phải nhận nội dung bước qua `children`, nút chân do trang
// trao; bỏ nút mở hộp (trang tự mở), ô tìm, danh sách thẻ ảnh picsum, badge màu; chấm ngăn `bg-gray-300` → `bg-border`.
import type { ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { RayBuoc, type BuocHop } from "./ray-buoc";

export type { BuocHop } from "./ray-buoc";

export function HopBuoc({
  open,
  onOpenChange,
  tieuDe,
  moTa,
  nhanRay,
  buoc,
  dangMo,
  denDuoc,
  onChonBuoc,
  tomTat,
  hanhDong,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tieuDe: string;
  moTa: string;
  nhanRay: string;
  buoc: readonly BuocHop[];
  dangMo: string;
  denDuoc: number;
  onChonBuoc: (id: string) => void;
  /** Các mảnh của dòng tóm tắt ở chân, cách nhau chấm ngăn. */
  tomTat: readonly string[];
  hanhDong: ReactNode;
  children: ReactNode;
}) {
  const [dau, ...sau] = tomTat;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(86vh,48rem)] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl lg:max-w-[64rem]">
        <DialogHeader className="shrink-0 gap-1 px-5 pt-4 pb-3 text-left">
          <DialogTitle>{tieuDe}</DialogTitle>
          <DialogDescription>{moTa}</DialogDescription>
        </DialogHeader>

        <Separator className="shrink-0" />

        <div className="grid min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <RayBuoc nhan={nhanRay} buoc={buoc} dangMo={dangMo} denDuoc={denDuoc} onChon={onChonBuoc} />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
              <ScrollArea
                className={cn(
                  "min-h-0 flex-1",
                  "[&_[data-slot=scroll-area-scrollbar]]:opacity-0 [&_[data-slot=scroll-area-scrollbar]]:transition-opacity [&_[data-slot=scroll-area-scrollbar]]:duration-150 hover:[&_[data-slot=scroll-area-scrollbar]]:opacity-100",
                )}
              >
                <div className="flex flex-col gap-2 p-5">{children}</div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="my-auto flex-row items-center justify-between border-t px-9 py-4">
          <span className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2 text-sm">
            {dau !== undefined ? <span className="shrink-0 whitespace-nowrap tabular-nums">{dau}</span> : null}
            {sau.map((m) => (
              <span key={m} className="flex min-w-0 items-center gap-2">
                <span aria-hidden className="bg-border size-1 shrink-0 rounded-full" />
                <span className="min-w-0 truncate">{m}</span>
              </span>
            ))}
          </span>

          <div className="flex items-center gap-2">{hanhDong}</div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
