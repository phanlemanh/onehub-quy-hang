/**
 * Ghép hàng với danh mục (hàng 14): bảng `listings` không có loại căn, diện tích, tầng, hướng — danh mục có. Khoá ghép là
 * toà + mã căn, không chỉ mã căn: hai toà có thể trùng mã (hàng 63). Thuần, kiểm bằng `node:test`.
 */
import type { CatalogData, CatalogUnitData } from "@quy-hang/core";
import type { ListingView } from "@/lib/sync/types";
import { CHUA_RO, type DongBang } from "./cot";

type ThuocTinhCan = { unitType: string; livingArea: number | null; floor: number | null; directionFaces: string | null };

const KHONG_CO: ThuocTinhCan = { unitType: CHUA_RO, livingArea: null, floor: null, directionFaces: null };
const chuan = (s: string) => s.trim().toLowerCase();
const khoa = (toa: string, ma: string) => `${chuan(toa)}\u0000${chuan(ma)}`;

/** «Studio» khi 0 phòng ngủ, «nPN» khi n — cách gọi của Sheet đầu chủ. */
export function nhanLoaiCan(bedroomsTotal: number | null): string {
  if (bedroomsTotal === null) return CHUA_RO;
  return bedroomsTotal === 0 ? "Studio" : `${bedroomsTotal}PN`;
}

export type ChiMucDanhMuc = Map<string, CatalogUnitData>;

export function chiMuc(catalog: CatalogData | null): ChiMucDanhMuc {
  const m: ChiMucDanhMuc = new Map();
  for (const p of catalog?.projects ?? []) for (const b of p.buildings) for (const u of b.units) m.set(khoa(b.buildingName, u.unitNumber), u);
  return m;
}

export function thuocTinhCan(idx: ChiMucDanhMuc, buildingName: string, unitNumber: string | null): ThuocTinhCan {
  const u = unitNumber ? idx.get(khoa(buildingName, unitNumber)) : undefined;
  if (!u) return KHONG_CO;
  return { unitType: nhanLoaiCan(u.bedroomsTotal), livingArea: u.livingArea, floor: u.floor, directionFaces: u.directionFaces };
}

function soNgay(f: unknown): { confirmedAgeDays: number | null; needsCallBack: boolean } {
  if (f && typeof f === "object" && "confirmed" in f && f.confirmed === true && "ageDays" in f) {
    return { confirmedAgeDays: Number(f.ageDays), needsCallBack: "needsCallBack" in f && f.needsCallBack === true };
  }
  return { confirmedAgeDays: null, needsCallBack: false };
}

function mucDu(c: unknown): number | null {
  return c && typeof c === "object" && "filled" in c && typeof c.filled === "number" ? c.filled : null;
}

/** Một hàng của kho trên máy thành một dòng của bảng. */
export function ghepDanhMuc(l: ListingView, idx: ChiMucDanhMuc): DongBang {
  return {
    id: l.id,
    buildingName: l.buildingName,
    unitNumber: l.unitNumber,
    ...thuocTinhCan(idx, l.buildingName, l.unitNumber),
    standardStatus: l.standardStatus,
    listPrice: l.listPrice,
    feeInclusion: l.feeInclusion,
    furnished: l.furnished,
    legalStatus: l.legalStatus,
    financing: l.financing,
    occupantType: l.occupantType,
    ...soNgay(l.freshness),
    completeness: mucDu(l.completeness),
    visibility: l.visibility ?? null,
    closePrice: l.closePrice,
    closeDate: l.closeDate,
    withdrawnReason: l.withdrawnReason,
  };
}
