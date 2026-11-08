"use client";

// Hai ngăn sửa nhanh của hồ sơ căn điện thoại (hàng 40 doi-gia-nhanh): «Đổi giá» mở từ khối Giá, «Đổi trạng thái» mở từ huy
// hiệu trạng thái. Ngăn nổi từ đáy qua `NganNoi` (luật no-direct-sheet), lỗi qua `TrangThai`. Phần thuần ở `sua-nhanh.ts`.
import { WITHDRAWN_REASONS, type WithdrawnReason } from "@quy-hang/core/listing";
import { vietPhanTram, type FeeInclusion } from "@quy-hang/core/pricing";
import { useState } from "react";

import { NganNoi } from "@/components/bo-cuc/ngan-noi";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useDocPhienBan, useSuaHang } from "@/lib/sync/react";
import { WITHDRAWN_LABEL } from "../../../inventory/cot";
import { chuDienSan, ghiAnToan, hieuLaGia, homNay, moTaThayDoi, type HangSua, type LuaChonTrangThai } from "../../../inventory/cell-edit/lenh";
import { useTuVung } from "../../../inventory/tu-vung";
import { buocDoiGia, buocDoiTrangThai, cacNac, canPhanKem, ghiLenh, type BuocLuu } from "./sua-nhanh";

export const NHAN_PHI_NGAN: Record<FeeInclusion, string> = { included: "Bao phí", excluded: "Không bao phí" };

function useGhi(hang: HangSua, xong: () => void) {
  const sua = ghiAnToan(useSuaHang());
  const docPhienBan = useDocPhienBan();
  const [loi, setLoi] = useState<string | null>(null);
  const [dangGhi, setDangGhi] = useState(false);
  const chay = async (b: Extract<BuocLuu, { kind: "ghi" | "hoi-lai" }>) => {
    setDangGhi(true);
    const kq = await ghiLenh(sua, hang, b.lenh, docPhienBan(hang.id));
    setDangGhi(false);
    if (kq.ok) xong();
    else setLoi(kq.chu);
  };
  return { loi, setLoi, dangGhi, chay };
}

function BaoLoi({ chu }: { chu: string | null }) {
  if (!chu) return null;
  return (
    <div className="contents" data-trang-thai="loi-sua-nhanh">
      <TrangThai kind="error" title={chu} />
    </div>
  );
}

