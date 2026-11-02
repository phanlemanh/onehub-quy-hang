"use client";

import "./globals.css";

import { BoCuc } from "@/components/bo-cuc";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";

// Lỗi ở chính layout gốc: Next thay cả layout nên tệp tự dựng <html><body>, không có provider (ADR-0024 §4).
export default function LoiGoc({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body>
        <BoCuc
          kieu="doc"
          dauMan={null}
          trangThai="loi"
          loi={
            <TrangThai
              kind="error"
              title="Quỹ hàng đang lỗi"
              description="Tải lại trang sau ít phút."
              hanhDong={
                <Button size="sm" variant="outline" onClick={reset}>
                  Thử lại
                </Button>
              }
            />
          }
        />
      </body>
    </html>
  );
}
