// Thân cột của hồ sơ căn (hàng 17) — chuyển thể `solution-crm-4` thành cột (Cổng Phạm vi, Hỏi-2): giá + mức đủ đầu cột,
// thuộc tính căn, lần rao, dòng thời gian lịch sử. Dựng thuần từ mô hình (`mo-hinh.ts`); nút cần bộ đồng bộ đi qua khe.
// Máy tính (từ 768 px) ở mọi chỗ: cột cạnh Bảng hàng, cột phải Hôm nay, toàn màn.
import { Maximize2, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ChoTai } from "@/components/bo-cuc/cho-tai";
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
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MucAnhCan } from "../photos/muc-anh-can";
import { NEO_MUC_ANH } from "../ready/nut-san-sang";
import { luc, type MoHinhHoSo } from "./mo-hinh";
import { NutBaoSai } from "./nut-bao-sai";
import { NutHoiDauChu } from "./nut-hoi-dau-chu";
import { DongDinhNghia } from "./dong-dinh-nghia";
import { CapGiaTri, doiUrl, Muc, ngay } from "./than-chung";

/** Nút cần bộ đồng bộ, hồ sơ dựng sẵn rồi trao vào: «Sẵn sàng bán» (khi mô hình cho hiện), ô gắn mã của hàng chưa có mã. */
export type KheHoSo = { sanSang: ReactNode; oMa: ReactNode };
export type HanhDongHoSo = { thuNgay: () => void; taiLichSu: (id: string) => void };

export function NutDong({ href }: { href: string | null }) {
  return href ? (
    <Button variant="ghost" size="icon-sm" aria-label="Đóng hồ sơ" data-muc="dong-ho-so" nativeButton={false} render={<a href={href} onClick={doiUrl(href)} />}>
      <X />
    </Button>
  ) : null;
}

export function NutToanMan({ href }: { href: string | null }) {
  return href ? (
    <Button variant="ghost" size="icon-sm" aria-label="Mở toàn màn" data-muc="mo-toan-man" nativeButton={false} render={<Link href={href} />}>
      <Maximize2 />
    </Button>
  ) : null;
}

