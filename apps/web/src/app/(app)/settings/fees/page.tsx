import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getApi, readMe } from "@/lib/api";

import { chanMucSan, MUC_SAN } from "../cai-dat";
import { MucCaiDat } from "../khung";
import type { BanCauHinh } from "../lead-routing/luat";
import { BangThuePhi } from "./bang-thue-phi";

export const dynamic = "force-dynamic";

const DUONG = "/settings/fees";

// Cài đặt sàn → mục Thuế phí (hàng 49, P12), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md) như mục chia lead.
// Máy chủ đọc hai thứ một lần khi dựng: cấu hình của sàn (lối chung, hàng 82) và danh bạ thành viên để ghi tên người đổi
// lần cuối. Đọc hỏng thì trao `null`, màn tự nói.
export default async function ThuePhiPage() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);

  const api = getApi();
  const doc = async <T,>(duong: string): Promise<T | null> => {
    try {
      const r = await api.request(`http://quy-hang.local${duong}`, { headers: { cookie } });
      return r.ok ? ((await r.json()) as T) : null;
    } catch {
      return null;
    }
  };
  const [cauHinh, danhBa] = await Promise.all([doc<BanCauHinh>("/api/v1/company/settings"), doc<{ id: string; name: string }[]>("/api/v1/company/member-names")]);
  const title = MUC_SAN.find((m) => m.href === DUONG)?.label ?? "Thuế phí";

  return (
    <MucCaiDat title={title} description="Tỉ lệ trừ khỏi giá bao phí và khoản nào tính là bao phí" khoi>
      <BangThuePhi
        key={cauHinh ? "co-cau-hinh" : "loi-tai"}
        tieuDe={title}
        cauHinh={cauHinh}
        tenNguoi={danhBa ? Object.fromEntries(danhBa.map((t) => [t.id, t.name])) : null}
      />
    </MucCaiDat>
  );
}
