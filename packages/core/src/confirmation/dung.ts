/**
 * Hàm dựng sự kiện «xác nhận danh mục» (hàng 95) — đường DUY NHẤT tạo `SuKienXacNhan`. Nhận lời sàn khai (giá trị người
 * nhập) cùng ngữ cảnh; từ chối, không lọc lặng, mọi khoá ngoài biểu mẫu của loại, mọi chuỗi ngoài dạng đóng, và mọi lời
 * gọi không có thoả thuận «Xác nhận danh mục» đang bật. Không trỏ tới hàng, lead, liên hệ, giá hay trạng thái.
 */
import type { Agreement } from "../agreements";
import { mayFlow } from "../agreements";
import { normalizeCode } from "../catalog/code-rule";
import type { CatalogBuildingData, CatalogData, CatalogUnitData } from "../catalog/types";
import { chuanHoaMaCan, docHuong, laMaTruc, MAU_MA_TOA, MAU_NGAY, MAU_UPI } from "./dang-dong";
import {
  CATALOG_CONFIRMATION_SCHEMA_VERSION,
  KHOA_RIENG,
  TRUONG_BAO_SAI,
  type BaoSai,
  type KhungToa,
  type LoaiSuKien,
  type ThuocTinhCan,
  type TruongBaoSai,
} from "./khuon";
import { KHOA_BEN_NHAN_TOI_THIEU, maMo } from "./ma-mo";

export type NguCanh = {
  thoaThuan: Agreement;
  danhMuc: CatalogData;
  khoaBenNhan: Uint8Array | undefined;
  companyId: string;
  userId: string;
  /** `YYYY-MM-DD` — lõi không đọc đồng hồ. */
  today: string;
};
export type Loi = { truong: string; thongDiep: string };
export type KetQua<T> = { ok: true; suKien: T } | { ok: false; loi: Loi[] };

/** Danh sách «không bao giờ có» của issue #94 — tên ở bảng lớp của luật ẩn. */
export const KHONG_BAO_GIO = ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto", "closePrice", "standardStatus"] as const;

const TANG_TOI_DA = 120;
const TRUC_TOI_DA = 60;

type Vo = {
  schemaVersion: typeof CATALOG_CONFIRMATION_SCHEMA_VERSION;
  officeKey: string;
  memberKey: string;
  observedOn: string;
};

const laSoNguyen = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v);
const laSoDuong = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v > 0;

function timToa(danhMuc: CatalogData, buildingKey: string): CatalogBuildingData | undefined {
  for (const s of danhMuc.subdivisions) for (const b of s.buildings) if (b.buildingKey === buildingKey) return b;
  return undefined;
}

/** Bước chung của ba loại: khoá lạ và thoả thuận trả ngay; còn lại gom lỗi. */
function kiemChung(
  loai: LoaiSuKien,
  dau: Readonly<Record<string, unknown>>,
  nc: NguCanh,
): { loi: Loi[]; vo?: Vo; toa?: CatalogBuildingData } {
  const khai = KHOA_RIENG[loai];
  const la = Object.keys(dau).filter((k) => !khai.includes(k));
  if (la.length > 0) {
    return {
      loi: la.map((k) => ({
        truong: k,
        thongDiep: (KHONG_BAO_GIO as readonly string[]).includes(k)
          ? `«${k}» không bao giờ rời sàn — sự kiện xác nhận không chở trường này.`
          : `«${k}» không thuộc biểu mẫu của loại ${loai}.`,
      })),
    };
  }
  const tt = nc.thoaThuan;
  const ngayHopLe = MAU_NGAY.test(nc.today) && !Number.isNaN(Date.parse(`${nc.today}T00:00:00Z`));
  const luong = ngayHopLe
    ? mayFlow(tt, "catalog", { at: new Date(`${nc.today}T00:00:00Z`), kind: "catalog_confirmation", direction: "outbound" })
    : { ok: false as const, reason: "ngày không hợp lệ" };
  if (tt.kind !== "catalog_confirmation" || !luong.ok) {
    return {
      loi: [{ truong: "thoaThuan", thongDiep: `Cần thoả thuận «Xác nhận danh mục» đang bật${luong.ok ? "" : `: ${luong.reason}`}` }],
    };
  }
  const loi: Loi[] = [];
  if (!nc.khoaBenNhan || nc.khoaBenNhan.length < KHOA_BEN_NHAN_TOI_THIEU) {
    loi.push({ truong: "khoaBenNhan", thongDiep: `Khoá bên nhận phải dài ít nhất ${KHOA_BEN_NHAN_TOI_THIEU} byte.` });
  }
  if (!nc.companyId) loi.push({ truong: "companyId", thongDiep: "Thiếu mã sàn." });
  if (!nc.userId) loi.push({ truong: "userId", thongDiep: "Thiếu mã người." });
  const buildingKey = dau["buildingKey"];
  const toa = typeof buildingKey === "string" && MAU_MA_TOA.test(buildingKey) ? timToa(nc.danhMuc, buildingKey) : undefined;
  if (!toa) loi.push({ truong: "buildingKey", thongDiep: "Toà không có trong danh mục dùng chung." });
  if (loi.length > 0 || !nc.khoaBenNhan) return { loi };
  return {
    loi,
    toa,
    vo: {
      schemaVersion: CATALOG_CONFIRMATION_SCHEMA_VERSION,
      officeKey: maMo(nc.khoaBenNhan, "office", nc.companyId),
      memberKey: maMo(nc.khoaBenNhan, "member", nc.userId),
      observedOn: nc.today,
    },
  };
}

