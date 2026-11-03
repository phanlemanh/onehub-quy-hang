/**
 * Bản đầy đủ của một căn mà một cửa ra có thể cầm khi dựng dữ liệu ra ngoài, và lớp dữ liệu của TỪNG khoá (hàng 31,
 * `data-classes.ts`: mỗi trường đúng một lớp). Luật ẩn chỉ cho ra khoá mà lớp có trần `external` hay `by_agreement`.
 */
import type { ContactType } from "../contacts";
import { CEILING, type DataClass } from "../data-classes";
import type { StandardStatus } from "../listing/status";
import type { UnitPhoto } from "../photos";
import type { NguoiNhan } from "./cua-ra";

/** Liên hệ như cửa ra có thể cầm — kể cả số đã giải mã. Không liên hệ nào ra ngoài. */
export type LienHeVao = { id: string; fullName: string | null; contactTypes: ContactType[]; phones: readonly string[] };

export type CanNoiBo = {
  // Căn (danh mục)
  buildingName: string;
  livingArea: number | null;
  bedroomsTotal: number | null;
  directionFaces: string | null;
  propertyType: string | null;
  propertySubType: string | null;
  // Vị trí căn — ra theo người nhận
  unitNumber: string | null;
  upi: string | null;
  stack: string | null;
  floor: number | null;
  /** Số tầng của toà theo danh mục; thiếu thì trang khách không có nấc tầng. */
  buildingFloorsTotal: number | null;
  // Lần rao
  standardStatus: StandardStatus;
  listPrice: number | null;
  feeInclusion: string | null;
  furnished: string | null;
  legalStatus: string | null;
  financing: string | null;
  occupantType: string | null;
  lastConfirmedAt: string | null;
  // Người gửi
  companyName: string;
  senderName: string;
  // Ảnh hai ngăn
  photos: readonly UnitPhoto[];
  // Giao dịch
  closePrice: number | null;
  closeDate: string | null;
  // Nội bộ công ty
  withdrawnReason: string | null;
  version: number;
  holderUserId: string | null;
  holderName: string | null;
  // Trường riêng của sàn
  customFields: Readonly<Record<string, unknown>>;
  // Nguồn
  ownerName: string | null;
  ownerPhone: string | null;
  floorPrice: number | null;
  titleDeedPhoto: string | null;
  contacts: readonly LienHeVao[];
};

export type KhoaCanNoiBo = keyof CanNoiBo;

export const LOP_TRUONG: Readonly<Record<KhoaCanNoiBo, DataClass>> = {
  buildingName: "catalog",
  livingArea: "catalog",
  bedroomsTotal: "catalog",
  directionFaces: "catalog",
  propertyType: "catalog",
  propertySubType: "catalog",
  unitNumber: "catalog",
  upi: "catalog",
  stack: "catalog",
  floor: "catalog",
  buildingFloorsTotal: "catalog",
  standardStatus: "shareable_listing",
  listPrice: "shareable_listing",
  feeInclusion: "shareable_listing",
  furnished: "shareable_listing",
  legalStatus: "shareable_listing",
  financing: "shareable_listing",
  occupantType: "shareable_listing",
  lastConfirmedAt: "shareable_listing",
  companyName: "shareable_listing",
  senderName: "shareable_listing",
  // Ảnh ngăn Gửi được là hàng chia sẻ được; ngăn Nội bộ lớp `source` — tách ở `anhRaNgoai` (hàng 18).
  photos: "shareable_listing",
  closePrice: "transaction",
  closeDate: "transaction",
  withdrawnReason: "company_internal",
  version: "company_internal",
  holderUserId: "company_internal",
  holderName: "company_internal",
  customFields: "custom_field",
  ownerName: "source",
  ownerPhone: "source",
  floorPrice: "source",
  titleDeedPhoto: "source",
  // Mọi liên hệ, kể cả người chỉ là Người mua: không liên hệ nào ra ngoài (câu giao hàng 31).
  contacts: "source",
};

/** Khoá lần đầu được xếp lớp ở đây — chưa bảng gốc nào của lõi khai lớp cho chúng. */
export const KHOA_CHUA_CO_BANG_GOC: readonly KhoaCanNoiBo[] = (Object.keys(LOP_TRUONG) as KhoaCanNoiBo[]).filter(
  (k) => !["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto", "photos"].includes(k),
);

const RA_DUOC = new Set(["external", "by_agreement"]);

/**
 * Lỗi của bảng lớp: khoá bản vào chưa xếp lớp; khoá nguồn của danh sách được ra có lớp không ra ngoài. `nguonRa` là mọi
 * khoá bản vào mà mỗi người nhận đọc (hợp các nguồn của danh sách được ra).
 */
export function kiemBangLop(
  bang: Readonly<Record<string, DataClass>>,
  nguonRa: Readonly<Record<NguoiNhan, readonly string[]>>,
  khoaBanVao: readonly string[],
): string[] {
  const loi: string[] = [];
  for (const k of khoaBanVao) if (!(k in bang)) loi.push(`${k}: chưa xếp lớp`);
  const daBao = new Set<string>();
  for (const ds of Object.values(nguonRa)) {
    for (const k of ds) {
      if (daBao.has(k)) continue;
      const lop = bang[k];
      if (lop === undefined) loi.push(`${k}: chưa xếp lớp`);
      else if (!RA_DUOC.has(CEILING[lop])) loi.push(`${k}: lớp ${lop} không ra ngoài`);
      daBao.add(k);
    }
  }
  return loi;
}

/** Bảng gốc của lõi: trường chủ nhà (hàng 11) và ngăn ảnh (hàng 18). */
export type BangGoc = {
  ownerFields: Readonly<Record<string, DataClass>>;
  sourceKeys: readonly string[];
  compartmentClass: Readonly<Record<string, DataClass>>;
};

/** Khoá đã có lớp ở bảng gốc phải trùng lớp ở bảng của luật ẩn — không hai nguồn sự thật. */
export function kiemBangGoc(bang: Readonly<Record<string, DataClass>>, goc: BangGoc): string[] {
  const loi: string[] = [];
  const so = (k: string, lopGoc: DataClass) => {
    const lop = bang[k];
    if (lop !== undefined && lop !== lopGoc) loi.push(`${k}: lệch bảng gốc (${lopGoc} ≠ ${lop})`);
  };
  for (const [k, lop] of Object.entries(goc.ownerFields)) so(k, lop);
  for (const k of goc.sourceKeys) so(k, "source");
  // `photos` mang lớp của ngăn Gửi được; ngăn Nội bộ phải là lớp không bao giờ rời công ty.
  const ganDuoc = goc.compartmentClass["shareable"];
  if (ganDuoc !== undefined) so("photos", ganDuoc);
  const noiBo = goc.compartmentClass["internal"];
  if (noiBo === undefined || CEILING[noiBo] !== "never_leaves_company") {
    loi.push(`photos: ngăn internal phải là lớp không rời công ty (đang ${noiBo ?? "vắng"})`);
  }
  return loi;
}
