"use client";

// Bốn khối của chế độ cuộc gọi (hàng 28, lối Vẽ mới ở Cổng Phạm vi): thẻ lead, danh sách hỏi, tính giá, so giá toà. Khối
// chỉ trình bày — dữ liệu, phím và lời ghi do `cuoc-goi.tsx` giữ. Hàng lựa chọn có phím ghép `ToggleGroup` + `Kbd` (dòng
// «Chỗ hở» Chế độ cuộc gọi, vo-va-ia §3); thành phần `questionnaire` không hợp — xem design-pass.md.
import { DANH_SACH_HOI, type MucHoi } from "@quy-hang/core/listing";
import { LEAD_STAGE_LABELS, NEED_LABELS, type LeadState, type Need } from "@quy-hang/core/dedupe";
import type { FeeInclusion, SoGiaToa } from "@quy-hang/core/pricing";
import { forwardRef, type KeyboardEvent, type ReactNode } from "react";

import { Badge } from "@/components/reui/badge";
import { FramePanel } from "@/components/reui/frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
// eslint-disable-next-line quy-hang-ui/no-raw-skeleton -- chờ tải từng vùng trong Frame của chế độ cuộc gọi, theo hình của vùng; ChoTai chỉ có hình cả trang
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "../../inventory/cot";
import { chuGioNgay } from "../../today/ly-do";
import { NHAN_PHI } from "./gia";
import { nhanKhoan, TI_LE_MAC_DINH_CHU, type DoiMayTinh, type MayTinh } from "./may-tinh";
import type { DongMucDu } from "./muc-du";
import type { LeadCuocGoi } from "./nguon";
import { hangLuaChon } from "./phim";

const TIEU_MUC = "text-xs font-medium uppercase tracking-wide text-muted-foreground";
const so = new Intl.NumberFormat("vi-VN");
const dong = (n: number) => `${so.format(n)} đ`;
const ty = (n: number) => `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(n / 1_000_000_000)} tỷ`;

/** Một cột của bố cục «Hồ sơ» (hàng 29, Hỏi-1): thẻ → danh sách hỏi → tính giá và so giá, theo thứ tự đầu chủ dùng khi gọi. */
export function BaCot({ the, hoi, gia }: { the: ReactNode; hoi: ReactNode; gia: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {the}
      {hoi}
      {gia}
    </div>
  );
}

export function DangTai() {
  return (
    <BaCot
      the={
        <FramePanel className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16 w-full" />
        </FramePanel>
      }
      hoi={
        <FramePanel className="flex flex-col gap-3" aria-busy="true">
          {DANH_SACH_HOI.map((m) => (
            <Skeleton key={m.ma} className="h-16 w-full" />
          ))}
        </FramePanel>
      }
      gia={
        <FramePanel className="flex flex-col gap-3" aria-busy="true">
          <Skeleton className="h-32 w-full" />
        </FramePanel>
      }
    />
  );
}

export type ThuocTinhLead = { kind: "chi-toa" } | { kind: "ngoai-danh-muc" } | { kind: "co"; truong: [string, string][] };

