"use client";

import type { ReactNode } from "react";

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

// Ngăn nổi — vùng thứ sáu của hệ bố cục (ADR-0024 §3): máy tính mở ngăn bên phải, điện thoại mở ngăn từ đáy, tự đổi
// theo khổ. Chỗ duy nhất trong mã màn gọi Sheet hay Drawer (luật quy-hang-ui/no-direct-sheet).
export function NganNoi({
  mo,
  onMo,
  tieuDe,
  moTa,
  children,
}: {
  mo: boolean;
  onMo: (mo: boolean) => void;
  tieuDe: ReactNode;
  moTa?: ReactNode;
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
          <div className="flex flex-col gap-khung overflow-y-auto px-trang pb-trang">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  return (
    <Sheet open={mo} onOpenChange={onMo}>
      <SheetContent side="right" data-vung="ngan-noi" data-kho="may-tinh">
        <SheetHeader>
          <SheetTitle>{tieuDe}</SheetTitle>
          {moTa && <SheetDescription>{moTa}</SheetDescription>}
        </SheetHeader>
        <div className="flex flex-col gap-khung overflow-y-auto px-trang pb-trang">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
