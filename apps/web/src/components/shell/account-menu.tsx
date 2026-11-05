"use client";

import { cn } from "cn";
import { LogOutIcon, MonitorIcon, MoonIcon, PaletteIcon, SettingsIcon, SunIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { toast, Toaster } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mucTaiKhoan } from "@/app/(app)/settings/cai-dat";
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
import { CHUA_DANG_XUAT, dangXuatTrenMay } from "./dang-xuat-tren-may";

const KHUNG_DANG_XUAT = "dang-xuat";

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
export function AccountMenuKhung({
  email,
  companyName,
  roles,
  dangXuat,
}: {
  email: string;
  companyName: string;
  /** Vai ở sàn đang làm — quản trị có thêm mục «Cài đặt sàn» (hàng cai-dat-hop-nhat). */
  roles: readonly string[];
  dangXuat: () => Promise<boolean>;
}) {
  const router = useRouter();
  const initials = email.slice(0, 2).toUpperCase();
  // Máy chủ lỗi hay mất mạng thì ở lại màn và báo kèm «Thử lại» (luật 55); thử lại không hỏi xoá kho lần hai.
  const chayDangXuat = async (daXoa: boolean) => {
    const kq = await dangXuatTrenMay({
      dangXuat,
      daXoa,
      than: thanDangXuat,
      goi: fetch,
      ve: () => {
        router.replace("/login");
        router.refresh();
      },
    });
    if (kq === "loi") {
      toast.error(CHUA_DANG_XUAT, { toasterId: KHUNG_DANG_XUAT, action: { label: "Thử lại", onClick: () => void chayDangXuat(true) } });
    }
  };

  return (
    <>
    <Toaster id={KHUNG_DANG_XUAT} position="bottom-center" />
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

          {mucTaiKhoan(roles).map((m, i) => (
            <DropdownMenuItem key={m.href} render={<Link href={m.href} />}>
              {i === 0 ? <UserIcon aria-hidden="true" /> : <SettingsIcon aria-hidden="true" />}
              {m.label}
            </DropdownMenuItem>
          ))}

          <DropdownMenuItem closeOnClick={false} className="cursor-default focus:bg-transparent!">
            <PaletteIcon aria-hidden="true" />
            Sáng / tối
            <div className="ml-auto">
              <ThemeSegmentedToggle />
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              // Còn thay đổi chưa gửi thì hỏi; đăng xuất luôn xoá kho trên máy của người này (luật 32).
              void chayDangXuat(false);
            }}
          >
            <LogOutIcon aria-hidden="true" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
    </>
  );
}
