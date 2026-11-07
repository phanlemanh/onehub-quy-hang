import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getApi, readMe } from "@/lib/api";

import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { CHU, type CotMauNhap, type TrangThaiMau } from "./mau-nhap";
import { VungMauNhap } from "./vung-mau-nhap";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Mẫu nhập (hàng 50 mau-nhap-va-bai), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md): Quản trị
// sàn xem, sửa, xoá từng cột Excel đã nhớ. Người không quản trị về Cá nhân kèm câu báo trước khi đọc API.
export default async function MauNhap() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  const res = await Promise.resolve(getApi().request("http://quy-hang.local/api/v1/company/import-templates", { headers: { cookie } })).catch(() => null);
  const tt: TrangThaiMau = res && res.ok ? { kieu: "xong", ds: (await res.json()) as CotMauNhap[] } : { kieu: "loi" };
  return (
    <MucCaiDat title={CHU.tieuDe} description={CHU.moTa}>
      <VungMauNhap tt={tt} />
    </MucCaiDat>
  );
}
