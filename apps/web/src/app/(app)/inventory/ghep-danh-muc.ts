/**
 * Ghép hàng với danh mục (hàng 14): bảng `listings` không có loại căn, diện tích, tầng, hướng — danh mục có. Khoá ghép là
 * toà + mã căn, không chỉ mã căn: hai toà có thể trùng mã (hàng 63). Hàng 79: hàng lô tra danh mục dãy bằng chính hàm đọc lô
 * của lõi (`buildLotIndex` / `lookupLot`), hàng ngoài khu tra căn ngoài khu của sàn; trường loại hình không dùng là `null`
 * («không có», ADR-0016 quyết định 2). Thuần, kiểm bằng `node:test`.
 */
import { buildLotIndex, lookupLot, type CatalogData, type CatalogUnitData, type LotIndex } from "@quy-hang/core";
import { nhanViTri } from "@quy-hang/core/listing";
import type { ListingView } from "@/lib/sync/types";
import { CHUA_RO, chuDauChu, type DanhBaDauChu, type DongBang } from "./cot";
import { laKhongDung, loaiDungCot } from "./loai-hinh";

type ThuocTinhCan = {
  unitType: string;
  livingArea: number | null;
  floor: number | null;
  directionFaces: string | null;
  /** RESO `PropertySubType` của căn — điều kiện loại hình của hàng đợi Hôm nay (hàng 22); không thấy nguồn là `null`. */
  propertySubType: string | null;
  lotSizeArea: number | null;
  storiesTotal: number | null;
  frontageLength: number | null;
  accessRoadWidth: number | null;
};

const KHONG_CO: ThuocTinhCan = {
  unitType: CHUA_RO,
  livingArea: null,
  floor: null,
  directionFaces: null,
  propertySubType: null,
  lotSizeArea: null,
  storiesTotal: null,
  frontageLength: null,
  accessRoadWidth: null,
};

/** Một căn ngoài khu của sàn như `GET /api/v1/off-compound-units` trả (hàng 79). */
export type CanNgoaiKhuXem = { id: string; propertySubType: string; unparsedAddress: string };
const chuan = (s: string) => s.trim().toLowerCase();
const khoa = (toa: string, ma: string) => `${chuan(toa)}\u0000${chuan(ma)}`;

/** «Studio» khi 0 phòng ngủ, «nPN» khi n — cách gọi của Sheet đầu chủ. */
export function nhanLoaiCan(bedroomsTotal: number | null): string {
  if (bedroomsTotal === null) return CHUA_RO;
  return bedroomsTotal === 0 ? "Studio" : `${bedroomsTotal}PN`;
}

/**
 * Chỉ mục toà + mã căn (Map như trước — chỗ khác đọc `get` trực tiếp), mang thêm chỉ mục lô của lõi và căn ngoài khu theo
 * mã (hàng 79). Danh mục lô sai loại hình làm `buildLotIndex` ném — khi ấy không có chỉ mục lô, hàng lô «Chưa rõ».
 */
export type ChiMucDanhMuc = Map<string, CatalogUnitData> & { lo?: LotIndex | null; ngoaiKhu?: ReadonlyMap<string, CanNgoaiKhuXem> };

export function chiMuc(catalog: CatalogData | null, ngoaiKhu?: readonly CanNgoaiKhuXem[] | null): ChiMucDanhMuc {
  const m: ChiMucDanhMuc = new Map();
  for (const p of catalog?.subdivisions ?? []) for (const b of p.buildings) for (const u of b.units) m.set(khoa(b.buildingName, u.unitNumber), u);
  const coDay = (catalog?.subdivisions ?? []).some((p) => (p.blocks ?? []).length > 0);
  try {
    m.lo = coDay && catalog ? buildLotIndex(catalog) : null;
  } catch {
    m.lo = null;
  }
  m.ngoaiKhu = new Map((ngoaiKhu ?? []).map((c) => [c.id, c]));
  return m;
}

/** Giá trị trường của nguồn khi loại hình dùng trường ấy; không dùng → `null` («không có»). */
function truong(sub: string, cot: string, v: number | null | undefined): number | null {
  return loaiDungCot(sub, cot) ? (v ?? null) : null;
}

function tuNguon(
  sub: string,
  u: { bedroomsTotal?: number | null; livingArea?: number | null; floor?: number | null; directionFaces?: string | null; lotSizeArea?: number | null; storiesTotal?: number | null; frontageLength?: number | null; accessRoadWidth?: number | null },
): ThuocTinhCan {
  return {
    unitType: laKhongDung({ propertySubType: sub }, "unitType") ? "" : nhanLoaiCan(u.bedroomsTotal ?? null),
    livingArea: truong(sub, "livingArea", u.livingArea),
    floor: truong(sub, "floor", u.floor),
    directionFaces: laKhongDung({ propertySubType: sub }, "directionFaces") ? null : (u.directionFaces ?? null),
    propertySubType: sub,
    lotSizeArea: truong(sub, "lotSizeArea", u.lotSizeArea),
    storiesTotal: truong(sub, "storiesTotal", u.storiesTotal),
    frontageLength: truong(sub, "frontageLength", u.frontageLength),
    accessRoadWidth: truong(sub, "accessRoadWidth", u.accessRoadWidth),
  };
}

