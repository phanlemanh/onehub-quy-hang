/**
 * Luật ẩn (hàng 31, bất biến 4, Tham chiếu luật 23–26): hàm DUY NHẤT dựng dữ liệu ra ngoài sàn cho mọi cửa ra. Bản ra
 * chỉ chép khoá có trong danh sách được ra của người nhận — khoá nào không có trong danh sách thì không ra, kể cả khoá
 * thêm sau này. Cấu hình của sàn chỉ chọn cách hiện TRONG trần, không mở trường nội bộ nào.
 */
import { freshness } from "../listing/freshness";
import type { StandardStatus } from "../listing/status";
import { anhRaNgoai, nhanAnh } from "../photos";
import type { CuaRa, NguoiNhan } from "./cua-ra";
import type { CanNoiBo, KhoaCanNoiBo } from "./lop-truong";

/** Sổ điểm biến thiên A4: #12 `customer_page.show_confirmed_age`, #13 `customer_page.private_hides_unit_number`. */
export type CauHinhRa = { showConfirmedAge: boolean; privateHidesUnitNumber: boolean };
export const CAU_HINH_MAC_DINH: CauHinhRa = { showConfirmedAge: true, privateHidesUnitNumber: true };
/** Mọi khoá về phía hiện nhiều nhất — bộ kiểm rò rỉ chạy cả trên cấu hình này (ADR-0018 quyết định 6). */
export const CAU_HINH_MO_NHAT: CauHinhRa = { showConfirmedAge: true, privateHidesUnitNumber: false };
export const CAU_HINH_TAT_CA: readonly CauHinhRa[] = [true, false].flatMap((showConfirmedAge) =>
  [true, false].map((privateHidesUnitNumber) => ({ showConfirmedAge, privateHidesUnitNumber })),
);

/** Tình trạng khách thấy (Hỏi-4 Cổng Phạm vi 03/11). Nhãn chữ là việc của trang. */
export type Availability = "available" | "under_contract" | "paused" | "unavailable";
export const AVAILABILITY: Readonly<Record<StandardStatus, Availability>> = {
  Active: "available",
  Pending: "under_contract",
  Hold: "paused",
  Closed: "unavailable",
  Withdrawn: "unavailable",
  Incomplete: "unavailable",
};
const CO_GIA: readonly Availability[] = ["available", "under_contract"];

export type AnhRa = { id: string; label: string; width: number; height: number };

export type CanRaNgoai = {
  buildingName?: string;
  unitNumber?: string | null;
  upi?: string | null;
  stack?: string | null;
  floor?: number | null;
  floorBand?: "high" | "low" | null;
  livingArea?: number | null;
  bedroomsTotal?: number | null;
  directionFaces?: string | null;
  propertyType?: string | null;
  propertySubType?: string | null;
  furnished?: string | null;
  legalStatus?: string | null;
  occupantType?: string | null;
  financing?: string | null;
  availability?: Availability;
  listPrice?: number | null;
  feeInclusion?: string | null;
  confirmedAgeDays?: number | null;
  photos?: AnhRa[];
  companyName?: string;
  senderName?: string;
};
export type KhoaRa = keyof CanRaNgoai;

/** Khoá bản vào mà mỗi khoá ra đọc — bảng lớp kiểm lớp của chính các khoá này. */
export const NGUON_RA: Readonly<Record<KhoaRa, readonly KhoaCanNoiBo[]>> = {
  buildingName: ["buildingName"],
  unitNumber: ["unitNumber"],
  upi: ["upi"],
  stack: ["stack"],
  floor: ["floor"],
  floorBand: ["floor", "buildingFloorsTotal"],
  livingArea: ["livingArea"],
  bedroomsTotal: ["bedroomsTotal"],
  directionFaces: ["directionFaces"],
  propertyType: ["propertyType"],
  propertySubType: ["propertySubType"],
  furnished: ["furnished"],
  legalStatus: ["legalStatus"],
  occupantType: ["occupantType"],
  financing: ["financing"],
  availability: ["standardStatus"],
  listPrice: ["listPrice"],
  feeInclusion: ["feeInclusion"],
  confirmedAgeDays: ["lastConfirmedAt"],
  photos: ["photos"],
  companyName: ["companyName"],
  senderName: ["senderName"],
};

