"use client";

import { HOME_LABEL, type Home, resolveJump } from "@quy-hang/core";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import { Kbd, KbdGroup } from "@/components/ui/kbd";

// Ô «Gõ mã căn»: ⌘K / Ctrl+K, hoặc «/» khi không đứng ở ô nhập. Chữ khớp tên nhà → nhảy nhà; còn lại → hồ sơ căn.
// Chỉ vai có Bảng hàng mới có ô này (Hỏi-3) — vỏ không gắn phím khi vai không có.
export function useUnitJumpKeys(enabled: boolean, setOpen: (open: boolean) => void) {
  useEffect(() => {
    if (!enabled) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, setOpen]);
}

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

/** Nút mở ô trên thanh trên máy tính — giữ dáng ô tìm của khối app-shell-8 (chữ gợi ý + phím tắt). */
export function UnitJumpButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-label="Gõ mã căn"
      className="w-48 justify-start font-normal text-muted-foreground lg:w-52 xl:w-80"
    >
      <SearchIcon className="opacity-60" aria-hidden="true" />
      <span className="flex-1 text-left">Gõ mã căn…</span>
      <KbdGroup aria-hidden="true">
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </Button>
  );
}

export function UnitJumpDialog({
  open,
  onOpenChange,
  homes,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homes: readonly Home[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const typed = text.trim();
  const target = resolveJump(text, homes);
  const matchedHome = homes.find((h) => target === resolveJump(HOME_LABEL[h], homes));

  function go(path: string | null) {
    if (!path) return;
    onOpenChange(false);
    setText("");
    router.push(path);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Gõ mã căn" description="Gõ mã căn hoặc tên nhà">
      <Command shouldFilter={false}>
        <CommandInput placeholder="Gõ mã căn hoặc tên nhà" value={text} onValueChange={setText} />
        <CommandList>
          <CommandEmpty>Gõ mã căn, rồi Enter</CommandEmpty>
          {target && !matchedHome && (
            <CommandGroup heading="Mã căn">
              <CommandItem value={`ma-can:${typed}`} onSelect={() => go(target)}>
                Mở căn {typed}
              </CommandItem>
            </CommandGroup>
          )}
          {(matchedHome ? [matchedHome] : typed ? [] : homes).length > 0 && (
            <CommandGroup heading="Nhà">
              {(matchedHome ? [matchedHome] : homes).map((home) => (
                <CommandItem key={home} value={`nha:${home}`} onSelect={() => go(resolveJump(HOME_LABEL[home], homes))}>
                  {HOME_LABEL[home]}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
