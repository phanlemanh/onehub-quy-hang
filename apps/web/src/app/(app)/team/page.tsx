import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";

import BangDoi from "./dashboard";
import { KhungDoi } from "./khung";

export const dynamic = "force-dynamic";

// Nhà Đội (Tham chiếu §9): ba ô số và bảng theo đầu chủ, chỉ cho vai có nhà Đội. Việc giao lại lead ở Hôm nay.
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany || !navigationFor(me.activeCompany.roles).homes.includes("team")) notFound();
  return (
    <KhungDoi>
      <BangDoi />
    </KhungDoi>
  );
}
