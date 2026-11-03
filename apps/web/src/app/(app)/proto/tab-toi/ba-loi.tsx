"use client";

// Trang ba lối của tab Tôi (hàng 38): cùng dữ liệu mẫu (tài khoản mẫu ba máy, hay một máy với ?may=1), ba cách dựng —
// Trong kho (settings-3) · ReUI (settings-2) · Vẽ mới (Frame xếp chồng). Gỡ khi màn thật ra.
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ManToi, type Loi, type MayDong } from "../../me/man-toi";
import { trangThaiDongMay } from "../../me/toi";

const TEN: Record<Loi, string> = { "trong-kho": "Trong kho", reui: "ReUI", "ve-moi": "Vẽ mới" };
const MAY_MAU: MayDong[] = [
  { id: "m1", kind: "iphone", browser: "Safari", lastUsedAt: "2026-11-03T08:00:00Z", current: true },
  { id: "m2", kind: "may-tinh", browser: "Chrome", lastUsedAt: "2026-11-02T10:30:00Z", current: false },
  { id: "m3", kind: "android", browser: "Chrome", lastUsedAt: "2026-10-30T14:10:00Z", current: false },
];

export function BaLoiToi({ loi, motMay }: { loi: Loi; motMay: boolean }) {
  const [ds, setDs] = useState(motMay ? MAY_MAU.slice(0, 1) : MAY_MAU);
  const [dang, setDang] = useState<"san" | "xong">("san");
  return (
    <div className="flex flex-col gap-4" data-loi={loi}>
      <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Ba lối">
        <span className="text-muted-foreground">Lối:</span>
        {(Object.keys(TEN) as Loi[]).map((k) => (
          <Button key={k} size="sm" variant={k === loi ? "default" : "outline"} nativeButton={false} render={<Link href={`?loi=${k}${motMay ? "&may=1" : ""}`} />}>
            {TEN[k]}
          </Button>
        ))}
      </nav>
      <ManToi
        key={loi}
        loi={loi}
        du={{
          email: "[tên]@example.test",
          tenSan: "[Sàn mẫu]",
          soSan: 2,
          cai: "ios-ba-buoc",
          thongBao: "chua-bat",
          dsMay: ds,
          may: trangThaiDongMay({ dang, soMay: ds.length, daThu: MAY_MAU.length - 1 }),
        }}
        hd={{
          cai: () => {},
          batThongBao: () => {},
          baoMat: () => {
            setDs(MAY_MAU.slice(0, 1));
            setDang("xong");
          },
          thuLaiMay: () => {},
          dangXuat: () => {},
        }}
      />
    </div>
  );
}
