/**
 * Cột của bản xuất (hàng 43, design §4): cột đang hiện của góc nhìn bảng hàng, theo thứ tự góc nhìn, giao với tập khoá
 * luật ẩn cho người nhận. Cột không có khoá ra tương ứng (giá chốt, người giữ, lý do ngừng, trường riêng…) bị bỏ và
 * liệt bằng nhãn ở dòng «Cột không ra ngoài».
 *
 * Nguồn bảng cột: `apps/web/src/app/(app)/inventory/cot.ts` (`COT`, `CotId`, `chuCuaO`, `dinhDangGia`). Lõi không nhập
 * từ app, nên id và nhãn chép lại ở đây; mỗi id của `CotId` phải có một dòng (bài kiểm của hộp thoại ghim). Cái riêng
 * của lõi là cột ↔ khoá ra của `banRaNgoai` — app không có bảng ấy.
 */
import { nhanGiaTri, type TuVung } from "../labels";
import { type CanRaNgoai, type CauHinhRa, type KhoaRa, truongRa } from "../redaction/ban-ra";
import type { NguoiNhan } from "../redaction/cua-ra";

export type DinhNghiaCot = { nhan: string; khoa: KhoaRa | null };

export const COT_BANG_HANG = {
  buildingName: { nhan: "Toà", khoa: "buildingName" },
  unitNumber: { nhan: "Mã căn", khoa: "unitNumber" },
  // «Loại căn» của bảng hàng dựng từ số phòng ngủ của danh mục (`nhanLoaiCan`).
  unitType: { nhan: "Loại căn", khoa: "bedroomsTotal" },
  livingArea: { nhan: "Diện tích", khoa: "livingArea" },
  floor: { nhan: "Tầng", khoa: "floor" },
  directionFaces: { nhan: "Hướng", khoa: "directionFaces" },
  // Trạng thái chuẩn không ra ngoài; khách thấy tình trạng (`availability`, Hỏi-4 hàng 31).
  standardStatus: { nhan: "Trạng thái", khoa: "availability" },
  listPrice: { nhan: "Giá", khoa: "listPrice" },
  feeInclusion: { nhan: "Phí", khoa: "feeInclusion" },
  furnished: { nhan: "Nội thất", khoa: "furnished" },
  legalStatus: { nhan: "Pháp lý", khoa: "legalStatus" },
  financing: { nhan: "Tài chính", khoa: "financing" },
  occupantType: { nhan: "Tình trạng sử dụng", khoa: "occupantType" },
  confirmedAgeDays: { nhan: "Xác nhận", khoa: "confirmedAgeDays" },
  completeness: { nhan: "Mức đủ", khoa: null },
  visibility: { nhan: "Ai thấy", khoa: null },
  closePrice: { nhan: "Giá chốt", khoa: null },
  closeDate: { nhan: "Ngày bán", khoa: null },
  withdrawnReason: { nhan: "Lý do ngừng", khoa: null },
  holderName: { nhan: "Người giữ", khoa: null },
  // Hàng 79 (bang-hang-theo-loai-hinh): năm cột loại hình của Bảng hàng — chưa ra ngoài; cho ra là việc của hàng 80 (LH10).
  propertySubType: { nhan: "Loại hình", khoa: null },
  lotSizeArea: { nhan: "Diện tích đất", khoa: null },
  storiesTotal: { nhan: "Số tầng", khoa: null },
  frontageLength: { nhan: "Mặt tiền", khoa: null },
  accessRoadWidth: { nhan: "Lộ giới", khoa: null },
} as const satisfies Record<string, DinhNghiaCot>;

export type CotBangHang = keyof typeof COT_BANG_HANG;
/** Cột của góc nhìn: id của bảng hàng, hay cột lõi chưa biết (trường riêng của sàn…) kèm nhãn — luôn bị bỏ. */
export type CotGocNhin = CotBangHang | { id: string; nhan: string };
export type CotRa = { id: string; nhan: string; khoa: KhoaRa };
export type KetQuaCot = { ra: CotRa[]; boQua: string[] };

