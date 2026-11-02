import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "./khung";
import { BangCoHoSo, HoSoDienThoai } from "../units/ho-so/bang-co-ho-so";

export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  return (
    <KhungBangHang title="Bảng hàng" dienThoai={(bao) => <HoSoDienThoai nguoi={me.user.id} san={me.activeCompany!.id} bao={bao} />}>
      <BangCoHoSo nguoi={me.user.id} san={me.activeCompany.id} />
    </KhungBangHang>
  );
}
