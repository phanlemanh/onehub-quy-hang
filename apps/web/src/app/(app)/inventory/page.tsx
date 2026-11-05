import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
  // Cách gọi riêng của sàn (hàng 45): đọc ở máy chủ mỗi lần mở trang; đọc hỏng thì chữ dựng sẵn, bảng vẫn mở.
  const tuVung = await docTuVung(cookie);
  return (
    <KhungBangHang
      title="Bảng hàng"
      hoSo={{ nguoi: me.user.id, san: me.activeCompany.id }}
      dienThoai={
        <TuVungProvider tuVung={tuVung}>
          <BangTheDienThoai nguoi={me.user.id} san={me.activeCompany.id} />
        </TuVungProvider>
      }
    >
      <TuVungProvider tuVung={tuVung}>
        <BangCoHoSo nguoi={me.user.id} san={me.activeCompany.id} vai={me.activeCompany.roles} tenSan={me.activeCompany.name} />
      </TuVungProvider>
    </KhungBangHang>
  );
}
