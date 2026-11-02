"use client";

// Nút «Quay số trên điện thoại» trong thẻ lead của chế độ cuộc gọi (hàng 30): gửi thông báo tới điện thoại của chính đầu
// chủ. Bấm không ghi «Đã gọi» — đầu chủ vẫn bấm «Đã gọi» sau cuộc gọi.
import { useState } from "react";

import { FramePanel } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import { goiFetch } from "@/lib/sync/goi-fetch";
import { diemDangKyMayNay, guiQuaySo, type KetQuaQuaySo } from "./quay-so";

export function NutQuaySo({ leadId }: { leadId: string }) {
  const [dang, setDang] = useState(false);
  const [kq, setKq] = useState<KetQuaQuaySo | null>(null);
  const gui = async () => {
    setDang(true);
    setKq(await guiQuaySo(leadId, goiFetch, await diemDangKyMayNay()));
    setDang(false);
  };
  return (
    <FramePanel className="flex flex-col items-start gap-2" aria-label="Quay số trên điện thoại">
      <Button size="sm" variant="outline" disabled={dang} onClick={() => void gui()}>
        {kq?.ok && kq.daGui ? "Gửi lại" : "Quay số trên điện thoại"}
      </Button>
      {kq ? <p className={kq.ok ? "text-muted-foreground text-sm" : "text-destructive text-sm"}>{kq.ok ? kq.bao : kq.loi}</p> : null}
    </FramePanel>
  );
}
