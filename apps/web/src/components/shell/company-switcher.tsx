"use client";

import { cn } from "cn";
import { Building2Icon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Bộ chọn sàn — chuyển thể OrgSwitcher của app-shell-8. Chỉ hiện khi người thuộc hơn một sàn; một sàn thì chỉ hiện tên.
// Đổi sàn gọi đúng đường của màn Chọn sàn: máy chủ ghi sàn đang làm, mọi màn tải lại theo sàn mới.
export function CompanySwitcher({
  companies,
  activeId,
}: {
  companies: { id: string; name: string }[];
  activeId: string;
}) {
  const router = useRouter();
  const active = companies.find((c) => c.id === activeId);

  if (companies.length <= 1) {
    return (
      <span className="flex min-w-0 items-center gap-2 px-2 text-sm font-medium">
        <Building2Icon className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        <span className="truncate">{active?.name}</span>
      </span>
    );
  }

  async function choose(companyId: string) {
    if (companyId === activeId) return;
    const res = await fetch("/api/v1/me/company", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    if (res.ok) router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="min-w-0 shrink text-foreground" aria-label="Chọn sàn" />}
      >
        <Building2Icon className="size-3.5 opacity-60" aria-hidden="true" />
        <span className="truncate">{active?.name}</span>
        <ChevronsUpDownIcon className="size-3.5 opacity-60" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" sideOffset={8} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sàn</DropdownMenuLabel>
          {companies.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => choose(c.id)} className={cn(c.id === activeId && "bg-accent")}>
              <span className="truncate">{c.name}</span>
              {c.id === activeId && <CheckIcon className="ml-auto size-4 text-primary" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
