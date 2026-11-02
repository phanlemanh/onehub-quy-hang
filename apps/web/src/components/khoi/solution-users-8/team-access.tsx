"use client";

import type { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";

import { UI_ICONS } from "./icons";
import { CAP_BOX, DotSeparator } from "./value-faces";

// Khối Người dùng — chuyển thể solution-users-8 (ReUI Pro, hàng 91): khung gốc TeamAccess của khối — đầu khối (dòng đếm
// + nút mời), Tabs kiểu line có số đếm, hộp xác nhận AlertDialog dùng chung, TooltipProvider. Giữ cấu trúc và lớp; gỡ
// `mx-auto max-w-6xl` ở gốc và `<main min-h-svh>` của trang mẫu (bề rộng thuộc bố cục Đọc); tiêu đề «Team Access» do đầu
// màn mang. Tab «People» → Thành viên (people-tab.tsx), tab «Alerts» → Vùng (zones-tab.tsx), hộp mời → hộp mời và sửa
// (member-dialog.tsx). Bỏ khách và hạn truy cập, lời mời chờ (Quỹ hàng thêm người ngay), ghế và thanh ghế, xuất CSV, ma
// trận cảnh báo, dữ liệu demo, REFERENCE_MS, SEAT_LIMIT, khung chờ Skeleton, thông báo sonner — lỗi đi qua TrangThai do
// màn dựng. Dữ liệu và lệnh gọi API ở màn `app/(app)/settings/users/quan-nguoi.tsx`.

export type Tab = "members" | "zones";

export interface Confirm {
  title: string;
  description: string;
  action: string;
}

export function TeamAccess({
  tab,
  onTabChange,
  memberCount,
  zoneCount,
  onInvite,
  members,
  zones,
  dialogs,
}: {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  memberCount: number;
  zoneCount: number;
  onInvite: () => void;
  members: ReactNode;
  zones: ReactNode;
  /** Hộp mời, sửa và xác nhận — dựng ngoài cây tab. */
  dialogs?: ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="@container flex w-full flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
          <p className="text-muted-foreground flex h-5 items-center gap-1.5 text-sm tabular-nums">
            <span className={CAP_BOX}>{`${memberCount} thành viên`}</span>
            <DotSeparator />
            <span className={CAP_BOX}>{`${zoneCount} vùng`}</span>
          </p>
          <Button type="button" onClick={onInvite}>
            {UI_ICONS.invite}
            <span className={CAP_BOX}>Mời người</span>
          </Button>
        </header>

        <Tabs value={tab} onValueChange={(next) => onTabChange(next === "zones" ? "zones" : "members")} className="gap-5">
          <TabsList variant="line" className="h-10! w-full justify-start gap-6 border-b bg-transparent p-0">
            <TabsTrigger value="members" className="h-full! flex-none gap-2 px-1 after:-bottom-px!">
              {UI_ICONS.people}
              <span className={CAP_BOX}>Thành viên</span>
              <span className={`text-muted-foreground text-xs tabular-nums ${CAP_BOX}`}>{memberCount}</span>
            </TabsTrigger>
            <TabsTrigger value="zones" className="h-full! flex-none gap-2 px-1 after:-bottom-px!">
              {UI_ICONS.zones}
              <span className={CAP_BOX}>Vùng</span>
              <span className={`text-muted-foreground text-xs tabular-nums ${CAP_BOX}`}>{zoneCount}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">{members}</TabsContent>
          <TabsContent value="zones">{zones}</TabsContent>
        </Tabs>
      </div>
      {dialogs}
    </TooltipProvider>
  );
}

/** Hộp xác nhận của khối; ở lại mở khi thao tác lỗi để `error` hiện trong hộp. */
export function ConfirmDialog({
  confirm,
  onOpenChange,
  onConfirm,
  error,
}: {
  confirm: Confirm | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  error?: ReactNode;
}) {
  return (
    <AlertDialog open={confirm !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
          <AlertDialogDescription>{confirm?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error}
        <AlertDialogFooter>
          <AlertDialogCancel>
            <span className={CAP_BOX}>Huỷ</span>
          </AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            <span className={CAP_BOX}>{confirm?.action}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
