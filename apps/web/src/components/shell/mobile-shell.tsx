"use client";

import { type Action, type Navigation, TAB_PATH } from "@quy-hang/core";
import { cn } from "cn";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TAB_LABEL } from "./nav-labels";
import { ChiBaoDongBo } from "@/components/sync/chi-bao-dong-bo";
import { MenuTaoDienThoai } from "./menu-tao";
import { Notifications } from "./notifications";

// Vỏ điện thoại (dưới md): thanh trên mảnh — tên nhà · gõ mã căn · chuông — và thanh tab dưới cố định theo vai.
// Đồ ghép ở bậc 6 (vo-va-ia.md «Chỗ hở»): ReUI không có vỏ tab dưới. Chủ kho gật khung trên bản bấm được 31/10.
export function MobileHeader({
  title,
  unitJump,
  onJump,
  className,
  mau,
  actions = [],
}: {
  /** Trang mẫu sống: không có bộ đồng bộ nên không có chỉ báo. */
  mau?: boolean;
  /** Việc tạo của vai — nút «+» mở menu Tạo. */
  actions?: readonly Action[];
  title: string;
  unitJump: boolean;
  onJump: () => void;
  className?: string;
}) {
  return (
    <header
      className={cn("sticky top-0 z-10 flex h-12 shrink-0 items-center gap-1 border-b bg-background px-4", className)}
    >
      <h1 className="flex-1 truncate text-base font-semibold tracking-tight">{title}</h1>
      {unitJump && (
        <Button variant="ghost" size="icon" aria-label="Gõ mã căn" onClick={onJump}>
          <SearchIcon />
        </Button>
      )}
      <MenuTaoDienThoai actions={actions} />
      {!mau && <ChiBaoDongBo gon />}
      <Notifications />
    </header>
  );
}

export function MobileTabBar({ nav, className }: { nav: Navigation; className?: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Nhà"
      data-slot="mobile-tab-bar"
      className={cn(
        "fixed inset-x-0 bottom-0 z-10 grid border-t bg-background pb-[env(safe-area-inset-bottom)]",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${nav.tabs.length}, minmax(0, 1fr))` }}
    >
      {nav.tabs.map((tab) => {
        const { label, icon: Icon } = TAB_LABEL[tab];
        const path = TAB_PATH[tab];
        const active = pathname === path || pathname.startsWith(`${path}/`);
        return (
          <Link
            key={tab}
            href={path}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:bg-muted aria-[current=page]:text-foreground"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
