import { settingsLanding } from "@quy-hang/core";
import { TU_VUNG_RONG } from "@quy-hang/core/labels";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Placeholder } from "@/components/shell/placeholder";
import { readMe } from "@/lib/api";

import { docTuVung } from "../inventory/doc-tu-vung";
import { TuVungProvider } from "../inventory/tu-vung";
import { DaiBatThongBao } from "./dai-bat";
import { HomNayDanhSach } from "./hom-nay";
import { KhungHomNay } from "./khung";

export const dynamic = "force-dynamic";

// Hôm nay — một danh sách việc của mọi vai (hồ sơ hom-nay-mot-danh-sach-viec). Phần theo dõi ở nhà của nó: bảng theo đầu
// chủ ở Đội, Lead đã nhập ở trang riêng, tin 7 ngày ở Đã gửi. Người chỉ giữ vai Quản trị không có việc ở đây, về Cài đặt.
export default async function Page() {
  const cookie = (await headers()).get("cookie") ?? "";
  const me = await readMe(cookie);
  const vai = me?.activeCompany?.roles ?? [];
  if (me?.activeCompany && vai.length > 0 && vai.every((r) => r === "company_admin")) redirect(settingsLanding(vai));
  // Từ vựng của sàn cho nhãn trạng thái và tên nhóm; đọc hỏng là chữ mặc định.
  const tv = me?.activeCompany ? await docTuVung(cookie).catch(() => TU_VUNG_RONG) : TU_VUNG_RONG;
  return (
    <KhungHomNay>
      {me?.activeCompany && vai.length > 0 ? (
        <>
          {vai.includes("listing_agent") || vai.includes("team_lead") ? <DaiBatThongBao /> : null}
          <TuVungProvider tuVung={tv}>
            <HomNayDanhSach vai={vai} nguoi={me.user.id} san={me.activeCompany.id} nhan={tv.trangThai} tv={tv} />
          </TuVungProvider>
        </>
      ) : (
        <Placeholder path="/today" trongKhung />
      )}
    </KhungHomNay>
  );
}
