"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

import { BoCuc } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

// Lỗi cấp tuyến trong vỏ (ADR-0024 §4): bố cục Đọc, một hành động «Thử lại».
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
          title="Không mở được màn này"
          description="Lần tải vừa rồi lỗi. Thử lại; vẫn lỗi thì báo quản trị sàn."
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
