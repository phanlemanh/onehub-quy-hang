"use client";

import { type Home, HOME_LABEL } from "@quy-hang/core";
import { cn } from "cn";
import {
  CalendarClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileSpreadsheetIcon,
  LinkIcon,
  BookmarkIcon,
  ListChecksIcon,
  PercentIcon,
  PlusIcon,
  SplitIcon,
  TagIcon,
  TextCursorInputIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SU_KIEN_MO_LUU, useGocNhinCuaToi } from "@/app/(app)/inventory/goc-nhin-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Cột thứ hai theo nhà (§9) — chuyển thể InnerSidebar + InnerSidebarNav của app-shell-8. Hôm nay và Đội không có cột.
type Item = { label: string; href: string; icon: LucideIcon };

const SHARES: Item[] = [
  { label: "Link đã gửi", href: "/shares", icon: LinkIcon },
  { label: "Lịch xem", href: "/viewings", icon: CalendarClockIcon },
];

export const SETTINGS_ITEMS: Item[] = [
  { label: "Người dùng", href: "/settings/users", icon: UsersIcon },
  { label: "Cách gọi", href: "/settings/labels", icon: TagIcon },
  { label: "Trường riêng", href: "/settings/fields", icon: TextCursorInputIcon },
  { label: "Trạng thái", href: "/settings/statuses", icon: ListChecksIcon },
  { label: "Luật chia lead", href: "/settings/lead-routing", icon: SplitIcon },
  { label: "Thuế phí", href: "/settings/fees", icon: PercentIcon },
  { label: "Mẫu nhập", href: "/settings/templates", icon: FileSpreadsheetIcon },
];

function SectionTitle({ children }: { children: string }) {
  return <p className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground uppercase">{children}</p>;
}

function NavList({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-0.5 px-2">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href={href} />}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "w-full justify-start gap-2.5 font-normal",
              isActive ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-70" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Button>
        );
      })}
    </div>
  );
}

function InventoryColumn() {
  // Góc nhìn của tôi lưu trên máy theo người và sàn (hàng 14); góc nhìn của đội cần bảng ở máy chủ — hàng sau.
  const { ds } = useGocNhinCuaToi();
  const items: Item[] = ds.map((g) => ({ label: g.ten, href: `/inventory/views/${encodeURIComponent(g.id)}`, icon: BookmarkIcon }));
  return (
    <>
      <div className="min-h-0 grow">
        <ScrollArea className="h-full">
          <nav className="flex flex-col py-1" aria-label="Góc nhìn">
            <SectionTitle>Góc nhìn của đội</SectionTitle>
            <p className="px-3 py-1 text-sm text-muted-foreground">Chưa có góc nhìn</p>
            <Separator className="my-2" />
            <SectionTitle>Góc nhìn của tôi</SectionTitle>
            {items.length ? <NavList items={items} /> : <p className="px-3 py-1 text-sm text-muted-foreground">Chưa có góc nhìn</p>}
            <div className="px-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2.5 font-normal"
                onClick={() => window.dispatchEvent(new Event(SU_KIEN_MO_LUU))}
              >
                <PlusIcon aria-hidden="true" />
                Lưu góc nhìn
              </Button>
            </div>
          </nav>
        </ScrollArea>
      </div>
      <div className="shrink-0 border-t px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Độ tươi</p>
        <p className="text-sm text-muted-foreground">Chưa có số</p>
      </div>
    </>
  );
}

function ColumnContent({ home }: { home: Home }) {
  if (home === "inventory") return <InventoryColumn />;
  const items = home === "shares" ? SHARES : SETTINGS_ITEMS;
  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col py-1" aria-label={HOME_LABEL[home]}>
        <SectionTitle>{HOME_LABEL[home]}</SectionTitle>
        <NavList items={items} />
      </nav>
    </ScrollArea>
  );
}

export function SecondColumn({ home, open }: { home: Home; open: boolean }) {
  return (
    <aside
      data-slot="second-column"
      data-state={open ? "open" : "closed"}
      aria-label={`Cột ${HOME_LABEL[home]}`}
      className={cn(
        "hidden shrink-0 overflow-hidden border-r md:flex",
        "transition-[width] duration-200 ease-linear motion-reduce:transition-none",
        open ? "w-(--sidebar-width-inner)" : "w-0 border-r-0",
      )}
    >
      <div className="flex w-(--sidebar-width-inner) shrink-0 flex-col overflow-hidden" inert={!open}>
        <ColumnContent home={home} />
      </div>
    </aside>
  );
}

/** Tay nắm gập/mở cột thứ hai — chuyển thể InnerSidebarRailToggle (nút của kho thay thẻ button trần). */
export function SecondColumnToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const Icon = open ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <Button
      variant="outline"
      size="icon-xs"
      onClick={onToggle}
      aria-label={open ? "Gập cột" : "Mở cột"}
      aria-expanded={open}
      className="absolute top-1/2 z-30 hidden -translate-y-1/2 rounded-full md:inline-flex"
      style={{ left: open ? "calc(var(--sidebar-width-inner) - 0.75rem)" : "-0.25rem" }}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
