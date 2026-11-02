"use client";

import { BoCuc } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

// Lỗi ngoài vỏ (đăng nhập, trang khách): bố cục Đọc trên nền trống (ADR-0024 §4).
export default function Loi({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
            <Button size="sm" variant="outline" onClick={reset}>
              Thử lại
            </Button>
          }
        />
      }
    />
  );
}
