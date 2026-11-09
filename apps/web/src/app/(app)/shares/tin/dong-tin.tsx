// Dòng tin của vùng «Đầu khách» — chuyển thể ReUI `solution-crm-5` (khối đích vo-va-ia §2 «Hôm nay, đầu khách»; chủ kho chọn
// ở Cổng Phạm vi hàng 37): đầu nhóm ngày kèm số tin, mốc thời gian dọc có biểu tượng từng loại, khung tin có tên, giờ và
// chi tiết. Bỏ lọc theo loại và theo người của khối; phần gấp mở thành chạm thẳng vì mỗi tin là một lối đi tiếp.
import { EyeIcon, HouseIcon, RefreshCwIcon, SendIcon, ChevronRightIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { ChoTai } from "@/components/bo-cuc";
import { Badge } from "@/components/reui/badge";
import { Frame, FrameHeader, FramePanel } from "@/components/reui/frame";
import { Timeline, TimelineContent, TimelineHeader, TimelineIndicator, TimelineItem, TimelineSeparator } from "@/components/reui/timeline";
import { BaoLoiVung, TrangThai } from "@/components/trang-thai";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { CHU, NHAN_TIN, chuTin, hrefTin, nhomTheoNgay, type TinDauKhach } from "./dau-khach";

export type TrangThaiVung = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; ds: TinDauKhach[] };

const BIEU_TUONG: Record<TinDauKhach["kind"], LucideIcon> = { reaction: EyeIcon, changed: RefreshCwIcon, new_match: HouseIcon };
const NHAN_MAU: Record<TinDauKhach["kind"], { variant: "success-light" | "warning-light" | "secondary"; cham: string }> = {
  reaction: { variant: "success-light", cham: "bg-success" },
  changed: { variant: "warning-light", cham: "bg-warning" },
  new_match: { variant: "secondary", cham: "bg-foreground" },
};

function MucTin({ t, step }: { t: TinDauKhach; step: number }) {
  const Icon = BIEU_TUONG[t.kind];
  const chu = chuTin(t);
  const mau = NHAN_MAU[t.kind];
  return (
    <TimelineItem step={step} className="ms-10 pb-6" data-tin={t.kind}>
      <TimelineHeader>
        {/* eslint-disable-next-line quy-hang-ui/no-layout-arbitrary -- lớp của khối ReUI solution-crm-5 chép nguyên: chiều cao vạch nối giữa hai mốc, không phải kích thước trang */}
        <TimelineSeparator className="bg-border! group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.5rem)] group-data-[orientation=vertical]/timeline:translate-y-7" />
        <Badge variant={mau.variant} className="gap-1.5">
          <span className={cn("size-1.5 shrink-0 rounded-full", mau.cham)} aria-hidden="true" />
          {NHAN_TIN[t.kind]}
        </Badge>
        <TimelineIndicator className="bg-background text-muted-foreground border-border flex size-6 items-center justify-center border group-data-[orientation=vertical]/timeline:-left-7 [&_svg]:size-3.5">
          <Icon aria-hidden="true" />
        </TimelineIndicator>
      </TimelineHeader>
      <TimelineContent className="mt-1.5">
        <Frame stacked dense spacing="sm">
          <Link href={hrefTin(t)} className="flex w-full" aria-label={`${NHAN_TIN[t.kind]}: ${chu.tieuDe}`}>
            <FrameHeader className="flex grow flex-row items-center justify-between gap-2">
              <div className="flex min-w-0 flex-col items-start gap-0.5">
                <span className="text-foreground min-w-0 truncate text-sm font-medium">{chu.tieuDe}</span>
                <span className="text-muted-foreground min-w-0 truncate text-xs">{chu.phu}</span>
              </div>
              <ChevronRightIcon className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
            </FrameHeader>
          </Link>
          <FramePanel>
            <p className="text-muted-foreground text-xs leading-5">{chu.chiTiet}</p>
          </FramePanel>
        </Frame>
      </TimelineContent>
    </TimelineItem>
  );
}

/** Bốn trạng thái của vùng (bảng ST-hndk-* của thiết kế); trống, lỗi đi qua `TrangThai`, đang tải dùng khung chờ của bố cục. */
export function DongTinDauKhach({ trang, homNay, onThuLai }: { trang: TrangThaiVung; homNay: string; onThuLai: () => void }) {
  if (trang.kieu === "dang-tai") return <ChoTai kieu="dong-tin" />;
  if (trang.kieu === "loi") return <BaoLoiVung title={CHU.loi} onThuLai={onThuLai} />;
  if (!trang.ds.length)
    return (
      <TrangThai
        kind="empty"
        icon={SendIcon}
        title={CHU.trong}
        description={CHU.trongMoTa}
        hanhDong={
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/inventory" />}>
            {CHU.guiCan}
          </Button>
        }
      />
    );
  return (
    <div className="flex flex-col gap-8">
      {nhomTheoNgay(trang.ds, homNay).map((n) => (
        <div key={n.day} data-ngay={n.day}>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{n.nhan}</h3>
            <span className="bg-border h-px grow" aria-hidden="true" />
            <span className="text-muted-foreground text-xs tabular-nums">{n.tin.length}</span>
          </div>
          <Timeline defaultValue={n.tin.length}>
            {n.tin.map((t, i) => (
              <MucTin key={`${t.kind}-${t.at}-${i}`} t={t} step={i + 1} />
            ))}
          </Timeline>
        </div>
      ))}
    </div>
  );
}
