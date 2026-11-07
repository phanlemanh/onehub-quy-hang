import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getApi, readMe } from "@/lib/api";

import { chanMucSan } from "../cai-dat";
import { MucCaiDat } from "../khung";
import { CHU, type DongTuDien, type TrangThaiTuDien } from "./tu-dien-thuan";
import { VungTuDien } from "./vung-tu-dien";

export const dynamic = "force-dynamic";

// Cài đặt sàn → Từ điển (hàng 70 chuan-hoa-moi-cua), dựng qua khuôn MucCaiDat (design/patterns/cai-dat-san.md): quản trị
// sàn duyệt hay bỏ cách gõ lạ người đã chọn khi nhập file, xem sức khoẻ dữ liệu. Người không quản trị về Cá nhân kèm câu
// báo trước khi đọc API.
export default async function TuDien() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  if (!me) redirect("/login");
  if (me.companies.length === 0) redirect("/no-company");
  if (!me.activeCompany) redirect("/select-company");
  const chan = chanMucSan(me.activeCompany.roles);
  if (chan) redirect(chan);
  const res = await Promise.resolve(getApi().request("http://quy-hang.local/api/v1/company/value-aliases", { headers: { cookie } })).catch(() => null);
  const tt: TrangThaiTuDien = res && res.ok ? { kieu: "xong", rows: ((await res.json()) as { rows: DongTuDien[] }).rows } : { kieu: "loi" };
  return (
    <MucCaiDat title={CHU.tieuDe} description={CHU.moTa}>
      <VungTuDien tt={tt} />
    </MucCaiDat>
  );
}
