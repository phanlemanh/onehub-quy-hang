"use client";

// Lối «Vẽ mới» (hàng 22, ADR-0019): ghép `Tabs` (một tab một hàng đợi, nhãn kèm số) + danh sách `Item` hai dòng + nút,
// trong một Frame. Tab đang mở hết việc thì chuyển sang tab đầu còn việc. Gỡ khi màn thật ra.
import { Fragment, useState } from "react";

import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BADGE_NHOM, HetViec, NutViec, tieuDe, useHangDoi } from "./hang-doi";
import { DAU_CHU, type NhomId, type Viec } from "./mau";

function DongPhu({ v }: { v: Viec }) {
  if (v.kind === "can") {
    return (
      <ItemDescription>
        <span className="text-foreground">{v.lyDo}</span> · {v.loai} · {v.gia}
      </ItemDescription>
    );
  }
  return (
    <ItemDescription>
      <span className={v.quaHan ? "text-destructive" : "text-foreground"}>{v.han}</span> · {v.nac} · {v.nhuCau} · {v.gia} · nhập{" "}
      {v.gioNhap}
    </ItemDescription>
  );
}

export function VeMoi() {
  const hd = useHangDoi();
  const [chon, setChon] = useState<NhomId>("lead-moi");
  const tab = hd.nhom.some((n) => n.id === chon) ? chon : hd.nhom[0]?.id;
  return (
    <section aria-label="Hôm nay" className="flex w-full flex-col">
      <Frame className="@container w-full">
        <FramePanel className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-foreground text-base font-medium">Hôm nay</h2>
            <span className="text-muted-foreground text-sm">
              {DAU_CHU} · {hd.tong} việc
            </span>
          </div>
          {tab === undefined ? (
            <HetViec />
          ) : (
            <Tabs value={tab} onValueChange={(v) => setChon(v as NhomId)}>
              <div className="-mx-1 overflow-x-auto px-1">
                <TabsList>
                  {hd.nhom.map((n) => (
                    <TabsTrigger key={n.id} value={n.id} className="flex-none">
                      {n.ten}
                      <Badge variant={BADGE_NHOM[n.id]}>{n.viec.length}</Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {hd.nhom.map((n) => (
                <TabsContent key={n.id} value={n.id}>
                  <ItemGroup className="gap-0!">
                    {n.viec.map((v, i) => (
                      <Fragment key={v.id}>
                        {i > 0 && <ItemSeparator />}
                        <Item role="listitem" className="px-1">
                          <ItemContent className="min-w-0">
                            <ItemTitle className="text-base">{tieuDe(v)}</ItemTitle>
                            <DongPhu v={v} />
                          </ItemContent>
                          <ItemActions className="basis-full @2xl:basis-auto">
                            <NutViec v={v} hd={hd} />
                          </ItemActions>
                        </Item>
                      </Fragment>
                    ))}
                  </ItemGroup>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </FramePanel>
      </Frame>
    </section>
  );
}
