"use client";

// chuyển thể dashboard-6 (ReUI Pro, hàng 42): giữ cấu trúc và lớp của MetricPanel, CoverageTable, ActionQueue và khung
// trang; chỉ đổi dữ liệu, chữ, prop. Đã bỏ: vùng biểu đồ Demand Mix (cần `recharts` và `ui/chart` chưa cài), bộ chọn
// ngày ở đầu trang (cần `date-fns`/`react-day-picker` qua `date-range-picker` chưa chép), nút Export và toast hoàn tác
// (`sonner`), trình đơn «…» của hàng đợi (xử lý hết/mở lại/ẩn đã xong — dòng giao xong rời hàng đợi), lề và nền
// `min-h-svh` của khung ngoài (vỏ app đã có). IconPlaceholder thay bằng icon lucide.
import { Fragment, type ReactNode } from "react";
import { ListChecksIcon } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/reui/badge";
import { Frame, FrameDescription, FrameFooter, FrameHeader, FramePanel, FrameTitle } from "@/components/reui/frame";
import { cn } from "cn";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemMedia } from "@/components/ui/item";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { STATUS_BADGES, type CrewMember, type MetricCard, type QueueAction } from "./data";

function getIconToneClassName(variant: BadgeProps["variant"]) {
  switch (variant) {
    case "warning-light":
      return "text-warning";
    case "info-light":
      return "text-info";
    case "destructive-light":
      return "text-destructive";
    case "success-light":
      return "text-success";
    case "primary-light":
      return "text-primary";
    default:
      return "text-muted-foreground";
  }
}

function IconTile({ children, variant, size = "default" }: { children: ReactNode; variant: BadgeProps["variant"]; size?: "default" | "sm" }) {
  return (
    <Item
      variant="outline"
      size="sm"
      aria-hidden="true"
      className={cn(
        "bg-muted/60 border-background flex shrink-0 flex-nowrap items-center justify-center border-2 p-0 shadow-xs dark:border [&_svg]:opacity-80",
        size === "sm" ? "size-9 [&_svg]:size-4" : "size-10 [&_svg]:size-4.5",
        getIconToneClassName(variant),
      )}
    >
      <ItemMedia variant="icon" className="size-auto">
        {children}
      </ItemMedia>
    </Item>
  );
}

export type Crumb = { label: string; href?: string };

