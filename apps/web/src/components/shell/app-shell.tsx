"use client";

import {
  type Home,
  homeOfPath,
  isSecondColumnOpen,
  type Navigation,
  SECOND_COLUMN_OPEN_BY_DEFAULT,
  secondColumnKey,
} from "@quy-hang/core";
import { cn } from "cn";
import { CalendarCheckIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AccountMenuKhung } from "./account-menu";
import { CompanySwitcher } from "./company-switcher";
import { SECOND_COLUMN_COOKIE } from "./cookie";
import { HomeRail } from "./home-rail";
import { MobileHeader, MobileTabBar } from "./mobile-shell";
import { type LoiMenuTao, MenuTao } from "./menu-tao";
import { Notifications } from "./notifications";
import { SecondColumn, SecondColumnToggle } from "./second-column";
import { titleOf } from "./tieu-de";
import { UnitJumpButton, UnitJumpDialog, useUnitJumpKeys } from "./unit-jump";

// Vỏ chung mọi màn sau đăng nhập (ADR-0002): một mã, hai vỏ theo bề rộng. Từ md là vỏ máy tính — khối app-shell-8 đã
// chuyển thể (cột nhà, thanh trên, cột thứ hai); dưới md là vỏ điện thoại ghép (thanh trên mảnh, tab dưới).
// Nhà và nút đọc từ `navigationFor` của packages/core — vỏ không rẽ nhánh theo tên vai.

export type ShellUser = {
  userId: string;
  email: string;
  companies: { id: string; name: string }[];
  activeCompany: { id: string; name: string; roles?: string[] };
};

function writeRemembered(key: string, open: boolean) {
  const all: Record<string, boolean> = {};
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${SECOND_COLUMN_COOKIE}=`))
    ?.slice(SECOND_COLUMN_COOKIE.length + 1);
  try {
    Object.assign(all, raw ? JSON.parse(decodeURIComponent(raw)) : {});
  } catch {
    // cookie hỏng thì ghi lại từ đầu
  }
  all[key] = open;
  document.cookie = `${SECOND_COLUMN_COOKIE}=${encodeURIComponent(JSON.stringify(all))}; path=/; max-age=31536000; samesite=lax`;
}

function DesktopHeader({
  user,
  nav,
  onJump,
  className,
  menuTao,
  chiBao,
  taiKhoan,
}: {
  user: ShellUser;
  nav: Navigation;
  onJump: () => void;
  className?: string;
  menuTao?: LoiMenuTao;
  chiBao?: ReactNode;
  taiKhoan?: ReactNode;
}) {
  return (
    <header
      data-slot="app-header"
      className={cn(
        "sticky top-0 z-50 h-(--header-height) w-full shrink-0 items-center gap-2 border-b bg-background px-2",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <CompanySwitcher companies={user.companies} activeId={user.activeCompany.id} />
      </div>

      {nav.unitJump && (
        <div className="ml-auto flex items-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
          <UnitJumpButton onClick={onJump} />
        </div>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1">
        {nav.homes.length === 0 && (
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/today" />}>
            <CalendarCheckIcon aria-hidden="true" />
            Hôm nay
          </Button>
        )}
        <MenuTao actions={nav.actions} loi={menuTao} />
        {chiBao}
        <Notifications />
        {taiKhoan ?? <AccountMenuKhung email={user.email} companyName={user.activeCompany.name} dangXuat={async () => false} />}
      </div>
    </header>
  );
}

export function AppShell({
  user,
  nav,
  remembered,
  children,
  mau,
  menuTao,
  nhaMau,
  chiBao,
  chiBaoGon,
  taiKhoan,
  phuVo,
}: {
  user: ShellUser;
  nav: Navigation;
  /** Cột thứ hai người đã mở/gập ở từng nhà, của đúng người và sàn đang làm. */
  remembered: Partial<Record<Home, boolean>>;
  children: ReactNode;
  /** Trang mẫu sống (hàng 91): nhà lấy từ `nhaMau`, đầu điện thoại không mở việc thật. */
  mau?: boolean;
  /** Chỉ trang ba lối của menu Tạo đổi lối; vỏ thật dùng lối mặc định. */
  menuTao?: LoiMenuTao;
  /** Trang mẫu sống: nhà đứng thay cho địa chỉ /mau/… để cột thứ hai và tiêu đề hiện như màn thật. */
  nhaMau?: Home;
  /** Phần của bộ đồng bộ — vỏ thật (`AppShellDongBo`) truyền vào; trang mẫu sống để trống nên không nhập lớp đồng bộ. */
  chiBao?: ReactNode;
  chiBaoGon?: ReactNode;
  taiKhoan?: ReactNode;
  phuVo?: ReactNode;
}) {
  const pathname = usePathname();
  const home = (mau && nhaMau) || homeOfPath(pathname);
  const [choices, setChoices] = useState(remembered);
  const [jumpOpen, setJumpOpen] = useState(false);
  const openJump = () => setJumpOpen(true);
  useUnitJumpKeys(nav.unitJump, setJumpOpen);

  const hasColumn = home !== null && SECOND_COLUMN_OPEN_BY_DEFAULT[home] !== undefined && nav.homes.includes(home);
  const columnOpen = home !== null && hasColumn && isSecondColumnOpen(home, choices[home]);

  function toggleColumn() {
    if (!home) return;
    const next = !columnOpen;
    setChoices((c) => ({ ...c, [home]: next }));
    writeRemembered(secondColumnKey(user.userId, user.activeCompany.id, home), next);
  }

  return (
    <SidebarProvider
      className={cn(
        "h-svh",
        "[--header-height:var(--vo-thanh-tren)]",
        "[--sidebar-accent:color-mix(in_oklab,var(--color-primary)_5%,transparent)]",
        "[--sidebar-accent-foreground:var(--color-primary)]",
      )}
      style={
        {
          "--sidebar-width": nav.homes.length > 0 ? "var(--vo-cot-bieu-tuong)" : "0px",
          "--sidebar-width-inner": "var(--vo-cot-hai)",
        } as CSSProperties
      }
    >
      {nav.homes.length > 0 && <HomeRail homes={nav.homes} current={home} />}

      <SidebarInset className="overflow-hidden shadow-none md:border">
        <DesktopHeader user={user} nav={nav} onJump={openJump} className="hidden md:flex" menuTao={menuTao} chiBao={chiBao} taiKhoan={taiKhoan} />
        <MobileHeader title={titleOf(pathname, home)} unitJump={nav.unitJump} onJump={openJump} className="md:hidden" chiBao={chiBaoGon} actions={nav.mobileActions} />

        <div className="relative flex min-h-0 flex-1">
          {hasColumn && home && <SecondColumn home={home} open={columnOpen} />}
          {hasColumn && <SecondColumnToggle open={columnOpen} onToggle={toggleColumn} />}
          {/* Lề thuộc bố cục (ADR-0024): màn dựng qua BoCuc tự giữ lề; màn chưa chuyển (ngoại lệ có hạn) giữ lề cũ của vỏ.
              Bỏ nhánh lề cũ khi màn cuối rời ngoại lệ. */}
          <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4 pb-24 md:pb-4 has-[[data-bo-cuc-goc]]:p-0 has-[[data-bo-cuc-goc]]:pb-20 md:has-[[data-bo-cuc-goc]]:pb-0">
            {children}
          </div>
        </div>

        <MobileTabBar nav={nav} className="md:hidden" />
      </SidebarInset>

      {nav.unitJump && <UnitJumpDialog open={jumpOpen} onOpenChange={setJumpOpen} homes={nav.homes} />}
      {phuVo}
    </SidebarProvider>
  );
}
