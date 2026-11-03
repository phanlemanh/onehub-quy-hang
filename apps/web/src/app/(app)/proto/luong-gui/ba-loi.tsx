"use client";

// Trang ba lối của Luồng Gửi (hàng 34, ADR-0019): cùng dữ liệu mẫu, ba cách dựng màn Gửi — Trong kho · ReUI · Vẽ mới. Cả
// ba đi bố cục «Luồng nhiều bước» (ADR-0024; điện thoại phủ toàn màn), cùng ngăn xem trước dựng trang khách từ
// `banRaNgoai`, cùng nút Gửi mở bảng chia sẻ của máy. Không gọi mạng. Gỡ khi màn thật ra.
import { EyeIcon, ImageIcon, PlusIcon, Share2Icon, UserIcon, UsersIcon, XIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "cn";

import { BoCuc, DauMan } from "@/components/bo-cuc";
import { MucCaiDatKhoi } from "@/components/khoi/settings-3/muc-cai-dat";
import { SettingField } from "@/components/khoi/settings-3/setting-field";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DongBang } from "../../inventory/cot";
import { dinhDangGia, FEE_LABEL } from "../../inventory/cot";
import { TheCan } from "../../inventory/cards/the-can";
import { canNhac, chuNutGui, NhacXacNhan, tenRa, thongSoRa, useLanGui, XemTruoc, type LanGui, type NguoiNhanChon } from "./chung";
import { KHACH_MAU, type CanMau } from "./mau";

export type Loi = "trong-kho" | "reui" | "ve-moi";
const TEN: Record<Loi, string> = { "trong-kho": "Trong kho", reui: "ReUI", "ve-moi": "Vẽ mới" };

function ChonLoi({ loi }: { loi: Loi }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Ba lối">
      {(Object.keys(TEN) as Loi[]).map((k) => (
        <Button key={k} size="sm" variant={k === loi ? "default" : "outline"} nativeButton={false} render={<Link href={`?loi=${k}`} />}>
          {TEN[k]}
        </Button>
      ))}
    </nav>
  );
}

function Khung({ loi, g, children }: { loi: Loi; g: LanGui; children: ReactNode }) {
  return (
    <BoCuc
      kieu="luong-nhieu-buoc"
      luong={{ tieuDe: "Gửi căn" }}
      dauMan={<DauMan duongDan={[{ nhan: "Bảng hàng", href: "#" }, { nhan: "Gửi" }]} tieuDe="Gửi căn" moTa="Chọn người nhận, xem trước rồi mở bảng chia sẻ" dieuKhien={<ChonLoi loi={loi} />} />}
      cotPhu={loi === "trong-kho" ? <CotXemTruoc g={g} /> : undefined}
    >
      {children}
      <XemTruoc g={g} />
    </BoCuc>
  );
}

