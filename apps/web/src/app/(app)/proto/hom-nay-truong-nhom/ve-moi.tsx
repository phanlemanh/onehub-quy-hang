"use client";

// Lối «Vẽ mới» (hàng 42, ADR-0019): ghép tự do, không theo khối nào — mỗi vùng một Frame xếp chồng (đầu khung có tiêu đề,
// nội dung bằng Item, Badge, Progress đã cài). Ba ô số thành một dải chữ, hàng đợi là danh sách dòng, bảng theo người là
// danh sách có thanh tỉ lệ. Gỡ khi màn thật ra.
import { Fragment } from "react";

import { Badge } from "@/components/reui/badge";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { GiaoLai, useTruongNhom } from "./chung";
import { BADGE_LOAI, CHU_PHAM_VI, CHUA_CO_NGUOI, chuQuaHan, NHAN_LOAI, tenDauChu } from "./mau";

export function VeMoi() {
  const tn = useTruongNhom();
  const oSo = [
    { nhan: "Lead quá hạn", so: tn.so.leadQuaHan, phu: "quá hạn nhận hay gọi", mau: "text-destructive" },
    { nhan: "Ngoại lệ", so: tn.so.ngoaiLe, phu: "chưa chia được", mau: "text-warning" },
    { nhan: "Hàng cũ", so: tn.so.hangCu, phu: "căn cần gọi lại", mau: "text-foreground" },
  ];
  const nguoi = [
    ...tn.dauChu.map((d) => ({ id: d.id, ten: d.ten, nghi: d.nghi, canMo: d.canMo, canGoiLai: d.canGoiLai, tuoi: d.tuoi })),
    { id: "chua-co", ten: "Chưa có người giữ", nghi: false, ...CHUA_CO_NGUOI },
  ];
  return (
    <section aria-label="Hôm nay của trưởng nhóm" className="flex w-full flex-col gap-4">
      <Frame>
        <FrameHeader>
          <FrameTitle>Hôm nay của nhóm</FrameTitle>
        </FrameHeader>
        <FramePanel className="grid gap-4 sm:grid-cols-3">
          {oSo.map((o) => (
            <div key={o.nhan} className="flex flex-col gap-1">
              <span className="text-muted-foreground text-sm">{o.nhan}</span>
              <span className={`text-3xl font-semibold tabular-nums ${o.mau}`}>{o.so}</span>
              <span className="text-muted-foreground text-xs">{o.phu}</span>
            </div>
          ))}
        </FramePanel>
      </Frame>

      <Frame>
        <FrameHeader>
          <FrameTitle>Cần giao lại</FrameTitle>
          <FrameDescription>Lead quá hạn và lead chưa chia được, lâu nhất trước</FrameDescription>
        </FrameHeader>
        <FramePanel className="p-0!">
          {tn.hangDoi.length === 0 ? (
            <p className="text-muted-foreground p-4 text-sm">Không lead nào quá hạn</p>
          ) : (
            <ItemGroup className="gap-0!">
              {tn.hangDoi.map((d, i) => (
                <Fragment key={d.id}>
                  {i > 0 && <ItemSeparator />}
                  <Item size="sm" role="listitem" className="px-4">
                    <ItemContent className="min-w-0">
                      <ItemTitle className="flex flex-wrap items-center gap-2">
                        {d.toa} · {d.can ?? "chỉ biết toà"}
                        <Badge variant={BADGE_LOAI[d.loai]}>{NHAN_LOAI[d.loai]}</Badge>
                      </ItemTitle>
                      <ItemDescription>
                        {tenDauChu(tn.dauChu, d.dauChu)} · <span className="text-destructive">quá hạn {chuQuaHan(d.phut)}</span>
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <GiaoLai dong={d} tn={tn} />
                    </ItemActions>
                  </Item>
                </Fragment>
              ))}
            </ItemGroup>
          )}
        </FramePanel>
      </Frame>

      <Frame>
        <FrameHeader>
          <FrameTitle>Hàng theo đầu chủ</FrameTitle>
          <FrameDescription>Căn đang mở · cần gọi lại · tỉ lệ tươi</FrameDescription>
        </FrameHeader>
        <FramePanel className="p-0!">
          <ItemGroup className="gap-0!">
            {nguoi.map((n, i) => (
              <Fragment key={n.id}>
                {i > 0 && <ItemSeparator />}
                <Item size="sm" role="listitem" className="px-4">
                  <ItemContent className="min-w-0">
                    <ItemTitle className="flex items-center gap-2">
                      {n.ten}
                      {n.nghi && <Badge variant="warning-light">Đang nghỉ</Badge>}
                    </ItemTitle>
                    <ItemDescription>
                      {n.canMo} căn đang mở · {n.canGoiLai} cần gọi lại
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions className="basis-40">
                    <Progress value={n.tuoi} aria-label={`Tỉ lệ tươi ${n.tuoi}%`} className="w-full items-center gap-2">
                      <span className="text-sm tabular-nums">{n.tuoi}% tươi</span>
                    </Progress>
                  </ItemActions>
                </Item>
              </Fragment>
            ))}
          </ItemGroup>
        </FramePanel>
        <FrameFooter className="text-muted-foreground text-xs">{CHU_PHAM_VI}</FrameFooter>
      </Frame>
    </section>
  );
}
