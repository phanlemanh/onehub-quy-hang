"use client";

import { BoCuc } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

// Lỗi cấp tuyến trong vỏ (ADR-0024 §4): bố cục Đọc, một hành động «Thử lại».
export default function Loi({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
            <Button size="sm" variant="outline" onClick={reset}>
              Thử lại
            </Button>
          }
        />
      }
    />
  );
}
