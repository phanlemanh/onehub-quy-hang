import { headers } from "next/headers";

import { Placeholder } from "@/components/shell/placeholder";
import { readMe } from "@/lib/api";

import { KhungLeadCuaToi } from "../leads/mine/khung";
import { LeadDaNhapThat } from "../leads/mine/nguon-that";
import { HomNayDauChu } from "./hom-nay-dau-chu";
import { KhungHomNay } from "./khung";

export const dynamic = "force-dynamic";

// Hôm nay theo vai (Tham chiếu §10): Đầu chủ thấy Hôm nay của đầu chủ (hàng 22, khuôn KhungHomNay); telesales thấy vùng
// «Lead đã nhập» (hàng 27, khuôn KhungLeadCuaToi) — người hai vai thấy cả hai, đầu chủ trước; vai khác giữ chỗ tạm tới
// Hôm nay của trưởng nhóm (hàng 42).
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  const vai = me?.activeCompany?.roles ?? [];
  const dauChu = me?.activeCompany && vai.includes("listing_agent") ? { nguoi: me.user.id, san: me.activeCompany.id } : null;
  const telesales = vai.includes("telesales");
  return (
    <KhungHomNay>
      {dauChu ? <HomNayDauChu nguoi={dauChu.nguoi} san={dauChu.san} /> : null}
      {telesales ? (
        <KhungLeadCuaToi>
          <LeadDaNhapThat />
        </KhungLeadCuaToi>
      ) : null}
      {!dauChu && !telesales ? <Placeholder path="/today" /> : null}
    </KhungHomNay>
  );
}
