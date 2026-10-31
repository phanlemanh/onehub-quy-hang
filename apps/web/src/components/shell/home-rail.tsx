"use client";

import { type Home, HOME_PATH } from "@quy-hang/core";
import { BoxesIcon } from "lucide-react";
import Link from "next/link";

import { Item, ItemMedia } from "@/components/ui/item";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HOME_ITEM } from "./nav-labels";

// Cột nhà bằng biểu tượng — chuyển thể AppSidebar + NavMain của app-shell-8. Nhà theo vai (packages/core);
// Cài đặt sàn đứng ở đáy (§9).
function HomeMenu({ homes, current }: { homes: Home[]; current: Home | null }) {
  return (
    <SidebarMenu className="gap-0.5">
      {homes.map((home) => {
        const { label, icon: Icon } = HOME_ITEM[home];
        return (
          <SidebarMenuItem key={home}>
            <SidebarMenuButton
              tooltip={{ children: label, hidden: false }}
              isActive={current === home}
              render={<Link href={HOME_PATH[home]} aria-label={label} />}
              className="justify-center"
            >
              <Icon aria-hidden="true" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

export function HomeRail({ homes, current }: { homes: Home[]; current: Home | null }) {
  const top = homes.filter((h) => h !== "settings");
  const bottom = homes.filter((h) => h === "settings");
  return (
    <Sidebar collapsible="icon" className="top-0 bottom-0" variant="inset">
      <div className="flex h-full flex-col" data-slot="home-rail">
        <SidebarHeader className="flex items-center justify-center py-3">
          <Item className="flex size-7 shrink-0 items-center justify-center bg-primary p-0 text-primary-foreground" aria-hidden="true">
            <ItemMedia variant="icon" className="size-auto">
              <BoxesIcon className="size-3.5" />
            </ItemMedia>
          </Item>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="justify-center">
              <HomeMenu homes={top} current={current} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {bottom.length > 0 && (
          <SidebarFooter>
            <HomeMenu homes={bottom} current={current} />
          </SidebarFooter>
        )}
      </div>
    </Sidebar>
  );
}
