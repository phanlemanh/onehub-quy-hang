"use client";

// Trang ba lối của Hồ sơ căn trên điện thoại (khổ < 768 px, ADR-0019, hồ sơ ho-so-dien-thoai-product-detail-5): cùng dữ
// liệu mẫu, ba cách dựng — Trong kho · ReUI · Vẽ mới. Lối ReUI dựng lại `product-detail-5` từ bản chuyển thể của trang
// khách (`app/s/[code]/chi-tiet.tsx`), không cài khối mới. Nút chính dính đáy theo vai (`?vai=`): đầu khách «Hỏi đầu
// chủ», đầu chủ giữ căn «Ghi cuộc gọi». Nút chỉ là hình — không gửi, không ghi gì. Gỡ khi màn thật ra.
import { ImageIcon, MessageCircleQuestion, PhoneCall } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/reui/badge";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ANH, CAN, LAN_RAO, SU_KIEN } from "./mau";

export type Loi = "trong-kho" | "reui" | "ve-moi";
export type Vai = "dau-khach" | "dau-chu";
const TEN_LOI: Record<Loi, string> = { "trong-kho": "Trong kho", reui: "ReUI", "ve-moi": "Vẽ mới" };
const TEN_VAI: Record<Vai, string> = { "dau-khach": "Đầu khách", "dau-chu": "Đầu chủ" };
const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";

