import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getApi, readMe } from "@/lib/api";

import { chanMucSan, MUC_SAN } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { LuatChiaLead } from "./luat-chia-lead";
import type { BanCauHinh, BoNhomDangAp } from "./luat";

export const dynamic = "force-dynamic";

const DUONG = "/settings/lead-routing";

// Cài đặt sàn → mục chia lead (hàng 48, P11), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md). Thân là khối
// settings-3 đã chuyển thể có chân Hoàn lại · Lưu — khung MucCaiDat không chuyền chân nên đặt `khoi`. Máy chủ đọc ba thứ
// một lần khi dựng: cấu hình của sàn (lối chung, hàng 82), bộ nhóm Hôm nay đang áp (hàng 22) và danh bạ thành viên để ghi
// tên người đổi lần cuối. Đọc hỏng thì trao `null`, màn tự nói.
export default async function LuatChiaLeadPage() {
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
  const [cauHinh, boNhom, danhBa] = await Promise.all([
    doc<BanCauHinh>("/api/v1/company/settings"),
    doc<BoNhomDangAp>("/api/v1/company/settings/queue"),
    doc<{ id: string; name: string }[]>("/api/v1/company/member-names"),
  ]);
  const title = MUC_SAN.find((m) => m.href === DUONG)?.label ?? "Chia lead";

  return (
    <MucCaiDat title={title} description="Lead mới về tay ai, hạn bao lâu, khi nào căn vào hàng đợi gọi lại" khoi>
      {/* Tải hỏng rồi «Thử lại» được: đổi khoá để khối client dựng lại từ dữ liệu mới (trạng thái ban đầu chỉ đọc một lần). */}
      <LuatChiaLead
        key={cauHinh ? "co-cau-hinh" : "loi-tai"}
        tieuDe={title}
        cauHinh={cauHinh}
        boNhom={boNhom ? { source: boNhom.source } : null}
        tenNguoi={danhBa ? Object.fromEntries(danhBa.map((t) => [t.id, t.name])) : null}
      />
    </MucCaiDat>
  );
}
