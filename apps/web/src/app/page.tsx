import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";

export const dynamic = "force-dynamic";

// `/` không có màn riêng: đưa người tới nhà mở đầu theo vai (Hôm nay; người chỉ quản trị vào Cài đặt sàn).
export default async function Home() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  redirect(navigationFor(me.activeCompany.roles).landing);
}
