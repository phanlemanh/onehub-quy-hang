"use client";

/**
 * Sửa trên ô (hàng 15) cho ba cột Giá, Phí, Trạng thái của Bảng hàng. Lưới mở trình sửa qua `onCellEditRequest` (Enter,
 * F2, gõ, nhấp đúp); trình sửa nổi ngay tại ô (Popover neo vào ô đang chọn). Không nút Lưu: Enter ghi một sự kiện qua
 * kho trên máy (hàng 13), rồi thông báo «Đã đổi … · Hoàn tác» (luật 8); mỗi thông báo hoàn tác đúng lần sửa của nó
 * (va-sua-tren-o). Logic thuần ở `lenh.ts`, `hoan-tac.ts`.
 */
import { useCallback, useState, type KeyboardEvent, type ReactNode } from "react";
import type { StandardStatus, WithdrawnReason } from "@quy-hang/core/listing";
import { docGia, vietPhanTram, type FeeInclusion } from "@quy-hang/core/pricing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDocPhienBan, useSuaHang } from "@/lib/sync/react";
import type { LoiTrenMay } from "@/lib/sync/ap-tren-may";
import { FEE_LABEL, STATUS_LABEL, WITHDRAWN_LABEL, type CotId, type DongBang } from "../cot";
import { laOGo } from "../bulk/phim";
import { COT_SUA } from "./cot-sua";
import { KHONG_HOAN_TAC, lenhHoanTac, taoSoHoanTac, type BanGhiHoanTac, type KetQuaDung } from "./hoan-tac";
import { chuaHieu, chuDienSan, dungLenhGia, dungLenhPhi, dungLenhTrangThai, hieuLaGia, hieuLaGiaChot, homNay, moTaLoi, moTaThayDoi, nacTrangThai, XAC_NHAN, type KetQuaLenh } from "./lenh";

export { COT_SUA };
type CotSua = "listPrice" | "feeInclusion" | "standardStatus";

const NHAN_COT: Record<CotSua, string> = { listPrice: "giá", feeInclusion: "phí", standardStatus: "trạng thái" };
const PHI: FeeInclusion[] = ["included", "excluded"];

type Phien = { hang: DongBang; cot: CotSua; chuDau?: string; coSo?: number; o: { top: number; left: number; width: number; height: number } };
type ChoXacNhan = Extract<KetQuaLenh, { ok: true }>;


export function useSuaTrenO() {
  const sua = useSuaHang();
  const docPhienBan = useDocPhienBan();
  const [phien, setPhien] = useState<Phien | null>(null);
  const [so] = useState(taoSoHoanTac);

  const moTrinhSua = useCallback((hang: DongBang, cot: CotId, chuDau?: string) => {
    if (!COT_SUA.has(cot)) return;
    // Hàng chưa có giá: ô Phí mở thẳng trình sửa Giá — không có phí trơn (AC-4).
    if (cot === "feeInclusion" && hang.listPrice === null) cot = "listPrice";
    const td = document.querySelector("td[data-cell-focused]");
    const r = td?.getBoundingClientRect();
    // Phiên bản người đang thấy: kho kéo bản mới trong lúc gõ thì lần ghi vào «Cần xem», không ghi đè lặng (AC-9).
    setPhien({ hang, cot: cot as CotSua, chuDau, coSo: docPhienBan(hang.id), o: r ? { top: r.top, left: r.left, width: r.width, height: r.height } : { top: 0, left: 0, width: 0, height: 0 } });
  }, [docPhienBan]);

  /** Ghi lệnh bù của bản ghi đã được bộ giữ cho dùng; bị từ chối thì báo, không ghi gì. Lệnh bù không tạo bản ghi mới. */
  const hoanTac = useCallback(
    async (kq: KetQuaDung) => {
      if (!kq.ok) {
        toast.error(kq.loi);
        return;
      }
      const g = kq.banGhi;
      // Lệnh bù mang phiên bản vừa xét: một lần kéo về chen giữa lúc xét và lúc ghi thì thành xung đột, vào «Cần xem»,
      // không ghi đè lặng lần sửa sau (AC-5).
      const ketQua = await sua(g.id, g.lenh.type, g.lenh.payload, g.phienBanSau);
      if (ketQua.ok) toast.success(`Đã hoàn tác ${g.nhan}`);
      else toast.error(`${KHONG_HOAN_TAC}: ${moTaLoi(ketQua.loi)}`);
    },
    [sua],
  );

  const ghi = useCallback(
    async (hang: DongBang, cot: CotSua, kq: ChoXacNhan, coSo: number | undefined) => {
      setPhien(null);
      const ketQua = await sua(hang.id, kq.lenh.type, kq.lenh.payload, coSo);
      if (!ketQua.ok) {
        toast.error(moTaLoi(ketQua.loi));
        return;
      }
      const nhan = `${NHAN_COT[cot]} ${hang.unitNumber ?? ""}`.trim();
      const bu = lenhHoanTac(hang, kq.lenh);
      // Phiên bản căn ngay sau lần ghi này: căn đổi phiên bản nữa là có lần sửa sau, thông báo này thôi hoàn tác (AC-5).
      const banGhi: BanGhiHoanTac | null = so.ghi(bu ? { id: hang.id, nhan, lenh: bu, phienBanSau: ketQua.op.expectedVersion + 1 } : null);
      toast(`Đã đổi ${nhan}`, {
        description: banGhi ? XAC_NHAN : `${XAC_NHAN} · ${KHONG_HOAN_TAC}`,
        duration: 10_000,
        action: banGhi ? { label: "Hoàn tác", onClick: () => void hoanTac(so.dungNut(banGhi, docPhienBan)) } : undefined,
      });
    },
    [sua, so, hoanTac, docPhienBan],
  );

  /** Ctrl/Cmd+Z khi lưới có tiêu điểm: hoàn tác lần sửa thành công gần nhất của người này trên bảng này (AC-6). */
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Đang gõ trong ô chữ (ô lọc cột…) thì Ctrl/Cmd+Z là của ô gõ, không hoàn tác lần sửa căn (hàng 16).
      if (phien || laOGo(e.target) || e.shiftKey || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      const kq = so.dungPhim(docPhienBan);
      if (!kq) return;
      e.preventDefault();
      void hoanTac(kq);
    },
    [phien, so, hoanTac, docPhienBan],
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
            <TrinhSua phien={phien} onDoiCot={(cot) => setPhien({ ...phien, cot, chuDau: undefined })} onHuy={() => setPhien(null)} onGhi={(kq) => void ghi(phien.hang, phien.cot, kq, phien.coSo)} />
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
  const [chu, setChu] = useState(chuDau ?? chuDienSan(hang));
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
          <p className="text-xs text-foreground">{hieuLaGiaChot(giaChot) ?? " "}</p>
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
