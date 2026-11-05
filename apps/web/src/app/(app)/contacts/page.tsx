import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { readMe } from "@/lib/api";
import { KhungLienHe } from "./khung";
import { CHU } from "./lien-he";
import VungLienHe from "./vung";

export const dynamic = "force-dynamic";

// Liên hệ (hàng 103), khuôn «Danh sách → chi tiết» (design/patterns/lien-he.md): đầu chủ thấy người mình giữ, trưởng nhóm cả
// sàn (ADR-0021 qđ 3). API chặn lại cùng luật.
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/login");
  if (!me.activeCompany) redirect("/select-company");
  const roles = me.activeCompany.roles ?? [];
  const duoc = roles.includes("listing_agent") || roles.includes("team_lead");
  return <KhungLienHe>{duoc ? <VungLienHe /> : <TrangThai kind="notice" title={CHU.khongVai} />}</KhungLienHe>;
}