/** «Không có căn» và «Nhiều căn» — chung hai thân. */
export function KhongNhieu({ m }: { m: Extract<MoHinhHoSo, { kind: "khong" | "nhieu" }> }) {
  if (m.kind === "khong") {
    return (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-end">
          <NutDong href={m.dongHref} />
        </div>
        {m.theoHang ? (
          <TrangThai kind="notice" title="Không có hàng này trong Bảng hàng" description="Hàng này không có trong hàng bạn thấy trên máy này." />
        ) : (
          <TrangThai kind="notice" title="Không có căn này trong Bảng hàng" description={`Mã «${m.ma}» không có trong hàng bạn thấy trên máy này.`} />
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex justify-end">
        <NutDong href={m.dongHref} />
      </div>
      <TrangThai
        kind="notice"
        title="Nhiều căn"
        description={
          <span className="flex flex-col gap-2">
            Mã «{m.ma}» có ở {m.toa.length} toà — chọn toà:
            <span className="flex flex-wrap gap-2">
              {m.toa.map((t) => (
                <Button key={t.ten} variant="outline" size="sm" nativeButton={false} render={<a href={t.href} onClick={doiUrl(t.href)} />}>
                  {t.ten}
                </Button>
              ))}
            </span>
          </span>
        }
      />
    </div>
  );
}

/** Lượt kéo đầu hỏng: lỗi kèm «Thử lại» ngay trong cột (AC-10 hàng 105) — bảng bên cạnh giữ trạng thái của nó. */
export function LoiTaiDau({ moTa, thuNgay }: { moTa: string; thuNgay: () => void }) {
  return (
    <div className="p-4">
      <TrangThai
        kind="error"
        title="Chưa tải được hồ sơ căn"
        description={moTa}
        hanhDong={
          <Button type="button" variant="outline" size="sm" onClick={thuNgay}>
            Thử lại
          </Button>
        }
      />
    </div>
  );
}

/** Phần lịch sử theo bản đã tải và mạng — chung hai thân; đã tải thì dựng `children` (dòng thời gian, hay danh sách gọn). */
export function PhanLichSu({ m, hd, children }: { m: Extract<MoHinhHoSo, { kind: "co" }>; hd: HanhDongHoSo; children: ReactNode }) {
  const ttls = m.ttls;
  if (ttls.kind === "can-mang") return <p className="text-sm text-muted-foreground">{ttls.chu}</p>;
  if (ttls.kind === "khong-tai-duoc")
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {ttls.chu}
        <Button variant="outline" size="sm" onClick={() => hd.taiLichSu(m.can.id)}>
          Thử lại
        </Button>
      </div>
    );
  if (ttls.kind === "dang-tai") return <TrangThai kind="loading" title="Đang tải lịch sử" />;
  return children;
}

export function ThanCot({ m, khe, hd }: { m: MoHinhHoSo; khe: KheHoSo; hd: HanhDongHoSo }) {
  if (m.kind === "loi") return <LoiTaiDau moTa={m.moTa} thuNgay={hd.thuNgay} />;
  if (m.kind === "cho-tai") return <ChoTai kieu="ho-so" />;
  if (m.kind === "khong" || m.kind === "nhieu") return <KhongNhieu m={m} />;

  const { can, chuaMa, tt } = m;
  return (
    <div className="flex flex-col" data-slot="ho-so-can" data-than="cot">
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs text-muted-foreground">{m.dauCot}</span>
            <div className="flex items-center gap-2">
              {chuaMa ? <h2 className="text-lg font-semibold text-muted-foreground">Chưa có mã căn</h2> : <h2 className="text-lg font-semibold">{m.ma}</h2>}
              <Badge variant={m.dangXem.dangMo ? "success-light" : "outline"}>{m.dangXem.trangThai}</Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <NutToanMan href={m.moToanMan} />
            <NutDong href={m.dongHref} />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{m.xacNhan}</span>
      </div>
      <Separator />
      <div className="flex flex-col gap-2 p-4" aria-label="Giá và mức đủ" data-muc="muc-du">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{m.gia}</span>
          {m.phi ? <Badge variant="outline">{m.phi}</Badge> : null}
        </div>
        <DongDinhNghia listingId={m.can.id} gia={m.can.listPrice} phi={m.can.feeInclusion} />
        <Progress value={(m.mucDu.co / m.mucDu.tren) * 100} aria-label="Mức đủ thông tin" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{m.mucDu.chu}</span>
          <span>
            {m.mucDu.co}/{m.mucDu.tren}
          </span>
        </div>
      </div>
      <Separator />
      <Muc tieuDe="Ảnh" id={NEO_MUC_ANH} muc="anh">
        {chuaMa ? <p className="text-sm text-muted-foreground">Ảnh gắn theo toà và mã căn — gắn mã căn rồi tải ảnh.</p> : <MucAnhCan toa={m.toa} ma={m.ma} />}
      </Muc>
      <Separator />
      <Muc
        tieuDe="Thuộc tính căn"
        muc="thuoc-tinh"
        phai={
          m.coBaoSai && tt?.kind === "co" ? (
            <div className="contents" data-muc="bao-sai">
              <NutBaoSai ma={m.ma} toa={m.toa} khu={tt.khu} truong={tt.truong} />
            </div>
          ) : null
        }
      >
        {chuaMa ? (
          <>
            <div className="contents" data-muc="o-ma">
              {khe.oMa}
            </div>
            <CapGiaTri ds={[["Toà", m.toa]]} />
          </>
        ) : tt?.kind === "co" ? (
          <CapGiaTri ds={tt.truong} muc="chu-khoa" />
        ) : (
          <p className="text-sm text-muted-foreground">Chưa có trong danh mục</p>
        )}
      </Muc>
      <Separator />
      <Muc tieuDe={m.dangXem.dangMo ? "Lần rao đang mở" : "Lần rao đang xem"} muc="lan-rao">
        {m.hienSanSang ? khe.sanSang : null}
        <CapGiaTri ds={m.truongLanRao} />
      </Muc>
      <Separator />
      <Muc tieuDe="Các lần rao" muc="cac-lan-rao">
        <ul className="flex flex-col gap-1 text-sm">
          {m.lan.map((r) => (
            <li key={r.id}>
              <a
                href={r.href}
                onClick={doiUrl(r.href)}
                aria-current={r.id === can.id ? "true" : undefined}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent aria-[current=true]:bg-accent"
              >
                <span className="flex items-center gap-2">
                  Lần {r.thu}
                  <Badge variant={r.dangMo ? "success-light" : "outline"}>{r.trangThai}</Badge>
                </span>
                <span className="text-muted-foreground">
                  {r.gia} · {r.tu ? ngay(r.tu) : "…"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Muc>
      <Separator />
      <Muc tieuDe="Lịch sử" muc="lich-su" phai={m.ttls.kind === "tren-may" ? <span className="text-xs text-muted-foreground">{m.ttls.chu}</span> : null}>
        <PhanLichSu m={m} hd={hd}>
          <Timeline defaultValue={m.lichSu.length}>
            {m.lichSu.map((d, i) => (
              <TimelineItem key={i} step={i + 1} className="group-data-[orientation=vertical]/timeline:ms-6">
                <TimelineHeader>
                  {/* eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- lớp của ví dụ timeline ReUI chép nguyên: chiều cao vạch nối giữa hai mốc, không phải kích thước trang */}
                  <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-5 group-data-[orientation=vertical]/timeline:h-[calc(100%-1rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-5" />
                  <TimelineTitle className="text-sm">
                    {d.viec}
                    {d.chiTiet ? <span className="font-normal text-muted-foreground"> · {d.chiTiet}</span> : null}
                  </TimelineTitle>
                  <TimelineIndicator className="size-2.5 group-data-[orientation=vertical]/timeline:-left-5" />
                </TimelineHeader>
                <TimelineContent>
                  <TimelineDate className="mb-0 text-xs">
                    {d.nguoi} · {luc(d.luc)}
                  </TimelineDate>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </PhanLichSu>
      </Muc>
      {m.co.hoiDauChu && !chuaMa ? <NutHoiDauChu key={can.id} listingId={can.id} dauChu={m.dauChu} ma={m.ma} toa={m.toa} /> : null}
    </div>
  );
}
