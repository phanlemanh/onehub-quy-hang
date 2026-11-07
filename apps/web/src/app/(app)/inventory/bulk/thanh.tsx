"use client";

/**
 * Sửa hàng loạt (hàng 16): ô tích ở cột «Dòng», thanh hành động trên lưới và hộp hỏi lại một lần trước khi ghi. Mỗi căn đổi
 * được một sự kiện qua kho trên máy (hàng 13); căn không đổi được không ghi và được kể tên trước. Logic thuần ở `lo.ts`,
 * `hoan-tac-lo.ts`; ghép từ thành phần đã cài (Checkbox, DropdownMenu, AlertDialog, Select, Sonner).
 */
import { createContext, memo, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { StandardStatus, WithdrawnReason } from "@quy-hang/core/listing";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDocPhienBan, useSuaHang } from "@/lib/sync/react";
import { ghiAnToan } from "../cell-edit/lenh";
import { STATUS_LABEL, WITHDRAWN_LABEL, type DongBang } from "../cot";
import { useDoiDauChu } from "./hop-doi-dau-chu";
import { chayHoanTacLo, type BanGhiLo } from "./hoan-tac-lo";
import { chayGhiLo, demLocAn, gomKetQua, hangCuaLo, LENH_DA_GOI, lenhTrangThai, moTaBatNgo, nacMenu, xetDaGoi, xetDoiTrangThai, type XetLo } from "./lo";

type Tich = { tich: ReadonlySet<string>; dangHien: readonly string[]; doi: (id: string, co: boolean) => void; chonHet: (co: boolean) => void };

const TichContext = createContext<Tich | null>(null);
export const TichProvider = TichContext.Provider;

/**
 * Ô tích của một dòng căn trong cột «Dòng». Lưới vẽ lại mọi dòng đang hiện mỗi khi khoảng cuộn đổi; memo giữ ô tích
 * (Checkbox Base UI, nặng) khỏi vẽ lại theo dòng — nó chỉ vẽ lại khi tập chọn đổi (va-bang-hang-e11-hieu-nang: thiếu memo
 * làm Bảng hàng chậm ~2 lần khi cuộn 5.000 căn).
 */
export const OTich = memo(function OTich({ id }: { id: string }) {
  const t = useContext(TichContext);
  if (!t) return null;
  return <Checkbox aria-label="Chọn dòng" checked={t.tich.has(id)} onCheckedChange={(co) => t.doi(id, !!co)} onClick={(e) => e.stopPropagation()} />;
});

/** «Chọn hết» ở đầu cột: tích mọi căn đang hiện sau lọc. */
export function OTichHet() {
  const t = useContext(TichContext);
  if (!t) return null;
  const da = t.dangHien.filter((id) => t.tich.has(id)).length;
  const het = da > 0 && da === t.dangHien.length;
  return <Checkbox aria-label="Chọn hết" checked={het} indeterminate={da > 0 && !het} onCheckedChange={(co) => t.chonHet(!!co)} />;
}

type Hoi = { loai: "trang-thai"; to: StandardStatus } | { loai: "da-goi" };

const TOI_DA_KE = 8;

