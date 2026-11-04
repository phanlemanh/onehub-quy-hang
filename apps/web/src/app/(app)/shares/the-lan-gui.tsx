// Thẻ một Lần gửi — chuyển thể `wishlist-4` (ReUI Pro): bìa ghép bốn ảnh căn, huy hiệu «Đã tắt», người nhận, số căn · giờ gửi,
// lượt mở · quan tâm, giờ mở gần nhất; bỏ nút chia sẻ, xoá của khối. Link một căn thì bìa một ảnh đầy (design-pass).
import { EyeIcon, HeartIcon, ImageIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import { Item } from "@/components/ui/item";
import { ANH, thoiGian, type LanGuiTom } from "./da-gui";

function Bia({ anh }: { anh: string[] }) {
  if (anh.length <= 1)
    return (
      <span className="bg-muted absolute inset-0">
        {anh[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- ảnh căn qua API có kiểm quyền
          <img
            src={ANH(anh[0])}
            alt=""
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageIcon
            aria-hidden="true"
            className="text-muted-foreground absolute inset-0 m-auto size-5"
          />
        )}
      </span>
    );
  return (
    <div className="bg-muted absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
      {[0, 1, 2, 3].map((i) =>
        anh[i] ? (
          <span key={i} className="bg-muted relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh căn qua API có kiểm quyền */}
            <img
              src={ANH(anh[i])}
              alt=""
              className="absolute inset-0 size-full object-cover"
              loading="lazy"
            />
          </span>
        ) : (
          <span key={i} aria-hidden="true" className="bg-muted-foreground/5" />
        ),
      )}
    </div>
  );
}

export function TheLanGui({
  l,
  onMo,
}: {
  l: LanGuiTom;
  onMo?: (id: string) => void;
}) {
  return (
    <article className="flex min-w-0 flex-col gap-3" data-lan-gui={l.id}>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onMo?.(l.id)}
        aria-label={`Xem link gửi ${l.recipient}`}
        className="relative block h-auto w-full p-0"
      >
        <Item
          variant="muted"
          className="relative aspect-square w-full overflow-hidden border-0 p-0 shadow-none"
        >
          <Bia anh={l.covers} />
        </Item>
        {l.disabledAt ? (
          <div className="pointer-events-none absolute top-3 left-3">
            <Badge variant="secondary">Đã tắt</Badge>
          </div>
        ) : null}
      </Button>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-foreground truncate text-sm font-semibold">
          {l.recipient}
        </h3>
        <p className="text-muted-foreground text-xs">
          {l.listingCount} căn · {thoiGian(l.createdAt)}
        </p>
        <p className="text-muted-foreground flex items-center gap-2 text-xs tabular-nums">
          <EyeIcon aria-hidden="true" className="size-3.5" /> {l.opens} mở
          <HeartIcon aria-hidden="true" className="size-3.5" /> {l.interests}{" "}
          quan tâm
        </p>
        <p className="text-muted-foreground text-xs">
          {l.lastOpenedAt
            ? `Mở gần nhất ${thoiGian(l.lastOpenedAt)}`
            : "Chưa mở"}
        </p>
      </div>
    </article>
  );
}