/** Giá trị của một trường căn ở dạng chuẩn để so và để xuất; sai dạng thì `undefined`. */
function giaTriTruong(field: TruongBaoSai, v: unknown): number | string | undefined {
  switch (field) {
    case "unitNumber":
      return typeof v === "string" ? (chuanHoaMaCan(v) ?? undefined) : undefined;
    case "livingArea":
      return laSoDuong(v) ? v : undefined;
    case "bedroomsTotal":
      return laSoNguyen(v) && v >= 0 ? v : undefined;
    case "floor":
      return laSoNguyen(v) ? v : undefined;
    case "directionFaces":
      return typeof v === "string" ? (docHuong(v) ?? undefined) : undefined;
    case "stack": {
      if (typeof v !== "string") return undefined;
      const s = normalizeCode(v);
      return laMaTruc(s) ? s : undefined;
    }
  }
}

function giaTriDanhMuc(can: CatalogUnitData, field: TruongBaoSai): number | string | undefined {
  const v = can[field];
  return v === null ? undefined : giaTriTruong(field, v);
}

export type DauKhungToa = { buildingKey: string; storiesTotal: number; skippedFloors: number[]; stacks: string[] };

export function dungKhungToa(dau: DauKhungToa, nc: NguCanh): KetQua<KhungToa> {
  const { loi, vo } = kiemChung("building_frame", dau, nc);
  const { storiesTotal, skippedFloors, stacks } = dau;
  if (!laSoNguyen(storiesTotal) || storiesTotal < 1 || storiesTotal > TANG_TOI_DA) {
    loi.push({ truong: "storiesTotal", thongDiep: `Số tầng phải là số nguyên từ 1 đến ${TANG_TOI_DA}.` });
  }
  const tangHopLe =
    Array.isArray(skippedFloors) &&
    skippedFloors.every((t, i) => laSoNguyen(t) && t >= 1 && (!laSoNguyen(storiesTotal) || t <= storiesTotal) && (i === 0 || t > (skippedFloors[i - 1] ?? 0)));
  if (!tangHopLe) loi.push({ truong: "skippedFloors", thongDiep: "Tầng bị bỏ phải là số nguyên tăng dần, không trùng, trong số tầng của toà." });
  const truc = Array.isArray(stacks) ? stacks.map((s) => (typeof s === "string" ? normalizeCode(s) : "")) : [];
  const trucHopLe =
    truc.length >= 1 && truc.length <= TRUC_TOI_DA && truc.every(laMaTruc) && new Set(truc).size === truc.length;
  if (!trucHopLe) loi.push({ truong: "stacks", thongDiep: `Danh sách trục phải có 1–${TRUC_TOI_DA} mã trục không trùng.` });
  if (loi.length > 0 || !vo) return { ok: false, loi };
  const suKien = { ...vo, eventType: "building_frame", buildingKey: dau.buildingKey, storiesTotal, skippedFloors: [...skippedFloors], stacks: truc };
  return { ok: true, suKien: thuTu("building_frame", suKien) as KhungToa };
}

