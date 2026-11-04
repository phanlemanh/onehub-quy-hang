import { headers } from "next/headers";

import { BO_NHOM_MAC_DINH } from "@quy-hang/core/today";

import { Frame, FramePanel } from "@/components/reui/frame";
import { Placeholder } from "@/components/shell/placeholder";
import { TrangThai } from "@/components/trang-thai";
import { readMe } from "@/lib/api";

import { KhungLeadCuaToi } from "../leads/mine/khung";
import { LeadDaNhapThat } from "../leads/mine/nguon-that";
import VungDauKhach from "./buyer/vung";
import { DaiBatThongBao } from "./dai-bat";
import { HomNayDauChu } from "./hom-nay-dau-chu";
import { KhungHomNay } from "./khung";
import { baoNgoaiDauChu, docNhomThamSo } from "./mo-nhom";
import HomNayTruongNhom from "./truong-nhom";
import { vungTheoVai } from "./truong-nhom-trang-thai";

export const dynamic = "force-dynamic";

// Hôm nay theo vai (Tham chiếu §10), vùng xếp bằng `vungTheoVai`: Trưởng nhóm thấy bảng điều khiển trên cùng (hàng 42,
// khuôn KhungTruongNhom); Đầu chủ thấy Hôm nay của đầu chủ (hàng 22) — người có cả hai vai thấy hàng đợi của mình dưới
// bảng điều khiển; telesales thấy vùng «Lead đã nhập» (hàng 27, khuôn KhungLeadCuaToi) sau vùng đầu chủ; vai khác giữ chỗ
// tạm. Dải bật thông báo lead (hàng 26) đứng đầu cho đầu chủ và trưởng nhóm. Người không có vai Đầu chủ mở một hàng đợi
// từ cột thứ hai thì đầu màn báo một dòng (va-he-bo-cuc, Hỏi-1: báo rõ) — cột liệt bộ nhóm mặc định nên dòng báo đọc nhãn
// từ cùng bộ ấy.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await readMe((await headers()).get("cookie") ?? "");
  const vai = me?.activeCompany?.roles ?? [];
  const dauChu = me?.activeCompany && vai.includes("listing_agent") ? { nguoi: me.user.id, san: me.activeCompany.id } : null;
  const vung = vungTheoVai(vai);
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
      {vung.map((v) =>
        v === "truong-nhom" ? (
          <HomNayTruongNhom key={v} />
        ) : v === "dau-chu" && dauChu ? (
          <HomNayDauChu key={v} nguoi={dauChu.nguoi} san={dauChu.san} />
        ) : v === "telesales" ? (
          <KhungLeadCuaToi key={v}>
            <LeadDaNhapThat />
          </KhungLeadCuaToi>
        ) : v === "dau-khach" ? (
          <VungDauKhach key={v} />
        ) : null,
      )}
      {vung.length === 0 ? <Placeholder path="/today" trongKhung /> : null}
    </KhungHomNay>
  );
}