export function TheLead({ lead, thuocTinh, onDaGoi, dangGhi, loi }: { lead: LeadCuocGoi; thuocTinh: ThuocTinhLead; onDaGoi: () => void; dangGhi: boolean; loi: string | null }) {
  const daGoi = lead.stage === "called" || lead.stage === "on_board";
  return (
    <FramePanel className="flex flex-col gap-3" aria-label="Thẻ lead">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={daGoi ? "primary-light" : "info-light"}>{LEAD_STAGE_LABELS[lead.stage as LeadState] ?? lead.stage}</Badge>
        <span className="text-muted-foreground text-sm">Nhập {chuGioNgay(lead.createdAt)}</span>
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          {lead.unitNumber ?? "Chỉ biết toà"} · {lead.buildingName}
        </h2>
        {thuocTinh.kind === "co" ? (
          <dl className="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
            {thuocTinh.truong.map(([k, v]) => (
              <div key={k} className="contents">
                <dt>{k}</dt>
                <dd className="text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-muted-foreground text-sm">{thuocTinh.kind === "chi-toa" ? "Chủ nhà chỉ báo toà — chưa có mã căn" : "Căn ngoài danh mục — chưa có thuộc tính"}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className={TIEU_MUC}>Chủ nhà muốn</span>
        <span className="text-xl font-semibold">{lead.priceText}</span>
        <span className="text-sm">Nhu cầu: {NEED_LABELS[lead.need as Need] ?? lead.need}</span>
      </div>
      {!daGoi && (
        <Button size="sm" className="self-start" disabled={dangGhi} onClick={onDaGoi}>
          Đã gọi <Kbd>G</Kbd>
        </Button>
      )}
      {loi ? <p className="text-destructive text-sm">{loi}</p> : null}
    </FramePanel>
  );
}

export type GiaNhom = {
  chu: string;
  phi: FeeInclusion | null;
  hieuLa: string | null;
  loi: string | null;
  hoiLai: { cuMoi: string; phanTram: string | null } | null;
};

type HoiProps = {
  mucDu: DongMucDu;
  chuaHoSo: boolean;
  dung: number;
  giaTri: Record<string, string | null>;
  loiNhom: Record<string, string | null>;
  gia: GiaNhom;
  onDung: (i: number) => void;
  onChon: (ma: Exclude<MucHoi["ma"], "price">, giaTri: string | null) => void;
  onGia: (chu: string) => void;
  onPhi: (phi: FeeInclusion) => void;
  onHoiLai: (dong: boolean) => void;
  onKeyGia: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export const DanhSachHoi = forwardRef<HTMLDivElement, HoiProps & { oGia: React.Ref<HTMLInputElement> }>(function DanhSachHoi(p, ref) {
  return (
    <FramePanel className="flex flex-col gap-3" aria-label="Danh sách hỏi">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">Danh sách hỏi</h2>
        <span className="text-sm font-medium" data-muc-du>
          {p.mucDu.chu}
        </span>
      </div>
      <p className="text-sm">{p.mucDu.conThieu}</p>
      {p.chuaHoSo ? <p className="text-muted-foreground text-sm">Câu trả lời đầu tiên tạo hồ sơ căn cho lead này.</p> : null}
      <p className="text-muted-foreground flex flex-wrap items-center gap-1 text-xs">
        <Kbd>1</Kbd>–<Kbd>3</Kbd> chọn · <Kbd>Tab</Kbd> nhóm kế · <Kbd>Delete</Kbd> xoá · <Kbd>G</Kbd> đã gọi · <Kbd>Ctrl</Kbd>+<Kbd>Enter</Kbd> xong cuộc gọi
      </p>
      <div ref={ref} tabIndex={0} className="flex flex-col gap-2 outline-none" aria-label="Các nhóm hỏi" data-danh-sach-hoi>
        {DANH_SACH_HOI.map((m, i) => {
          const co = m.ma === "price" ? p.giaTri.price !== null : p.giaTri[m.ma] !== null && p.giaTri[m.ma] !== undefined;
          return (
            <div
              key={m.ma}
              onClick={() => p.onDung(i)}
              data-nhom={m.ma}
              aria-current={i === p.dung ? "true" : undefined}
              className={cn("flex flex-col gap-2 rounded-lg border p-3", i === p.dung ? "border-primary bg-primary/5" : "border-border")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{m.nhan}</span>
                <Badge variant={co ? "success-light" : "warning-light"}>{co ? "Đã hỏi" : "Chưa hỏi"}</Badge>
              </div>
              {"luaChon" in m ? (
                <HangChon muc={m} giaTri={p.giaTri[m.ma] ?? null} onChon={(v) => p.onChon(m.ma, v)} />
              ) : (
                <NhomGia gia={p.gia} oGia={p.oGia} onGia={p.onGia} onPhi={p.onPhi} onHoiLai={p.onHoiLai} onKeyGia={p.onKeyGia} />
              )}
              {p.loiNhom[m.ma] ? <p className="text-destructive text-sm">{p.loiNhom[m.ma]}</p> : null}
            </div>
          );
        })}
      </div>
    </FramePanel>
  );
});

function HangChon({ muc, giaTri, onChon }: { muc: Extract<MucHoi, { luaChon: unknown }>; giaTri: string | null; onChon: (v: string | null) => void }) {
  const hang = hangLuaChon(muc, giaTri);
  const dang = hang.luaChon.find((l) => l.dangChon);
  return (
    <div className="flex flex-col gap-1">
      <ToggleGroup
        variant="outline"
        size="sm"
        className="flex-wrap"
        value={dang ? [dang.nhan] : []}
        onValueChange={(v: string[]) => onChon(v.length ? v[v.length - 1]! : null)}
      >
        {hang.luaChon.map((l) => (
          <ToggleGroupItem key={l.nhan} value={l.nhan} tabIndex={-1}>
            <Kbd>{l.phim}</Kbd> {l.nhan}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {hang.ngoaiBo ? (
        <span className="flex items-center gap-2 text-sm">
          <Badge variant="warning-light">Ngoài bộ lựa chọn</Badge>
          {hang.ngoaiBo}
        </span>
      ) : null}
    </div>
  );
}

function NhomGia({ gia, oGia, onGia, onPhi, onHoiLai, onKeyGia }: Pick<HoiProps, "gia" | "onGia" | "onPhi" | "onHoiLai" | "onKeyGia"> & { oGia: React.Ref<HTMLInputElement> }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          ref={oGia}
          value={gia.chu}
          onChange={(e) => onGia(e.target.value)}
          onKeyDown={onKeyGia}
          aria-label="Giá chủ báo"
          data-o="gia"
          className="w-40"
        />
        <ToggleGroup variant="outline" size="sm" value={gia.phi ? [gia.phi] : []} onValueChange={(v: string[]) => v.length && onPhi(v[v.length - 1] as FeeInclusion)}>
          {(["included", "excluded"] as const).map((f, i) => (
            <ToggleGroupItem key={f} value={f} tabIndex={-1}>
              <Kbd>Alt+{i + 1}</Kbd> {NHAN_PHI[f][0]!.toUpperCase() + NHAN_PHI[f].slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {gia.loi ? <p className="text-destructive text-sm">{gia.loi}</p> : gia.hieuLa ? <p className="text-muted-foreground text-sm">{gia.hieuLa} · Enter ghi</p> : null}
      {gia.hoiLai ? (
        <div className="flex flex-wrap items-center gap-2 text-sm" role="alertdialog" aria-label="Hỏi lại giá">
          <span>
            Đổi {gia.hoiLai.cuMoi}
            {gia.hoiLai.phanTram ? ` (${gia.hoiLai.phanTram})` : ""}?
          </span>
          <Button size="sm" onClick={() => onHoiLai(true)}>
            Ghi <Kbd>Enter</Kbd>
          </Button>
          <Button size="sm" variant="outline" onClick={() => onHoiLai(false)}>
            Huỷ <Kbd>Esc</Kbd>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function TinhGia({ s, onDoi }: { s: MayTinh; onDoi: (d: DoiMayTinh) => void }) {
  const loi = (o: NonNullable<MayTinh["loi"]>["o"]) => (s.loi?.o === o ? <span className="text-destructive text-xs">{s.loi.chu}</span> : null);
  return (
    <FramePanel className="flex flex-col gap-3" aria-label="Tính giá">
      <h2 className="text-base font-semibold">Tính giá</h2>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Giá chủ báo
          <Input value={s.chuGia} onChange={(e) => onDoi({ o: "gia", chu: e.target.value })} data-o="may-tinh" />
          {loi("gia")}
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Môi giới %
          <Input value={s.chuMoiGioi} inputMode="decimal" onChange={(e) => onDoi({ o: "moi-gioi", chu: e.target.value })} data-o="may-tinh" />
          {loi("moi-gioi")}
        </label>
      </div>
      <ToggleGroup variant="outline" size="sm" value={[s.phi]} onValueChange={(v: string[]) => v.length && onDoi({ o: "phi", phi: v[v.length - 1] as FeeInclusion })}>
        <ToggleGroupItem value="included">Bao phí</ToggleGroupItem>
        <ToggleGroupItem value="excluded">Không bao phí</ToggleGroupItem>
      </ToggleGroup>
      {s.ketQua?.khoan.length ? (
        <ul className="flex flex-col gap-1 text-sm">
          {s.ketQua.khoan.map((k) => (
            <li key={k.ma} className="flex justify-between gap-2">
              <span className="text-muted-foreground">
                {nhanKhoan(k)} {String(k.tiLe / 100).replace(".", ",")}%
              </span>
              <span>{dong(k.dong)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <label className="flex flex-col gap-1 text-sm">
        Chủ nhận về tay
        <Input value={s.chuVeTay} onChange={(e) => onDoi({ o: "ve-tay", chu: e.target.value })} data-o="may-tinh" />
        {loi("ve-tay")}
        {s.ketQua ? <span className="text-muted-foreground text-xs">{dong(s.ketQua.veTay)}</span> : null}
      </label>
      <p className="text-muted-foreground text-xs">{TI_LE_MAC_DINH_CHU}</p>
    </FramePanel>
  );
}

export function SoGia({ kq, loaiCan }: { kq: SoGiaToa; loaiCan: string | null }) {
  const { dai, viTri } = kq;
  const phanTram = dai && viTri && dai.cao > dai.thap ? Math.min(100, Math.max(0, ((viTri.veTay - dai.thap) * 100) / (dai.cao - dai.thap))) : 50;
  return (
    <FramePanel className="flex flex-col gap-3" aria-label="Cùng loại trong toà">
      <h2 className="text-base font-semibold">Cùng loại trong toà{loaiCan && !kq.caToa ? ` · ${loaiCan}` : ""}</h2>
      {kq.caToa ? <p className="text-muted-foreground text-sm">Chưa biết loại căn — so cả toà.</p> : null}
      {!dai ? (
        <p className="text-sm">Toà chưa có căn cùng loại có giá</p>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            {viTri ? <Progress value={phanTram} aria-label="Vị trí căn này trên dải về tay của toà" /> : null}
            <div className="text-muted-foreground flex justify-between text-xs">
              <span>{ty(dai.thap)}</span>
              <span>giữa {ty(dai.giua)}</span>
              <span>{ty(dai.cao)}</span>
            </div>
            {viTri ? (
              <p className="text-sm">
                Căn này về tay {ty(viTri.veTay)} · {viTri.lechPhanTram > 0 ? "+" : viTri.lechPhanTram < 0 ? "−" : ""}
                {String(Math.abs(viTri.lechPhanTram)).replace(".", ",")}% so với giữa toà
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">Căn này chưa có giá để đặt lên dải.</p>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Phí</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Xác nhận</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kq.dong.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.unitNumber ?? "—"}</TableCell>
                  <TableCell>{ty(c.listPrice)}</TableCell>
                  <TableCell>{c.feeInclusion === "included" ? "BP" : "N"}</TableCell>
                  <TableCell>
                    <Badge variant={c.standardStatus === "Active" ? "success-light" : "warning-light"}>{STATUS_LABEL[c.standardStatus]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.lastConfirmedAt ? chuGioNgay(c.lastConfirmedAt) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-muted-foreground text-xs">Dải tính trên giá chủ nhận về tay. BP = bao phí · N = không bao phí.</p>
        </>
      )}
    </FramePanel>
  );
}
