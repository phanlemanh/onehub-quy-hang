import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";
import { KhungGui } from "./khung";
import { ManGui } from "./man-gui";

export const dynamic = "force-dynamic";

// Màn Gửi (hàng 34), khuôn «Luồng nhiều bước» (design/patterns/gui.md). Căn đi theo người từ Bảng hàng thẻ (`?can=`);
// người gửi trên trang xem trước là tên trong phiên đăng nhập, sàn là sàn đang làm. Vai có tab Gửi mới vào được; API chặn
// lại cùng luật.
export default async function Page() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (!me.activeCompany) redirect("/select-company");
  if (!navigationFor(me.activeCompany.roles).tabs.includes("send"))
    return (
      <KhungGui>
        <TrangThai kind="notice" title="Đầu khách và trưởng nhóm gửi được căn." />
      </KhungGui>
    );
  const phien = await getApi().request("http://quy-hang.local/api/v1/auth/get-session", { headers: { cookie } });
  const ten = phien.ok ? (((await phien.json()) as { user?: { name?: string } } | null)?.user?.name ?? "") : "";
  return (
    <KhungGui>
      <ManGui san={me.activeCompany.id} nguoi={{ companyName: me.activeCompany.name, senderName: ten }} />
    </KhungGui>
  );
}