/** Khách riêng ẩn mã căn: cột «Tầng» mang nấc tầng, đứng ở chỗ cột mã căn hay tầng đầu tiên của góc nhìn. */
export const COT_NAC_TANG: CotRa = { id: "floorBand", nhan: "Tầng", khoa: "floorBand" };

const laCotBangHang = (id: string): id is CotBangHang => Object.prototype.hasOwnProperty.call(COT_BANG_HANG, id);

export function cotRa(cotGocNhin: readonly CotGocNhin[], nguoiNhan: NguoiNhan, cauHinh: CauHinhRa): KetQuaCot {
  const duoc = new Set<KhoaRa>(truongRa(nguoiNhan, cauHinh));
  const anMaCan = duoc.has("floorBand");
  const ra: CotRa[] = [];
  const boQua: string[] = [];
  let daCoNacTang = false;
  for (const c of cotGocNhin) {
    const id = typeof c === "string" ? c : c.id;
    const dn: DinhNghiaCot | null = laCotBangHang(id) ? COT_BANG_HANG[id] : null;
    const nhan = dn?.nhan ?? (typeof c === "string" ? c : c.nhan);
    let khoa = dn?.khoa ?? null;
    if (anMaCan && (khoa === "unitNumber" || khoa === "floor")) {
      if (khoa === "unitNumber") boQua.push(nhan);
      if (!daCoNacTang) ra.push(COT_NAC_TANG);
      daCoNacTang = true;
      continue;
    }
    // Sàn tắt tuổi xác nhận thì bản ra không có giá trị nào cho cột ấy.
    if (khoa === "confirmedAgeDays" && !cauHinh.showConfirmedAge) khoa = null;
    if (khoa !== null && duoc.has(khoa)) ra.push({ id, nhan, khoa });
    else boQua.push(nhan);
  }
  return { ra, boQua };
}

const TY = 1_000_000_000;
const SO_2 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const SO_NGUYEN = new Intl.NumberFormat("vi-VN");
export const KHONG_CO = "—";
export const CHUA_RO = "Chưa rõ";

/** «4,65 tỷ» · «950 triệu» · «—» — như `dinhDangGia` của bảng hàng. */
export function dinhDangGia(dong: number | null | undefined): string {
  if (dong === null || dong === undefined) return KHONG_CO;
  if (dong >= TY) return `${SO_2.format(dong / TY)} tỷ`;
  return `${SO_NGUYEN.format(Math.round(dong / 1_000_000))} triệu`;
}

export const NHAN_TINH_TRANG: Readonly<Record<NonNullable<CanRaNgoai["availability"]>, string>> = {
  available: "Đang bán",
  under_contract: "Đang giao dịch",
  paused: "Tạm ngừng",
  unavailable: "Không còn bán",
};
export const NHAN_PHI: Readonly<Record<string, string>> = { included: "Bao phí", excluded: "Không bao phí" };
export const NHAN_NAC_TANG: Readonly<Record<"high" | "low", string>> = { high: "Tầng cao", low: "Tầng thấp" };

/** Chữ của một ô, đọc từ bản đã ẩn — như chữ ô của bảng hàng. */
export function chuCuaO(ban: CanRaNgoai, khoa: KhoaRa, tv?: TuVung | null): string {
  const v = ban[khoa];
  if (khoa === "bedroomsTotal") {
    if (typeof v !== "number") return CHUA_RO;
    return v === 0 ? "Studio" : `${v}PN`;
  }
  if (v === null || v === undefined || v === "") return KHONG_CO;
  switch (khoa) {
    case "availability":
      return NHAN_TINH_TRANG[v as keyof typeof NHAN_TINH_TRANG] ?? String(v);
    case "feeInclusion":
      return nhanGiaTri(tv, "feeInclusion", String(v), NHAN_PHI[String(v)] ?? String(v));
    case "floorBand":
      return NHAN_NAC_TANG[v as "high" | "low"] ?? String(v);
    case "listPrice":
      return dinhDangGia(v as number);
    case "livingArea":
      return `${SO_2.format(v as number)} m²`;
    case "confirmedAgeDays":
      return v === 0 ? "Hôm nay" : `${String(v)} ngày trước`;
    case "photos":
      return `${(v as readonly unknown[]).length} ảnh`;
    default:
      return String(v);
  }
}
