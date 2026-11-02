import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { TrangThai } from "@/components/trang-thai";
import { getApi, readMe } from "@/lib/api";

import { MucCaiDat } from "../khung";
import { QuanNguoi, type Khu, type ThanhVien } from "./quan-nguoi";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Người dùng (S6, hàng 7), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md). Thân là khối Pro
// solution-users-8 đã chuyển (hàng 91, components/khoi/solution-users-8/) — mang Frame riêng nên đặt `khoi`.
export default async function NguoiDung() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const api = getApi();
  const res = await api.request("http://quy-hang.local/api/v1/company/members", { headers: { cookie } });
  return (
    <MucCaiDat title="Người dùng" description={`Người của sàn ${me.activeCompany.name}`} khoi>
      {res.status === 403 ? (
        <TrangThai kind="notice" title="Chỉ quản trị sàn xem được trang này." />
      ) : (
        <QuanNguoi
          thanhVien={(await res.json()) as ThanhVien[]}
          khu={(await (await api.request("http://quy-hang.local/api/v1/company/zones", { headers: { cookie } })).json()) as Khu[]}
          toi={me.user.id}
        />
      )}
    </MucCaiDat>
  );
}
