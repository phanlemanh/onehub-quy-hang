"use client";

import { ChevronLeftIcon, EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

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

// Đầu màn của hệ bố cục (ADR-0024 §3): dải ngoài khung, trên các khối của thân — như Verve CRM (ghép bậc 6: ReUI không có
// khối đầu trang). Đường dẫn luôn có (nhà › màn; chủ kho 02/11 «Luôn có breakcrumb»), điện thoại chỉ còn mục cha làm lối
// về · tiêu đề và một dòng (bỏ khi khối của thân đã mang tiêu đề, như Tràn) · một nút chính, tối đa hai nút phụ, còn lại vào «…». ReUI không có khối đầu trang riêng — ghép FrameHeader + breadcrumb + button +
// dropdown-menu (dòng «Chỗ hở» ở vo-va-ia.md §3).

export type NutDauMan = { nhan: string; href?: string; onClick?: () => void; icon?: ReactNode };
export type DuongDan = { nhan: string; href?: string };

export function DauMan({
  tieuDe,
  moTa,
  duongDan,
  nut = [],
  phu,
}: {
  /** Bỏ khi khối của thân mang tiêu đề trong đầu khung của nó (Tràn, Danh sách – chi tiết). */
  tieuDe?: ReactNode;
  moTa?: ReactNode;
  /**
   * Các tầng từ nhà tới màn này, ít nhất nhà › màn, màn này ở cuối. Luôn hiện; mục cha là lối về (điện thoại chỉ hiện
   * mục cha). Hồ sơ toàn màn không cần lối về riêng.
   */
  duongDan: [DuongDan, DuongDan, ...DuongDan[]];
  nut?: NutDauMan[];
  /** Chỗ cho chọn kỳ, bước đang ở, nhãn trạng thái — thứ đứng cạnh tiêu đề. */
  phu?: ReactNode;
}) {
  const { chinh, phu: nutPhu, them } = chiaNut(nut);
  return (
    <header data-vung="dau-man" className="flex flex-row flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        {/* Máy tính: đủ các tầng. Điện thoại: chỉ mục cha thành lối về «‹ cha» — tiêu đề đã nói màn hiện tại. */}
        <Breadcrumb>
          <BreadcrumbList>
            {duongDan.map((t, i) => {
              const cuoi = i === duongDan.length - 1;
              const cha = i === duongDan.length - 2;
              return (
                <Fragment key={`${t.nhan}-${i}`}>
                  {i > 0 && <BreadcrumbSeparator className="max-md:hidden" />}
                  <BreadcrumbItem data-tang={cuoi ? "cuoi" : cha ? "cha" : "tren"} className={cha ? undefined : "max-md:hidden"}>
                    {!cuoi && t.href ? (
                      <BreadcrumbLink className="inline-flex items-center gap-1" render={<Link href={t.href} />}>
                        {cha && <ChevronLeftIcon aria-hidden="true" className="size-3.5 md:hidden" />}
                        {t.nhan}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{t.nhan}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        {(tieuDe || phu) && (
          <div className="flex flex-wrap items-center gap-2">
            {tieuDe && <h1 className="text-lg font-semibold tracking-tight">{tieuDe}</h1>}
            {phu}
          </div>
        )}
        {moTa && <p className="text-sm text-muted-foreground">{moTa}</p>}
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
    </header>
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
