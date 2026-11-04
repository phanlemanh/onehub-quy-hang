// Trang ba lối của Đã gửi (hàng 36, ADR-0019): `?loi=trong-kho|reui|ve-moi`, `&chi=<id>` mở chi tiết. Gỡ khi chủ kho chọn
// lối (luật đợt 45), ảnh giữ ở hồ sơ.
import { EyeIcon, HeartIcon, ImageIcon, LinkIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LAN_GUI_MAU, type LanGuiMau } from "./mau";

export const dynamic = "force-dynamic";

const ChiSo = ({ l }: { l: LanGuiMau }) => (
  <span className="text-muted-foreground flex items-center gap-2 text-xs tabular-nums">
    <EyeIcon aria-hidden="true" className="size-3.5" /> {l.mo} mở
    <HeartIcon aria-hidden="true" className="size-3.5" /> {l.quanTam} quan tâm
  </span>
);

function Bia({ n }: { n: number }) {
  return (
    <Item
      variant="muted"
      className="relative aspect-square w-full overflow-hidden border-0 p-0 shadow-none"
    >
      <div className="bg-muted absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={
              i < n
                ? "bg-muted-foreground/15 relative"
                : "bg-muted-foreground/5"
            }
          >
            {i < n ? (
              <ImageIcon
                aria-hidden="true"
                className="text-muted-foreground absolute inset-0 m-auto size-4"
              />
            ) : null}
          </span>
        ))}
      </div>
    </Item>
  );
}

function TheReui({ l }: { l: LanGuiMau }) {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      <a href={`?loi=reui&chi=${l.id}`} className="relative block">
        <Bia n={l.can.length} />
        {l.tat ? (
          <div className="pointer-events-none absolute top-3 left-3">
            <Badge variant="secondary">Đã tắt</Badge>
          </div>
        ) : null}
      </a>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-foreground truncate text-sm font-semibold">
          {l.nguoiNhan}
        </h3>
        <p className="text-muted-foreground text-xs">
          {l.can.length} căn · {l.luc}
        </p>
        <ChiSo l={l} />
        <p className="text-muted-foreground text-xs">
          {l.moCuoi ? `Mở gần nhất ${l.moCuoi}` : "Chưa mở"}
        </p>
      </div>
    </article>
  );
}

function ChiTiet({ l }: { l: LanGuiMau }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <a href="?loi=reui" className="text-muted-foreground text-sm">
        ← Đã gửi
      </a>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">{l.nguoiNhan}</h1>
        <ChiSo l={l} />
      </div>
      <Separator />
      {l.can.map((c, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Item variant="outline">
            <ItemMedia variant="image">
              <div className="bg-muted relative size-14 rounded-md">
                <ImageIcon
                  aria-hidden="true"
                  className="text-muted-foreground absolute inset-0 m-auto size-4"
                />
              </div>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{c.ten}</ItemTitle>
              <ItemDescription>
                {c.gia} · {c.quanTam} quan tâm
              </ItemDescription>
              {c.doi ? (
                <div>
                  <Badge variant="secondary">{c.doi}</Badge>
                </div>
              ) : null}
            </ItemContent>
          </Item>
          {c.thay ? (
            <div className="flex flex-col gap-1 pl-4">
              <p className="text-muted-foreground text-xs font-medium">
                Gợi ý căn thay
              </p>
              {c.thay.map((t) => (
                <a key={t} href="#" className="text-primary text-sm">
                  {t} — Gửi căn này
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ))}
      {!l.tat ? (
        <Button type="button" variant="outline">
          <LinkIcon data-icon="inline-start" aria-hidden="true" />
          Tắt link
        </Button>
      ) : (
        <Badge variant="secondary">Đã tắt</Badge>
      )}
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ loi?: string; chi?: string }>;
}) {
  const { loi = "reui", chi } = await searchParams;
  if (loi === "trong-kho")
    return (
      <main>
        <div className="flex flex-col gap-2 p-4">
          {LAN_GUI_MAU.map((l) => (
            <Item key={l.id} variant="outline">
              <ItemContent>
                <ItemTitle>
                  {l.nguoiNhan}{" "}
                  {l.tat ? <Badge variant="secondary">Đã tắt</Badge> : null}
                </ItemTitle>
                <ItemDescription>
                  {l.can.length} căn · {l.luc} ·{" "}
                  {l.moCuoi ? `mở gần nhất ${l.moCuoi}` : "chưa mở"}
                </ItemDescription>
                <ChiSo l={l} />
              </ItemContent>
            </Item>
          ))}
        </div>
      </main>
    );
  if (loi === "ve-moi")
    return (
      <main>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người nhận</TableHead>
                <TableHead>Căn</TableHead>
                <TableHead>Mở</TableHead>
                <TableHead>Quan tâm</TableHead>
                <TableHead>Mở gần nhất</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {LAN_GUI_MAU.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.nguoiNhan}</TableCell>
                  <TableCell>{l.can.length}</TableCell>
                  <TableCell>{l.mo}</TableCell>
                  <TableCell>{l.quanTam}</TableCell>
                  <TableCell>{l.moCuoi ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    );
  const mot = chi ? LAN_GUI_MAU.find((l) => l.id === chi) : undefined;
  return mot ? (
    <ChiTiet l={mot} />
  ) : (
    <main className="grid grid-cols-2 gap-x-3 gap-y-6 p-4 sm:grid-cols-3">
      {LAN_GUI_MAU.map((l) => (
        <TheReui key={l.id} l={l} />
      ))}
    </main>
  );
}
