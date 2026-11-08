/**
 * Khuôn sự kiện «xác nhận danh mục» phiên bản 1 (hàng 95, ADR-0027; ADR-0017 §6 sửa đổi 03/11 của Invest): ba loại sự
 * kiện, mỗi sự kiện chỉ chở lớp danh mục, kèm mã sàn và mã người mờ. Đây là nguồn DUY NHẤT của hằng khuôn — khuôn zod ở
 * `packages/connect/src/catalog-confirmation.ts` nhập từ đây, không chép.
 */
import type { DataClass } from "../data-classes";
import type { KhoaCanNoiBo } from "../redaction/lop-truong";

export const CATALOG_CONFIRMATION_SCHEMA_VERSION = 1;

export const LOAI_SU_KIEN = ["building_frame", "unit_attributes", "correction"] as const;
export type LoaiSuKien = (typeof LOAI_SU_KIEN)[number];

/** Sáu trường báo sai được — giữ cứng (Cổng Phạm vi Hỏi-4): nghĩa chuẩn để so giữa các sàn. */
export const TRUONG_BAO_SAI = ["unitNumber", "livingArea", "bedroomsTotal", "directionFaces", "floor", "stack"] as const;
export type TruongBaoSai = (typeof TRUONG_BAO_SAI)[number];

/** Lookup `DirectionFaces` của RESO — sự kiện luôn ra giá trị này. */
export const HUONG_RESO = ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"] as const;
export type Huong = (typeof HUONG_RESO)[number];

/** Khoá vỏ — danh sách đóng riêng của khuôn (ADR-0017 §6 cho đúng hai mã mờ). */
export const KHOA_VO = ["schemaVersion", "eventType", "officeKey", "memberKey", "observedOn"] as const;

/** Khoá phần riêng của từng loại, đúng thứ tự xuất — thêm khoá ở đây là đổi khuôn, bài kiểm ghim danh sách này. */
export const KHOA_RIENG: Readonly<Record<LoaiSuKien, readonly string[]>> = {
  building_frame: ["buildingKey", "storiesTotal", "skippedFloors", "stacks"],
  unit_attributes: ["buildingKey", "upi", "unitNumber", "livingArea", "bedroomsTotal", "directionFaces", "floor", "stack"],
  correction: ["buildingKey", "upi", "field", "correctValue"],
};

/** Lớp của ba khoá cấp toà chưa có ở bảng lớp của luật ẩn (`LOP_TRUONG` khoá theo một căn, không theo toà). */
export const LOP_TRUONG_KHUON: Readonly<Record<string, DataClass>> = {
  buildingKey: "catalog",
  skippedFloors: "catalog",
  stacks: "catalog",
};

/** Khoá phần riêng → khoá của `LOP_TRUONG` mà nó chở; `field`/`correctValue` chở một trong sáu trường báo sai. */
export const NGUON_LOP: Readonly<Record<string, readonly KhoaCanNoiBo[]>> = {
  storiesTotal: ["buildingFloorsTotal"],
  upi: ["upi"],
  unitNumber: ["unitNumber"],
  livingArea: ["livingArea"],
  bedroomsTotal: ["bedroomsTotal"],
  directionFaces: ["directionFaces"],
  floor: ["floor"],
  stack: ["stack"],
  field: TRUONG_BAO_SAI,
  correctValue: TRUONG_BAO_SAI,
};

/**
 * Lỗi của bảng lớp khuôn: khoá phần riêng chưa xếp lớp, mang lớp khác danh mục, hay nằm ở cả bảng khuôn lẫn bảng của
 * luật ẩn (hai nguồn sự thật). Khoá không có ở `nguon` mà có ở `lopTruong` tra thẳng tên ấy.
 */
export function kiemLopKhoa(
  khoaRieng: Readonly<Record<string, readonly string[]>>,
  lopKhuon: Readonly<Record<string, DataClass>>,
  lopTruong: Readonly<Record<string, DataClass>>,
  nguon: Readonly<Record<string, readonly string[]>> = NGUON_LOP,
): string[] {
  const loi: string[] = [];
  for (const k of Object.keys(lopKhuon)) if (k in lopTruong) loi.push(`${k}: khoá hai nơi (bảng khuôn và bảng luật ẩn)`);
  const daXet = new Set<string>();
  for (const ds of Object.values(khoaRieng)) {
    for (const k of ds) {
      if (daXet.has(k)) continue;
      daXet.add(k);
      if (k in lopKhuon) {
        if (lopKhuon[k] !== "catalog") loi.push(`${k}: lớp ${lopKhuon[k]}`);
        continue;
      }
      const ds2 = nguon[k] ?? (k in lopTruong ? [k] : []);
      if (ds2.length === 0) loi.push(`${k}: chưa xếp lớp`);
      for (const k2 of ds2) {
        const lop = lopTruong[k2];
        if (lop === undefined) loi.push(`${k}: ${k2} chưa xếp lớp`);
        else if (lop !== "catalog") loi.push(`${k}: lớp ${lop}`);
      }
    }
  }
  return loi;
}

/** Dấu của lõi — chỉ ở kiểu: đối tượng tự viết không gán được vào `SuKienXacNhan`. */
declare const DAU_LOI: unique symbol;
type DauLoi = { readonly [DAU_LOI]: true };

type Vo<E extends LoaiSuKien> = {
  schemaVersion: typeof CATALOG_CONFIRMATION_SCHEMA_VERSION;
  eventType: E;
  officeKey: string;
  memberKey: string;
  /** Ngày người nhập, `YYYY-MM-DD` — mốc thô (Cổng Phạm vi Hỏi-1). */
  observedOn: string;
  buildingKey: string;
};

export type KhungToa = Vo<"building_frame"> & { storiesTotal: number; skippedFloors: number[]; stacks: string[] } & DauLoi;
export type ThuocTinhCan = Vo<"unit_attributes"> & {
  upi: string | null;
  unitNumber: string;
  livingArea?: number;
  bedroomsTotal?: number;
  directionFaces?: Huong;
  floor?: number;
  stack?: string;
} & DauLoi;
export type BaoSai = Vo<"correction"> & { upi: string; field: TruongBaoSai; correctValue: number | string } & DauLoi;
export type SuKienXacNhan = KhungToa | ThuocTinhCan | BaoSai;
