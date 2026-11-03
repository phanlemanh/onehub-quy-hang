/**
 * Bộ chuyển bộ dữ liệu mẫu của hàng 5 (`packages/db/seed/mau/du-lieu-mau.json`) thành đầu vào số đo — chỉ cho ca kiểm. Mỗi
 * hàng mẫu thành đúng chuỗi lệnh bộ nạp bản thật ghi (`packages/db/seed/nap-ban-that.ts`, hàm `napTrongSo`); ca kiểm «bộ
 * chuyển theo bộ nạp» so thứ tự lời gọi `lenh` của hai tệp. Lead mẫu thành dữ kiện lead với kết quả kiểm trùng tính bằng
 * `decideOutcome` như `createLead`; số chủ của lead mẫu chỉ dùng ở đây để so chủ trùng, không vào đầu vào số đo.
 * Bộ nạp ghi giờ lúc nạp; ở đây giờ bắt đầu truyền vào, mỗi lệnh sau lệnh trước một phút.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "../catalog/types";
import { decideOutcome, OPEN_STATUSES } from "../dedupe";
import { confirmsWithOwner, type EventType, type ListingEvent } from "../listing/events";
import { WITHDRAWN_REASONS, type StandardStatus } from "../listing/status";
import type { HangVao, LeadVao } from "./kieu";

export const DUONG_MAU = fileURLToPath(new URL("../../../db/seed/mau/du-lieu-mau.json", import.meta.url));
export const DUONG_BO_NAP = fileURLToPath(new URL("../../../db/seed/nap-ban-that.ts", import.meta.url));

type GoiMau = {
  danhMuc: CatalogData;
  chuNha: { ma: string; soDienThoai: string; dauChu: string }[];
  hang: { ma: string; maCan: string; upi: string; trangThai: StandardStatus; gia: number; dieuKienPhi: string; dauChu: string; chuNha: string }[];
  lead: { ma: string; toa: string; maCan: string | null; soDienThoai: string }[];
};

/** Hằng của bộ nạp — giữ đúng chữ của `nap-ban-that.ts`. */
const CHI_TIET_DANG_BAN = { legalStatus: "Sổ hồng", occupantType: "Chủ ở" };
const NGAY_CHOT = "2026-10-30";
const PHI: Record<string, string> = { bao_phi: "included", khong_bao_phi: "excluded" };
const MO = new Set<StandardStatus>(OPEN_STATUSES);

export const docGoiMau = (): GoiMau => JSON.parse(readFileSync(DUONG_MAU, "utf8")) as GoiMau;

export type BoMau = { hang: HangVao[]; lead: LeadVao[]; danhMuc: CatalogData; maCuaHang: Map<string, string> };

/** Bộ mẫu chuyển thành đầu vào. `batDau`: giờ của lệnh đầu tiên (ISO). Mã hàng là `H-xx`, mã lead là `L-xx` của gói. */
export function boMau(batDau: string, goi: GoiMau = docGoiMau()): BoMau {
  let phut = 0;
  const luc = () => new Date(Date.parse(batDau) + phut++ * 60_000).toISOString();
  const toaCuaCan = new Map<string, string>();
  const toaTheoKhoa = new Map<string, string>();
  for (const s of goi.danhMuc.subdivisions) {
    for (const t of s.buildings) {
      toaTheoKhoa.set(t.buildingKey, t.buildingName);
      for (const c of t.units) toaCuaCan.set(c.upi, t.buildingName);
    }
  }

  const hang: HangVao[] = [];
  const maCuaHang = new Map<string, string>();
  let thuTuNgung = 0;
  for (const h of goi.hang) {
    const buildingName = toaCuaCan.get(h.upi);
    if (!buildingName) throw new Error(`${h.ma}: căn không có trong danh mục`);
    const events: ListingEvent[] = [];
    const ghi = (type: EventType, payload: Record<string, unknown>) =>
      events.push({ seq: events.length + 1, type, payload, actorUserId: h.dauChu, actorRoles: ["listing_agent"], confirmedWithOwner: confirmsWithOwner(type), occurredAt: luc() });
    // Bộ nạp tạo hàng bằng createListing, rồi mỗi lệnh sau bằng `lenh` — đổi chuỗi `lenh` ở đây thì đổi cùng thứ tự ở bộ nạp
    // (ca kiểm «bộ chuyển theo bộ nạp»).
    ghi("created", { buildingName, unitNumber: h.maCan });
    const lenh = ghi;
    lenh("price_changed", { listPrice: h.gia, feeInclusion: PHI[h.dieuKienPhi] });
    if (h.trangThai === "Withdrawn") {
      lenh("status_changed", { to: "Withdrawn", withdrawnReason: WITHDRAWN_REASONS[thuTuNgung++ % WITHDRAWN_REASONS.length] });
    } else if (h.trangThai !== "Incomplete") {
      lenh("details_changed", CHI_TIET_DANG_BAN);
      lenh("status_changed", { to: "Active" });
      if (h.trangThai === "Closed") lenh("status_changed", { to: "Closed", closePrice: h.gia, closeDate: NGAY_CHOT });
      else if (h.trangThai !== "Active") lenh("status_changed", { to: h.trangThai });
    }
    hang.push({ id: h.ma, events });
    maCuaHang.set(h.maCan, h.ma);
  }

  // Lead nạp sau mọi hàng, như bộ nạp: kiểm trùng thấy hàng mở và chủ nhà đã có.
  const dauChuTheoSo = new Map<string, string>();
  for (const h of goi.hang) {
    const cn = goi.chuNha.find((c) => c.ma === h.chuNha);
    if (cn && !dauChuTheoSo.has(cn.soDienThoai)) dauChuTheoSo.set(cn.soDienThoai, h.dauChu);
  }
  const lead: LeadVao[] = goi.lead.map((l) => {
    const buildingName = toaTheoKhoa.get(l.toa);
    const mo = goi.hang.find((h) => MO.has(h.trangThai) && toaCuaCan.get(h.upi) === buildingName && h.maCan === l.maCan);
    const kq = decideOutcome({
      openListing: mo ? { listingId: mo.ma, agentUserId: mo.dauChu } : null,
      ownerAgentUserId: dauChuTheoSo.get(l.soDienThoai) ?? null,
    });
    return {
      id: l.ma,
      createdAt: luc(),
      unitNumber: l.maCan,
      outcome: kq.outcome,
      matchedAgentUserId: kq.agentUserId,
      routedAt: null,
      acceptedAt: null,
      firstCalledAt: null,
      boardAt: null,
      returnedAt: null,
      resubmittedAt: null,
      discardedAt: null,
    };
  });
  return { hang, lead, danhMuc: goi.danhMuc, maCuaHang };
}

/** Thứ tự loại lệnh của các lời gọi `lenh` trong một tệp nguồn — bộ nạp viết `lenh({ type: "…"`, bộ chuyển viết `lenh("…"`. */
export function thuTuLenh(nguon: string): string[] {
  return [...nguon.matchAll(/\blenh\(\s*(?:\{\s*type:\s*)?"([a-z_]+)"/g)].map((m) => m[1]!);
}
