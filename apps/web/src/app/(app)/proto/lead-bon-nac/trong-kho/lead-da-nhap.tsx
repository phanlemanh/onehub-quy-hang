"use client";

import { CornerDownRightIcon } from "lucide-react";

import { Badge } from "@/components/reui/badge";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";

import { cauPhu, tenCan, tenDauChu, trangThaiLead, type LeadMau, type Vung } from "../_chung/du-lieu-mau";
import { useLeadMau } from "../_chung/dung-lead";
import { NutThemLead, OGuiLai, ThanhBanMau, VungLoi, VungTrong } from "../_chung/vung-chung";

// Lối «Trong kho» (ADR-0019): dựng theo khuôn Frame stack của `KhungLead` (hàng 24) với thành phần đã cài — `Item` cho
// mỗi lead, `Badge` -light cho nấc kèm giờ, `Field` + `Input` cho ô sửa số. Không cài gì mới.

function DongLead({ l, guiLai }: { l: LeadMau; guiLai: (id: string) => void }) {
  const t = trangThaiLead(l);
  return (
    <Item variant="outline" size="sm" className="items-start">
      <ItemContent className="min-w-0">
        <ItemTitle>{tenCan(l)}</ItemTitle>
        <ItemDescription>
          {cauPhu(l)} · {tenDauChu(l)}
        </ItemDescription>
        {l.kieu === "tin-bo-sung" && <ItemDescription>Tin bổ sung cho hàng đang mở — không theo bốn nấc.</ItemDescription>}
        {l.guiLaiTu && (
          <ItemDescription className="flex items-center gap-1">
            <CornerDownRightIcon className="size-3.5" aria-hidden />
            Gửi lại từ {l.guiLaiTu}
          </ItemDescription>
        )}
        {l.kieu === "da-gui-lai" && <ItemDescription>Trả lại vì «{l.traLai?.lyDo}» · đã gửi lại thành {l.guiLaiThanh}</ItemDescription>}
        {l.kieu === "tra-lai" && (
          <div className="mt-1 flex flex-col gap-2">
            <ItemDescription className="text-destructive">
              {l.dauChu} trả lại: «{l.traLai?.lyDo}»
            </ItemDescription>
            <OGuiLai id={l.id} guiLai={guiLai} />
          </div>
        )}
      </ItemContent>
      <ItemActions className="flex-col items-end gap-1">
        <Badge variant={t.variant} size="lg">
          {t.chu}
        </Badge>
        <span className="text-xs text-muted-foreground tabular-nums">{t.gio}</span>
      </ItemActions>
    </Item>
  );
}

function KhungDangTai() {
  return (
    <ItemGroup aria-busy>
      {Array.from({ length: 5 }, (_, i) => (
        <Item key={i} variant="outline" size="sm">
          <ItemContent className="gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-64 max-w-full" />
          </ItemContent>
          <ItemActions className="flex-col items-end gap-1">
            <Skeleton className="h-5.5 w-16" />
            <Skeleton className="h-3 w-10" />
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}

export function LeadDaNhap({ vung: vungDau }: { vung: Vung }) {
  const { vung, leads, thuLai, guiLai } = useLeadMau(vungDau);
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <ThanhBanMau duong="/proto/lead-bon-nac/trong-kho" vung={vungDau} />
      <Frame className="w-full">
        <FrameHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <FrameTitle>Lead đã nhập</FrameTitle>
            <FrameDescription>Mới nhất trước · Đã gửi → Đã nhận → Đã gọi → Lên bảng</FrameDescription>
          </div>
          {vung === "co-du-lieu" && leads.length > 0 && <NutThemLead size="sm" />}
        </FrameHeader>
        <FramePanel>
          {vung === "dang-tai" ? (
            <KhungDangTai />
          ) : vung === "loi" ? (
            <VungLoi thuLai={thuLai} />
          ) : leads.length === 0 ? (
            <VungTrong />
          ) : (
            <ItemGroup>
              {leads.map((l) => (
                <DongLead key={l.id} l={l} guiLai={guiLai} />
              ))}
            </ItemGroup>
          )}
        </FramePanel>
      </Frame>
    </div>
  );
}
