// Trang ba lối của trang khách (hàng 35, ADR-0019): `?loi=trong-kho|reui|ve-moi`, `&chi=<số>` mở chi tiết một căn ở lối
// ReUI. Cùng bộ mẫu đi qua luật ẩn; gỡ khỏi cây khi chủ kho chọn lối (luật đợt 45), ảnh giữ ở hồ sơ.
import type { CanRaNgoai } from "@quy-hang/core/redaction";
import { giaTin, tenCanRa, thongSoRa } from "@quy-hang/core/sharing";
import { HeartIcon, ImageIcon } from "lucide-react";

import { TrangKhach } from "@/app/(app)/shares/new/trang-khach";
import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { BO_MAU } from "./mau";

export const dynamic = "force-dynamic";

const NHAN: Readonly<Record<string, string>> = { under_contract: "Đã có người đặt cọc", paused: "Tạm ngưng", unavailable: "Không còn" };
const mo = (b: CanRaNgoai) => b.availability !== "available";
const xacNhan = (b: CanRaNgoai) =>
  b.confirmedAgeDays == null ? null : `Giá xác nhận ${b.confirmedAgeDays === 0 ? "hôm nay" : `${b.confirmedAgeDays} ngày trước`}`;
const giaRa = (b: CanRaNgoai) => (b.listPrice != null ? giaTin(b.listPrice) : null);

function DauTrang() {
  const d = BO_MAU[0];
  return (
    <header className="border-b px-4 py-3">
      <p className="text-foreground text-sm font-semibold">{d?.companyName}</p>
      <p className="text-muted-foreground text-xs">{d?.senderName} gửi bạn {BO_MAU.length} căn</p>
    </header>
  );
}

function Anh({ className }: { className: string }) {
  return (
    <div className={`bg-muted relative overflow-hidden ${className}`}>
      <ImageIcon aria-hidden="true" className="text-muted-foreground absolute inset-0 m-auto size-6" />
    </div>
  );
}

// Lối ReUI: thẻ của wishlist-3 (ảnh vuông, huy hiệu tín hiệu, dòng hiệu, tên, giá, chú thích, nút chính), bỏ giỏ.
function TheReui({ b, i }: { b: CanRaNgoai; i: number }) {
  return (
    <article className={`group/card flex h-full min-w-0 flex-col gap-2.5 ${mo(b) ? "opacity-60" : ""}`}>
      <Item variant="muted" className="relative aspect-square w-full overflow-hidden border-0 p-0 shadow-none">
        <a href={`?loi=reui&chi=${i}`} aria-label={`Xem ${tenCanRa(b)}`} className="absolute inset-0 block">
          <Anh className="absolute inset-0" />
        </a>
        {NHAN[b.availability ?? ""] ? (
          <div className="pointer-events-none absolute top-3 left-3 z-10">
            <Badge variant="secondary">{NHAN[b.availability ?? ""]}</Badge>
          </div>
        ) : null}
      </Item>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-muted-foreground truncate text-xs font-medium tracking-wider uppercase">{b.buildingName}</p>
        <h3 className="text-foreground truncate text-sm leading-tight font-semibold">{tenCanRa(b)}</h3>
        <p className="text-muted-foreground truncate text-xs">{thongSoRa(b)}</p>
        {giaRa(b) ? <div className="mt-0.5 text-base font-semibold tabular-nums">{giaRa(b)}</div> : null}
        {xacNhan(b) ? <p className="text-muted-foreground truncate text-xs">{xacNhan(b)}</p> : null}
      </div>
      {b.availability === "available" ? (
        <Button type="button" variant="outline" className="mt-auto w-full">
          <HeartIcon data-icon="inline-start" aria-hidden="true" />
          Quan tâm
        </Button>
      ) : null}
    </article>
  );
}

// Lối ReUI, chi tiết: bố cục product-detail-5 (ảnh lớn, tên, thông số, hộp giá + nút chính), bỏ đánh giá và giỏ.
function ChiTietReui({ b }: { b: CanRaNgoai }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <a href="?loi=reui" className="text-muted-foreground text-sm">← Bộ căn</a>
      <Anh className="aspect-[4/3] w-full rounded-lg" />
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{b.buildingName}</p>
        <h1 className="text-foreground text-xl font-semibold tracking-tight">{tenCanRa(b)}</h1>
        <p className="text-muted-foreground text-sm">{thongSoRa(b)}</p>
      </div>
      <Separator />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {[["Pháp lý", b.legalStatus], ["Nội thất", b.furnished], ["Hướng", b.directionFaces]].map(([k, v]) =>
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
        <div className="text-2xl font-semibold tabular-nums">{giaRa(b)}</div>
        {xacNhan(b) ? <p className="text-muted-foreground text-xs">{xacNhan(b)}</p> : null}
        <Button type="button" size="lg" className="w-full">
          <HeartIcon data-icon="inline-start" aria-hidden="true" />
          Quan tâm
        </Button>
      </div>
    </div>
  );
}

// Lối vẽ mới: danh sách dòng (Item) một cột — ảnh nhỏ, tên, giá lớn bên phải, nút Quan tâm dạng biểu tượng.
function DongVeMoi({ b }: { b: CanRaNgoai }) {
  return (
    <Item variant="outline" className={mo(b) ? "opacity-60" : ""}>
      <ItemMedia variant="image">
        <Anh className="size-16 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{tenCanRa(b)}</ItemTitle>
        <ItemDescription>{NHAN[b.availability ?? ""] ?? [thongSoRa(b), xacNhan(b)].filter(Boolean).join(" · ")}</ItemDescription>
      </ItemContent>
      <div className="flex flex-col items-end gap-1">
        {giaRa(b) ? <span className="text-base font-semibold tabular-nums">{giaRa(b)}</span> : null}
        {b.availability === "available" ? (
          <Button type="button" size="icon-sm" variant="outline" aria-label="Quan tâm">
            <HeartIcon aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </Item>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ loi?: string; chi?: string }> }) {
  const { loi = "reui", chi } = await searchParams;
  if (loi === "trong-kho")
    return (
      <main className="mx-auto max-w-md p-4">
        <TrangKhach ban={BO_MAU} nguoiNhan="khach_rieng" />
      </main>
    );
  if (loi === "ve-moi")
    return (
      <main className="mx-auto max-w-md">
        <DauTrang />
        <div className="flex flex-col gap-2 p-4">
          {BO_MAU.map((b, i) => (
            <DongVeMoi key={i} b={b} />
          ))}
        </div>
      </main>
    );
  const mot = chi != null ? BO_MAU[Number(chi)] : undefined;
  return (
    <main className="mx-auto max-w-3xl">
      <DauTrang />
      {mot ? (
        <ChiTietReui b={mot} />
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 p-4 sm:grid-cols-3">
          {BO_MAU.map((b, i) => (
            <TheReui key={i} b={b} i={i} />
          ))}
        </div>
      )}
    </main>
  );
}
