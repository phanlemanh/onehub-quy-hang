import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { readMe } from "@/lib/api";
import { TrangThu } from "./trang-thu";

export const dynamic = "force-dynamic";

// Trang thử của bộ đồng bộ (hàng 13, Hỏi-3): chấm và đo vế mất mạng trên thiết bị. Không có lối vào trong điều hướng; chỉ
// vai có Bảng hàng; gỡ khi Bảng hàng thật ra (hàng 14).
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany || !navigationFor(me.activeCompany.roles).homes.includes("inventory")) notFound();
  return <TrangThu />;
}
