import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "./khung";
import { BangCoHoSo } from "../units/ho-so/bang-co-ho-so";

export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  return (
    <KhungBangHang title="Bảng hàng">
      <BangCoHoSo nguoi={me.user.id} san={me.activeCompany.id} />
    </KhungBangHang>
  );
}
