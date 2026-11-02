"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { cn } from "cn";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

// Ngăn nổi — vùng thứ sáu của hệ bố cục (ADR-0024 §3), chuyển thể sheet-9 (ReUI Pro, hàng 91): ngăn inset bên phải —
// cách mép 1rem, bo góc, đầu ngăn có tên và nút, thân cuộn, chân dính đáy. Chỗ duy nhất trong mã màn gọi Sheet hay Drawer
// (luật quy-hang-ui/no-direct-sheet). Máy tính mở ngăn bên phải; điện thoại mở ngăn từ đáy.
// `phuBang`: ngăn đè lên bảng mà bảng vẫn bấm được (không khoá, không phủ mờ) — hồ sơ cạnh bảng đổi theo dòng đang chọn
// (Danh sách – chi tiết; chủ kho 02/11).

const NUT_MO = "text-muted-foreground hover:text-foreground";
const INSET = "inset-y-ngan-le right-ngan-le left-auto h-[calc(100svh-2*var(--spacing-ngan-le))] w-[min(var(--container-ngan),calc(100vw-2*var(--spacing-ngan-le)))] max-w-none gap-0 overflow-hidden rounded-xl border p-0 outline-none";
// Lớp popup bên phải của SheetContent (components/ui/sheet.tsx, bản cài), đường cong chuyển động theo chuẩn ReUI của kho;
// SheetContent luôn dựng lớp phủ chặn bấm, nên ngăn đè lên bảng ghép thẳng từ Popup, bỏ lớp phủ.
const POPUP =
  "fixed z-50 flex flex-col bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-vao data-ending-style:translate-x-[2.5rem] data-ending-style:opacity-0 data-starting-style:translate-x-[2.5rem] data-starting-style:opacity-0";

export function NganNoi({
  mo,
  onMo,
  tieuDe,
  moTa,
  hanhDong,
  chan,
  phuBang = false,
  children,
}: {
  mo: boolean;
  onMo: (mo: boolean) => void;
  tieuDe: ReactNode;
  moTa?: ReactNode;
  /** Nút ở đầu ngăn, cạnh nút đóng (mở toàn màn…). */
  hanhDong?: ReactNode;
  /** Chân dính đáy: nút của bản ghi. */
  chan?: ReactNode;
  phuBang?: boolean;
  children: ReactNode;
}) {
  const dienThoai = useIsMobile();
  if (dienThoai)
    return (
      <Drawer open={mo} onOpenChange={onMo}>
        <DrawerContent data-vung="ngan-noi" data-kho="dien-thoai">
          <DrawerHeader>
            <DrawerTitle>{tieuDe}</DrawerTitle>
            {moTa && <DrawerDescription>{moTa}</DrawerDescription>}
          </DrawerHeader>
          <div className="flex flex-col overflow-y-auto">{children}</div>
          {chan && <DrawerFooter className="flex-row gap-2 border-t">{chan}</DrawerFooter>}
        </DrawerContent>
      </Drawer>
    );
  const ruot = (
    <>
      <SheetHeader className="shrink-0 p-0">
        <div className="flex min-h-12 items-center justify-between gap-2 border-b px-4">
          <SheetTitle className="min-w-0 truncate text-base font-semibold">{tieuDe}</SheetTitle>
          <div className="flex shrink-0 items-center gap-1">
            {hanhDong}
            <SheetClose render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Đóng" className={NUT_MO} />}>
              <XIcon aria-hidden="true" />
            </SheetClose>
          </div>
        </div>
        <SheetDescription className={moTa ? "px-4 pt-2" : "sr-only"}>{moTa ?? tieuDe}</SheetDescription>
      </SheetHeader>
      <div className="min-h-0 flex-1">
        <ScrollArea className="h-full">{children}</ScrollArea>
      </div>
      {chan && <SheetFooter className="shrink-0 flex-row gap-2 border-t bg-background">{chan}</SheetFooter>}
    </>
  );
  if (phuBang)
    return (
      <Sheet open={mo} onOpenChange={onMo} modal={false} disablePointerDismissal>
        <SheetPrimitive.Portal>
          <SheetPrimitive.Popup data-slot="sheet-content" data-side="right" data-vung="ngan-noi" data-kho="may-tinh" className={cn(POPUP, INSET)}>
            {ruot}
          </SheetPrimitive.Popup>
        </SheetPrimitive.Portal>
      </Sheet>
    );
  return (
    <Sheet open={mo} onOpenChange={onMo}>
      <SheetContent side="right" showCloseButton={false} data-vung="ngan-noi" data-kho="may-tinh" className={INSET}>
        {ruot}
      </SheetContent>
    </Sheet>
  );
}
