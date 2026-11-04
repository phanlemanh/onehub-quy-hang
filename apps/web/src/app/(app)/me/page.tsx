import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungToi } from "./khung";
import { ToiThat } from "./toi-that";

export const dynamic = "force-dynamic";

// Tab Tôi (hàng 38): trên điện thoại là tab dưới, trên máy tính mở từ menu tài khoản. Mọi vai cùng một màn.
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  return (
    <KhungToi>
      <ToiThat loi="reui" email={me.user.email} tenSan={me.activeCompany.name} soSan={me.companies.length} />
    </KhungToi>
  );
}
