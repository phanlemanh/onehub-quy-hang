"use client";

// Trang thử chế độ ép giá (hàng 29, design-pass): đầu căn, kết quả gọi bằng phím, lịch sử trả giá, giá đáy, cùng danh sách
// hỏi, tính giá, so giá của trang ba lối hàng 28. Hai cách xếp cho Hỏi-1: «Hồ sơ» một cột (ADR-0024) hay ba cột. Dữ liệu
// mẫu, phím chỉ đổi trạng thái cục bộ, không gọi mạng. Gỡ khi màn thật ra.
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/reui/badge";
import { FramePanel } from "@/components/reui/frame";
import { Timeline, TimelineContent, TimelineDate, TimelineHeader, TimelineIndicator, TimelineItem, TimelineSeparator, TimelineTitle } from "@/components/reui/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DanhSachHoi, SoGia, TinhGia } from "../cuoc-goi-khai-thac/khoi";
import { BA_LOI, CAN, GIA_DAY, LICH_SU } from "./mau";

export type BoCucThu = "ho-so" | "ba-cot";

const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const KET_QUA = [
  { ma: "ha", phim: "H", nhan: "Hạ giá" },
  { ma: "giu", phim: "G", nhan: "Giữ giá" },
  { ma: "ban", phim: "B", nhan: "Đã cọc / bán…" },
  { ma: "khong", phim: "K", nhan: "Không nghe máy" },
] as const;

function DauCan() {
  return (
    <FramePanel className="flex flex-col gap-2" aria-label="Căn đang gọi">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="warning-light">Nên gọi ép giá</Badge>
        <Badge variant="success-light">{CAN.nac}</Badge>
      </div>
      <h1 className="text-lg font-semibold">
        {CAN.ma} · {CAN.toa} · {CAN.gia}
      </h1>
      <p className="text-muted-foreground text-sm">{CAN.phu}</p>
    </FramePanel>
  );
}

function KetQuaGoi() {
  const [chon, setChon] = useState<string | null>(null);
  const [loi, setLoi] = useState(0);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = KET_QUA.find((x) => x.phim.toLowerCase() === e.key.toLowerCase());
      if (k) setChon(k.ma);
      else if (e.key === "Escape") setChon(null);
      else if (chon === "ban" && /^[1-3]$/.test(e.key)) setLoi(Number(e.key) - 1);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [chon]);
  return (
    <FramePanel className="flex flex-col gap-3" aria-label="Kết quả cuộc gọi">
      <h2 className={TIEU_MUC}>Kết quả cuộc gọi</h2>
      <ToggleGroup variant="outline" className="flex-wrap" value={chon ? [chon] : []} onValueChange={(v: string[]) => setChon(v[v.length - 1] ?? null)}>
        {KET_QUA.map((k) => (
          <ToggleGroupItem key={k.ma} value={k.ma}>
            <Kbd>{k.phim}</Kbd> {k.nhan}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {chon === "ha" && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input defaultValue="2,72 tỷ" aria-label="Giá mới" className="w-40" />
            <ToggleGroup variant="outline" size="sm" defaultValue={["excluded"]}>
              <ToggleGroupItem value="included">
                <Kbd>Alt+1</Kbd> Bao phí
              </ToggleGroupItem>
              <ToggleGroupItem value="excluded">
                <Kbd>Alt+2</Kbd> Không bao phí
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <p className="text-muted-foreground text-sm">Hiểu là 2,72 tỷ · không bao phí · trước 2,8 tỷ · −3% · Enter ghi</p>
        </div>
      )}
      {chon === "giu" && <p className="text-sm">Enter ghi «Còn · giữ giá» — tính là vừa xác nhận với chủ nhà.</p>}
      {chon === "ban" && (
        <ToggleGroup variant="outline" size="sm" value={[String(loi)]} onValueChange={(v: string[]) => setLoi(Number(v[v.length - 1] ?? 0))}>
          {BA_LOI.map((l, i) => (
            <ToggleGroupItem key={l} value={String(i)}>
              <Kbd>{i + 1}</Kbd> {l}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      {chon === "khong" && <p className="text-sm">Không ghi gì — về Hôm nay, căn vẫn ở nhóm ép giá.</p>}
      <p className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
        <Kbd>H</Kbd> <Kbd>G</Kbd> <Kbd>B</Kbd> <Kbd>K</Kbd> chọn · <Kbd>Esc</Kbd> bỏ · <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> về Hôm nay
      </p>
    </FramePanel>
  );
}

function LichSuGiaDay() {
  return (
    <FramePanel className="flex flex-col gap-4" aria-label="Lịch sử trả giá">
      <h2 className={TIEU_MUC}>Lịch sử trả giá</h2>
      <Timeline defaultValue={LICH_SU.length}>
        {LICH_SU.map((e, i) => (
          <TimelineItem key={i} step={i + 1} className="group-data-[orientation=vertical]/timeline:ms-6">
            <TimelineHeader>
              <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-5" />
              <TimelineTitle className="text-sm">
                {e.viec}
                <span className="font-normal text-muted-foreground"> · {e.chiTiet}</span>
              </TimelineTitle>
              <TimelineIndicator className="group-data-[orientation=vertical]/timeline:-left-5 size-2.5" />
            </TimelineHeader>
            <TimelineContent>
              <TimelineDate className="mb-0 text-xs">
                {e.ai} · {e.luc}
              </TimelineDate>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
      <div className="flex flex-col gap-1" aria-label="Giá đáy">
        <span className={TIEU_MUC}>Giá đáy chủ từng nói · nội bộ</span>
        <span className="text-lg font-semibold">{GIA_DAY.gia}</span>
        <span className="text-muted-foreground text-sm">{GIA_DAY.cach}</span>
      </div>
    </FramePanel>
  );
}

export function EpGia({ boCuc }: { boCuc: BoCucThu }) {
  const chuyen = (
    <div className="flex flex-wrap items-center gap-2 px-1 py-2 text-sm" data-bo-cuc={boCuc}>
      <span className="text-muted-foreground">Hỏi-1 · Bố cục:</span>
      <Button size="sm" variant={boCuc === "ho-so" ? "default" : "outline"} nativeButton={false} render={<Link href="?bo-cuc=ho-so" />}>
        Hồ sơ một cột (khuyên)
      </Button>
      <Button size="sm" variant={boCuc === "ba-cot" ? "default" : "outline"} nativeButton={false} render={<Link href="?bo-cuc=ba-cot" />}>
        Ba cột
      </Button>
    </div>
  );
  if (boCuc === "ho-so")
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-1">
        {chuyen}
        <DauCan />
        <KetQuaGoi />
        <LichSuGiaDay />
        <DanhSachHoi />
        <TinhGia />
        <SoGia />
      </div>
    );
  return (
    <div className="flex flex-col gap-1">
      {chuyen}
      <div className="grid gap-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-1">
          <DauCan />
          <LichSuGiaDay />
        </div>
        <div className="flex flex-col gap-1">
          <KetQuaGoi />
          <DanhSachHoi />
        </div>
        <div className="flex flex-col gap-1">
          <TinhGia />
          <SoGia />
        </div>
      </div>
    </div>
  );
}
