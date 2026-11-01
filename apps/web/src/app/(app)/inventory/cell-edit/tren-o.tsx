"use client";

/**
 * Sửa trên ô (hàng 15) cho ba cột Giá, Phí, Trạng thái của Bảng hàng. Lưới mở trình sửa qua `onCellEditRequest` (Enter,
 * F2, gõ, nhấp đúp); trình sửa nổi ngay tại ô (Popover neo vào ô đang chọn). Không nút Lưu: Enter ghi một sự kiện qua
 * kho trên máy (hàng 13), rồi thông báo «Đã đổi … · Hoàn tác» (luật 8). Logic thuần ở `lenh.ts`, `hoan-tac.ts`.
 */
import { useCallback, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { StandardStatus, WithdrawnReason } from "@quy-hang/core/listing";
import { docGia, vietGia, vietPhanTram, type FeeInclusion } from "@quy-hang/core/pricing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSuaHang } from "@/lib/sync/react";
import type { LoiTrenMay } from "@/lib/sync/ap-tren-may";
import { FEE_LABEL, STATUS_LABEL, WITHDRAWN_LABEL, type CotId, type DongBang } from "../cot";
import { COT_SUA } from "./cot-sua";
import { KHONG_HOAN_TAC, lenhHoanTac } from "./hoan-tac";
import { chuaHieu, dungLenhGia, dungLenhPhi, dungLenhTrangThai, hieuLaGia, homNay, nacTrangThai, XAC_NHAN, type KetQuaLenh, type Lenh } from "./lenh";

export { COT_SUA };
type CotSua = "listPrice" | "feeInclusion" | "standardStatus";

const NHAN_COT: Record<CotSua, string> = { listPrice: "giá", feeInclusion: "phí", standardStatus: "trạng thái" };
const PHI: FeeInclusion[] = ["included", "excluded"];

type Phien = { hang: DongBang; cot: CotSua; chuDau?: string; o: { top: number; left: number; width: number; height: number } };
type DaGhi = { id: string; nhan: string; lenh: Lenh };
type ChoXacNhan = Extract<KetQuaLenh, { ok: true }>;

function moTaLoi(l: LoiTrenMay): string {
  if (l.kind === "missing-requirement") return `Thiếu ${l.missing.join(", ")}`;
  if (l.kind === "invalid-transition") return l.reason;
  if (l.kind === "not-found") return "Không còn thấy hàng này";
  if (l.kind === "kho") return "Máy chưa lưu được lần sửa — thử lại";
  return "Lần sửa không hợp lệ";
}

function moTaThayDoi(hang: DongBang, lenh: Lenh): string {
  if (lenh.type === "price_changed") {
    const cu = hang.listPrice === null ? "chưa có giá" : `${vietGia(hang.listPrice)}, ${FEE_LABEL[hang.feeInclusion ?? ""] ?? "—"}`;
    return `${cu} → ${vietGia(lenh.payload.listPrice)}, ${FEE_LABEL[lenh.payload.feeInclusion]}`;
  }
  return `${STATUS_LABEL[hang.standardStatus]} → ${STATUS_LABEL[lenh.payload.to]}`;
}

export function useSuaTrenO() {
  const sua = useSuaHang();
  const [phien, setPhien] = useState<Phien | null>(null);
  const daGhi = useRef<DaGhi | null>(null);

  const moTrinhSua = useCallback((hang: DongBang, cot: CotId, chuDau?: string) => {
    if (!COT_SUA.has(cot)) return;
    const td = document.querySelector("td[data-cell-focused]");
    const r = td?.getBoundingClientRect();
    setPhien({ hang, cot: cot as CotSua, chuDau, o: r ? { top: r.top, left: r.left, width: r.width, height: r.height } : { top: 0, left: 0, width: 0, height: 0 } });
  }, []);

  const hoanTac = useCallback(async () => {
    const g = daGhi.current;
    daGhi.current = null;
    if (!g) return;
    const kq = await sua(g.id, g.lenh.type, g.lenh.payload);
    if (kq.ok) toast.success(`Đã hoàn tác ${g.nhan}`);
    else toast.error(`Không hoàn tác được: ${moTaLoi(kq.loi)}`);
  }, [sua]);

  const ghi = useCallback(
    async (hang: DongBang, cot: CotSua, kq: ChoXacNhan) => {
      setPhien(null);
      const ketQua = await sua(hang.id, kq.lenh.type, kq.lenh.payload);
      if (!ketQua.ok) {
        toast.error(moTaLoi(ketQua.loi));
        return;
      }
      const nhan = `${NHAN_COT[cot]} ${hang.unitNumber ?? ""}`.trim();
      const bu = lenhHoanTac(hang, kq.lenh);
      daGhi.current = bu ? { id: hang.id, nhan, lenh: bu } : null;
      toast(`Đã đổi ${nhan}`, {
        description: bu ? XAC_NHAN : `${XAC_NHAN} · ${KHONG_HOAN_TAC}`,
        duration: 10_000,
        action: bu ? { label: "Hoàn tác", onClick: () => void hoanTac() } : undefined,
      });
    },
    [sua, hoanTac],
  );

  /** Ctrl/Cmd+Z khi lưới có tiêu điểm: hoàn tác lần sửa gần nhất của người này trên bảng này. */
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (phien || e.shiftKey || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z" || !daGhi.current) return;
      e.preventDefault();
      void hoanTac();
    },
    [phien, hoanTac],
  );

  const trinhSua: ReactNode = (
    <>
      <Toaster position="bottom-right" />
      {phien ? (
        <Popover open onOpenChange={(mo) => (mo ? null : setPhien(null))}>
          <PopoverTrigger
            render={<span aria-hidden className="pointer-events-none fixed" style={{ top: phien.o.top, left: phien.o.left, width: phien.o.width, height: phien.o.height }} />}
          />
          <PopoverContent align="start" side="bottom" sideOffset={2} className="w-80 p-3">
            <TrinhSua phien={phien} onDoiCot={(cot) => setPhien({ ...phien, cot, chuDau: undefined })} onHuy={() => setPhien(null)} onGhi={(kq) => void ghi(phien.hang, phien.cot, kq)} />
          </PopoverContent>
        </Popover>
      ) : null}
    </>
  );

  return { moTrinhSua, onKeyDown, trinhSua };
}

