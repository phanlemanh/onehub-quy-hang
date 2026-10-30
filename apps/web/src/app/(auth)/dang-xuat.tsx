"use client";

import { useRouter } from "next/navigation";
import { nut } from "./khung";

export function DangXuat() {
  const router = useRouter();
  return (
    <button
      type="button"
      style={nut}
      onClick={async () => {
        await fetch("/api/v1/auth/sign-out", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
        router.replace("/dang-nhap");
        router.refresh();
      }}
    >
      Đăng xuất
    </button>
  );
}
