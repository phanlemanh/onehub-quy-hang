"use client";

// Chỉ báo đồng bộ trên thanh trên (hàng 13, AC-8): chữ nói đang ở đâu, không chỉ màu. Bấm khi có căn cần xem → bảng Cần xem.
import { CircleAlertIcon, CloudCheckIcon, CloudOffIcon, LoaderIcon, RefreshCwIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoDongBo, useChiBao } from "@/lib/sync/react";

const BIEU_TUONG = { tai: LoaderIcon, xong: CloudCheckIcon, gui: RefreshCwIcon, mang: CloudOffIcon, xem: CircleAlertIcon } as const;
const BIEN_THE = { tai: "outline", xong: "outline", gui: "secondary", mang: "secondary", xem: "destructive" } as const;

export function ChiBaoDongBo({ gon = false }: { gon?: boolean }) {
  const cb = useChiBao();
  const { moCanXem } = useBoDongBo();
  const Icon = BIEU_TUONG[cb.loai];
  const so = cb.nhan.match(/\d+(?= (?:căn|thay đổi))/)?.[0];
  const noiDung = gon ? (
    <>
      <Icon aria-hidden="true" />
      {so}
    </>
  ) : (
    <>
      <Icon aria-hidden="true" />
      {cb.nhan}
    </>
  );
  if (cb.loai === "xem") {
    return (
      <Button variant="ghost" size="sm" aria-label={cb.nhan} onClick={() => moCanXem(true)} data-slot="chi-bao-dong-bo">
        <Badge variant="destructive">{noiDung}</Badge>
      </Button>
    );
  }
  return (
    <Badge variant={BIEN_THE[cb.loai]} aria-label={cb.nhan} role="status" data-slot="chi-bao-dong-bo">
      {noiDung}
    </Badge>
  );
}
