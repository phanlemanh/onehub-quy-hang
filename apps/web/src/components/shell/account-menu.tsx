"use client";

import { cn } from "cn";
import { LogOutIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { thanDangXuat } from "@/lib/push/dang-ky";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dangXuatTrenMay } from "./dang-xuat-tren-may";

// Menu tài khoản — chuyển thể NavUser của app-shell-8: tên sàn đang làm, sáng/tối, đăng xuất.
const THEMES = [
  { value: "light", label: "Sáng", icon: SunIcon },
  { value: "dark", label: "Tối", icon: MoonIcon },
  { value: "system", label: "Theo máy", icon: MonitorIcon },
];

function ThemeSegmentedToggle() {
  const { theme, setTheme } = useTheme();
  // Máy chủ không biết chế độ của máy: chỉ đánh dấu ô đang chọn sau khi chạy ở trình duyệt.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const current = mounted ? (theme ?? "system") : "system";

  return (
    <div role="radiogroup" aria-label="Sáng hay tối" className="inline-flex items-center gap-0.5 rounded-full bg-muted/60 p-0.5">
      {THEMES.map(({ value, label, icon: Icon }) => {
        const isActive = current === value;
        return (
          <Button
            key={value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            variant="ghost"
            size="icon-xs"
            onClick={() => setTheme(value)}
            className={cn(
              "rounded-full",
              isActive ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}

/** Thân menu tài khoản, không đọc bộ đồng bộ — vỏ thật nối `dangXuat` của bộ đồng bộ ở `app-shell-dong-bo.tsx`. */
export function AccountMenuKhung({ email, companyName, dangXuat }: { email: string; companyName: string; dangXuat: () => Promise<boolean> }) {
  const router = useRouter();
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Tài khoản" />}>
        <Avatar className="size-6 rounded-md">
          <AvatarFallback className="rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
            <span className="truncate text-sm font-semibold text-foreground">{email}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">Sàn {companyName}</span>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem render={<Link href="/me" />}>
            <UserIcon aria-hidden="true" />
            Tôi
          </DropdownMenuItem>

          <DropdownMenuItem closeOnClick={false} className="cursor-default focus:bg-transparent!">
            <PaletteIcon aria-hidden="true" />
            Sáng / tối
            <div className="ml-auto">
              <ThemeSegmentedToggle />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={async () => {
              // Còn thay đổi chưa gửi thì hỏi; đăng xuất luôn xoá kho trên máy của người này (luật 32).
              await dangXuatTrenMay({
                dangXuat,
                than: thanDangXuat,
                goi: fetch,
                ve: () => {
                  router.replace("/login");
                  router.refresh();
                },
              });
            }}
          >
            <LogOutIcon aria-hidden="true" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
