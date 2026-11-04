"use client";

// Trang ba lối của cột hồ sơ căn (hàng 17, ADR-0019): cùng dữ liệu mẫu, ba cách dựng — Trong kho · ReUI · Vẽ mới. Bảng
// bên trái là dòng giả, chỉ để thấy cột phải đứng cạnh bảng còn bấm được. Gỡ khi màn thật ra.
import { Flag, Maximize2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/reui/badge";
import { FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CAN, DONG, LAN_RAO, SU_KIEN } from "./mau";

export type Loi = "trong-kho" | "reui" | "ve-moi";
const TEN: Record<Loi, string> = { "trong-kho": "Trong kho", reui: "ReUI", "ve-moi": "Vẽ mới" };

function BaoSai({ mo, dong }: { mo: boolean; dong: () => void }) {
  return (
    <Dialog open={mo} onOpenChange={(v) => !v && dong()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Báo sai thông tin căn {CAN.ma}</DialogTitle>
          <DialogDescription>Thuộc tính căn lấy từ danh mục dùng chung — sàn không tự sửa. Báo để đội vận hành sửa.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel>Thuộc tính sai</FieldLabel>
          <Select defaultValue="Diện tích">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAN.thuocTinh.map(([k]) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Giá trị đúng</FieldLabel>
          <Input defaultValue="70,2 m²" />
        </Field>
        <Field>
          <FieldLabel>Ghi chú</FieldLabel>
          <Textarea placeholder="Căn cứ: sổ hồng, bản vẽ…" />
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={dong}>
            Huỷ
          </Button>
          <Button onClick={dong}>Chép và mở bảng chia sẻ</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NutBaoSai({ moBaoSai }: { moBaoSai: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={moBaoSai}>
      <Flag />
      Báo sai thông tin căn
    </Button>
  );
}

function DauCot() {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          {CAN.khu} · {CAN.toa} · {CAN.loaiHinh}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{CAN.ma}</span>
          <Badge variant="success-light">{CAN.trangThai}</Badge>
        </div>
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Mở toàn màn">
          <Maximize2 />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Đóng hồ sơ">
          <X />
        </Button>
      </div>
    </div>
  );
}

function CapGiaTri({ ds }: { ds: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
      {ds.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function LichSuDong() {
  return (
    <ul className="flex flex-col gap-3 text-sm">
      {SU_KIEN.map((e, i) => (
        <li key={i} className="flex flex-col gap-0.5">
          <span>
            {e.viec}
            {e.chiTiet ? <span className="text-muted-foreground"> · {e.chiTiet}</span> : null}
          </span>
          <span className="text-xs text-muted-foreground">
            {e.ai} · {e.luc}
          </span>
        </li>
      ))}
    </ul>
  );
}

function LichSuTimeline() {
  return (
    <Timeline defaultValue={SU_KIEN.length}>
      {SU_KIEN.map((e, i) => (
        <TimelineItem key={i} step={i + 1} className="group-data-[orientation=vertical]/timeline:ms-6">
          <TimelineHeader>
            {/* eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- lớp của ví dụ timeline ReUI chép nguyên: chiều cao vạch nối giữa hai mốc, không phải kích thước trang */}
            <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-5" />
            <TimelineTitle className="text-sm">
              {e.viec}
              {e.chiTiet ? <span className="font-normal text-muted-foreground"> · {e.chiTiet}</span> : null}
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
  );
}

function CacLanRao() {
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {LAN_RAO.map((r) => (
        <li key={r.ma} className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            {r.ma}
            <Badge variant={r.dangMo ? "success-light" : "outline"}>{r.trangThai}</Badge>
          </span>
          <span className="text-muted-foreground">
            {r.gia} · {r.tu}–{r.den ?? "nay"}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Lối 1 — Trong kho: khuôn Cài đặt sàn (Frame xếp chồng, mỗi mục một FramePanel có tiêu đề). */
function TrongKho({ moBaoSai }: { moBaoSai: () => void }) {
  return (
    <div className="flex flex-col gap-1 h-full overflow-y-auto *:data-[slot=frame-panel]:shrink-0">
      <FrameHeader>
        <DauCot />
      </FrameHeader>
      <FramePanel fit className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <FrameTitle>Thuộc tính căn</FrameTitle>
          <NutBaoSai moBaoSai={moBaoSai} />
        </div>
        <CapGiaTri ds={CAN.thuocTinh} />
      </FramePanel>
      <FramePanel fit className="flex flex-col gap-3">
        <FrameTitle>Lần rao đang mở</FrameTitle>
        <CapGiaTri ds={CAN.phanLanRao} />
      </FramePanel>
      <FramePanel fit className="flex flex-col gap-3">
        <FrameTitle>Các lần rao</FrameTitle>
        <CacLanRao />
      </FramePanel>
      <FramePanel fit className="flex flex-col gap-3">
        <FrameTitle>Lịch sử</FrameTitle>
        <LichSuDong />
      </FramePanel>
    </div>
  );
}

/** Lối 2 — ReUI: `solution-crm-4` chuyển thành cột (ngăn phủ → cột chia đôi): giá + mức đủ đầu cột, trường chính, dòng thời gian. */
function ReUI({ moBaoSai }: { moBaoSai: () => void }) {
  const tieuMuc = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
  return (
    <div className="flex flex-col gap-1 h-full">
      <FramePanel className="flex flex-col gap-0 overflow-y-auto p-0">
        <div className="flex flex-col gap-2 p-4">
          <DauCot />
          <span className="text-xs text-muted-foreground">{CAN.tuoi}</span>
        </div>
        <Separator />
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{CAN.gia}</span>
            <Badge variant="outline">{CAN.phi}</Badge>
          </div>
          <Progress value={(CAN.mucDu.co / CAN.mucDu.tren) * 100} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mức đủ thông tin · thiếu {CAN.mucDu.thieu}</span>
            <span>
              {CAN.mucDu.co}/{CAN.mucDu.tren}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className={tieuMuc}>Thuộc tính căn</span>
            <NutBaoSai moBaoSai={moBaoSai} />
          </div>
          <CapGiaTri ds={CAN.thuocTinh} />
        </div>
        <Separator />
        <div className="flex flex-col gap-3 p-4">
          <span className={tieuMuc}>Lần rao đang mở</span>
          <CapGiaTri ds={CAN.phanLanRao.slice(1)} />
        </div>
        <Separator />
        <div className="flex flex-col gap-3 p-4">
          <span className={tieuMuc}>Các lần rao</span>
          <CacLanRao />
        </div>
        <Separator />
        <div className="flex flex-col gap-3 p-4">
          <span className={tieuMuc}>Lịch sử</span>
          <LichSuTimeline />
        </div>
      </FramePanel>
    </div>
  );
}

/** Lối 3 — Vẽ mới: ghép Frame + Tabs, ba ngăn Căn · Lần rao · Lịch sử, không cuộn dài. */
function VeMoi({ moBaoSai }: { moBaoSai: () => void }) {
  return (
    <div className="flex flex-col gap-1 h-full">
      <FrameHeader>
        <DauCot />
        <FrameDescription>
          {CAN.gia} · {CAN.phi} · mức đủ {CAN.mucDu.co}/{CAN.mucDu.tren}
        </FrameDescription>
      </FrameHeader>
      <FramePanel className="overflow-y-auto">
        <Tabs defaultValue="can">
          <TabsList>
            <TabsTrigger value="can">Căn</TabsTrigger>
            <TabsTrigger value="lan-rao">Lần rao</TabsTrigger>
            <TabsTrigger value="lich-su">Lịch sử</TabsTrigger>
          </TabsList>
          <TabsContent value="can" className="flex flex-col gap-3 pt-3">
            <CapGiaTri ds={CAN.thuocTinh} />
            <div>
              <NutBaoSai moBaoSai={moBaoSai} />
            </div>
          </TabsContent>
          <TabsContent value="lan-rao" className="flex flex-col gap-4 pt-3">
            <CapGiaTri ds={CAN.phanLanRao} />
            <Separator />
            <CacLanRao />
          </TabsContent>
          <TabsContent value="lich-su" className="pt-3">
            <LichSuDong />
          </TabsContent>
        </Tabs>
      </FramePanel>
    </div>
  );
}

function BangGia() {
  const cot = "grid grid-cols-4 gap-2 px-3 py-2";
  return (
    <div className="flex flex-col gap-1 h-full">
      <FramePanel className="p-0 text-sm" role="list" aria-label="Dòng giả của Bảng hàng">
        <div className={`${cot} border-b text-xs font-medium text-muted-foreground`}>
          {["Mã căn", "Loại căn", "Trạng thái", "Giá"].map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
        {DONG.map((d) => (
          <div key={d[0]} role="listitem" className={d[0] === CAN.ma ? `${cot} border-b bg-accent` : `${cot} border-b`}>
            {d.map((o, i) => (
              <span key={i}>{o}</span>
            ))}
          </div>
        ))}
      </FramePanel>
    </div>
  );
}

export function BaLoi({ loi }: { loi: Loi }) {
  const [baoSai, setBaoSai] = useState(false);
  const mo = () => setBaoSai(true);
  const cot = loi === "trong-kho" ? <TrongKho moBaoSai={mo} /> : loi === "reui" ? <ReUI moBaoSai={mo} /> : <VeMoi moBaoSai={mo} />;
  return (
    <FramePanel className="flex h-full flex-col gap-3" data-loi={loi}>
      <nav className="flex items-center gap-2 text-sm" aria-label="Ba lối">
        <span className="text-muted-foreground">Lối:</span>
        {(Object.keys(TEN) as Loi[]).map((k) => (
          <Button key={k} size="sm" variant={k === loi ? "default" : "outline"} nativeButton={false} render={<Link href={`?loi=${k}`} />}>
            {TEN[k]}
          </Button>
        ))}
      </nav>
      <div className="hidden min-h-0 flex-1 md:flex">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="62%" minSize="35%">
            <BangGia />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="38%" minSize="28%">
            {cot}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <div className="min-h-0 flex-1 md:hidden">{cot}</div>
      <BaoSai mo={baoSai} dong={() => setBaoSai(false)} />
    </FramePanel>
  );
}
