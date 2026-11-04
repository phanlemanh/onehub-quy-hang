import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";
import { TrangThai } from "@/components/trang-thai";
import { CHU } from "./danh-sach";
import { KhungDaGui } from "./khung";
import { ManDaGui } from "./man-da-gui";

export const dynamic = "force-dynamic";

// Đã gửi (hàng 36), khuôn «Danh sách → chi tiết» (design/patterns/da-gui.md): Lần gửi của đầu khách, trưởng nhóm thấy cả sàn
// (bảng vai Tham chiếu §9). API chặn lại cùng luật.
export default async function Page() {
  const me = await readMe((await headers()).get("cookie") ?? "");
  if (!me) redirect("/login");
  if (!me.activeCompany) redirect("/select-company");
  const roles = me.activeCompany.roles ?? [];
  const duoc = roles.includes("buyer_agent") || roles.includes("team_lead");
  return (
    <KhungDaGui>
      {duoc ? <ManDaGui /> : <TrangThai kind="notice" title={CHU.khongVai} />}
    </KhungDaGui>
  );
}
