"use client";

// Lối «Trong kho» (hàng 22, ADR-0019): dùng lại dáng của khuôn `KhungLeadCuaToi` (khối list-11 đã có trong kho) — một Frame
// stacked, thanh đầu «Hôm nay», mỗi hàng đợi một FramePanel có tiêu đề kèm số và các dòng kiểu Item, nút ở cuối dòng;
// khung hẹp thì nút xuống dưới dòng. Gỡ khi màn thật ra.
import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Fragment } from "react";
import { BADGE_NHOM, HetViec, NutViec, tieuDe, useHangDoi, type HangDoi } from "./hang-doi";
import { DAU_CHU, type Viec } from "./mau";

function DongViec({ v, hd }: { v: Viec; hd: HangDoi }) {
  return (
    <Item size="sm" role="listitem" className="px-3.5">
      <ItemContent className="min-w-0">
        <ItemTitle className="text-foreground text-base font-medium">{tieuDe(v)}</ItemTitle>
        {v.kind === "lead" ? (
          <>
            <ItemDescription>
              {v.nhuCau} · {v.gia} · nhập {v.gioNhap}
            </ItemDescription>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="info-light">{v.nac}</Badge>
              <span className={v.quaHan ? "text-destructive" : "text-muted-foreground"}>{v.han}</span>
            </div>
          </>
        ) : (
          <>
            <ItemDescription>
              {v.loai} · {v.gia}
            </ItemDescription>
            <div className="text-muted-foreground text-sm">{v.lyDo}</div>
          </>
        )}
      </ItemContent>
      <ItemActions className="basis-full @xl:basis-auto">
        <NutViec v={v} hd={hd} />
      </ItemActions>
    </Item>
  );
}

export function TrongKho() {
  const hd = useHangDoi();
  return (
    <section aria-label="Hôm nay" className="flex w-full flex-col">
      <Frame stacked className="@container w-full">
        <FramePanel className="flex items-center justify-between gap-2 p-3.5!">
          <h2 className="text-foreground text-base font-medium">Hôm nay</h2>
          <span className="text-muted-foreground text-sm">
            {DAU_CHU} · {hd.tong} việc
          </span>
        </FramePanel>
        {hd.nhom.length === 0 ? (
          <FramePanel>
            <HetViec />
          </FramePanel>
        ) : (
          hd.nhom.map((n) => (
            <FramePanel key={n.id} className="flex flex-col gap-1 p-0! pb-1!">
              <div className="flex items-center gap-2 px-3.5 pt-3 pb-1">
                <h3 className="text-foreground text-sm font-medium">{n.ten}</h3>
                <Badge variant={BADGE_NHOM[n.id]}>{n.viec.length}</Badge>
              </div>
              <ItemGroup className="gap-0!">
                {n.viec.map((v, i) => (
                  <Fragment key={v.id}>
                    {i > 0 && <ItemSeparator />}
                    <DongViec v={v} hd={hd} />
                  </Fragment>
                ))}
              </ItemGroup>
            </FramePanel>
          ))
        )}
      </Frame>
    </section>
  );
}
