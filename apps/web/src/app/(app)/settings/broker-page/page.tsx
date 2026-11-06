import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";

import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { CHU_CAI_DAT, docCaiDat } from "./thuan";
import { VungMoiGioi } from "./vung";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Trang môi giới (hàng 44, Hỏi-3), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md): Quản trị sàn
// đặt mức chia mặc định và ẩn mức chia. Thân là khung settings-3 mang Frame riêng nên đặt `khoi`.
export default async function TrangMoiGioi() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  const res = await Promise.resolve(getApi().request("http://quy-hang.local/api/v1/company/settings", { headers: { cookie } })).catch(() => null);
  return (
    <MucCaiDat title={CHU_CAI_DAT.tieuDe} description={CHU_CAI_DAT.moTa} khoi>
      {res && res.ok ? <VungMoiGioi dau={docCaiDat(await res.json())} /> : <TrangThai kind="error" title={CHU_CAI_DAT.loiDoc} description="Tải lại trang để thử lại." />}
    </MucCaiDat>
  );
}
