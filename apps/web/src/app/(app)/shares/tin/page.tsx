import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { readMe } from "@/lib/api";

import { KhungTinKhach } from "./khung";
import VungDauKhach from "./vung";

export const dynamic = "force-dynamic";

// Tin của khách ở Đã gửi (hồ sơ hom-nay-mot-danh-sach-viec): tin 7 ngày về link của chính mình, chỉ đầu khách; API chặn lại.
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/login");
  if (!me.activeCompany) redirect("/select-company");
  return <KhungTinKhach>{me.activeCompany.roles.includes("buyer_agent") ? <VungDauKhach /> : <TrangThai kind="notice" title="Tin của khách chỉ có ở vai Đầu khách" />}</KhungTinKhach>;
}
