import { ChevronRightIcon, ContactIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { readMe } from "@/lib/api";

import { CHU } from "./lien-he";

/**
 * Đường vào Liên hệ trên điện thoại (hàng 103, Hỏi-1): một mục trong Tôi / Cài đặt, không thêm tab. Chỉ hiện cho Đầu chủ và
 * Trưởng nhóm — vai đọc được liên hệ (ADR-0021 qđ 3); trên máy tính Liên hệ là nhà thứ sáu nên mục ẩn ở khổ lớn.
 */
export async function LienHeTrenToi() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  const vai = me?.activeCompany?.roles ?? [];
  if (!vai.includes("listing_agent") && !vai.includes("team_lead")) return null;
  return (
    <Item variant="outline" className="md:hidden" render={<Link href="/contacts" />}>
      <ItemMedia variant="icon">
        <ContactIcon aria-hidden="true" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{CHU.tieuDe}</ItemTitle>
        <ItemDescription>{CHU.moTa}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4" aria-hidden="true" />
      </ItemActions>
    </Item>
  );
}