/**
 * Thuộc tính căn của một hàng theo dạng: có toà → danh mục toà; lô → danh mục dãy (lõi); ngoài khu → căn của sàn (chỉ loại
 * hình; trường thấp tầng chưa có chỗ lưu nên «chưa rõ»). Không thấy nguồn → «Chưa rõ».
 */
export function thuocTinhHang(idx: ChiMucDanhMuc, l: Pick<ListingView, "buildingName" | "unitNumber" | "subdivisionName" | "blockName" | "offCompoundUnitId">): ThuocTinhCan {
  if (l.buildingName) return thuocTinhCan(idx, l.buildingName, l.unitNumber);
  if ((l.blockName || l.subdivisionName) && l.unitNumber && idx.lo) {
    const khu = idx.lo.subdivisions.find((s) => chuan(s.subdivisionName) === chuan(l.subdivisionName ?? ""));
    const kq = khu ? lookupLot(idx.lo, l.unitNumber, khu.subdivisionKey) : null;
    return kq?.status === "found" ? tuNguon(kq.unit.propertySubType, kq.unit) : KHONG_CO;
  }
  const c = l.offCompoundUnitId ? idx.ngoaiKhu?.get(l.offCompoundUnitId) : undefined;
  return c ? tuNguon(c.propertySubType, {}) : KHONG_CO;
}

export function thuocTinhCan(idx: ChiMucDanhMuc, buildingName: string, unitNumber: string | null): ThuocTinhCan {
  const u = unitNumber ? idx.get(khoa(buildingName, unitNumber)) : undefined;
  if (!u) return KHONG_CO;
  // Danh mục máy khách cũ có thể chưa mang loại hình — khi vắng giữ đúng dòng cũ (căn hộ), không đoán trường thấp tầng.
  if (!u.propertySubType) return { ...KHONG_CO, unitType: nhanLoaiCan(u.bedroomsTotal), livingArea: u.livingArea, floor: u.floor, directionFaces: u.directionFaces };
  return tuNguon(u.propertySubType, u);
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

/** Mục ảnh của mức đủ (anh-khong-chan-ban): chỉ khi bản xem mang tổng khác năm — dòng của bản xem đời trước giữ nguyên. */
function mucAnh(c: unknown): Pick<DongBang, "mucDuTong" | "thieuAnh"> {
  if (!c || typeof c !== "object" || !("total" in c) || typeof c.total !== "number" || c.total === 5) return {};
  const thieu = "missing" in c && Array.isArray(c.missing) && c.missing.includes("photos");
  return { mucDuTong: c.total, ...(thieu && { thieuAnh: true }) };
}

/**
 * Một hàng của kho trên máy thành một dòng của bảng. Bảng hàng trao `danhBa` (kể cả `null` khi chưa đọc được) để có cột
 * «Đầu chủ»; chỗ khác (Hôm nay, bảng thẻ) không trao thì dòng không có cột ấy.
 */
import { oRiengCuaHang } from "./truong-rieng";

export function ghepDanhMuc(l: ListingView, idx: ChiMucDanhMuc, danhBa?: DanhBaDauChu): DongBang {
  return {
    id: l.id,
    // Hàng lô: «Khu · Dãy»; hàng ngoài khu: địa chỉ đã gõ của căn (Hỏi-1 hàng 79), vắng căn thì chữ chỗ của lõi.
    buildingName: (l.offCompoundUnitId && idx.ngoaiKhu?.get(l.offCompoundUnitId)?.unparsedAddress) || nhanViTri(l),
    unitNumber: l.unitNumber,
    // Hàng không toà mở hồ sơ theo hàng (hàng 79); hàng có toà giữ đúng dòng cũ.
    ...(l.buildingName ? {} : { theoHang: true }),
    ...thuocTinhHang(idx, l),
    standardStatus: l.standardStatus,
    // Nhãn trạng thái riêng (hàng 46): chỉ khi căn mang — căn không nhãn giữ đúng dòng cũ.
    ...(l.statusLabel ? { statusLabel: l.statusLabel } : {}),
    listPrice: l.listPrice,
    feeInclusion: l.feeInclusion,
    furnished: l.furnished,
    legalStatus: l.legalStatus,
    financing: l.financing,
    occupantType: l.occupantType,
    ...soNgay(l.freshness),
    completeness: mucDu(l.completeness),
    ...mucAnh(l.completeness),
    visibility: l.visibility ?? null,
    closePrice: l.closePrice,
    closeDate: l.closeDate,
    withdrawnReason: l.withdrawnReason,
    ...(danhBa !== undefined ? { "dau-chu": chuDauChu(l.listAgentKey, danhBa) } : {}),
    // Trường riêng của sàn (hàng 47): căn không mang giá trị nào giữ đúng dòng cũ.
    ...oRiengCuaHang(l.custom),
  };
}
