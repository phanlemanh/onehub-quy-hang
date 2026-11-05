import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { KhungBangHang } from "../../khung";
import { BangHang } from "../../bang-hang";
import { BangTheDienThoai } from "../../cards/bang-the";

// Góc nhìn đã lưu (Tham chiếu §9 `/inventory/views/<id>`): cùng bảng, áp cách xem đã lưu trên máy này.
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me?.activeCompany) redirect("/login");
  return (
    <KhungBangHang title="Bảng hàng" dienThoai={<BangTheDienThoai nguoi={me.user.id} san={me.activeCompany.id} />}>
      <BangHang nguoi={me.user.id} san={me.activeCompany.id} gocNhinId={decodeURIComponent(id)} vai={me.activeCompany.roles} tenSan={me.activeCompany.name} />
    </KhungBangHang>
  );
}