/** Trình sửa trong hộp nổi — dùng cả ở Bảng hàng lẫn trang mẫu design-pass. */
export function TrinhSua({ phien, onDoiCot, onHuy, onGhi }: { phien: Pick<Phien, "hang" | "cot" | "chuDau">; onDoiCot: (cot: CotSua) => void; onHuy: () => void; onGhi: (kq: ChoXacNhan) => void }) {
  const [cho, setCho] = useState<ChoXacNhan | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const xet = (kq: KetQuaLenh) => {
    if (!kq.ok) {
      if ("moTrinhSuaGia" in kq) onDoiCot("listPrice");
      else setLoi(kq.loi);
      return;
    }
    if (kq.hoiLai?.hoi || kq.khongHoanTac) setCho(kq);
    else onGhi(kq);
  };

  if (cho) return <HoiLai hang={phien.hang} kq={cho} onDoi={() => onGhi(cho)} onThoi={() => setCho(null)} />;
  if (phien.cot === "listPrice") return <SuaGia hang={phien.hang} chuDau={phien.chuDau} loi={loi} onDoiChu={() => setLoi(null)} onXet={xet} onHuy={onHuy} />;
  if (phien.cot === "feeInclusion") return <SuaPhi hang={phien.hang} onXet={xet} />;
  return <SuaTrangThai hang={phien.hang} loi={loi} onDoiChu={() => setLoi(null)} onXet={xet} onHuy={onHuy} />;
}

