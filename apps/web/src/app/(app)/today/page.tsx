import { headers } from "next/headers";

import { Placeholder } from "@/components/shell/placeholder";
import { readMe } from "@/lib/api";

import { KhungLeadCuaToi } from "../leads/mine/khung";
import { LeadDaNhapThat } from "../leads/mine/nguon-that";

export const dynamic = "force-dynamic";

// Hôm nay theo vai (Tham chiếu §10): telesales thấy vùng «Lead đã nhập» với bốn nấc (hàng 27, khuôn KhungLeadCuaToi);
// vai khác giữ chỗ tạm tới Hôm nay của đầu chủ, trưởng nhóm (hàng 22, 42).
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (me?.activeCompany?.roles.includes("telesales")) {
    return (
      <KhungLeadCuaToi>
        <LeadDaNhapThat />
      </KhungLeadCuaToi>
    );
  }
  return <Placeholder path="/today" />;
}
