import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";

import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { TrangThaiRieng } from "./trang-thai";
import type { BoTrangThaiMan } from "./trang-thai-thuan";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Trạng thái (hàng 46), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md). Thân là khung settings-3
// đã chuyển (MucCaiDatKhoi + SettingField) trong `trang-thai.tsx` — mang Frame riêng nên đặt `khoi`.
export default async function TrangThaiPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  const res = await getApi().request("http://quy-hang.local/api/v1/company/statuses", { headers: { cookie } });
  return (
    <MucCaiDat title="Trạng thái" description="Nhãn trạng thái của sàn, neo vào sáu trạng thái chuẩn" khoi>
      {res.ok ? (
        <TrangThaiRieng bo={(await res.json()) as BoTrangThaiMan} />
      ) : (
        <TrangThai kind="error" title="Chưa đọc được trạng thái của sàn" description="Tải lại trang để thử lại." />
      )}
    </MucCaiDat>
  );
}
