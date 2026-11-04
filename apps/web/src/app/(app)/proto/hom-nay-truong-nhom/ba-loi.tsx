"use client";

// Trang ba lối của Hôm nay của Trưởng nhóm (hàng 42, ADR-0019): cùng dữ liệu mẫu (6 lead trong hàng đợi, 4 đầu chủ), ba
// cách dựng — Trong kho (stats-7 + data-grid) · ReUI (dashboard-6) · Vẽ mới (Frame xếp chồng). Nút chỉ đổi trạng thái cục
// bộ, không gọi mạng. Gỡ khi màn thật ra.
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ReUI } from "./reui";
import { TrongKho } from "./trong-kho";
import { VeMoi } from "./ve-moi";

export type Loi = "trong-kho" | "reui" | "ve-moi";
const TEN: Record<Loi, string> = { "trong-kho": "Trong kho", reui: "ReUI", "ve-moi": "Vẽ mới" };

export function BaLoi({ loi }: { loi: Loi }) {
  return (
    <div className="flex flex-col gap-4" data-loi={loi}>
      <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Ba lối">
        <span className="text-muted-foreground">Lối:</span>
        {(Object.keys(TEN) as Loi[]).map((k) => (
          <Button key={k} size="sm" variant={k === loi ? "default" : "outline"} nativeButton={false} render={<Link href={`?loi=${k}`} />}>
            {TEN[k]}
          </Button>
        ))}
      </nav>
      {loi === "trong-kho" ? <TrongKho key="trong-kho" /> : loi === "reui" ? <ReUI key="reui" /> : <VeMoi key="ve-moi" />}
    </div>
  );
}
