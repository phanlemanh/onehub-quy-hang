/**
 * Bản mồi của bộ kiểm rò rỉ (hàng 31): một căn mà MỌI trường không được ra mang một giá trị riêng, không trùng chữ nào
 * khác của bản. Mồi không chứa dữ liệu thật (AGENTS.md): tên `[Tên] …`, số `0900 000 07x`. Cửa ra sau này (trang khách,
 * gửi, phát hàng) dựng trang trên chính bản này rồi quét mã nguồn trang bằng `timRoRi`.
 */
import { CEILING } from "../data-classes";
import type { CauHinhRa } from "./ban-ra";
import type { NguoiNhan } from "./cua-ra";
import type { GiaTriMoi } from "./kiem-ro-ri";
import { LOP_TRUONG, type CanNoiBo, type KhoaCanNoiBo } from "./lop-truong";

const anh = (id: string, compartment: "shareable" | "internal", displayOrder: number, them: { isCover?: boolean; isSample?: boolean } = {}) => ({
  id,
  buildingName: "Toà Mồi A",
  unitNumber: "Z-97.53",
  compartment,
  displayOrder,
  isCover: them.isCover ?? false,
  isSample: them.isSample ?? false,
  takenAt: "2026-10-20",
  addedAt: "2026-10-21T08:00:00Z",
  contentType: "image/jpeg",
  width: 1600,
  height: 1200,
});

export function canMoi(): CanNoiBo {
  return {
    buildingName: "Toà Mồi A",
    livingArea: 74.5,
    bedroomsTotal: 2,
    directionFaces: "Đông Nam",
    propertyType: "Residential",
    propertySubType: "Condominium",
    unitNumber: "Z-97.53",
    upi: "UPI-MOI-9753",
    stack: "TRUC-MOI-53",
    floor: 12,
    buildingFloorsTotal: 15,
    standardStatus: "Active",
    listPrice: 4_250_000_000,
    feeInclusion: "excluded",
    furnished: "Đầy đủ",
    legalStatus: "Sổ hồng",
    financing: "Không vay",
    occupantType: "Chủ ở",
    lastConfirmedAt: "2026-10-24T09:00:00Z",
    companyName: "[Tên sàn] Mồi",
    senderName: "[Tên] Người gửi mồi",
    photos: [
      anh("moi-anh-gui-a", "shareable", 2, { isSample: true }),
      anh("moi-anh-gui-b", "shareable", 0),
      anh("moi-anh-gui-c", "shareable", 1, { isCover: true }),
      anh("moi-anh-noi-bo-1", "internal", 0),
      anh("moi-anh-noi-bo-2", "internal", 1),
    ],
    closePrice: 9_876_543_212,
    closeDate: "2019-07-13",
    withdrawnReason: "moi-ly-do-ngung",
    version: 7,
    holderUserId: "moi-nguoi-giu-0001",
    holderName: "[Tên] Đầu chủ giữ mồi",
    customFields: { canGoc: "moi-truong-rieng-can-goc" },
    ownerName: "[Tên] Chủ nhà mồi Ửng",
    ownerPhone: "0900 000 073",
    floorPrice: 9_876_543_211,
    titleDeedPhoto: "moi-anh-so-hong-0001",
    contacts: [
      { id: "moi-lien-he-chu-ban", fullName: "[Tên] Chủ bán mồi Đức", contactTypes: ["Seller"], phones: ["0900000071"] },
      { id: "moi-lien-he-nguoi-mua", fullName: "[Tên] Người mua mồi Ấn", contactTypes: ["Buyer"], phones: ["0900000072"] },
    ],
  };
}

const RA_DUOC = new Set(["external", "by_agreement"]);
const VI_TRI_AN: readonly KhoaCanNoiBo[] = ["unitNumber", "upi", "stack"];

function themGiaTri(ra: GiaTriMoi[], truong: string, v: unknown) {
  if (typeof v === "string" && v.length >= 4) ra.push({ truong, giaTri: v, kieu: "chu" });
  else if (typeof v === "number" && v >= 1_000_000) ra.push({ truong, giaTri: v, kieu: "so_tien" });
}

/**
 * Giá trị không được xuất hiện trong bản ra cho người nhận và cấu hình này: mọi khoá có lớp không ra ngoài (kể cả từng
 * phần của liên hệ, trường riêng), mã ảnh ngăn Nội bộ, và mã căn, UPI, trục khi khách riêng ẩn mã căn. Số ngắn (số
 * tầng, phiên bản) không làm mồi được — quá dễ trùng chữ khác.
 */
export function giaTriMoi(can: CanNoiBo, nguoiNhan: NguoiNhan, cauHinh: CauHinhRa): GiaTriMoi[] {
  const ra: GiaTriMoi[] = [];
  for (const k of Object.keys(LOP_TRUONG) as KhoaCanNoiBo[]) {
    if (RA_DUOC.has(CEILING[LOP_TRUONG[k]])) continue;
    if (k === "contacts") {
      can.contacts.forEach((lh, i) => {
        themGiaTri(ra, `contacts[${i}].id`, lh.id);
        themGiaTri(ra, `contacts[${i}].fullName`, lh.fullName);
        lh.phones.forEach((so, j) => ra.push({ truong: `contacts[${i}].phones[${j}]`, giaTri: so, kieu: "so_dien_thoai" }));
      });
    } else if (k === "customFields") {
      for (const [ten, v] of Object.entries(can.customFields)) themGiaTri(ra, `customFields.${ten}`, v);
    } else if (k === "ownerPhone") {
      if (can.ownerPhone) ra.push({ truong: k, giaTri: can.ownerPhone, kieu: "so_dien_thoai" });
    } else {
      themGiaTri(ra, k, can[k]);
    }
  }
  for (const p of can.photos) if (p.compartment === "internal") themGiaTri(ra, `photos[${p.id}]`, p.id);
  if (nguoiNhan === "khach_rieng" && cauHinh.privateHidesUnitNumber) for (const k of VI_TRI_AN) themGiaTri(ra, k, can[k]);
  return ra;
}
