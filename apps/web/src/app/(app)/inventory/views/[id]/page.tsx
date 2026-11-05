import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "../../khung";
import { BangHang } from "../../bang-hang";
import { BangTheDienThoai } from "../../cards/bang-the";
import { docTuVung } from "../../doc-tu-vung";
import { TuVungProvider } from "../../tu-vung";

// Góc nhìn đã lưu (Tham chiếu §9 `/inventory/views/<id>`): cùng bảng, áp cách xem đã lưu trên máy này.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me?.activeCompany) redirect("/login");
  // Cách gọi riêng của sàn (hàng 45): cùng từ vựng với /inventory.
  const tuVung = await docTuVung(cookie);
  return (
    <KhungBangHang
      title="Bảng hàng"
      dienThoai={
        <TuVungProvider tuVung={tuVung}>
          <BangTheDienThoai nguoi={me.user.id} san={me.activeCompany.id} />
        </TuVungProvider>
      }
    >
      <TuVungProvider tuVung={tuVung}>
        <BangHang nguoi={me.user.id} san={me.activeCompany.id} gocNhinId={decodeURIComponent(id)} vai={me.activeCompany.roles} tenSan={me.activeCompany.name} />
      </TuVungProvider>
    </KhungBangHang>
  );
}
