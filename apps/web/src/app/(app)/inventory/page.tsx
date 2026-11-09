import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { lamViecVoiHang } from "@quy-hang/core/access";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "./khung";
import { BangCoHoSo } from "../units/ho-so/bang-co-ho-so";
import { BangTheDienThoai } from "./cards/bang-the";
import { docTuVung } from "./doc-tu-vung";
import { TuVungProvider } from "./tu-vung";

export default async function Page() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me?.activeCompany) redirect("/login");
  // Bảng quyền của hàng (bang-quyen-theo-vai): người không có Bảng hàng — Telesales, Quản trị sàn — về Hôm nay.
  if (!lamViecVoiHang({ roles: me.activeCompany.roles })) redirect("/today");
  // Cách gọi riêng của sàn (hàng 45): đọc ở máy chủ mỗi lần mở trang; đọc hỏng thì chữ dựng sẵn, bảng vẫn mở.
  const tuVung = await docTuVung(cookie);
  return (
    // Từ vựng bọc cả khung: cột hồ sơ cạnh bảng dựng trong khung, ngoài phần con của nó.
    <TuVungProvider tuVung={tuVung}>
      <KhungBangHang
        title="Bảng hàng"
        hoSo={{ nguoi: me.user.id, san: me.activeCompany.id }}
        dienThoai={<BangTheDienThoai nguoi={me.user.id} san={me.activeCompany.id} />}
      >
        <BangCoHoSo nguoi={me.user.id} san={me.activeCompany.id} vai={me.activeCompany.roles} tenSan={me.activeCompany.name} />
      </KhungBangHang>
    </TuVungProvider>
  );
}
