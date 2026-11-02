"use client";

// Trang ba lối của Chế độ cuộc gọi khai thác (hàng 28, ADR-0019): cùng một lead mẫu, ba cách xếp bốn khối — Trong kho
// (khuôn hồ sơ căn: một cột) · ReUI (solution-crm-4: đầu bản ghi + cột chính + cột phụ) · Vẽ mới (KD1: ba cột). Gỡ khi
// màn thật ra.
import Link from "next/link";

import { FramePanel } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import { DanhSachHoi, SoGia, TheLead, TinhGia } from "./khoi";

export type Loi = "trong-kho" | "reui" | "ve-moi";
const TEN: Record<Loi, string> = { "trong-kho": "Trong kho", reui: "ReUI", "ve-moi": "Vẽ mới" };

function ChonLoi({ loi }: { loi: Loi }) {
  return (
    <FramePanel fit className="flex flex-wrap items-center gap-2 text-sm" aria-label="Ba lối">
      <span className="text-muted-foreground">Lối:</span>
      {(Object.keys(TEN) as Loi[]).map((k) => (
        <Button key={k} size="sm" variant={k === loi ? "default" : "outline"} nativeButton={false} render={<Link href={`?loi=${k}`} />}>
          {TEN[k]}
        </Button>
      ))}
    </FramePanel>
  );
}

/** Trong kho: dáng hồ sơ căn toàn màn — một cột hẹp, bốn khối nối nhau. */
function TrongKho() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-1">
      <TheLead />
      <DanhSachHoi />
      <TinhGia />
      <SoGia />
    </div>
  );
}

/** ReUI: solution-crm-4 — đầu bản ghi trải ngang, cột chính danh sách hỏi, cột phụ tính giá và so giá. */
function ReUI() {
  return (
    <div className="flex flex-col gap-1">
      <TheLead />
      <div className="grid gap-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <DanhSachHoi />
        <div className="flex flex-col gap-1">
          <TinhGia />
          <SoGia />
        </div>
      </div>
    </div>
  );
}

/** Vẽ mới: KD1 — ba cột: thẻ lead · danh sách hỏi · tính giá và so giá. */
function VeMoi() {
  return (
    <div className="grid gap-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.3fr)]">
      <TheLead />
      <DanhSachHoi />
      <div className="flex flex-col gap-1">
        <TinhGia />
        <SoGia />
      </div>
    </div>
  );
}

export function BaLoi({ loi }: { loi: Loi }) {
  return (
    <div className="flex flex-col gap-1" data-loi={loi}>
      <ChonLoi loi={loi} />
      {loi === "trong-kho" ? <TrongKho key="trong-kho" /> : loi === "reui" ? <ReUI key="reui" /> : <VeMoi key="ve-moi" />}
    </div>
  );
}
