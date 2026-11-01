"use client";

import { CornerDownRightIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

import { BON_NAC, cauPhu, nacHienTai, tenCan, tenDauChu, trangThaiLead, type LeadMau, type Nac, type Vung } from "../_chung/du-lieu-mau";
import { useLeadMau } from "../_chung/dung-lead";
import { NutThemLead, OGuiLai, ThanhBanMau, VungLoi, VungTrong } from "../_chung/vung-chung";

// Lối «Vẽ mới» (ADR-0019): ghép từ thành phần — bốn cột theo nấc trên máy tính, xếp chồng trên điện thoại. Lead bị trả
// lại nổi lên dải «Cần bạn làm» trên đầu; tin bổ sung và lead đã gửi lại ở dải «Ngoài bốn nấc» dưới cùng. Trục: nấc,
// không phải thời gian — trong mỗi cột vẫn mới nhất trước.

function TheLead({ l }: { l: LeadMau }) {
  const t = trangThaiLead(l);
  return (
    <Item variant="outline" size="xs" className="items-start bg-background">
      <ItemContent className="min-w-0 gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <ItemTitle className="line-clamp-2">{tenCan(l)}</ItemTitle>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{t.gio}</span>
        </div>
        <ItemDescription className="text-xs">{cauPhu(l)}</ItemDescription>
        {l.dauChu ? (
          <ItemDescription className="text-xs">{tenDauChu(l)}</ItemDescription>
        ) : (
          <div>
            <Badge variant="warning-light">Đang chờ chia</Badge>
          </div>
        )}
        {l.guiLaiTu && (
          <ItemDescription className="flex items-center gap-1 text-xs">
            <CornerDownRightIcon className="size-3" aria-hidden />
            Gửi lại từ {l.guiLaiTu}
          </ItemDescription>
        )}
      </ItemContent>
    </Item>
  );
}

function CotNac({ ma, nhan, leads }: { ma: Nac; nhan: string; leads: LeadMau[] }) {
  const o = leads.filter((l) => nacHienTai(l) === ma);
  return (
    <section aria-label={nhan} className="flex min-w-0 flex-col gap-2 rounded-lg bg-muted/50 p-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-medium">{nhan}</h3>
        <span className="text-xs text-muted-foreground tabular-nums">{o.length}</span>
      </div>
      {o.length === 0 ? <p className="px-1 pb-1 text-xs text-muted-foreground">Chưa có lead ở nấc này.</p> : o.map((l) => <TheLead key={l.id} l={l} />)}
    </section>
  );
}

function KhungDangTai() {
  return (
    <div aria-busy className="grid gap-3 md:grid-cols-4">
      {BON_NAC.map((n) => (
        <div key={n.ma} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2">
          <Skeleton className="mx-1 h-4 w-16" />
          {[0, 1].map((i) => (
            <div key={i} className="flex flex-col gap-1.5 rounded-lg border bg-background p-2.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36 max-w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function LeadDaNhap({ vung: vungDau }: { vung: Vung }) {
  const { vung, leads, thuLai, guiLai } = useLeadMau(vungDau);
  const bonNac = leads.filter((l) => l.kieu === "bon-nac");
  const traLai = leads.filter((l) => l.kieu === "tra-lai");
  const ngoai = leads.filter((l) => l.kieu === "tin-bo-sung" || l.kieu === "da-gui-lai");
  const coDuLieu = vung === "co-du-lieu" && leads.length > 0;
  return (
    <div className="flex w-full flex-col gap-3">
      <ThanhBanMau duong="/proto/lead-bon-nac/ve-moi" vung={vungDau} />
      <Frame className="w-full">
        <FrameHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <FrameTitle>Lead đã nhập</FrameTitle>
            <FrameDescription>Theo nấc · mới nhất trước trong mỗi cột</FrameDescription>
          </div>
          {coDuLieu && <NutThemLead size="sm" />}
        </FrameHeader>

        {coDuLieu && traLai.length > 0 && (
          <FramePanel className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Cần bạn làm · {traLai.length}</h3>
            {traLai.map((l) => (
              <div key={l.id} className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{tenCan(l)}</span>
                    <Badge variant="destructive-light">Bị trả lại · {l.traLai?.luc}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cauPhu(l)} · {l.dauChu} trả lại: «{l.traLai?.lyDo}»
                  </p>
                </div>
                <OGuiLai id={l.id} guiLai={guiLai} />
              </div>
            ))}
          </FramePanel>
        )}

        <FramePanel>
          {vung === "dang-tai" ? (
            <KhungDangTai />
          ) : vung === "loi" ? (
            <VungLoi thuLai={thuLai} />
          ) : leads.length === 0 ? (
            <VungTrong />
          ) : (
            <div className="grid gap-3 md:grid-cols-4">
              {BON_NAC.map((n) => (
                <CotNac key={n.ma} ma={n.ma} nhan={n.nhan} leads={bonNac} />
              ))}
            </div>
          )}
        </FramePanel>

        {coDuLieu && ngoai.length > 0 && (
          <FramePanel className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Ngoài bốn nấc · {ngoai.length}</h3>
            {ngoai.map((l) => {
              const t = trangThaiLead(l);
              return (
                <div key={l.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <Badge variant={t.variant}>{t.chu}</Badge>
                  <span className="font-medium">{tenCan(l)}</span>
                  <span className="text-muted-foreground">
                    {l.kieu === "tin-bo-sung"
                      ? `Tin bổ sung cho hàng đang mở · ${tenDauChu(l)} · ${t.gio}`
                      : `Trả lại vì «${l.traLai?.lyDo}» · đã gửi lại thành ${l.guiLaiThanh}`}
                  </span>
                </div>
              );
            })}
          </FramePanel>
        )}
      </Frame>
    </div>
  );
}