/** Ngăn «Đổi giá»: ô giá, bao phí hay không, hỏi lại khi giá đổi nhiều hay đổi điều kiện phí. */
export function NganDoiGia({ hang, mo, onMo }: { hang: HangSua; mo: boolean; onMo: (v: boolean) => void }) {
  const tv = useTuVung();
  const [chu, setChu] = useState(() => chuDienSan(hang));
  const [phi, setPhi] = useState<FeeInclusion | null>(hang.feeInclusion === "included" || hang.feeInclusion === "excluded" ? hang.feeInclusion : null);
  const [hoi, setHoi] = useState<Extract<BuocLuu, { kind: "hoi-lai" }> | null>(null);
  const dong = () => {
    setHoi(null);
    onMo(false);
  };
  const g = useGhi(hang, dong);
  const luu = () => {
    g.setLoi(null);
    const b = buocDoiGia(hang, chu, phi);
    if (b.kind === "loi") g.setLoi(b.chu);
    else if (b.kind === "hoi-lai") setHoi(b);
    else void g.chay(b);
  };
  return (
    <NganNoi
      mo={mo}
      onMo={(v) => (v ? onMo(true) : dong())}
      tieuDe={`Đổi giá · ${hang.unitNumber ?? ""}`}
      moTa="Giá kèm điều kiện phí"
      chan={
        hoi ? (
          <div className="flex gap-2">
            <Button className="h-11 flex-1" variant="outline" onClick={() => setHoi(null)} data-nut="sua-lai">
              Sửa lại
            </Button>
            <Button className="h-11 flex-1" disabled={g.dangGhi} onClick={() => void g.chay(hoi)} data-nut="ghi-hoi-lai">
              Ghi
            </Button>
          </div>
        ) : (
          <Button className="h-11 w-full" size="lg" disabled={g.dangGhi} onClick={luu} data-nut="luu-gia">
            Lưu
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-3 px-4 pb-4" data-slot="ngan-doi-gia">
        <Input inputMode="decimal" aria-label="Giá mới" value={chu} onChange={(e) => (setChu(e.target.value), setHoi(null))} placeholder="vd 3,2 tỷ hoặc 950 triệu" maxLength={40} />
        <p className="text-xs text-muted-foreground">{hieuLaGia(chu, phi) ?? " "}</p>
        <ToggleGroup value={phi ? [phi] : []} onValueChange={(v) => (setPhi((v[0] as FeeInclusion | undefined) ?? null), setHoi(null))} variant="outline" aria-label="Điều kiện phí">
          <ToggleGroupItem value="included">{NHAN_PHI_NGAN.included}</ToggleGroupItem>
          <ToggleGroupItem value="excluded">{NHAN_PHI_NGAN.excluded}</ToggleGroupItem>
        </ToggleGroup>
        {hoi ? (
          <div className="flex flex-col gap-1" role="alertdialog" aria-label="Hỏi lại trước khi đổi" data-khoi="hoi-lai">
            <p className="text-sm font-medium">{moTaThayDoi(hang, hoi.lenh, undefined, tv)}</p>
            {hoi.phanTram !== null ? <p className="text-xs text-muted-foreground">{hoi.doiPhi ? "Đổi điều kiện phí · " : ""}Đổi {vietPhanTram(hoi.phanTram)} so với giá đang ghi — chắc chưa?</p> : null}
          </div>
        ) : null}
        <BaoLoi chu={g.loi} />
      </div>
    </NganNoi>
  );
}

/** Ngăn «Đổi trạng thái»: nấc theo luật, phần kèm của Đã bán / Ngừng bán, lý do của lõi khi trái luật. */
export function NganDoiTrangThai({ hang, sanSang, mo, onMo }: { hang: HangSua; sanSang: boolean; mo: boolean; onMo: (v: boolean) => void }) {
  const tv = useTuVung();
  const ds = cacNac(hang, tv.trangThai, sanSang);
  const [chon, setChon] = useState<LuaChonTrangThai | null>(null);
  const [giaChot, setGiaChot] = useState("");
  const [ngayBan, setNgayBan] = useState(homNay());
  const [lyDo, setLyDo] = useState<WithdrawnReason | undefined>();
  const dong = () => {
    setChon(null);
    onMo(false);
  };
  const g = useGhi(hang, dong);
  const luu = () => {
    if (!chon) return;
    g.setLoi(null);
    const b = buocDoiTrangThai(hang, chon, { giaChot, ngayBan, lyDo }, sanSang);
    if (b.kind === "loi") g.setLoi(b.chu);
    else void g.chay({ kind: "ghi", lenh: b.lenh });
  };
  return (
    <NganNoi
      mo={mo}
      onMo={(v) => (v ? onMo(true) : dong())}
      tieuDe={`Đổi trạng thái · ${hang.unitNumber ?? ""}`}
      moTa="Chuyển theo luật của sàn"
      chan={
        <Button className="h-11 w-full" size="lg" disabled={!chon || g.dangGhi} onClick={luu} data-nut="luu-trang-thai">
          Lưu
        </Button>
      }
    >
      <div className="flex flex-col gap-3 px-4 pb-4" data-slot="ngan-doi-trang-thai">
        {ds.length ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Đổi sang">
            {ds.map((lc) => (
              <Button key={`${lc.to}:${lc.label ?? ""}`} type="button" size="sm" variant={chon?.to === lc.to && chon.label === lc.label ? "default" : "outline"} onClick={() => (setChon(lc), g.setLoi(null))} data-nac={lc.to}>
                {lc.chu}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nấc cuối — mở lại là hàng mới.</p>
        )}
        {chon?.to === "Closed" && canPhanKem(chon.to) ? (
          <>
            <Input inputMode="decimal" aria-label="Giá chốt" value={giaChot} onChange={(e) => setGiaChot(e.target.value)} placeholder="Giá chốt, vd 4,5 tỷ" maxLength={40} />
            <Input type="date" aria-label="Ngày bán" value={ngayBan} onChange={(e) => setNgayBan(e.target.value)} />
          </>
        ) : null}
        {chon?.to === "Withdrawn" ? (
          <Select value={lyDo ?? null} onValueChange={(v) => setLyDo((v ?? undefined) as WithdrawnReason | undefined)}>
            <SelectTrigger aria-label="Lý do ngừng">
              <SelectValue placeholder="Lý do ngừng" />
            </SelectTrigger>
            <SelectContent>
              {WITHDRAWN_REASONS.map((k) => (
                <SelectItem key={k} value={k}>
                  {WITHDRAWN_LABEL[k] ?? k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <BaoLoi chu={g.loi} />
      </div>
    </NganNoi>
  );
}

/** Huy hiệu trạng thái của hồ sơ: người được sửa hàng chạm để mở ngăn Đổi trạng thái (AC-1, AC-4). */
export function HuyHieuTrangThai({ hang, suaHang, sanSang, children }: { hang: HangSua; suaHang: boolean; sanSang: boolean; children?: React.ReactNode }) {
  const [mo, setMo] = useState(false);
  if (!suaHang) return <>{children}</>;
  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="h-auto p-0" onClick={() => setMo(true)} aria-label="Đổi trạng thái" data-nut="doi-trang-thai">
        {children}
      </Button>
      {mo ? <NganDoiTrangThai hang={hang} sanSang={sanSang} mo={mo} onMo={setMo} /> : null}
    </>
  );
}

/** Khối Giá của hồ sơ: người được sửa hàng chạm để mở ngăn Đổi giá; căn Đã bán thì nói lý do, không mở (AC-1, AC-2, AC-3). */
export function KhoiGiaSua({ hang, suaHang, khoa, children }: { hang: HangSua; suaHang: boolean; khoa: string | null; children?: React.ReactNode }) {
  const [mo, setMo] = useState(false);
  if (!suaHang) return <>{children}</>;
  if (khoa)
    return (
      <>
        {children}
        <p className="text-xs text-muted-foreground" data-trang-thai="khoa-gia">
          {khoa}
        </p>
      </>
    );
  return (
    <>
      <Button type="button" variant="ghost" className="h-auto flex-col items-start gap-2 p-0 text-left" onClick={() => setMo(true)} aria-label="Đổi giá" data-nut="doi-gia">
        {children}
        <span className="text-xs font-medium text-primary">Đổi giá</span>
      </Button>
      {mo ? <NganDoiGia hang={hang} mo={mo} onMo={setMo} /> : null}
    </>
  );
}