const VI_TRI: readonly KhoaRa[] = ["unitNumber", "upi", "stack", "floor"];
/** Đặc điểm căn, tình trạng, giá, ảnh, người gửi — chung cho mọi người nhận (Hỏi-3 Cổng Phạm vi 03/11). */
const CHUNG: readonly KhoaRa[] = [
  "buildingName",
  "livingArea",
  "bedroomsTotal",
  "directionFaces",
  "propertyType",
  "propertySubType",
  "furnished",
  "legalStatus",
  "occupantType",
  "financing",
  "availability",
  "listPrice",
  "feeInclusion",
  "confirmedAgeDays",
  "photos",
  "companyName",
  "senderName",
];

/** Tập lớn nhất mỗi người nhận có thể thấy, ở cấu hình nào cũng vậy. Mẫu phát hàng, mẫu bài chỉ chọn trong tập này. */
export const TRUONG_RA: Readonly<Record<NguoiNhan, readonly KhoaRa[]>> = {
  khach_rieng: [...CHUNG, "floorBand", ...VI_TRI],
  nhom_moi_gioi: [...CHUNG, ...VI_TRI],
};

/** Hợp các khoá bản vào mà mỗi người nhận đọc — đầu vào của `kiemBangLop`. */
export function nguonRaTheoNguoiNhan(truongRa: Readonly<Record<NguoiNhan, readonly KhoaRa[]>> = TRUONG_RA) {
  const ra = {} as Record<NguoiNhan, KhoaCanNoiBo[]>;
  for (const [nn, ds] of Object.entries(truongRa) as [NguoiNhan, readonly KhoaRa[]][]) {
    // Khoá ra chưa có nguồn khai thì coi chính nó là khoá bản vào — để bảng lớp gọi đúng tên khoá ấy.
    ra[nn] = [...new Set(ds.flatMap((k) => NGUON_RA[k] ?? [k as KhoaCanNoiBo]))];
  }
  return ra;
}

/** Tập khoá thật của một lượt dựng: khách riêng ẩn mã căn thì thay bốn khoá vị trí bằng nấc tầng. */
export function truongRa(nguoiNhan: NguoiNhan, cauHinh: CauHinhRa): readonly KhoaRa[] {
  const an = nguoiNhan === "khach_rieng" && cauHinh.privateHidesUnitNumber;
  return TRUONG_RA[nguoiNhan].filter((k) => (an ? !VI_TRI.includes(k) : k !== "floorBand"));
}

/** Hỏi-1: tầng ở nửa trên số tầng của toà là «tầng cao»; thiếu số tầng hay số tầng toà thì không có nấc. */
export function bangTang(floor: number | null, tongTang: number | null): "high" | "low" | null {
  if (floor === null || tongTang === null || tongTang <= 0) return null;
  return floor > tongTang / 2 ? "high" : "low";
}

function giaTri(can: CanNoiBo, k: KhoaRa, today: string): unknown {
  switch (k) {
    case "floorBand":
      return bangTang(can.floor, can.buildingFloorsTotal);
    case "availability":
      return AVAILABILITY[can.standardStatus];
    case "confirmedAgeDays": {
      const f = freshness(can.lastConfirmedAt, today);
      return f.confirmed ? f.ageDays : null;
    }
    case "photos":
      return anhRaNgoai(can.photos).map((p) => ({ id: p.id, label: nhanAnh(p), width: p.width, height: p.height }));
    default:
      return can[k];
  }
}

/**
 * Dựng bản ra cho một cửa và một người nhận. `cua` không đổi luật — mọi cửa ra cùng một bản cho cùng người nhận.
 * `today` là `YYYY-MM-DD` (lõi không đọc đồng hồ); tuổi xác nhận đếm như bàn làm việc (`freshness`).
 */
export function banRaNgoai(
  can: CanNoiBo,
  tuy: { cua: CuaRa; nguoiNhan: NguoiNhan; cauHinh?: CauHinhRa; today: string },
): CanRaNgoai {
  const cauHinh = tuy.cauHinh ?? CAU_HINH_MAC_DINH;
  const coGia = CO_GIA.includes(AVAILABILITY[can.standardStatus]);
  const ra: Record<string, unknown> = {};
  for (const k of truongRa(tuy.nguoiNhan, cauHinh)) {
    if ((k === "listPrice" || k === "feeInclusion") && !coGia) continue;
    if (k === "confirmedAgeDays" && !(coGia && cauHinh.showConfirmedAge)) continue;
    ra[k] = giaTri(can, k, tuy.today);
  }
  return ra as CanRaNgoai;
}
