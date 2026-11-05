import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";

import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { CachGoi } from "./cach-goi";
import type { BoNhanMan } from "./cach-goi-thuan";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Cách gọi (S1, hàng 45), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md). Thân là khung settings-3
// đã chuyển (MucCaiDatKhoi + SettingField) trong `cach-goi.tsx` — mang Frame riêng nên đặt `khoi`.
export default async function CachGoiPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  const res = await getApi().request("http://quy-hang.local/api/v1/company/labels", { headers: { cookie } });
  return (
    <MucCaiDat title="Cách gọi" description="Tên sàn dùng trên Bảng hàng, bản phát hàng và trang khách" khoi>
      {res.ok ? (
        <CachGoi bo={(await res.json()) as BoNhanMan} />
      ) : (
        <TrangThai kind="error" title="Chưa đọc được cách gọi của sàn" description="Tải lại trang để thử lại." />
      )}
    </MucCaiDat>
  );
}
