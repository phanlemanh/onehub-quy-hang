"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DangXuat() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await fetch("/api/v1/auth/sign-out", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
        router.replace("/dang-nhap");
        router.refresh();
      }}
    >
      Đăng xuất
    </Button>
  );
}