export type DauThuocTinhCan = {
  buildingKey: string;
  upi: string | null;
  unitNumber: string;
  livingArea?: number;
  bedroomsTotal?: number;
  directionFaces?: string;
  floor?: number;
  stack?: string;
};

const TRUONG_KHAI_CAN = ["livingArea", "bedroomsTotal", "directionFaces", "floor", "stack"] as const;

export function dungThuocTinhCan(dau: DauThuocTinhCan, nc: NguCanh): KetQua<ThuocTinhCan> {
  const { loi, vo, toa } = kiemChung("unit_attributes", dau, nc);
  const unitNumber = giaTriTruong("unitNumber", dau.unitNumber);
  if (unitNumber === undefined) loi.push({ truong: "unitNumber", thongDiep: "Mã căn ngoài dạng đóng (chữ hoa, số, dấu nối; không câu, không số điện thoại)." });
  if (dau.upi !== null && (typeof dau.upi !== "string" || !MAU_UPI.test(dau.upi) || (toa && !toa.units.some((u) => u.upi === dau.upi)))) {
    loi.push({ truong: "upi", thongDiep: "UPI không phải căn của toà này trong danh mục." });
  }
  const gt: Record<string, number | string> = {};
  for (const k of TRUONG_KHAI_CAN) {
    if (dau[k] === undefined) continue;
    const v = giaTriTruong(k, dau[k]);
    if (v === undefined) loi.push({ truong: k, thongDiep: `Giá trị «${k}» ngoài dạng đóng.` });
    else gt[k] = v;
  }
  if (TRUONG_KHAI_CAN.every((k) => dau[k] === undefined)) loi.push({ truong: "dau", thongDiep: "Cần ít nhất một giá trị sàn khai." });
  if (loi.length > 0 || !vo) return { ok: false, loi };
  const suKien = { ...vo, eventType: "unit_attributes", buildingKey: dau.buildingKey, upi: dau.upi, unitNumber, ...gt };
  return { ok: true, suKien: thuTu("unit_attributes", suKien) as ThuocTinhCan };
}

export type DauBaoSai = { buildingKey: string; upi: string; field: TruongBaoSai; correctValue: string | number };

export function dungBaoSai(dau: DauBaoSai, nc: NguCanh): KetQua<BaoSai> {
  const { loi, vo, toa } = kiemChung("correction", dau, nc);
  const can = toa?.units.find((u) => u.upi === dau.upi);
  if (toa && !can) loi.push({ truong: "upi", thongDiep: "Căn không có trong danh mục — chỉ báo sai được căn đã có." });
  const field = (TRUONG_BAO_SAI as readonly string[]).includes(dau.field) ? dau.field : undefined;
  if (!field) loi.push({ truong: "field", thongDiep: `Chỉ báo sai được: ${TRUONG_BAO_SAI.join(", ")}.` });
  const correctValue = field ? giaTriTruong(field, dau.correctValue) : undefined;
  if (field && correctValue === undefined) loi.push({ truong: "correctValue", thongDiep: `Giá trị đúng sai kiểu hay ngoài dạng đóng của «${field}».` });
  if (field && can && correctValue !== undefined && giaTriDanhMuc(can, field) === correctValue) {
    loi.push({ truong: "correctValue", thongDiep: "Giá trị trùng danh mục — không phải báo sai." });
  }
  if (loi.length > 0 || !vo || !field || correctValue === undefined) return { ok: false, loi };
  const suKien = { ...vo, eventType: "correction", buildingKey: dau.buildingKey, upi: dau.upi, field, correctValue };
  return { ok: true, suKien: thuTu("correction", suKien) as BaoSai };
}

/** Thứ tự khoá xuất cố định: vỏ rồi phần riêng theo `KHOA_RIENG` — tệp ví dụ ổn định từng byte. */
function thuTu(loai: LoaiSuKien, o: Record<string, unknown>): Record<string, unknown> {
  const ra: Record<string, unknown> = {};
  for (const k of ["schemaVersion", "eventType", "officeKey", "memberKey", "observedOn", ...KHOA_RIENG[loai]]) {
    if (o[k] !== undefined) ra[k] = o[k];
  }
  return ra;
}