function SuaGia({ hang, chuDau, loi, onDoiChu, onXet, onHuy }: { hang: DongBang; chuDau?: string; loi: string | null; onDoiChu: () => void; onXet: (kq: KetQuaLenh) => void; onHuy: () => void }) {
  const [chu, setChu] = useState(chuDau ?? (hang.listPrice === null ? "" : vietGia(hang.listPrice)));
  const [phi, setPhi] = useState<FeeInclusion | null>(hang.feeInclusion === "included" || hang.feeInclusion === "excluded" ? hang.feeInclusion : null);
  const hieuLa = hieuLaGia(chu, phi);
  // Chưa hiểu thì báo ngay khi gõ (AC-3), không đợi Enter.
  const bao = loi ?? (chu.trim() && !docGia(chu).ok ? chuaHieu(chu) : null);
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onXet(dungLenhGia(hang, chu, phi));
      }}
      onKeyDown={(e) => (e.key === "Escape" ? onHuy() : null)}
    >
      <Input
        autoFocus
        aria-label="Giá"
        aria-invalid={bao ? true : undefined}
        maxLength={40}
        value={chu}
        onChange={(e) => (setChu(e.target.value), onDoiChu())}
        placeholder="4,65 tỷ hoặc 950 triệu"
      />
      <ToggleGroup variant="outline" size="sm" value={phi ? [phi] : []} onValueChange={(v) => (setPhi((v[0] as FeeInclusion | undefined) ?? phi), onDoiChu())} aria-label="Điều kiện phí">
        {PHI.map((p) => (
          <ToggleGroupItem key={p} value={p}>
            {FEE_LABEL[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {bao ? <p className="text-xs text-destructive">{bao}</p> : <p className="text-xs text-foreground">{hieuLa ?? " "}</p>}
      <p className="text-xs text-muted-foreground">{XAC_NHAN}</p>
    </form>
  );
}

function SuaPhi({ hang, onXet }: { hang: DongBang; onXet: (kq: KetQuaLenh) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <ToggleGroup variant="outline" size="sm" value={hang.feeInclusion ? [hang.feeInclusion] : []} onValueChange={(v) => (v[0] ? onXet(dungLenhPhi(hang, v[0] as FeeInclusion)) : null)} aria-label="Điều kiện phí">
        {PHI.map((p) => (
          <ToggleGroupItem key={p} value={p} autoFocus={p !== hang.feeInclusion}>
            {FEE_LABEL[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">{XAC_NHAN}</p>
    </div>
  );
}

function SuaTrangThai({ hang, loi, onDoiChu, onXet, onHuy }: { hang: DongBang; loi: string | null; onDoiChu: () => void; onXet: (kq: KetQuaLenh) => void; onHuy: () => void }) {
  const nac = nacTrangThai(hang.standardStatus);
  const [to, setTo] = useState<StandardStatus | null>(null);
  const [giaChot, setGiaChot] = useState("");
  const [ngayBan, setNgayBan] = useState(homNay());
  const [lyDo, setLyDo] = useState<WithdrawnReason | undefined>();
  const chon = (s: StandardStatus) => {
    onDoiChu();
    if (s === "Closed" || s === "Withdrawn") setTo(s);
    else onXet(dungLenhTrangThai(hang, s));
  };
  if (!nac.length) return <p className="text-sm text-muted-foreground">«{STATUS_LABEL[hang.standardStatus]}» là nấc cuối — mở lại là hàng mới.</p>;
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (to) onXet(dungLenhTrangThai(hang, to, { giaChot, ngayBan, lyDo }));
      }}
      onKeyDown={(e) => (e.key === "Escape" ? onHuy() : null)}
    >
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Đổi sang">
        {nac.map((s, i) => (
          <Button key={s} type="button" size="sm" variant={to === s ? "default" : "outline"} autoFocus={i === 0} onClick={() => chon(s)}>
            {STATUS_LABEL[s]}
          </Button>
        ))}
      </div>
      {to === "Closed" ? (
        <>
          <Input autoFocus aria-label="Giá chốt" value={giaChot} onChange={(e) => (setGiaChot(e.target.value), onDoiChu())} placeholder="Giá chốt, vd 4,5 tỷ" maxLength={40} />
          <p className="text-xs text-foreground">{docGia(giaChot).ok ? `Hiểu là: giá chốt ${vietGia((docGia(giaChot) as { dong: number }).dong)}` : " "}</p>
          <Input type="date" aria-label="Ngày bán" value={ngayBan} onChange={(e) => setNgayBan(e.target.value)} />
        </>
      ) : null}
      {to === "Withdrawn" ? (
        <Select value={lyDo ?? null} onValueChange={(v) => (setLyDo((v ?? undefined) as WithdrawnReason | undefined), onDoiChu())}>
          <SelectTrigger aria-label="Lý do ngừng">
            <SelectValue placeholder="Lý do ngừng" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(WITHDRAWN_LABEL).map(([k, nhan]) => (
              <SelectItem key={k} value={k}>
                {nhan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {loi ? <p className="text-xs text-destructive">{loi}</p> : null}
      {to ? (
        <Button type="submit" size="sm">
          Đổi sang {STATUS_LABEL[to]}
        </Button>
      ) : null}
      <p className="text-xs text-muted-foreground">{XAC_NHAN}</p>
    </form>
  );
}

function HoiLai({ hang, kq, onDoi, onThoi }: { hang: DongBang; kq: ChoXacNhan; onDoi: () => void; onThoi: () => void }) {
  const h = kq.hoiLai;
  return (
    <div className="flex flex-col gap-2" role="alertdialog" aria-label="Hỏi lại trước khi đổi">
      <p className="text-sm font-medium">{moTaThayDoi(hang, kq.lenh)}</p>
      {h && h.phanTram !== null && !h.doiPhi ? <p className="text-xs text-muted-foreground">Đổi {vietPhanTram(h.phanTram)} so với giá cũ</p> : null}
      {h?.doiPhi ? <p className="text-xs text-muted-foreground">Đổi điều kiện phí{h.phanTram ? ` · ${vietPhanTram(h.phanTram)}` : ""}</p> : null}
      {kq.hieuLa ? <p className="text-xs">{kq.hieuLa}</p> : null}
      {kq.khongHoanTac ? <p className="text-xs font-medium text-destructive">{KHONG_HOAN_TAC}</p> : null}
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onThoi}>
          Thôi
        </Button>
        <Button size="sm" autoFocus onClick={onDoi}>
          Đổi
        </Button>
      </div>
    </div>
  );
}
