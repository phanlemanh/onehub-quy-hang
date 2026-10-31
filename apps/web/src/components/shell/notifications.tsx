"use client";

import { BellIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TrangThai } from "@/components/trang-thai";

// Chuông và ngăn thông báo — chuyển thể NotificationsDrawer của app-shell-8. Chưa có nguồn thông báo: ngăn trống.
export function Notifications() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Thông báo" />}>
        <BellIcon aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" showCloseButton={false} className="flex w-full flex-col gap-0 p-0 sm:w-96">
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm">Thông báo</SheetTitle>
            <SheetClose render={<Button variant="ghost" size="icon-sm" aria-label="Đóng thông báo" />}>
              <XIcon className="size-3.5" aria-hidden="true" />
            </SheetClose>
          </div>
          <SheetDescription className="sr-only">Thông báo của bạn trong sàn</SheetDescription>
        </SheetHeader>
        <TrangThai
          kind="empty"
          icon={BellIcon}
          title="Chưa có thông báo"
          description="Lead mới, căn đổi giá và khách mở link sẽ báo ở đây."
          className="flex-1"
        />
      </SheetContent>
    </Sheet>
  );
}