/** Chọn loại người nhận — một ToggleGroup, dùng ở cả ba lối. */
function LoaiNguoiNhan({ g }: { g: LanGui }) {
  return (
    <ToggleGroup
      variant="outline"
      value={g.nguoiNhan ? [g.nguoiNhan] : []}
      onValueChange={(v) => g.chonNguoiNhan((v[0] as NguoiNhanChon | undefined) ?? null)}
      aria-label="Gửi cho ai"
    >
      <ToggleGroupItem value="khach_rieng">
        <UserIcon aria-hidden="true" />
        Khách riêng
      </ToggleGroupItem>
      <ToggleGroupItem value="nhom_moi_gioi">
        <UsersIcon aria-hidden="true" />
        Nhóm môi giới
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

/** Danh sách khách đang mở + «Khách mới» (Hỏi-2). */
function DanhSachKhach({ g }: { g: LanGui }) {
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup value={g.khach?.id ?? ""} onValueChange={(v) => g.chonKhach(String(v))} aria-label="Khách riêng">
        {KHACH_MAU.map((k) => (
          <Item key={k.id} variant="outline" size="sm" render={<label htmlFor={`khach-${k.id}`} />} className="cursor-pointer">
            <RadioGroupItem id={`khach-${k.id}`} value={k.id} />
            <ItemContent>
              <ItemTitle>{k.ten}</ItemTitle>
              <ItemDescription>
                {k.nhuCau}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <span className="text-muted-foreground text-xs">{k.mo}</span>
            </ItemActions>
          </Item>
        ))}
      </RadioGroup>
      <Button variant="ghost" size="sm" className="self-start">
        <PlusIcon aria-hidden="true" />
        Khách mới
      </Button>
    </div>
  );
}

function NutXemVaGui({ g }: { g: LanGui }) {
  const nut = chuNutGui(g);
  return (
    <>
      <Button variant="outline" size="sm" disabled={!g.nguoiNhan || g.ds.length === 0} onClick={() => g.setXem(true)}>
        <EyeIcon aria-hidden="true" />
        Xem trước
      </Button>
      <Button size="sm" disabled={!nut.mo} onClick={() => void g.gui()}>
        <Share2Icon aria-hidden="true" />
        {nut.chu}
      </Button>
    </>
  );
}

const nhanNguoiNhan = (g: LanGui) =>
  g.nguoiNhan === "khach_rieng" ? (g.khach ? `Khách riêng · ${g.khach.ten}` : "Khách riêng — chưa chọn khách") : g.nguoiNhan === "nhom_moi_gioi" ? "Nhóm môi giới" : "Chưa chọn người nhận";

// ── Trong kho: khuôn «Luồng nhiều bước» của trang mẫu (settings-3 xếp chồng + cột phụ Xem trước) và thẻ product-grid-4
// của Bảng hàng thẻ (hàng 32). ──

function dongTu(c: CanMau): DongBang {
  const n = c.noiBo;
  return {
    id: c.id,
    buildingName: n.buildingName,
    unitNumber: n.unitNumber,
    unitType: n.bedroomsTotal ? `${n.bedroomsTotal}PN` : "—",
    livingArea: n.livingArea,
    floor: n.floor,
    directionFaces: n.directionFaces,
    standardStatus: n.standardStatus,
    listPrice: n.listPrice,
    feeInclusion: n.feeInclusion,
    furnished: n.furnished,
    legalStatus: n.legalStatus,
    financing: n.financing,
    occupantType: n.occupantType,
    confirmedAgeDays: null,
    needsCallBack: false,
    completeness: null,
    visibility: "Company",
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
  };
}

function CotXemTruoc({ g }: { g: LanGui }) {
  return (
    <Frame spacing="sm" className="w-full">
      <FrameHeader>
        <FrameTitle>Xem trước</FrameTitle>
        <FrameDescription>{nhanNguoiNhan(g)}</FrameDescription>
      </FrameHeader>
      <FramePanel className="flex flex-col gap-2">
        {g.ban.map((b, i) => (
          <div key={i} className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-foreground truncate">{tenRa(b)}</span>
            <span className="text-muted-foreground shrink-0 tabular-nums">{dinhDangGia(b.listPrice ?? null)}</span>
          </div>
        ))}
      </FramePanel>
      <FrameFooter className="flex flex-row justify-end">
        <Button variant="outline" size="sm" disabled={!g.nguoiNhan} onClick={() => g.setXem(true)}>
          <EyeIcon aria-hidden="true" />
          Mở trang khách
        </Button>
      </FrameFooter>
    </Frame>
  );
}

function TrongKho() {
  const g = useLanGui();
  return (
    <Khung loi="trong-kho" g={g}>
      <MucCaiDatKhoi tieuDe="Gửi cho ai" moTa="Khách riêng không thấy mã căn; nhóm môi giới thấy mã.">
        <SettingField title="Người nhận" description="Một khách đang mở của bạn, hay nhóm môi giới.">
          <LoaiNguoiNhan g={g} />
        </SettingField>
        {g.nguoiNhan === "khach_rieng" ? (
          <SettingField title="Khách" description="Khách chưa có thì tạo ngay ở đây." last>
            <DanhSachKhach g={g} />
          </SettingField>
        ) : null}
      </MucCaiDatKhoi>
      <Frame className="w-full">
        <FrameHeader className="px-2! py-2.5!">
          <FrameTitle>Căn sẽ gửi</FrameTitle>
          <FrameDescription>{g.ds.length} căn, theo thứ tự đã chọn trên Bảng hàng.</FrameDescription>
        </FrameHeader>
        <FramePanel className="flex flex-col gap-1">
          {g.ds.map((c) => (
            <div key={c.id} className="flex flex-col gap-1">
              <TheCan d={dongTu(c)} dangChon={false} daChon={false} onMo={() => undefined} onTich={() => undefined} onGiuLau={() => undefined} />
              <div className="flex items-center justify-between gap-2 pl-32">
                {canNhac(c) ? <NhacXacNhan /> : <span />}
                <Button variant="ghost" size="sm" onClick={() => g.boCan(c.id)}>
                  Bỏ căn
                </Button>
              </div>
            </div>
          ))}
        </FramePanel>
      </Frame>
      <MucCaiDatKhoi tieuDe="Tin soạn sẵn" moTa="Dựng từ bản ra; sửa được trước khi gửi.">
        <SettingField title="Tin" description="Link nằm trong thân tin." last>
          <Textarea rows={8} value={g.tin} onChange={(e) => g.suaTin(e.target.value)} aria-label="Tin soạn sẵn" />
        </SettingField>
      </MucCaiDatKhoi>
      <div className="bg-background sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t py-3">
        <span className="text-foreground text-sm font-medium tabular-nums">{g.ds.length} căn</span>
        <div className="flex items-center gap-2">
          <NutXemVaGui g={g} />
        </div>
      </div>
    </Khung>
  );
}

// ── ReUI: wishlist-1 (ReUI Pro, tải bằng khoá Pro qua registry 03/11) — đầu khối có dòng chấm ngăn, dòng chọn có ảnh nhỏ
// và huy hiệu tín hiệu, thanh chọn «n mục · Clear · Remove · Add to cart» thành thanh dính đáy «n căn · Xem trước · Gửi». ──

function ChamNgan({ cac }: { cac: string[] }) {
  return (
    <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm">
      {cac.map((s, i) => (
        <span key={s} className="inline-flex items-center gap-2">
          {i > 0 ? <span aria-hidden="true" className="bg-muted-foreground/40 size-1 shrink-0 rounded-full" /> : null}
          <span>{s}</span>
        </span>
      ))}
    </p>
  );
}

function DongCan({ c, g, i }: { c: CanMau; g: LanGui; i: number }) {
  const b = g.ban[i];
  const n = c.noiBo;
  return (
    <div className="group/row -mx-3 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg px-3 sm:-mx-4 sm:gap-5 sm:px-4">
      <Item variant="muted" className="relative size-16 overflow-hidden p-0 sm:size-20">
        <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-5" />
      </Item>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-muted-foreground w-fit text-xs font-medium">{n.buildingName}</span>
        <h3 className="text-foreground min-w-0 truncate text-sm leading-tight font-semibold tracking-tight sm:text-base">{n.unitNumber}</h3>
        <ChamNgan cac={[thongSoRa(b ?? {}), b && b.unitNumber == null ? `Khách thấy: ${tenRa(b)}` : "Khách thấy mã căn"]} />
        {canNhac(c) ? <NhacXacNhan /> : null}
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-foreground text-sm font-semibold tabular-nums">{dinhDangGia(n.listPrice)}</span>
        <span className="text-muted-foreground text-xs">{n.feeInclusion ? FEE_LABEL[n.feeInclusion] : ""}</span>
        <Button variant="ghost" size="icon-sm" aria-label={`Bỏ ${n.unitNumber}`} onClick={() => g.boCan(c.id)}>
          <XIcon aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

function ReUI() {
  const g = useLanGui();
  return (
    <Khung loi="reui" g={g}>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3" aria-label="Gửi cho ai">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-base font-semibold tracking-tight">Gửi cho ai</h2>
            <LoaiNguoiNhan g={g} />
          </div>
          {g.nguoiNhan === "khach_rieng" ? <DanhSachKhach g={g} /> : null}
        </section>

        <section className="flex flex-col" aria-label="Căn sẽ gửi">
          <div className="flex flex-col gap-1 pb-3">
            <h2 className="text-foreground text-base font-semibold tracking-tight">Căn sẽ gửi</h2>
            <ChamNgan cac={[`${g.ds.length} căn đang bán`, "theo thứ tự đã chọn", `${g.ds.filter(canNhac).length} căn cần gọi xác nhận`]} />
          </div>
          <ul role="list" className="divide-border divide-y border-y">
            {g.ds.map((c, i) => (
              <li key={c.id} className="py-4 sm:py-5">
                <DongCan c={c} g={g} i={i} />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2" aria-label="Tin soạn sẵn">
          <h2 className="text-foreground text-base font-semibold tracking-tight">Tin soạn sẵn</h2>
          <Textarea rows={8} value={g.tin} onChange={(e) => g.suaTin(e.target.value)} aria-label="Tin soạn sẵn" />
          <p className="text-muted-foreground text-xs">Dựng từ bản ra, link nằm trong thân tin. Sửa được trước khi gửi.</p>
        </section>

        {/* Thanh chọn của wishlist-1: số đếm trái, nút phải — dời xuống đáy và dính. */}
        <div className="bg-background sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t py-3">
          <div className="flex min-w-0 flex-col">
            <span className="text-foreground text-sm font-medium tabular-nums">{g.ds.length} căn</span>
            <span className="text-muted-foreground truncate text-xs">{nhanNguoiNhan(g)}</span>
          </div>
          <div className="flex items-center gap-2">
            <NutXemVaGui g={g} />
          </div>
        </div>
      </div>
    </Khung>
  );
}

// ── Vẽ mới: ghép Frame + Tabs — ba bước Người nhận · Căn · Tin trong một khung, chân khung là thanh gửi. ──

function VeMoi() {
  const g = useLanGui();
  return (
    <Khung loi="ve-moi" g={g}>
      <Frame className="w-full">
        <Tabs defaultValue="nguoi-nhan">
          <FrameHeader className="px-2! py-2.5!">
            <TabsList>
              <TabsTrigger value="nguoi-nhan">1 · Người nhận</TabsTrigger>
              <TabsTrigger value="can">2 · Căn ({g.ds.length})</TabsTrigger>
              <TabsTrigger value="tin">3 · Tin</TabsTrigger>
            </TabsList>
          </FrameHeader>
          <FramePanel>
            <TabsContent value="nguoi-nhan" className="flex flex-col gap-3">
              <LoaiNguoiNhan g={g} />
              {g.nguoiNhan === "khach_rieng" ? <DanhSachKhach g={g} /> : null}
            </TabsContent>
            <TabsContent value="can" className="flex flex-col gap-2">
              {g.ds.map((c, i) => (
                <Item key={c.id} variant="outline" size="sm">
                  <ItemContent>
                    <ItemTitle>{c.noiBo.unitNumber}</ItemTitle>
                    <ItemDescription>
                      {thongSoRa(g.ban[i] ?? {})} · {dinhDangGia(c.noiBo.listPrice)}
                    </ItemDescription>
                    {canNhac(c) ? <NhacXacNhan /> : null}
                  </ItemContent>
                  <ItemActions>
                    <Button variant="ghost" size="icon-sm" aria-label={`Bỏ ${c.noiBo.unitNumber}`} onClick={() => g.boCan(c.id)}>
                      <XIcon aria-hidden="true" />
                    </Button>
                  </ItemActions>
                </Item>
              ))}
            </TabsContent>
            <TabsContent value="tin">
              <Textarea rows={8} value={g.tin} onChange={(e) => g.suaTin(e.target.value)} aria-label="Tin soạn sẵn" />
            </TabsContent>
          </FramePanel>
        </Tabs>
        <FrameFooter className={cn("bg-background sticky bottom-0 z-10 flex flex-row items-center justify-between gap-3")}>
          <span className="text-muted-foreground truncate text-sm">
            <span className="text-foreground font-medium tabular-nums">{g.ds.length} căn</span> · {nhanNguoiNhan(g)}
          </span>
          <div className="flex items-center gap-2">
            <NutXemVaGui g={g} />
          </div>
        </FrameFooter>
      </Frame>
    </Khung>
  );
}

export function BaLoi({ loi }: { loi: Loi }) {
  return loi === "trong-kho" ? <TrongKho key="trong-kho" /> : loi === "ve-moi" ? <VeMoi key="ve-moi" /> : <ReUI key="reui" />;
}
