import { navigationFor } from "@quy-hang/core";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { docTuVung } from "../../inventory/doc-tu-vung";
import { TuVungProvider } from "../../inventory/tu-vung";
import { HoSoToanMan } from "../ho-so/ho-so-toan-man";
import { KhungHoSoCan } from "../ho-so/khung";

// Hồ sơ căn toàn màn (hàng 17, Tham chiếu §routes): cùng hồ sơ của cột phải Bảng hàng. «Gõ mã căn» và «Mở toàn màn» tới
// đây; `toa` chọn toà khi mã có ở hai toà, `lan` chọn lần rao.
export default async function Page({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ toa?: string; lan?: string }> }) {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me?.activeCompany) redirect("/login");
  if (!navigationFor(me.activeCompany.roles).homes.includes("inventory")) notFound();
  const { code } = await params;
  const { toa, lan } = await searchParams;
  const tuVung = await docTuVung(cookie);
  return (
    <KhungHoSoCan>
      <TuVungProvider tuVung={tuVung}>
        <HoSoToanMan nguoi={me.user.id} san={me.activeCompany.id} chon={{ ma: decodeURIComponent(code), toa: toa ?? null, lan: lan ?? null }} />
      </TuVungProvider>
    </KhungHoSoCan>
  );
}
