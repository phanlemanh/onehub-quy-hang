import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";

// Trang giữ chỗ cho tới vỏ ứng dụng (hàng 53) — dựng bằng thành phần đã cài để bộ chuẩn giao diện chạy thật.
export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <Frame className="w-full max-w-md">
        <FrameHeader>
          <FrameTitle>Quỹ hàng</FrameTitle>
          <FrameDescription>Bàn làm việc của sàn đang được dựng.</FrameDescription>
        </FrameHeader>
        <FramePanel className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Đang dựng</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Máy chủ API đã chạy; màn đầu tiên dựng trên bộ chuẩn giao diện của kho.</p>
        </FramePanel>
        <FrameFooter>
          <Button variant="outline" nativeButton={false} render={<Link href="/api/v1/health" prefetch={false} />}>
            Kiểm API
          </Button>
        </FrameFooter>
      </Frame>
    </main>
  );
}
