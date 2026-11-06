"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { BoCuc } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

// Lỗi ngoài vỏ (đăng nhập, trang khách) và lỗi của chính vỏ — đọc phiên hỏng vì cơ sở dữ liệu nghẽn (sự cố 06/11):
// bố cục Đọc trên nền trống (ADR-0024 §4).
// «Thử lại» dựng lại cả phần máy chủ (`router.refresh`), không chỉ phần trình duyệt — lỗi đọc phiên hay cơ sở dữ liệu
// nằm ở máy chủ, `reset` một mình chỉ vẽ lại lỗi cũ.
export default function Loi({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const thuLai = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });
  return (
    <BoCuc
      kieu="doc"
      dauMan={null}
      trangThai="loi"
      loi={
        <TrangThai
          kind="error"
          title="Không mở được trang này"
          description="Lần tải vừa rồi lỗi. Thử lại sau ít phút."
          hanhDong={
            <Button size="sm" variant="outline" onClick={thuLai}>
              Thử lại
            </Button>
          }
        />
      }
    />
  );
}
