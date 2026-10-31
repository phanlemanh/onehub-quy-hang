"use client";

// Bảng Cần xem (hàng 13, AC-6, AC-7): mỗi căn đụng nhau, đã cọc/đã bán hay bị từ chối, kèm lối do người chọn.
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useBoDongBo, useCanXem } from "@/lib/sync/react";
import type { NeedsReview } from "@/lib/sync/types";

const tien = (v: unknown) => (typeof v === "number" ? `${(v / 1_000_000).toLocaleString("vi-VN")} triệu` : "—");
const gio = (iso: string) => new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

function giaTriCuaToi(r: NeedsReview) {
  return r.mine
    .map((o) => (o.type === "price_changed" ? `giá ${tien(o.payload.listPrice)}` : o.type === "status_changed" ? `trạng thái ${String(o.payload.to)}` : JSON.stringify(o.payload)))
    .join(" · ");
}

function MotCan({ r }: { r: NeedsReview }) {
  const { bd } = useBoDongBo();
  const can = r.server?.value ?? bd.danhSach().find((l) => l.id === r.listingId);
  return (
    <div className="flex flex-col gap-2 border-b py-3 last:border-b-0">
      <p className="text-sm font-medium">
        {can ? `${can.buildingName} · ${can.unitNumber ?? "—"}` : "Căn không còn trên máy"}
      </p>
      {r.kind === "da-coc" && <p className="text-sm text-destructive">Căn đã cọc</p>}
      {r.kind === "da-ban" && <p className="text-sm text-destructive">Căn đã bán</p>}
      {r.server && (
        <p className="text-sm text-muted-foreground">
          Bản mới: giá {tien(r.server.value.listPrice)} · trạng thái {r.server.value.standardStatus} — người khác sửa lúc {gio(r.server.at)}
        </p>
      )}
      <p className="text-sm">Của tôi: {giaTriCuaToi(r)}</p>
      {r.reason && <p className="text-sm text-muted-foreground">Lý do: {r.reason}</p>}
      <div className="flex gap-2">
        {r.kind === "tu-choi" ? (
          <>
            {r.reason !== "căn không còn đọc được" && (
              <Button size="sm" variant="outline" onClick={() => void bd.suaLai(r.listingId)}>
                Sửa lại
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => void bd.boThayDoi(r.listingId)}>
              Bỏ thay đổi
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={() => void bd.giuCuaToi(r.listingId)}>
              Giữ của tôi
            </Button>
            <Button size="sm" variant="outline" onClick={() => void bd.layBanMoi(r.listingId)}>
              Lấy bản mới
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function BangCanXem() {
  const { canXemMo, moCanXem } = useBoDongBo();
  const ds = useCanXem();
  return (
    <Sheet open={canXemMo && ds.length > 0} onOpenChange={moCanXem}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Căn cần xem</SheetTitle>
          <SheetDescription>Thay đổi của bạn chưa lên vì có người sửa trước hay máy chủ không nhận. Chọn lối cho từng căn.</SheetDescription>
        </SheetHeader>
        <div className="px-4">
          {ds.map((r) => (
            <MotCan key={r.listingId} r={r} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
