import { settingsLanding } from "@quy-hang/core";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";

export const dynamic = "force-dynamic";

// Nhà Cài đặt mở vào mục đầu theo quyền (hàng cai-dat-hop-nhat): quản trị sàn vào Người dùng, vai khác vào Cá nhân.
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  redirect(settingsLanding(me.activeCompany.roles ?? []));
}
