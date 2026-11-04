"use client";

// Chuyển thể @reui/dialog-5 (ReUI Pro, hàng 43) — cột trái `TemplateCategoryRail`: aside có nhãn, ScrollArea ẩn thanh cuộn,
// RadioGroup các Item bọc Label với RadioGroupItem ẩn, ô biểu tượng, tên và ghi chú. Đổi: mỗi mục là một BƯỚC của luồng
// (số thứ tự + tên), bước chưa tới tắt, bước đã qua bấm để quay lại; ô màu theo tông (bảng màu thô violet/rose…) thay bằng
// Item `muted` — bước xong mang dấu tích; IconPlaceholder thay bằng icon lucide do trang trao.
import { CheckIcon, type LucideIcon } from "lucide-react";

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type BuocHop = { id: string; nhan: string; ghiChu: string; icon: LucideIcon };

const scrollAreaScrollbarAutohide =
  "[&_[data-slot=scroll-area-scrollbar]]:opacity-0 [&_[data-slot=scroll-area-scrollbar]]:transition-opacity [&_[data-slot=scroll-area-scrollbar]]:duration-150 hover:[&_[data-slot=scroll-area-scrollbar]]:opacity-100";

export function RayBuoc({
  nhan,
  buoc,
  dangMo,
  denDuoc,
  onChon,
}: {
  nhan: string;
  buoc: readonly BuocHop[];
  dangMo: string;
  /** Số bước đã tới (bước có chỉ số nhỏ hơn số này bấm được). */
  denDuoc: number;
  onChon: (id: string) => void;
}) {
  const viTri = buoc.findIndex((b) => b.id === dangMo);
  return (
    <aside className="flex max-h-[min(42svh,22rem)] min-h-0 flex-col overflow-hidden border-b lg:max-h-none lg:w-72 lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="px-5 pt-4 pb-3">
        <p className="text-muted-foreground text-xs font-medium">{nhan}</p>
      </div>

      <ScrollArea className={cn("h-full min-h-0 w-full flex-1", scrollAreaScrollbarAutohide)}>
        <RadioGroup value={dangMo} onValueChange={(v) => onChon(String(v))} aria-label={nhan} className="flex flex-col gap-0.5 px-5 pb-3">
          {buoc.map((b, i) => {
            const isActive = b.id === dangMo;
            const tat = i >= denDuoc;
            const Icon = i < viTri ? CheckIcon : b.icon;
            return (
              <Item
                key={b.id}
                render={<Label />}
                className={cn(
                  "w-full min-w-0 cursor-pointer flex-nowrap items-center px-0.5 py-1.5 text-left",
                  isActive ? "bg-muted/70" : "hover:bg-muted/70",
                  tat && "cursor-not-allowed opacity-50 hover:bg-transparent",
                )}
              >
                <RadioGroupItem value={b.id} disabled={tat} className="sr-only" />

                {/* Item drops media to the top when a description is present; this rail centers the tile against both lines instead. */}
                <ItemMedia className="translate-y-0 self-center">
                  <Item variant="muted" className="size-9 items-center justify-center p-0">
                    <Icon className="size-4" aria-hidden="true" />
                  </Item>
                </ItemMedia>

                <ItemContent className="min-w-0 flex-1 gap-0.5">
                  <ItemTitle className="text-sm leading-tight font-medium">
                    {i + 1}. {b.nhan}
                  </ItemTitle>
                  <ItemDescription className="text-muted-foreground mt-0.5 text-xs">{b.ghiChu}</ItemDescription>
                </ItemContent>
              </Item>
            );
          })}
        </RadioGroup>
      </ScrollArea>
    </aside>
  );
}
