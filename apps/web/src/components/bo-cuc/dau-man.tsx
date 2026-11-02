"use client";

import { ArrowLeftIcon, EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { FrameDescription, FrameHeader, FrameTitle } from "@/components/reui/frame";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { chiaNut } from "./ma-tran";

// Đầu màn của hệ bố cục (ADR-0024 §3): đường dẫn khi màn sâu hơn một tầng · tiêu đề và một dòng · một nút chính, tối
// đa hai nút phụ, còn lại vào «…». ReUI không có khối đầu trang riêng — ghép FrameHeader + breadcrumb + button +
// dropdown-menu (dòng «Chỗ hở» ở vo-va-ia.md §3).

export type NutDauMan = { nhan: string; href?: string; onClick?: () => void; icon?: ReactNode };
export type DuongDan = { nhan: string; href?: string };

export function DauMan({
  tieuDe,
  moTa,
  duongDan = [],
  loiVe,
  nut = [],
  phu,
}: {
  tieuDe: ReactNode;
  moTa?: ReactNode;
  /** Các tầng từ nhà tới màn này, gồm cả màn này ở cuối. Hiện khi sâu hơn một tầng. */
  duongDan?: DuongDan[];
  /** Lối về của màn toàn màn (Hồ sơ hai cột). */
  loiVe?: DuongDan;
  nut?: NutDauMan[];
  /** Chỗ cho chọn kỳ, bước đang ở, nhãn trạng thái — thứ đứng cạnh tiêu đề. */
  phu?: ReactNode;
}) {
  const { chinh, phu: nutPhu, them } = chiaNut(nut);
  return (
    <FrameHeader data-vung="dau-man" className="flex flex-row flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        {loiVe && (
          <Button variant="ghost" size="sm" className="-ml-2 self-start" nativeButton={false} render={<Link href={loiVe.href ?? "/"} />}>
            <ArrowLeftIcon aria-hidden="true" />
            {loiVe.nhan}
          </Button>
        )}
        {duongDan.length > 1 && (
          <Breadcrumb>
            <BreadcrumbList>
              {duongDan.map((t, i) => (
                <Fragment key={`${t.nhan}-${i}`}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {i < duongDan.length - 1 && t.href ? (
                      <BreadcrumbLink render={<Link href={t.href} />}>{t.nhan}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{t.nhan}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <FrameTitle>{tieuDe}</FrameTitle>
          {phu}
        </div>
        {moTa && <FrameDescription>{moTa}</FrameDescription>}
      </div>
      {chinh && (
        <div className="flex shrink-0 items-center gap-2">
          {them.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Thêm việc" />}>
                <EllipsisIcon aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {them.map((n) => (
                  <DropdownMenuItem key={n.nhan} onClick={n.onClick} render={n.href ? <Link href={n.href} /> : undefined}>
                    {n.icon}
                    {n.nhan}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {nutPhu.map((n) => (
            <NutMot key={n.nhan} n={n} variant="outline" />
          ))}
          <NutMot n={chinh} variant="default" />
        </div>
      )}
    </FrameHeader>
  );
}

function NutMot({ n, variant }: { n: NutDauMan; variant: "default" | "outline" }) {
  if (n.href)
    return (
      <Button variant={variant} size="sm" nativeButton={false} render={<Link href={n.href} />}>
        {n.icon}
        {n.nhan}
      </Button>
    );
  return (
    <Button variant={variant} size="sm" onClick={n.onClick}>
      {n.icon}
      {n.nhan}
    </Button>
  );
}
