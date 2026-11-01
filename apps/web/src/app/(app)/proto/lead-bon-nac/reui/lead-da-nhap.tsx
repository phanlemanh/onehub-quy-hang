"use client";

import { CornerDownRightIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { Badge } from "@/components/reui/badge";
import { Frame, FramePanel } from "@/components/reui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { cauPhu, tenCan, tenDauChu, trangThaiLead, type LeadMau, type Vung } from "../_chung/du-lieu-mau";
import { useLeadMau } from "../_chung/dung-lead";
import { NutThemLead, OGuiLai, ThanhBanMau, VungLoi, VungTrong } from "../_chung/vung-chung";

// Lối «ReUI» (ADR-0019): khối đích `@reui/list-11` (Top Movers) của vo-va-ia §2, chuyển thể tại chỗ dùng — giữ Frame
// stacked, thanh đầu, bảng ba cột với Badge -light. Đổi: ô tìm + ⌘K → nút «+ Lead» (bậc 1: telesales có ít lead một
// ngày, không cần tìm); logo công ty → bỏ; cột Active (mũi tên tăng giảm) → đầu chủ nhận và giờ của nấc gần nhất; thêm
// một dòng phụ dưới lead bị trả lại cho ô sửa số; khung hẹp (điện thoại) ẩn cột thứ ba, giờ và đầu chủ xuống dưới tên.

function TrangThaiBadge({ l }: { l: LeadMau }) {
  const t = trangThaiLead(l);
  return (
    <Badge variant={t.variant} size="lg">
      {t.chu}
    </Badge>
  );
}

function DongLead({ l, guiLai }: { l: LeadMau; guiLai: (id: string) => void }) {
  const t = trangThaiLead(l);
  const ghiChu =
    l.kieu === "tin-bo-sung"
      ? "Tin bổ sung cho hàng đang mở"
      : l.kieu === "da-gui-lai"
        ? `Trả lại vì «${l.traLai?.lyDo}» · đã gửi lại thành ${l.guiLaiThanh}`
        : l.guiLaiTu
          ? `Gửi lại từ ${l.guiLaiTu}`
          : null;
  return (
    <>
      <TableRow className={l.kieu === "tra-lai" ? "border-b-0" : undefined}>
        <TableCell className="px-3.5 py-3 whitespace-normal @lg:pe-16">
          <div className="min-w-0">
            <div className="text-foreground text-base font-medium">{tenCan(l)}</div>
            <div className="text-muted-foreground text-sm">{cauPhu(l)}</div>
            <div className="text-muted-foreground text-sm @md:hidden">
              {t.gio} · {tenDauChu(l)}
            </div>
            {ghiChu && (
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                {l.guiLaiTu && <CornerDownRightIcon className="size-3.5" aria-hidden />}
                {ghiChu}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="px-3.5 py-3">
          <TrangThaiBadge l={l} />
        </TableCell>
        <TableCell className="hidden px-3.5 py-3 @md:table-cell">
          <div className="text-foreground text-sm font-medium tabular-nums">{t.gio}</div>
          <div className="text-muted-foreground text-sm">{tenDauChu(l)}</div>
        </TableCell>
      </TableRow>
      {l.kieu === "tra-lai" && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={3} className="px-3.5 pt-0 pb-3 whitespace-normal">
            <div className="flex flex-col gap-2">
              <div className="text-destructive text-sm">
                {l.dauChu} trả lại: «{l.traLai?.lyDo}»
              </div>
              <OGuiLai id={l.id} guiLai={guiLai} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function BangDauBang({ children }: { children: ReactNode }) {
  return (
    <Table>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead className="text-muted-foreground ps-3.5 text-sm">Lead</TableHead>
          <TableHead className="text-muted-foreground text-sm">Nấc</TableHead>
          <TableHead className="text-muted-foreground hidden text-sm @md:table-cell">Giờ · đầu chủ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

export function LeadDaNhap({ vung: vungDau }: { vung: Vung }) {
  const { vung, leads, thuLai, guiLai } = useLeadMau(vungDau);
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <ThanhBanMau duong="/proto/lead-bon-nac/reui" vung={vungDau} />
      <Frame stacked className="@container w-full">
        <FramePanel className="flex items-center justify-between p-3.5!">
          <h2 className="text-foreground text-base font-medium">Lead đã nhập</h2>
          {leads.length > 0 && vung === "co-du-lieu" && <NutThemLead size="sm" />}
        </FramePanel>

        <FramePanel className={vung === "co-du-lieu" && leads.length > 0 ? "p-0!" : vung === "dang-tai" ? "p-0!" : undefined}>
          {vung === "dang-tai" ? (
            <BangDauBang>
              {Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i} aria-busy>
                  <TableCell className="px-3.5 py-3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-3.5 w-44" />
                  </TableCell>
                  <TableCell className="px-3.5 py-3">
                    <Skeleton className="h-5.5 w-16" />
                  </TableCell>
                  <TableCell className="hidden px-3.5 py-3 @md:table-cell">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="mt-1.5 h-3.5 w-28" />
                  </TableCell>
                </TableRow>
              ))}
            </BangDauBang>
          ) : vung === "loi" ? (
            <VungLoi thuLai={thuLai} />
          ) : leads.length === 0 ? (
            <VungTrong />
          ) : (
            <BangDauBang>
              {leads.map((l) => (
                <Fragment key={l.id}>
                  <DongLead l={l} guiLai={guiLai} />
                </Fragment>
              ))}
            </BangDauBang>
          )}
        </FramePanel>
      </Frame>
    </div>
  );
}
