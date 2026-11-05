// Thẻ một căn của trang khách — chuyển thể `wishlist-3` (ReUI Pro): ảnh vuông + huy hiệu trạng thái, tên căn theo người
// nhận, thông số, giá, «Giá xác nhận …», nút chính «Quan tâm» thay nút giỏ. Chỉ nhận bản ra `CanRaNgoai` (bất biến 4).
import { nhanGiaTri, type TuVung } from "@quy-hang/core/labels";
import type { CanRaNgoai } from "@quy-hang/core/redaction";
import { giaTin, tenCanRa, thongSoRa } from "@quy-hang/core/sharing";
import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Item } from "@/components/ui/item";
import { NutQuanTam } from "./quan-tam";

/** Nhãn trạng thái khách thấy (Hỏi-4); căn đang bán không mang nhãn. */
export const NHAN_TRANG_THAI: Readonly<Record<string, string>> = { under_contract: "Đã có người đặt cọc", paused: "Tạm ngưng", unavailable: "Không còn" };
const PHI: Readonly<Record<string, string>> = { included: "Bao phí", excluded: "Không bao phí" };

export const dangBan = (b: CanRaNgoai) => b.availability === "available";
export const xacNhan = (b: CanRaNgoai) =>
  b.confirmedAgeDays == null ? null : `Giá xác nhận ${b.confirmedAgeDays === 0 ? "hôm nay" : `${b.confirmedAgeDays} ngày trước`}`;
/** Chữ điều kiện phí của căn: tên riêng của sàn gửi (hàng 45), vắng thì chữ dựng sẵn. */
export const chuPhi = (b: CanRaNgoai, tv?: TuVung | null) => (b.feeInclusion ? nhanGiaTri(tv, "feeInclusion", b.feeInclusion, PHI[b.feeInclusion] ?? b.feeInclusion) : null);
export const duongAnh = (code: string, id: string) => `/api/v1/public/shares/${code}/photos/${id}`;

/** `id` căn của trang lấy từ vị trí trong Lần gửi — trang không có mã hàng; nút Quan tâm cần mã hàng nên route trả nó riêng. */
export function TheCan({ b, i, code, listingId, tv }: { b: CanRaNgoai; i: number; code: string; listingId?: string; tv?: TuVung | null }) {
  const bia = b.photos?.[0];
  const nhan = NHAN_TRANG_THAI[b.availability ?? ""];
  const mo = !dangBan(b);
  return (
    <article className="flex h-full min-w-0 flex-col gap-2.5" data-trang-thai={b.availability} data-mo={mo ? "" : undefined}>
      <Item variant="muted" className="relative aspect-square w-full overflow-hidden border-0 p-0 shadow-none">
        <a href={`?can=${i}`} aria-label={`Xem ${tenCanRa(b)}`} className={`absolute inset-0 block ${mo ? "opacity-50" : ""}`}>
          {bia ? (
            // eslint-disable-next-line @next/next/no-img-element -- byte qua route công khai theo mã link, không qua bộ tối ưu ảnh
            <img src={duongAnh(code, bia.id)} alt={bia.label} loading={i < 2 ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover" />
          ) : (
            <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-6" />
          )}
        </a>
        {nhan ? (
          <div className="pointer-events-none absolute top-3 left-3 z-10">
            <Badge variant="secondary">{nhan}</Badge>
          </div>
        ) : null}
      </Item>
      <div className={`flex min-w-0 flex-col gap-1 ${mo ? "text-muted-foreground" : ""}`}>
        <h3 className="text-foreground truncate text-sm leading-tight font-semibold">{tenCanRa(b)}</h3>
        <p className="text-muted-foreground truncate text-xs">{thongSoRa(b)}</p>
        {b.listPrice != null ? (
          <div className="mt-0.5 flex items-baseline gap-2">
            <span className={`text-base font-semibold tabular-nums ${mo ? "text-muted-foreground" : "text-foreground"}`}>{giaTin(b.listPrice)}</span>
            {b.feeInclusion ? <span className="text-muted-foreground text-xs">{chuPhi(b, tv)}</span> : null}
          </div>
        ) : null}
        {xacNhan(b) ? <p className="text-muted-foreground truncate text-xs">{xacNhan(b)}</p> : null}
      </div>
      {dangBan(b) && listingId ? <NutQuanTam code={code} listingId={listingId} /> : null}
    </article>
  );
}
