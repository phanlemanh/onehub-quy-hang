import { headers } from "next/headers";

import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";

import { Frame, FramePanel } from "@/components/reui/frame";
import { Placeholder } from "@/components/shell/placeholder";
import { TrangThai } from "@/components/trang-thai";
import { readMe } from "@/lib/api";

import { KhungLeadCuaToi } from "../leads/mine/khung";
import { LeadDaNhapThat } from "../leads/mine/nguon-that";
import { DaiBatThongBao } from "./dai-bat";
import { HomNayDauChu } from "./hom-nay-dau-chu";
import { KhungHomNay } from "./khung";
import { baoNgoaiDauChu, docNhomThamSo } from "./mo-nhom";

export const dynamic = "force-dynamic";

// Hôm nay theo vai (Tham chiếu §10): Đầu chủ thấy Hôm nay của đầu chủ (hàng 22, khuôn KhungHomNay); telesales thấy vùng
// «Lead đã nhập» (hàng 27, khuôn KhungLeadCuaToi) — người hai vai thấy cả hai, đầu chủ trước; vai khác giữ chỗ tạm tới
// Hôm nay của trưởng nhóm (hàng 42). Dải bật thông báo lead (hàng 26) đứng đầu cho đầu chủ và trưởng nhóm — trưởng nhóm
// thấy dải cả khi đang ở trang giữ chỗ. Người không có vai Đầu chủ mở một hàng đợi từ cột thứ hai thì đầu màn báo một
// dòng (va-he-bo-cuc, Hỏi-1: báo rõ) — cột liệt bộ nhóm mặc định nên dòng báo đọc nhãn từ cùng bộ ấy.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  const vai = me?.activeCompany?.roles ?? [];
  const dauChu = me?.activeCompany && vai.includes("listing_agent") ? { nguoi: me.user.id, san: me.activeCompany.id } : null;
  const telesales = vai.includes("telesales");
  const nhanDay = Boolean(me?.activeCompany) && (vai.includes("listing_agent") || vai.includes("team_lead"));
  const q = await searchParams;
  const thamSo = new URLSearchParams(Object.entries(q).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
  const bao = dauChu ? null : baoNgoaiDauChu(docNhomThamSo(thamSo), BO_NHOM_MAC_DINH);
  return (
    <KhungHomNay>
      {bao ? (
        <Frame stacked className="w-full min-w-0">
          <FramePanel className="p-0!">
            <TrangThai kind="notice" title={bao} />
          </FramePanel>
        </Frame>
      ) : null}
      {nhanDay ? <DaiBatThongBao /> : null}
      {dauChu ? <HomNayDauChu nguoi={dauChu.nguoi} san={dauChu.san} /> : null}
      {telesales ? (
        <KhungLeadCuaToi>
          <LeadDaNhapThat />
        </KhungLeadCuaToi>
      ) : null}
      {!dauChu && !telesales ? <Placeholder path="/today" trongKhung /> : null}
    </KhungHomNay>
  );
}
