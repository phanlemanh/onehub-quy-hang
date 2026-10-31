"use client";

// Hỏi khi đăng xuất còn thay đổi chưa gửi (hàng 13, AC-10).
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
import { useBoDongBo } from "@/lib/sync/react";

export function HoiDangXuat() {
  const { hoi } = useBoDongBo();
  return (
    <AlertDialog open={hoi !== null} onOpenChange={(mo) => !mo && hoi?.tra(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Đăng xuất?</AlertDialogTitle>
          <AlertDialogDescription>Còn {hoi?.n ?? 0} thay đổi chưa gửi lên — đăng xuất sẽ xoá chúng khỏi máy</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => hoi?.tra(false)}>Ở lại</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => hoi?.tra(true)}>
            Vẫn đăng xuất
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
