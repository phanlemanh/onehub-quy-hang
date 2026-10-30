"use client";

import { HOME_PATH, TAB_PATH, type Home, type Navigation } from "@quy-hang/core";
import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { HOME_LABEL, NOTIFICATION_ICON, TAB_LABEL } from "./nav-labels";

// Vỏ điện thoại (dưới md): thanh trên mảnh — tên nhà · gõ mã căn · chuông — và thanh tab dưới cố định theo vai.
// Đồ ghép ở bậc 6 (vo-va-ia.md «Chỗ hở»): ReUI không có vỏ tab dưới.
export function MobileShell({
  nav,
  title,
  basePath = "",
  query = "",
  children,
}: {
  nav: Navigation;
  title: string;
  /** Tiền tố đường — bản mẫu chạy dưới /proto/<slug>, vỏ thật để trống. */
  basePath?: string;
  /** Chuỗi truy vấn giữ qua các tab (bản mẫu giữ ?vai=). */
  query?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [jumpOpen, setJumpOpen] = useState(false);
  const href = (path: string) => `${basePath}${path}${query}`;
  const Bell = NOTIFICATION_ICON;

  const jumpHomes = nav.homes.length > 0 ? nav.homes : (["today"] as Home[]);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-12 items-center gap-1 border-b bg-background px-4">
        <h1 className="flex-1 truncate text-base font-semibold tracking-tight">{title}</h1>
        {nav.unitJump && (
          <Button variant="ghost" size="icon" aria-label="Gõ mã căn" onClick={() => setJumpOpen(true)}>
            <SearchIcon />
          </Button>
        )}
        <Button variant="ghost" size="icon" aria-label="Thông báo">
          <Bell />
        </Button>
      </header>

      <main className="flex flex-1 flex-col p-4 pb-20">{children}</main>

      <nav
        aria-label="Nhà"
        className="fixed inset-x-0 bottom-0 z-10 grid border-t bg-background pb-[env(safe-area-inset-bottom)]"
        style={{ gridTemplateColumns: `repeat(${nav.tabs.length}, minmax(0, 1fr))` }}
      >
        {nav.tabs.map((tab) => {
          const { label, icon: Icon } = TAB_LABEL[tab];
          const path = `${basePath}${TAB_PATH[tab]}`;
          const active = pathname === path || pathname.startsWith(`${path}/`);
          return (
            <Link
              key={tab}
              href={href(TAB_PATH[tab])}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:bg-muted aria-[current=page]:text-foreground"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      {nav.unitJump && (
        <CommandDialog open={jumpOpen} onOpenChange={setJumpOpen} title="Gõ mã căn" description="Gõ mã căn hoặc tên nhà">
          <JumpPanel
            homes={jumpHomes}
            onPick={(path) => {
              setJumpOpen(false);
              router.push(href(path));
            }}
          />
        </CommandDialog>
      )}
    </div>
  );
}

function JumpPanel({ homes, onPick }: { homes: Home[]; onPick: (path: string) => void }) {
  const [text, setText] = useState("");
  const code = text.trim().toUpperCase();
  return (
    <Command>
      <CommandInput placeholder="Gõ mã căn hoặc tên nhà" value={text} onValueChange={setText} />
      <CommandList>
        <CommandEmpty>Không có nhà nào khớp</CommandEmpty>
        {code && (
          <CommandGroup heading="Mã căn">
            <CommandItem value={`ma-can ${text}`} onSelect={() => onPick(`/units/${encodeURIComponent(code)}`)}>
              Mở căn {code}
            </CommandItem>
          </CommandGroup>
        )}
        <CommandGroup heading="Nhà">
          {homes.map((home) => (
            <CommandItem key={home} value={HOME_LABEL[home].label} onSelect={() => onPick(HOME_PATH[home])}>
              {HOME_LABEL[home].label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
