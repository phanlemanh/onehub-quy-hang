"use client";

// Trạng thái cục bộ dùng chung cho ba lối (hàng 22, ADR-0019): bấm «Còn · giữ giá», «Đã gọi», «Trả lại» thì dòng rời
// nhóm, số nhóm giảm; «Nhận» đổi nấc lead sang Đã nhận. Không mạng. Gỡ khi màn thật ra.
import { InboxIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState, type ComponentProps } from "react";

import type { Badge } from "@/components/reui/badge";
import { TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { CAN, LEAD, NHOM, type NhomId, type Viec } from "./mau";

export type NhomViec = { id: NhomId; ten: string; viec: Viec[] };

export type HangDoi = {
  nhom: NhomViec[];
  tong: number;
  /** Ghi kết quả gọi: dòng rời hàng đợi. */
  xong: (id: string) => void;
  /** Lead Đã gửi → Đã nhận; vẫn ở hàng đợi tới khi gọi. */
  nhan: (id: string) => void;
};

export function useHangDoi(): HangDoi {
  const [viec, setViec] = useState<Viec[]>(() => [...LEAD, ...CAN]);
  const xong = useCallback((id: string) => setViec((ds) => ds.filter((v) => v.id !== id)), []);
  const nhan = useCallback(
    (id: string) => setViec((ds) => ds.map((v) => (v.kind === "lead" && v.id === id ? { ...v, nac: "Đã nhận", han: "Hạn gọi còn 15 phút", quaHan: false } : v))),
    [],
  );
  const nhom = useMemo(
    () =>
      NHOM.map((n) => ({ ...n, viec: viec.filter((v) => (v.kind === "lead" ? n.id === "lead-moi" : v.nhom === n.id)) })).filter(
        (n) => n.viec.length > 0,
      ),
    [viec],
  );
  return { nhom, tong: viec.length, xong, nhan };
}

type BadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;
export const BADGE_NHOM: Record<NhomId, BadgeVariant> = {
  "lead-moi": "info-light",
  "ep-gia": "warning-light",
  "goi-lai": "destructive-light",
  "thieu-tin": "invert-light",
  "moi-doi": "primary-light",
};

export const tieuDe = (v: Viec) => (v.kind === "lead" ? `${v.toa} · ${v.can ?? "chỉ biết toà"}` : `${v.ma} · ${v.toa}`);

/** Nút kết quả gọi của một dòng — cùng bộ ở ba lối. */
export function NutViec({ v, hd, className }: { v: Viec; hd: HangDoi; className?: string }) {
  if (v.kind === "can") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
        <Button size="sm" onClick={() => hd.xong(v.id)}>
          Còn · giữ giá
        </Button>
        <Button size="sm" variant="outline">
          Đổi giá, trạng thái…
        </Button>
      </div>
    );
  }
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {v.nac === "Đã gửi" && (
        <Button size="sm" onClick={() => hd.nhan(v.id)}>
          Nhận
        </Button>
      )}
      <Button size="sm" variant={v.nac === "Đã gửi" ? "outline" : "default"} onClick={() => hd.xong(v.id)}>
        Đã gọi
      </Button>
      <Button size="sm" variant="ghost" onClick={() => hd.xong(v.id)}>
        Trả lại
      </Button>
    </div>
  );
}

export function HetViec() {
  return (
    <TrangThai
      kind="empty"
      icon={InboxIcon}
      title="Hôm nay không còn việc"
      description={
        <Button variant="outline" size="sm" className="mt-2" nativeButton={false} render={<Link href="/inventory" />}>
          Mở Bảng hàng
        </Button>
      }
    />
  );
}
