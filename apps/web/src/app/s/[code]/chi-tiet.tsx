// Chi tiết một căn của trang khách — chuyển thể `product-detail-5` (ReUI Pro): ảnh lớn, tên, thông số, hộp giá + nút chính;
// bỏ đánh giá, carousel và giỏ. Ảnh lướt ngang bằng cuộn có điểm dừng.
import type { CanRaNgoai } from "@quy-hang/core/redaction";
import { giaTin, tenCanRa, thongSoRa } from "@quy-hang/core/sharing";
import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Separator } from "@/components/ui/separator";
import { NutQuanTam } from "./quan-tam";
import { dangBan, duongAnh, NHAN_TRANG_THAI, xacNhan } from "./the-can";

export function ChiTiet({ b, code, listingId }: { b: CanRaNgoai; code: string; listingId?: string }) {
  const anh = b.photos ?? [];
  const nhan = NHAN_TRANG_THAI[b.availability ?? ""];
  const dong: [string, string | null | undefined][] = [
    ["Pháp lý", b.legalStatus],
    ["Nội thất", b.furnished],
    ["Hướng", b.directionFaces],
    ["Hiện trạng", b.occupantType],
  ];
  return (
    <div className="flex flex-col gap-4 p-4">
      <a href="?" className="text-muted-foreground text-sm">
        ← Bộ căn
      </a>
      <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto">
        {anh.length ? (
          anh.map((a) => (
            // eslint-disable-next-line @next/next/no-img-element -- byte qua route công khai theo mã link
            <img key={a.id} src={duongAnh(code, a.id)} alt={a.label} className="bg-muted aspect-[4/3] w-full shrink-0 snap-center rounded-lg object-cover" />
          ))
        ) : (
          <div className="bg-muted relative aspect-[4/3] w-full rounded-lg">
            <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-6" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {nhan ? (
          <div>
            <Badge variant="secondary">{nhan}</Badge>
          </div>
        ) : null}
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{tenCanRa(b)}</h1>
        <p className="text-muted-foreground text-sm">{thongSoRa(b)}</p>
      </div>
      <Separator />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {dong.map(([k, v]) =>
          v ? (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-foreground">{v}</dd>
            </div>
          ) : null,
        )}
      </dl>
      <Separator />
      <div className="flex flex-col gap-2">
        {b.listPrice != null ? <div className="text-2xl font-semibold tabular-nums">{giaTin(b.listPrice)}</div> : null}
        {xacNhan(b) ? <p className="text-muted-foreground text-xs">{xacNhan(b)}</p> : null}
        {dangBan(b) && listingId ? <NutQuanTam code={code} listingId={listingId} lon /> : null}
      </div>
    </div>
  );
}
