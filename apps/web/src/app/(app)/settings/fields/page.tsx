import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { boTuThan } from "@quy-hang/core/custom-fields";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";

import { docTuVung } from "../../inventory/doc-tu-vung";
import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { TruongRiengMan } from "./truong-rieng";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Trường riêng (hàng 47), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md). Thân là khung settings-3
// đã chuyển (MucCaiDatKhoi + SettingField) trong `truong-rieng.tsx` — mang Frame riêng nên đặt `khoi`. Tên riêng sàn đặt ở
// Cách gọi (hàng 45) đi vào máy dò trùng nghĩa.
export default async function TruongRiengPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  const [res, tuVung] = await Promise.all([getApi().request("http://quy-hang.local/api/v1/company/fields", { headers: { cookie } }), docTuVung(cookie)]);
  return (
    <MucCaiDat title="Trường riêng" description="Trường thật sự mới của sàn cho hàng và liên hệ" khoi>
      {res.ok ? (
        <TruongRiengMan bo={boTuThan((await res.json()) as { fields?: unknown[] })} tuVung={tuVung} />
      ) : (
        <TrangThai kind="error" title="Chưa đọc được trường riêng của sàn" description="Tải lại trang để thử lại." />
      )}
    </MucCaiDat>
  );
}
