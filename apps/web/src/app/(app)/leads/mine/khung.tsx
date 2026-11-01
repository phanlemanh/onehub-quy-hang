import { PlusIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Frame, FramePanel } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";

// Khuôn của nhóm `lead-cua-toi` (design/patterns/lead-cua-toi.md): vùng «Lead đã nhập» là một Frame stacked theo khối
// đích `@reui/list-11` (vo-va-ia §2, lối ReUI duyệt ở Cổng Phạm vi hàng 27). Thanh đầu giữ tên vùng và đúng một hành động
// «+ Lead»; thân (bảng, đang tải, trống, lỗi) là các FramePanel do màn đặt vào.
export function KhungLeadCuaToi({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Lead đã nhập" className="flex w-full max-w-3xl flex-col">
      <Frame stacked className="@container w-full">
        <FramePanel className="flex items-center justify-between p-3.5!">
          <h2 className="text-foreground text-base font-medium">Lead đã nhập</h2>
          <Button size="sm" render={<Link href="/leads/new" />} nativeButton={false}>
            <PlusIcon data-icon="inline-start" />
            Lead
          </Button>
        </FramePanel>
        {children}
      </Frame>
    </section>
  );
}
