// Chi tiết một Lần gửi: mỗi căn theo thứ tự gửi — lượt quan tâm, nhãn «Vừa đổi», «Gợi ý căn thay» (dòng `Item` mở luồng Gửi).
import { giaTin } from "@quy-hang/core/sharing";
import { HeartIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { hrefCanThay, nhanVuaDoi, type CanTrongLink } from "./da-gui";

export function DongCan({ c }: { c: CanTrongLink }) {
  const nhan = nhanVuaDoi(c.changed);
  return (
    <div className="flex flex-col gap-2" data-can={c.id}>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{c.name}</ItemTitle>
          <ItemDescription className="flex items-center gap-2">
            {c.listPrice != null ? giaTin(c.listPrice) : "Giá liên hệ"} ·{" "}
            <HeartIcon aria-hidden="true" className="size-3.5" /> {c.interest}{" "}
            quan tâm
          </ItemDescription>
          {nhan ? (
            <div>
              <Badge variant="secondary">{nhan}</Badge>
            </div>
          ) : null}
        </ItemContent>
      </Item>
      {c.suggestions.length ? (
        <div className="flex flex-col gap-1 pl-4">
          <p className="text-muted-foreground text-xs font-medium">
            Gợi ý căn thay
          </p>
          {c.suggestions.map((g) => (
            <Item
              key={g.id}
              variant="muted"
              size="sm"
              render={<a href={hrefCanThay(g.id)} />}
            >
              <ItemContent>
                <ItemTitle>{g.name}</ItemTitle>
                <ItemDescription>
                  {g.listPrice != null ? giaTin(g.listPrice) : "Giá liên hệ"} ·
                  Gửi căn này
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
      ) : null}
    </div>
  );
}
