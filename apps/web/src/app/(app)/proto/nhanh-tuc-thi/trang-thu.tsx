"use client";

// Danh sách hàng từ kho trên máy, sửa giá và trạng thái, xem lịch sử — để chấm (E4b, E8b) và đo trên thiết bị.
import { STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDanhSachHang, useHoSoHang, useSuaHang } from "@/lib/sync/react";
import type { ListingView } from "@/lib/sync/types";

function LichSu({ id }: { id: string }) {
  const h = useHoSoHang(id);
  if (!h) return null;
  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground" data-slot="lich-su">
      <span>{h.lichSu.length} sự kiện</span>
      {h.lichSu.map((e) => (
        <span key={e.seq}>
          #{e.seq} {e.type} {JSON.stringify(e.payload)}
        </span>
      ))}
    </div>
  );
}

/** Giá trị kèm theo mà lõi đòi khi đổi trạng thái — trang thử điền sẵn để đo luồng, màn thật sẽ hỏi người. */
function kemTheo(to: StandardStatus, l: ListingView): Record<string, unknown> {
  if (to === "Closed") return { to, closePrice: l.listPrice ?? 0 };
  if (to === "Withdrawn") return { to, withdrawnReason: "owner_changed_mind" };
  return { to };
}

function Dong({ l }: { l: ListingView }) {
  const sua = useSuaHang();
  const [gia, setGia] = useState("");
  const [loi, setLoi] = useState<string | null>(null);
  const [moLichSu, setMoLichSu] = useState(false);
  const ghi = async (type: "price_changed" | "status_changed", payload: Record<string, unknown>) => {
    const kq = await sua(l.id, type, payload);
    setLoi(kq.ok ? null : JSON.stringify(kq.loi));
  };
  return (
    <div className="flex flex-col gap-2 border-b py-3" data-slot="dong-hang" data-id={l.id}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-40 text-sm font-medium">
          {l.buildingName} · {l.unitNumber ?? "—"}
        </span>
        <span className="text-sm" data-slot="gia">
          {l.listPrice?.toLocaleString("vi-VN") ?? "—"}
        </span>
        <Input
          className="w-40"
          inputMode="numeric"
          placeholder="Giá mới"
          aria-label={`Giá mới của ${l.unitNumber ?? l.id}`}
          value={gia}
          onChange={(e) => setGia(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || !gia) return;
            void ghi("price_changed", { listPrice: Number(gia), feeInclusion: l.feeInclusion ?? "excluded" });
            setGia("");
          }}
        />
        <Select value={l.standardStatus} onValueChange={(v) => v && v !== l.standardStatus && void ghi("status_changed", kemTheo(v as StandardStatus, l))}>
          <SelectTrigger className="w-40" aria-label={`Trạng thái của ${l.unitNumber ?? l.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STANDARD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={() => setMoLichSu((v) => !v)}>
          Lịch sử
        </Button>
      </div>
      {loi && <p className="text-sm text-destructive">{loi}</p>}
      {moLichSu && <LichSu id={l.id} />}
    </div>
  );
}

export function TrangThu() {
  const ds = useDanhSachHang();
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-lg font-semibold">Trang thử đồng bộ</h1>
      <p className="text-sm text-muted-foreground">Đọc từ kho trên máy; sửa ghi trên máy trước rồi gửi lên. Trang thử của hàng 13, gỡ khi có Bảng hàng.</p>
      {ds.length === 0 && <p className="text-sm text-muted-foreground">Chưa có hàng trên máy.</p>}
      {ds.map((l) => (
        <Dong key={l.id} l={l} />
      ))}
    </div>
  );
}
