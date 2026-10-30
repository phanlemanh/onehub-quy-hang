import { HammerIcon } from "lucide-react";

import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

// Trang giữ chỗ của nhà chưa có màn: cho biết nhà này dựng ở hàng nào của lộ trình (docs/plan/lo-trinh.json).
export const PLACEHOLDER: Record<string, { title: string; question: string; rows: string }> = {
  "/today": { title: "Hôm nay", question: "Giờ làm gì?", rows: "hàng 22 (máy tính), 39 (điện thoại)" },
  "/inventory": { title: "Bảng hàng", question: "Có hàng gì, ở đâu?", rows: "hàng 14 (máy tính), 32 (điện thoại)" },
  "/shares": { title: "Gửi", question: "Khách đang phản ứng ra sao?", rows: "hàng 34 (luồng Gửi), 36 (Đã gửi)" },
  "/team": { title: "Đội", question: "Đội đang chạy thế nào?", rows: "hàng 42" },
  "/settings": { title: "Cài đặt sàn", question: "Sàn gọi tên và chạy theo luật nào?", rows: "hàng 45" },
  "/leads/new": { title: "Lead", question: "Nhận lead chủ nhà", rows: "hàng 24 (máy tính), 51 (điện thoại)" },
  "/me": { title: "Tôi", question: "Tài khoản, sàn đang làm, cài app", rows: "hàng 38" },
};

export function placeholderFor(path: string) {
  const unit = /^\/units\/([^/]+)/.exec(path);
  if (unit) {
    const code = decodeURIComponent(unit[1] ?? "");
    return { title: `Căn ${code}`, question: `Căn ${code}: chưa có dữ liệu`, rows: "hàng 33 (điện thoại)" };
  }
  return PLACEHOLDER[path] ?? { title: "Quỹ hàng", question: "Chưa có màn ở địa chỉ này", rows: "—" };
}

export function Placeholder({ path }: { path: string }) {
  const p = placeholderFor(path);
  return (
    <Frame className="w-full">
      <FrameHeader>
        <FrameTitle>{p.title}</FrameTitle>
        <FrameDescription>{p.question}</FrameDescription>
      </FrameHeader>
      <FramePanel>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HammerIcon />
            </EmptyMedia>
            <EmptyTitle>Màn này đang dựng</EmptyTitle>
            <EmptyDescription>Dựng ở {p.rows} của lộ trình.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </FramePanel>
    </Frame>
  );
}