function CoverageHeader({ crumbs, label }: { crumbs: Crumb[]; label: string }) {
  return (
    <header className="flex min-h-9 w-full shrink-0 items-center justify-between gap-2" aria-label={label}>
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return last ? (
              <BreadcrumbItem key={c.label} className="min-w-0">
                <BreadcrumbPage className="truncate">{c.label}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <Fragment key={c.label}>
                <BreadcrumbItem className="hidden md:inline-flex">
                  <BreadcrumbLink render={<a href={c.href ?? "#"} />}>{c.label}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:flex" />
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

function MetricPanel({ metric }: { metric: MetricCard }) {
  return (
    <FramePanel className="flex min-h-24 flex-col justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <IconTile variant={metric.variant} size="sm">
          {metric.icon}
        </IconTile>
        <span className="truncate text-sm leading-none font-medium">{metric.label}</span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="text-2xl leading-none font-semibold tracking-tight tabular-nums">{metric.value}</div>
          <div className="text-muted-foreground truncate text-xs leading-none">{metric.detail}</div>
        </div>
        <Badge variant={metric.variant} className="shrink-0">
          {metric.changeIcon}
          {metric.change}
        </Badge>
      </div>
    </FramePanel>
  );
}

export type CoverageLabels = {
  title: string;
  description: string;
  badge: string;
  member: string;
  location: string;
  coverage: string;
  relief: string;
  status: string;
  empty: string;
  footnote?: string;
};

function CoverageTable({ members, t }: { members: CrewMember[]; t: CoverageLabels }) {
  return (
    <Frame spacing="default" className="h-full">
      <FrameHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-px">
          <FrameTitle>{t.title}</FrameTitle>
          <FrameDescription>{t.description}</FrameDescription>
        </div>
        <Badge variant="info-light">{t.badge}</Badge>
      </FrameHeader>
      <FramePanel className="p-0!">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.member}</TableHead>
                <TableHead className="hidden sm:table-cell">{t.location}</TableHead>
                <TableHead>{t.coverage}</TableHead>
                <TableHead>{t.relief}</TableHead>
                <TableHead>{t.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const state = STATUS_BADGES[member.status];

                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{member.name}</div>
                          <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-xs">
                            <span className="truncate">{member.role}</span>
                            {/* Thay cột phụ dưới sm; đổi hai mốc cùng nhau. */}
                            <span aria-hidden="true" className="bg-muted-foreground/40 size-1 shrink-0 rounded-full sm:hidden" />
                            <span className="shrink-0 sm:hidden">{member.location}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">{member.location}</TableCell>
                    <TableCell>
                      <div className="flex min-w-24 flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium tabular-nums">{member.coverage}%</span>
                          <span className="text-muted-foreground hidden text-xs sm:inline">{member.notes}</span>
                        </div>
                        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                          <div className={cn("h-full rounded-full", state.barClassName)} style={{ width: `${member.coverage}%` }} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">{member.reliefHours}</TableCell>
                    <TableCell>
                      <Badge variant={state.variant}>{state.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="text-muted-foreground py-8 text-center text-sm">{t.empty}</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </FramePanel>
      {t.footnote && <FrameFooter className="text-muted-foreground text-xs">{t.footnote}</FrameFooter>}
    </Frame>
  );
}

export type QueueLabels = { title: string; description: string; emptyTitle: string; emptyDescription: string };

function ActionQueue({ items, renderCta, t }: { items: QueueAction[]; renderCta: (item: QueueAction) => ReactNode; t: QueueLabels }) {
  return (
    <Frame spacing="default" className="h-full">
      <FrameHeader className="flex-row items-center justify-between gap-3">
        <div className="flex flex-col gap-px">
          <FrameTitle>{t.title}</FrameTitle>
          <FrameDescription>{t.description}</FrameDescription>
        </div>
      </FrameHeader>
      <FramePanel className="p-0!">
        {items.length > 0 ? (
          <div className="divide-border divide-y">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-(--frame-panel-px) py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <IconTile variant={item.variant}>{item.icon}</IconTile>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-muted-foreground truncate text-xs">{item.detail}</div>
                  </div>
                </div>
                <div className="shrink-0">{renderCta(item)}</div>
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ListChecksIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>{t.emptyTitle}</EmptyTitle>
              <EmptyDescription>{t.emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </FramePanel>
    </Frame>
  );
}

export function CoverageDashboard({
  heading,
  crumbs,
  metrics,
  members,
  coverage,
  queue,
  queueItems,
  renderQueueCta,
}: {
  heading: string;
  crumbs: Crumb[];
  metrics: MetricCard[];
  members: CrewMember[];
  coverage: CoverageLabels;
  queue: QueueLabels;
  queueItems: QueueAction[];
  renderQueueCta: (item: QueueAction) => ReactNode;
}) {
  return (
    <div className="bg-background text-foreground w-full">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-4" aria-labelledby="page-heading">
        <h1 id="page-heading" className="sr-only">
          {heading}
        </h1>

        {/* Header */}
        <CoverageHeader crumbs={crumbs} label={heading} />

        {/* Metrics */}
        <div className="@container">
          <Frame spacing="default">
            <div className="grid gap-1 @2xl:grid-cols-3">
              {metrics.map((metric) => (
                <MetricPanel key={metric.id} metric={metric} />
              ))}
            </div>
          </Frame>
        </div>

        {/* Operations */}
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <CoverageTable members={members} t={coverage} />
          </div>
          <ActionQueue items={queueItems} renderCta={renderQueueCta} t={queue} />
        </div>
      </main>
    </div>
  );
}
