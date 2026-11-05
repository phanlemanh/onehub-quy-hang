import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { lamViecVoiHang } from "@quy-hang/core/access";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "./khung";
import { BangCoHoSo } from "../units/ho-so/bang-co-ho-so";
import { BangTheDienThoai } from "./cards/bang-the";

export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  // Bảng quyền của hàng (bang-quyen-theo-vai): người không có Bảng hàng — Telesales, Quản trị sàn — về Hôm nay.
  if (!lamViecVoiHang({ roles: me.activeCompany.roles })) redirect("/today");
  return (
    <KhungBangHang
      title="Bảng hàng"
      hoSo={{ nguoi: me.user.id, san: me.activeCompany.id }}
      dienThoai={<BangTheDienThoai nguoi={me.user.id} san={me.activeCompany.id} />}
    >
      <BangCoHoSo nguoi={me.user.id} san={me.activeCompany.id} vai={me.activeCompany.roles} tenSan={me.activeCompany.name} />
    </KhungBangHang>
  );
}
