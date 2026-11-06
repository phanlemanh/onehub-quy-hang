import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { readMe } from "@/lib/api";

import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { CongTacAi } from "./cong-tac";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Xử lý bằng AI (hàng 68, ADR-0011 quyết định 2, 10; Hỏi-2 Cổng Phạm vi 05/11: mục riêng ở cột Sàn), dựng
// qua khuôn MucCaiDat (design/patterns/cai-dat-san.md). Quản trị sàn bật, tắt thoả thuận ai_processing và xem tiền tháng.
export default async function XuLyBangAi() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  return (
    <MucCaiDat title="Xử lý bằng AI" description="Máy đề xuất cách ghép cột khi nhập bảng hàng">
      <CongTacAi />
    </MucCaiDat>
  );
}
