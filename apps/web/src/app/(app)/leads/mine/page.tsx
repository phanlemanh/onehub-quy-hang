import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";

import { KhungLeadCuaToi } from "./khung";
import { LeadDaNhapThat } from "./nguon-that";

export const dynamic = "force-dynamic";

// Lead đã nhập (hàng 27), dựng qua khuôn KhungLeadCuaToi (design/patterns/lead-cua-toi.md): lead người đăng nhập đã nhập,
// mới nhất trước, với bốn nấc. Hôm nay của telesales hiện cùng vùng này.
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  return (
    <KhungLeadCuaToi>
      <LeadDaNhapThat />
    </KhungLeadCuaToi>
  );
}
