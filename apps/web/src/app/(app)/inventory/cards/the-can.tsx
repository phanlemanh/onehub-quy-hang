"use client";

/**
 * Thẻ căn của Bảng hàng trên điện thoại (hàng 32) — chuyển thể `product-card.tsx` của khối @reui/product-grid-4 (khối đích ở
 * `docs/design/vo-va-ia.md` §2): giữ ô ảnh vuông `Item` muted bên trái, cột nội dung bên phải với dòng tiêu đề + giá chung
 * đường chân chữ và hàng ba thông số `dl` trên vạch mảnh. Đổi: tiêu đề → mã căn, giá → «4,65 tỷ» kèm điều kiện phí; bỏ câu
 * chuyện; ba thông số → Diện tích · Phòng ngủ · Hướng; huy hiệu trên ảnh → «Đang giao dịch» (hay nhãn riêng của căn, hàng 46); nút tim → ô chọn khi đang chọn
 * nhiều; dải đầu chương → dòng nhóm toà (`DongNhomToa`), một lần mỗi toà.
 */
import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "cn";

import { Badge } from "@/components/reui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Item } from "@/components/ui/item";
import { nhanTruong } from "@quy-hang/core/labels";
import { CHUA_RO, chuCuaO, dinhDangGia, type DongBang } from "../cot";
import { useTuVung } from "../tu-vung";
import { taoNguonAnhBia } from "./anh-bia";
import { taoGiuLau, NGUONG_GIU_LAU, type SuKien } from "./giu-lau";
import { chonDuoc, chuTrangThaiThe } from "./the";

// Một nguồn ảnh bìa cho cả trang: mỗi căn hỏi API một lần.
const nguonAnh = typeof window === "undefined" ? null : taoNguonAnhBia();

function useAnhBia(toa: string, ma: string | null): [string | null, () => void] {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let huy = false;
    if (nguonAnh && ma) void nguonAnh.anhBia(toa, ma).then((u) => !huy && setUrl(u));
    return () => {
      huy = true;
    };
  }, [toa, ma]);
  // Ảnh không mở được (hết phiên, byte vắng): về ô ảnh trống thay vì biểu tượng ảnh vỡ của trình duyệt.
  return [url, () => setUrl(null)];
}

export function DongNhomToa({ toa, so }: { toa: string; so: number }) {
  return (
    <header className="flex items-center gap-3 pb-3 pt-5">
      <span className="text-muted-foreground font-mono text-xs tabular-nums">{so} căn</span>
      <span aria-hidden="true" className="bg-border h-px flex-1" />
      <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{toa}</h2>
    </header>
  );
}

function ThongSo({ nhan, giaTri }: { nhan: string; giaTri: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-muted-foreground truncate text-xs">{nhan}</dt>
      <dd className="text-foreground truncate text-sm leading-snug font-medium">{giaTri}</dd>
    </div>
  );
}

/** Giữ lâu nối với máy trạng thái thuần; đồng hồ là một setTimeout gõ đúng ngưỡng. */
function useGiuLau(onCham: () => void, onGiuLau: () => void) {
  const may = useRef(taoGiuLau());
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);
  const xuLy = (e: SuKien) => {
    for (const r of may.current.buoc(e)) {
      if (r === "cham") onCham();
      else if (r === "giu-lau") onGiuLau();
    }
    if (e.loai !== "xuong" && e.loai !== "dong-ho" && hen.current) {
      clearTimeout(hen.current);
      hen.current = null;
    }
  };
  useEffect(() => () => void (hen.current && clearTimeout(hen.current)), []);
  return {
    onPointerDown: (e: PointerEvent) => {
      if (e.button !== 0) return;
      xuLy({ loai: "xuong", t: performance.now(), x: e.clientX, y: e.clientY });
      hen.current = setTimeout(() => xuLy({ loai: "dong-ho", t: performance.now() }), NGUONG_GIU_LAU);
    },
    onPointerMove: (e: PointerEvent) => xuLy({ loai: "dich", t: performance.now(), x: e.clientX, y: e.clientY }),
    onPointerUp: (e: PointerEvent) => xuLy({ loai: "len", t: performance.now(), x: e.clientX, y: e.clientY }),
    onPointerCancel: () => xuLy({ loai: "huy", t: performance.now() }),
    onPointerLeave: () => xuLy({ loai: "huy", t: performance.now() }),
  };
}

