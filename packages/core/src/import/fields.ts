/**
 * Trường chuẩn mà một cột của file bảng hàng ghép vào (ADR-0011, Kiến trúc «Nhập dữ liệu» §4). Tên theo RESO khi có:
 * `ListAgentFullName` → `listAgentName`, `PrivateRemarks` → `privateRemarks`; `confirmedDate` là ngày trong file — nguồn của
 * `confirmedAt` (ADR-0011 quyết định 8), RESO không có trường cùng nghĩa.
 */
import type { DataClass } from "../data-classes";

export const STANDARD_FIELDS = [
  "unitNumber",
  "buildingName",
  "subdivisionName",
  "floor",
  "livingArea",
  "bedroomsTotal",
  "directionFaces",
  "listPrice",
  "feeInclusion",
  "standardStatus",
  "ownerName",
  "ownerPhone",
  "floorPrice",
  "listAgentName",
  "privateRemarks",
  "confirmedDate",
] as const;
export type StandardField = (typeof STANDARD_FIELDS)[number];

export function isStandardField(v: unknown): v is StandardField {
  return typeof v === "string" && (STANDARD_FIELDS as readonly string[]).includes(v);
}

/** Lớp dữ liệu của từng trường — trần ở `data-classes.ts`; chủ nhà và số chủ là `source`, không bao giờ rời công ty. */
export const FIELD_CLASS: Readonly<Record<StandardField, DataClass>> = {
  unitNumber: "catalog",
  buildingName: "catalog",
  subdivisionName: "catalog",
  floor: "catalog",
  livingArea: "catalog",
  bedroomsTotal: "catalog",
  directionFaces: "catalog",
  listPrice: "shareable_listing",
  feeInclusion: "shareable_listing",
  standardStatus: "shareable_listing",
  ownerName: "source",
  ownerPhone: "source",
  floorPrice: "source",
  listAgentName: "company_internal",
  privateRemarks: "company_internal",
  confirmedDate: "company_internal",
};

/** Nhãn trên màn xem trước (hàng 65) — một chỗ có tên, theo CONTEXT.md và Tham chiếu §4. */
export const FIELD_LABEL: Readonly<Record<StandardField, string>> = {
  unitNumber: "Mã căn",
  buildingName: "Toà",
  subdivisionName: "Dự án",
  floor: "Tầng",
  livingArea: "Diện tích",
  bedroomsTotal: "Phòng ngủ",
  directionFaces: "Hướng",
  listPrice: "Giá chào",
  feeInclusion: "Điều kiện phí",
  standardStatus: "Trạng thái",
  ownerName: "Chủ nhà",
  ownerPhone: "Số chủ nhà",
  floorPrice: "Giá đáy",
  listAgentName: "Đầu chủ",
  privateRemarks: "Ghi chú nội bộ",
  confirmedDate: "Ngày xác nhận",
};

/** Trường lấy từ danh mục theo mã căn (quyết định 12): ô của file chỉ để đối chiếu. */
export const CATALOG_FIELDS: readonly StandardField[] = ["buildingName", "subdivisionName", "floor", "livingArea", "bedroomsTotal", "directionFaces"];
