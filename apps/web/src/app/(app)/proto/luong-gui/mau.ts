// Dữ liệu mẫu của trang ba lối Luồng Gửi (hàng 34, ADR-0019) — nhãn mẫu, không người thật, không số thật. Màn thật đọc
// căn đang chọn từ Bảng hàng thẻ (`?can=`), khách từ `GET /api/v1/prospects` và dựng bản ra bằng `banRaNgoai` của lõi.
import type { CanNoiBo } from "@quy-hang/core/redaction";

export const HOM_NAY = "2026-11-03";

export type CanMau = { id: string; noiBo: CanNoiBo };

function can(p: Partial<CanNoiBo> & Pick<CanNoiBo, "buildingName" | "unitNumber">): CanNoiBo {
  return {
    livingArea: null,
    bedroomsTotal: null,
    directionFaces: null,
    propertyType: "Residential",
    propertySubType: "Apartment",
    upi: null,
    stack: null,
    floor: null,
    buildingFloorsTotal: 30,
    standardStatus: "Active",
    listPrice: null,
    feeInclusion: "included",
    furnished: "[Mẫu] Cơ bản",
    legalStatus: "[Mẫu] Sổ hồng",
    financing: null,
    occupantType: "[Mẫu] Để trống",
    lastConfirmedAt: "2026-10-31",
    companyName: "[Sàn mẫu]",
    senderName: "[Đầu khách mẫu]",
    photos: [],
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
    version: 1,
    holderUserId: null,
    holderName: null,
    customFields: {},
    // Phần nguồn — có trong bản vào để thấy luật ẩn bỏ nó; không bao giờ ra trang khách.
    ownerName: "[Tên chủ nhà]",
    ownerPhone: "0900 000 099",
    floorPrice: 3_000_000_000,
    titleDeedPhoto: null,
    contacts: [],
    ...p,
  };
}

/** Bốn căn đã chọn trên Bảng hàng thẻ, theo thứ tự chọn. Căn thứ hai quá 14 ngày chưa xác nhận. */
export const CAN_MAU: CanMau[] = [
  {
    id: "c1",
    noiBo: can({ buildingName: "Toà A", unitNumber: "A-12.03", floor: 12, livingArea: 68.5, bedroomsTotal: 2, directionFaces: "Đông Nam", listPrice: 3_250_000_000 }),
  },
  {
    id: "c2",
    noiBo: can({
      buildingName: "Toà A",
      unitNumber: "A-21.07",
      floor: 21,
      livingArea: 74.2,
      bedroomsTotal: 2,
      directionFaces: "Tây Bắc",
      listPrice: 3_480_000_000,
      feeInclusion: "excluded",
      lastConfirmedAt: "2026-10-12",
    }),
  },
  {
    id: "c3",
    noiBo: can({ buildingName: "Toà B", unitNumber: "B-08.11", floor: 8, livingArea: 55, bedroomsTotal: 1, directionFaces: "Đông", listPrice: 2_650_000_000 }),
  },
  {
    id: "c4",
    noiBo: can({ buildingName: "Toà B", unitNumber: "B-27.02", floor: 27, livingArea: 96.3, bedroomsTotal: 3, directionFaces: "Nam", listPrice: 4_650_000_000 }),
  },
];

export type KhachMau = { id: string; ten: string; nhuCau: string; mo: string };

/** Khách đang mở của đầu khách (nhu cầu khách của hàng 86). */
export const KHACH_MAU: KhachMau[] = [
  { id: "k1", ten: "[Tên khách 1]", nhuCau: "Mua · 2PN · đến 3,5 tỷ", mo: "Hỏi hôm nay" },
  { id: "k2", ten: "[Tên khách 2]", nhuCau: "Mua · 1–2PN · đến 2,8 tỷ", mo: "Hỏi hôm qua" },
  { id: "k3", ten: "[Tên khách 3]", nhuCau: "Thuê · 3PN", mo: "Hỏi 29/10" },
];

/** Gốc link mẫu — màn thật nhận `code` từ `POST /api/v1/shares`. */
export const LINK_MAU = "https://[gốc]/s/[mã]";
