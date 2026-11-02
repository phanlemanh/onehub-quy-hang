"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { thanDangXuat } from "@/lib/push/dang-ky";
import { xoaKhoCuaNguoi } from "@/lib/sync/kho-indexeddb";

// Đăng xuất ở màn chọn sàn và màn chưa có sàn: ngoài vỏ nên không có bộ đồng bộ, vẫn xoá kho trên máy của người này (luật 32).
export function DangXuat({ userId }: { userId: string }) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await xoaKhoCuaNguoi(userId);
        await fetch("/api/v1/auth/sign-out", { method: "POST", headers: { "content-type": "application/json" }, body: await thanDangXuat() });
        router.replace("/login");
        router.refresh();
      }}
    >
      Đăng xuất
    </Button>
  );
}