export function useSuaHangLoat(moiHang: readonly DongBang[], dangHien: readonly DongBang[]) {
  // Mọi lần ghi của lô đi qua hàm bọc: lỗi bất ngờ thành thông báo, không mất lặng (va-duong-loi-hoan-tac).
  const sua = ghiAnToan(useSuaHang());
  const docPhienBan = useDocPhienBan();
  const [tich, setTich] = useState<ReadonlySet<string>>(() => new Set());
  const [hoi, setHoi] = useState<Hoi | null>(null);
  const [lyDo, setLyDo] = useState<WithdrawnReason | undefined>();
  const [dangGhi, setDangGhi] = useState(false);

  const idHien = useMemo(() => dangHien.map((h) => h.id), [dangHien]);
  const lo = useMemo(() => hangCuaLo(tich, moiHang), [tich, moiHang]);
  const an = demLocAn(tich, idHien);

  const doi = useCallback((id: string, co: boolean) => setTich((cu) => {
    const moi = new Set(cu);
    if (co) moi.add(id);
    else moi.delete(id);
    return moi;
  }), []);
  const chonHet = useCallback((co: boolean) => setTich((cu) => {
    const moi = new Set(cu);
    for (const id of idHien) if (co) moi.add(id); else moi.delete(id);
    return moi;
  }), [idHien]);
  const ctx = useMemo<Tich>(() => ({ tich, dangHien: idHien, doi, chonHet }), [tich, idHien, doi, chonHet]);

  const xet: XetLo | null = hoi ? (hoi.loai === "da-goi" ? xetDaGoi(lo) : xetDoiTrangThai(lo, hoi.to, { lyDo })) : null;

  // Căn chưa hoàn tác được tích lại trên lưới và thông báo kể mã căn, lý do; nút «Hoàn tác» bấm lại đúng căn hỏng vì kho
  // hay lỗi bất ngờ (va-duong-loi-hoan-tac — nếp ghi lô một phần của hàng 16).
  const hoanTacLo = useCallback(
    (b: BanGhiLo) => {
      const chay = async (lo: BanGhiLo): Promise<void> => {
        const tb = await chayHoanTacLo(lo, docPhienBan, sua);
        if (tb.tichLai.length) setTich((cu) => new Set([...cu, ...tb.tichLai]));
        if (tb.loai === "thanh-cong") toast.success(tb.chu);
        else if (tb.loai === "loi") toast.error(tb.chu);
        else {
          const thuLai = tb.thuLai;
          toast(tb.chu, { description: tb.moTa, duration: 10_000, action: thuLai ? { label: "Hoàn tác", onClick: () => void chay(thuLai) } : undefined });
        }
      };
      return chay(b);
    },
    [sua, docPhienBan],
  );

  const ghi = useCallback(async () => {
    if (!hoi || !xet || !xet.doiDuoc.length) return;
    setDangGhi(true);
    const lenh = hoi.loai === "da-goi" ? LENH_DA_GOI : lenhTrangThai(hoi.to, lyDo);
    const { ketQua, muc, batNgo } = await chayGhiLo(sua, xet.doiDuoc, lenh);
    const gom = gomKetQua(hoi.loai, ketQua, xet.khongDoi);
    const moTa = moTaBatNgo(batNgo) ?? undefined;
    setTich((cu) => new Set([...cu].filter((id) => !gom.boTich.includes(id))));
    setHoi(null);
    setLyDo(undefined);
    setDangGhi(false);
    if (!gom.boTich.length) toast.error(gom.thongBao, { description: moTa });
    else if (muc.length) {
      const b: BanGhiLo = { muc, daDung: false };
      toast(gom.thongBao, { description: moTa, duration: 10_000, action: { label: "Hoàn tác", onClick: () => void hoanTacLo(b) } });
    } else toast(gom.thongBao, { description: [hoi.loai === "da-goi" ? "Còn / giữ giá · không hoàn tác được" : null, moTa].filter(Boolean).join(" · ") || undefined });
  }, [hoi, xet, lyDo, sua, hoanTacLo]);

  const menu = nacMenu(lo);
  // Đổi đầu chủ (hàng 89): chỉ hiện khi lõi cho phép theo vai — quyết ở `canReassignListingAgents`, không so tên vai ở đây.
  const doiDauChu = useDoiDauChu(tich, moiHang, () => setTich(new Set()));

  const thanh: ReactNode = tich.size ? (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sửa hàng loạt">
      <span className="text-xs tabular-nums">
        <span className="text-sm font-medium">{tich.size}</span> căn đã chọn
        {an ? <span className="text-muted-foreground"> · {an} đang bị lọc ẩn</span> : null}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" />}>
          Đổi trạng thái
          <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {menu.length === 0 ? <DropdownMenuItem disabled>Không căn nào đổi được</DropdownMenuItem> : null}
          {menu.map((to) => (
            <DropdownMenuItem key={to} onClick={() => setHoi({ loai: "trang-thai", to })}>
              {STATUS_LABEL[to]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button type="button" variant="outline" size="sm" onClick={() => setHoi({ loai: "da-goi" })}>
        Đánh dấu đã gọi
      </Button>
      {doiDauChu.nut}
      <Button type="button" variant="ghost" size="sm" onClick={() => setTich(new Set())}>
        Bỏ chọn
      </Button>
    </div>
  ) : null;

  const hop: ReactNode = (
    <AlertDialog open={hoi !== null} onOpenChange={(mo) => (mo || dangGhi ? null : (setHoi(null), setLyDo(undefined)))}>
      <AlertDialogContent>
        {hoi && xet ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {hoi.loai === "da-goi" ? `Đánh dấu đã gọi ${xet.doiDuoc.length} căn` : `Đổi ${xet.doiDuoc.length} căn sang ${STATUS_LABEL[hoi.to]}`}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {hoi.loai === "da-goi" ? "Còn / giữ giá — tính là vừa xác nhận với chủ nhà · không hoàn tác được." : "Mỗi căn một lần sửa, tính là vừa xác nhận với chủ nhà."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {hoi.loai === "trang-thai" && hoi.to === "Withdrawn" ? (
              <Select value={lyDo ?? null} onValueChange={(v) => setLyDo((v ?? undefined) as WithdrawnReason | undefined)}>
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
            {xet.khongDoi.length ? (
              <div className="flex flex-col gap-1 text-xs">
                <p className="font-medium">{xet.khongDoi.length} căn không đổi được</p>
                <ul className="text-muted-foreground flex flex-col gap-0.5">
                  {xet.khongDoi.slice(0, TOI_DA_KE).map((k) => (
                    <li key={k.id}>
                      {k.maCan} — {k.lyDo}
                    </li>
                  ))}
                  {xet.khongDoi.length > TOI_DA_KE ? <li>và {xet.khongDoi.length - TOI_DA_KE} căn nữa</li> : null}
                </ul>
              </div>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={dangGhi}>Thôi</AlertDialogCancel>
              <AlertDialogAction disabled={!xet.doiDuoc.length || dangGhi} onClick={() => void ghi()}>
                Đổi
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );

  return { ctx, thanh, hop: <>{hop}{doiDauChu.hop}</> };
}
