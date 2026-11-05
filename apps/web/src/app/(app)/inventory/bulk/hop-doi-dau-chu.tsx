"use client";

/**
 * Đổi đầu chủ hàng loạt (hàng 89): nút trên thanh sửa hàng loạt, hộp hỏi chọn người nhận và kể đủ căn sẽ đổi (kể cả căn
 * cùng chủ nhà bị kéo theo), thông báo 10 giây có «Hoàn tác». Đổi đi thẳng máy chủ rồi bộ đồng bộ kéo lại ngay. Ghép từ
 * thành phần đã cài (Button, AlertDialog, Select, Sonner) theo hộp hỏi của sửa hàng loạt (hàng 16).
 */
import { canReassignListingAgents } from "@quy-hang/core";
import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import { layDauChuCuaSan, type DauChuCuaSan } from "@/app/(app)/today/nguon";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBoDongBo } from "@/lib/sync/react";
import type { DongBang } from "../cot";
import { chayDoi, chayHoanTac, doiDauChu, dungHop, hoanTacDoi, thongBaoDoi, trangThaiNut, xemTruoc, type XemTruoc } from "./doi-dau-chu";

const nghe = (bao: () => void) => {
  window.addEventListener("online", bao);
  window.addEventListener("offline", bao);
  return () => {
    window.removeEventListener("online", bao);
    window.removeEventListener("offline", bao);
  };
};
const useCoMang = () => useSyncExternalStore(nghe, () => navigator.onLine, () => true);

/** Nút «Đổi đầu chủ»: chỉ dựng khi luật của lõi cho phép theo vai; mất mạng thì tắt kèm lời. */
export function NutDoiDauChu({ vai, coMang, onMo, quyen = canReassignListingAgents }: { vai: readonly string[]; coMang: boolean; onMo: () => void; quyen?: (vai: readonly string[]) => boolean }) {
  if (!quyen(vai)) return null;
  const nut = trangThaiNut(coMang);
  return (
    <Button type="button" variant="outline" size="sm" disabled={nut.tat} title={nut.loi ?? undefined} onClick={onMo}>
      Đổi đầu chủ
    </Button>
  );
}

/** Ô chọn người nhận: Select nhận danh sách mục để nút chọn hiện tên đầu chủ, không hiện mã người. */
export function ChonNguoiNhan({ dauChu, nhan, onDoi }: { dauChu: readonly DauChuCuaSan[]; nhan: string | null; onDoi: (id: string | null) => void }) {
  return (
    <Select value={nhan} items={dauChu.map((d) => ({ value: d.userId, label: d.displayName }))} onValueChange={(v) => onDoi((v as string | null) ?? null)}>
      <SelectTrigger aria-label="Đầu chủ mới">
        <SelectValue placeholder="Chọn đầu chủ mới" />
      </SelectTrigger>
      <SelectContent>
        {dauChu.map((d) => (
          <SelectItem key={d.userId} value={d.userId}>
            {d.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useDoiDauChu(tich: ReadonlySet<string>, moiHang: readonly DongBang[], xong: () => void): { nut: ReactNode; hop: ReactNode } {
  const { bd, vai } = useBoDongBo();
  const coMang = useCoMang();
  const [mo, setMo] = useState(false);
  const [ban, setBan] = useState<XemTruoc | null>(null);
  const [loi, setLoi] = useState<string | null>(null);
  const [dauChu, setDauChu] = useState<DauChuCuaSan[]>([]);
  const [nhan, setNhan] = useState<string | null>(null);
  const [dangDoi, setDangDoi] = useState(false);

  const duoc = canReassignListingAgents(vai);
  const ten = useCallback((id: string) => dauChu.find((d) => d.userId === id)?.displayName ?? "Đầu chủ khác", [dauChu]);
  const maCan = useCallback(
    (id: string) => {
      const h = moiHang.find((x) => x.id === id);
      return h ? [h.buildingName, h.unitNumber].filter(Boolean).join(" ") : "Căn khác của chủ";
    },
    [moiHang],
  );

  useEffect(() => {
    if (!mo) return;
    let huy = false;
    void Promise.all([xemTruoc([...tich]), layDauChuCuaSan()]).then(([x, d]) => {
      if (huy) return;
      if (d.ok) setDauChu(d.items);
      if (x.ok) setBan(x.data);
      else setLoi(x.loi);
    });
    return () => {
      huy = true;
    };
  }, [mo, tich]);

  const hoanTac = useCallback(
    async (id: string, tenNhan: string) => {
      const r = await chayHoanTac({ hoanTac: () => hoanTacDoi(id), keo: () => bd.thuNgay(), tenNhan });
      if (!r.ok) return void toast.error(r.loi);
      toast.success(r.chu, { description: r.moTa ?? undefined });
    },
    [bd],
  );

  const doi = useCallback(async () => {
    if (!nhan) return;
    setDangDoi(true);
    const tenNhan = ten(nhan);
    const r = await chayDoi({
      doi: () => doiDauChu([...tich], nhan),
      bao: (chu, id) => {
        setMo(false);
        setNhan(null);
        xong();
        toast(chu, thongBaoDoi(id, tenNhan, hoanTac));
      },
      keo: () => bd.thuNgay(),
    });
    setDangDoi(false);
    if (!r.ok) setLoi(r.loi);
  }, [nhan, tich, xong, ten, hoanTac, bd]);

  if (!duoc) return { nut: null, hop: null };

  const hop = ban ? dungHop(ban, maCan, ten) : null;
  return {
    nut: <NutDoiDauChu vai={vai} coMang={coMang} onMo={() => (setBan(null), setLoi(null), setMo(true))} />,
    hop: (
      <AlertDialog open={mo} onOpenChange={(m) => (m || dangDoi ? null : (setMo(false), setNhan(null)))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{hop ? `Đổi đầu chủ ${hop.soCan} căn` : "Đổi đầu chủ"}</AlertDialogTitle>
            <AlertDialogDescription>
              {hop ? `Mọi căn cùng chủ nhà đi theo · ${hop.soLienHe} liên hệ chủ nhà đổi người giữ.` : loi ?? "Đang tải các căn sẽ đổi…"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ChonNguoiNhan dauChu={dauChu} nhan={nhan} onDoi={setNhan} />
          {hop ? (
            <ul className="flex max-h-60 flex-col gap-0.5 overflow-y-auto text-xs" aria-label="Căn sẽ đổi">
              {hop.dong.map((d) => (
                <li key={d.id}>
                  {d.maCan} — đang giữ: {d.cu}
                  {d.cungChu ? <span className="text-muted-foreground"> · cùng chủ nhà</span> : null}
                </li>
              ))}
            </ul>
          ) : null}
          {hop && loi ? <p className="text-xs text-destructive">{loi}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={dangDoi}>Thôi</AlertDialogCancel>
            <AlertDialogAction disabled={!hop || !nhan || dangDoi} onClick={() => void doi()}>
              Đổi đầu chủ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  };
}