function CapGiaTri({ ds, hep = false }: { ds: [string, string][]; hep?: boolean }) {
  return (
    <dl className={hep ? "grid grid-cols-2 gap-x-4 gap-y-2 text-sm" : "grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm"}>
      {ds.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-foreground">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Muc({ tieuDe, phai, children }: { tieuDe: string; phai?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 p-4" aria-label={tieuDe}>
      <div className="flex min-h-8 items-center justify-between gap-2">
        <h3 className={TIEU_MUC}>{tieuDe}</h3>
        {phai}
      </div>
      {children}
    </section>
  );
}

/** Ô ảnh mẫu — chưa có byte ảnh, chỉ khung đúng tỉ lệ và nhãn. */
function OAnh({ nhan, phu, lon = false }: { nhan: string; phu?: string; lon?: boolean }) {
  return (
    <div
      className={
        lon
          ? "flex aspect-[4/3] w-full shrink-0 snap-center flex-col items-center justify-center gap-1 rounded-lg bg-muted"
          : "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md bg-muted"
      }
      role="img"
      aria-label={nhan}
    >
      <ImageIcon aria-hidden="true" className="size-6 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">
        {nhan}
        {phu ? ` · ${phu}` : null}
      </span>
    </div>
  );
}

function GiaMucDu() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{CAN.gia}</span>
        <Badge variant="outline">{CAN.phi}</Badge>
      </div>
      <Progress value={(CAN.mucDu.co / CAN.mucDu.tren) * 100} aria-label="Mức đủ thông tin" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Mức đủ thông tin · thiếu {CAN.mucDu.thieu}</span>
        <span className="tabular-nums">
          {CAN.mucDu.co}/{CAN.mucDu.tren}
        </span>
      </div>
    </div>
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
          <span className="text-muted-foreground tabular-nums">
            {r.gia} · {r.tu}–{r.den ?? "nay"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function LichSuTimeline({ ds = SU_KIEN }: { ds?: typeof SU_KIEN }) {
  return (
    <Timeline defaultValue={ds.length}>
      {ds.map((e, i) => (
        <TimelineItem key={i} step={i + 1} className="group-data-[orientation=vertical]/timeline:ms-6">
          <TimelineHeader>
            {/* eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- lớp của ví dụ timeline ReUI chép nguyên: chiều cao vạch nối giữa hai mốc, không phải kích thước trang */}
            <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-5" />
            <TimelineTitle className="text-sm">
              {e.viec}
              {e.chiTiet ? <span className="font-normal text-muted-foreground"> · {e.chiTiet}</span> : null}
            </TimelineTitle>
            <TimelineIndicator className="size-2.5 group-data-[orientation=vertical]/timeline:-left-5" />
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

/** Lịch sử gọn: một dòng mỗi việc, ba việc gần nhất, «Xem cả» mở phần còn lại. */
function LichSuGon() {
  const [ca, setCa] = useState(false);
  const ds = ca ? SU_KIEN : SU_KIEN.slice(0, 3);
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-3 text-sm">
        {ds.map((e, i) => (
          <li key={i} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0">
              {e.viec}
              {e.chiTiet ? <span className="text-muted-foreground"> · {e.chiTiet}</span> : null}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{e.luc.split(" ")[0]}</span>
          </li>
        ))}
      </ul>
      {SU_KIEN.length > 3 ? (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setCa((v) => !v)}>
            {ca ? "Thu gọn" : `Xem cả ${SU_KIEN.length} việc`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Nút chính dính đáy (lối ReUI, Vẽ mới; lối Trong kho chỉ cho đầu khách như màn đang chạy). Chỉ là hình. */
function NutChinh({ vai }: { vai: Vai }) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-col border-t bg-background p-4" data-slot="nut-chinh" data-vai={vai}>
      {vai === "dau-chu" ? (
        <Button className="w-full">
          <PhoneCall />
          Ghi cuộc gọi
        </Button>
      ) : (
        <Button className="w-full">
          <MessageCircleQuestion />
          Hỏi đầu chủ · {CAN.dauChu}
        </Button>
      )}
    </div>
  );
}

/** Lối 1 — Trong kho: hồ sơ đang chạy trên điện thoại hôm nay (`solution-crm-4` chuyển thành cột), cùng thứ tự mục. */
function TrongKho({ vai }: { vai: Vai }) {
  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <span className="text-xs text-muted-foreground">
          {CAN.khu} · {CAN.toa} · {CAN.loaiHinh}
        </span>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{CAN.ma}</h2>
          <Badge variant="success-light">{CAN.trangThai}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">{CAN.tuoi}</span>
      </div>
      <Separator />
      <div className="p-4" aria-label="Giá và mức đủ">
        <GiaMucDu />
      </div>
      <Separator />
      <Muc tieuDe="Ảnh">
        <div className="grid grid-cols-3 gap-2">
          {ANH.map((a) => (
            <OAnh key={a.id} nhan={a.nhan} />
          ))}
        </div>
      </Muc>
      <Separator />
      <Muc tieuDe="Thuộc tính căn">
        <CapGiaTri ds={CAN.thuocTinh} />
      </Muc>
      <Separator />
      <Muc tieuDe="Lần rao đang mở">
        {vai === "dau-chu" ? (
          <div>
            <Button variant="outline" size="sm">
              Sẵn sàng bán
            </Button>
          </div>
        ) : null}
        <CapGiaTri ds={CAN.phanLanRao} />
      </Muc>
      <Separator />
      <Muc tieuDe="Các lần rao">
        <CacLanRao />
      </Muc>
      <Separator />
      <Muc tieuDe="Lịch sử">
        <LichSuTimeline />
      </Muc>
      {vai === "dau-khach" ? <NutChinh vai={vai} /> : null}
    </>
  );
}

/** Lối 2 — ReUI: `product-detail-5` (khối đích «Hồ sơ căn, điện thoại»), dựng lại từ bản chuyển thể của trang khách. */
function ReUI({ vai }: { vai: Vai }) {
  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto" aria-label="Ảnh căn, lướt ngang">
          {ANH.map((a, i) => (
            <OAnh key={a.id} nhan={a.nhan} phu={`${i + 1}/${ANH.length}`} lon />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <Badge variant="success-light">{CAN.trangThai}</Badge>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {CAN.ma} · {CAN.toa}
          </h2>
          <p className="text-sm text-muted-foreground">{CAN.chinh.map(([k, v]) => (k === "Phòng ngủ" ? `${v} phòng ngủ` : v)).join(" · ")}</p>
        </div>
        <Separator />
        <div className="flex flex-col gap-2" aria-label="Giá và mức đủ">
          <GiaMucDu />
          <p className="text-xs text-muted-foreground">{CAN.tuoi}</p>
        </div>
      </div>
      <Separator />
      <Muc tieuDe="Thuộc tính căn">
        <CapGiaTri ds={CAN.thuocTinh} hep />
      </Muc>
      <Separator />
      <Muc tieuDe="Lần rao">
        <CapGiaTri ds={CAN.phanLanRao.slice(1)} hep />
        <Separator />
        <CacLanRao />
      </Muc>
      <Separator />
      <Muc tieuDe="Lịch sử">
        <LichSuGon />
      </Muc>
      <NutChinh vai={vai} />
    </>
  );
}

/** Lối 3 — Vẽ mới: đầu màn gọn (mã căn + giá) rồi ba ngăn Tổng quan · Ảnh · Lịch sử; ghép Tabs, Badge, Timeline. */
function VeMoi({ vai }: { vai: Vai }) {
  return (
    <>
      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{CAN.ma}</h2>
          <Badge variant="success-light">{CAN.trangThai}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {CAN.toa} · {CAN.chinh.map(([k, v]) => (k === "Phòng ngủ" ? `${v}PN` : v)).join(" · ")}
        </span>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-2xl font-semibold tabular-nums">{CAN.gia}</span>
          <Badge variant="outline">{CAN.phi}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {CAN.tuoi} · đủ {CAN.mucDu.co}/{CAN.mucDu.tren}, thiếu {CAN.mucDu.thieu}
        </span>
      </div>
      <Separator />
      <Tabs defaultValue="tong-quan" className="p-4">
        <TabsList className="w-full">
          <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
          <TabsTrigger value="anh">Ảnh · {ANH.length}</TabsTrigger>
          <TabsTrigger value="lich-su">Lịch sử</TabsTrigger>
        </TabsList>
        <TabsContent value="tong-quan" className="flex flex-col gap-4 pt-3">
          <OAnh nhan={ANH[0]!.nhan} lon />
          <div className="flex flex-col gap-2">
            <span className={TIEU_MUC}>Thuộc tính căn</span>
            <CapGiaTri ds={CAN.thuocTinh} hep />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <span className={TIEU_MUC}>Lần rao đang mở</span>
            <CapGiaTri ds={CAN.phanLanRao.slice(1)} hep />
          </div>
        </TabsContent>
        <TabsContent value="anh" className="pt-3">
          <div className="grid grid-cols-2 gap-2">
            {ANH.map((a) => (
              <OAnh key={a.id} nhan={a.nhan} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="lich-su" className="flex flex-col gap-4 pt-3">
          <CacLanRao />
          <Separator />
          <LichSuTimeline />
        </TabsContent>
      </Tabs>
      <NutChinh vai={vai} />
    </>
  );
}

export function BaLoi({ loi, vai }: { loi: Loi; vai: Vai }) {
  const than = loi === "trong-kho" ? <TrongKho vai={vai} /> : loi === "reui" ? <ReUI vai={vai} /> : <VeMoi vai={vai} />;
  return (
    <div className="flex flex-col" data-loi={loi} data-vai={vai}>
      <nav className="flex flex-col gap-2 border-b p-4 text-sm" aria-label="Ba lối">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Lối:</span>
          {(Object.keys(TEN_LOI) as Loi[]).map((k) => (
            <Button key={k} size="sm" variant={k === loi ? "default" : "outline"} nativeButton={false} render={<Link href={`?loi=${k}&vai=${vai}`} />}>
              {TEN_LOI[k]}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Vai:</span>
          {(Object.keys(TEN_VAI) as Vai[]).map((k) => (
            <Button key={k} size="sm" variant={k === vai ? "secondary" : "ghost"} nativeButton={false} render={<Link href={`?loi=${loi}&vai=${k}`} />}>
              {TEN_VAI[k]}
            </Button>
          ))}
        </div>
      </nav>
      {than}
    </div>
  );
}
