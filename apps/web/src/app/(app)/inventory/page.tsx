import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "./khung";
import { BangHang } from "./bang-hang";

export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  return (
    <KhungBangHang title="Bảng hàng">
      <BangHang nguoi={me.user.id} san={me.activeCompany.id} />
    </KhungBangHang>
  );
}