export function TheCan({
  d,
  dangChon,
  daChon,
  onMo,
  onTich,
  onGiuLau,
}: {
  d: DongBang;
  dangChon: boolean;
  daChon: boolean;
  onMo: (d: DongBang) => void;
  onTich: (d: DongBang) => void;
  onGiuLau: (d: DongBang) => void;
}) {
  const tv = useTuVung();
  const [anh, anhHong] = useAnhBia(d.buildingName, d.unitNumber);
  const duoc = chonDuoc(d);
  const cham = () => (dangChon ? onTich(d) : onMo(d));
  const giu = useGiuLau(cham, () => onGiuLau(d));
  const phim = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cham();
    }
  };
  const ma = d.unitNumber ?? "Chưa có mã căn";

  return (
    <article
      data-the-can={d.id}
      role="button"
      tabIndex={0}
      aria-pressed={dangChon ? daChon : undefined}
      aria-label={`${ma} · ${d.buildingName}`}
      onKeyDown={phim}
      onContextMenu={(e) => e.preventDefault()}
      {...giu}
      className="group/card focus-visible:ring-ring/50 flex min-w-0 cursor-pointer items-start gap-4 rounded-lg py-2 outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-3"
    >
      <Item variant="muted" className="relative aspect-square w-28 shrink-0 overflow-hidden border-0 p-0 shadow-none">
        {anh ? (
          // eslint-disable-next-line @next/next/no-img-element -- byte qua API có kiểm quyền, không qua bộ tối ưu ảnh của Next
          <img src={anh} alt={`Ảnh căn ${ma}`} draggable={false} loading="lazy" onError={anhHong} className="absolute inset-0 size-full object-cover" />
        ) : (
          <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-6" />
        )}
        {d.standardStatus === "Pending" ? (
          <div className="absolute top-2 left-2">
            <Badge variant="info-light" radius="full">
              {chuTrangThaiThe(d, tv)}
            </Badge>
          </div>
        ) : null}
        {dangChon ? (
          <div className="absolute top-2 right-2">
            <Checkbox
              checked={daChon}
              disabled={!duoc}
              aria-label={duoc ? `Chọn ${ma}` : `${ma} đang giao dịch — không chọn được`}
              tabIndex={-1}
              className="bg-background pointer-events-none"
            />
          </div>
        ) : null}
      </Item>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <h3 className={cn("text-foreground min-w-0 truncate text-lg leading-snug font-medium tracking-tight", !d.unitNumber && "text-muted-foreground")}>{ma}</h3>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-foreground text-base font-semibold tabular-nums">{dinhDangGia(d.listPrice)}</span>
            {d.feeInclusion ? <span className="text-muted-foreground text-xs">{chuCuaO(d, "feeInclusion", tv)}</span> : null}
          </div>
        </div>
        <dl className="border-border/60 grid grid-cols-3 gap-x-3 gap-y-2 border-t pt-3">
          <ThongSo nhan={nhanTruong(tv, "livingArea", "Diện tích")} giaTri={chuCuaO(d, "livingArea")} />
          <ThongSo nhan="Phòng ngủ" giaTri={d.unitType === CHUA_RO ? "—" : d.unitType} />
          <ThongSo nhan={nhanTruong(tv, "directionFaces", "Hướng")} giaTri={chuCuaO(d, "directionFaces")} />
        </dl>
      </div>
    </article>
  );
}
