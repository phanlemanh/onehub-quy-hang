"use client";

import { ACTION_PATH, type Action } from "@quy-hang/core";
import { ChevronDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { ACTION_LABEL } from "./nav-labels";

// Menu Tạo trên thanh trên (ADR-0024 quyết định 1, 13): mọi việc tạo của vai ở đúng một chỗ — việc tạo đầu của vai là
// nút chính một chạm, các việc còn lại trong menu. Việc tạo theo vai đọc từ `navigationFor` (Tham chiếu §9); màn không
// đặt nút tạo của riêng nó. `loi` chỉ để trang ba lối của hàng 91 dựng ba cách đặt cạnh nhau; vỏ thật dùng lối đã chọn.

export type LoiMenuTao = "reui" | "trong-kho" | "ve-moi";

export function chiaViecTao(actions: readonly Action[]): { chinh: Action | null; menu: Action[] } {
  const [chinh = null, ...menu] = actions;
  return { chinh, menu };
}

function Muc({ action }: { action: Action }) {
  const { label, icon: Icon } = ACTION_LABEL[action];
  return (
    <DropdownMenuItem render={<Link href={ACTION_PATH[action]} />}>
      <Icon aria-hidden="true" />
      {label.replace(/^\+ /, "")}
    </DropdownMenuItem>
  );
}

export function MenuTao({ actions, loi = "reui" }: { actions: readonly Action[]; loi?: LoiMenuTao }) {
  const { chinh, menu } = chiaViecTao(actions);
  if (!chinh) return null;

  if (loi === "trong-kho")
    return (
      <>
        {actions.map((action, i) => {
          const { label, icon: Icon } = ACTION_LABEL[action];
          return (
            <Button key={action} variant={i === 0 ? "default" : "outline"} size="sm" nativeButton={false} render={<Link href={ACTION_PATH[action]} />}>
              {action !== "new_lead" && <Icon aria-hidden="true" />}
              {label}
            </Button>
          );
        })}
      </>
    );

  if (loi === "ve-moi")
    return (
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" />}>
          <PlusIcon aria-hidden="true" />
          Tạo
          <ChevronDownIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((a) => (
            <Muc key={a} action={a} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );

  const nutChinh = (
    <Button size="sm" nativeButton={false} render={<Link href={ACTION_PATH[chinh]} />}>
      {ACTION_LABEL[chinh].label}
    </Button>
  );
  if (menu.length === 0) return nutChinh;
  return (
    <ButtonGroup aria-label="Tạo">
      {nutChinh}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="icon-sm" aria-label="Việc tạo khác" />}>
          <ChevronDownIcon aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {menu.map((a) => (
            <Muc key={a} action={a} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
