// Dữ liệu mẫu của trang ba lối Hôm nay của đầu chủ (hàng 22, ADR-0019) — ca nhiều việc, nhãn mẫu, không người thật,
// không số điện thoại. Màn thật đọc căn từ kho trên máy và lead qua `GET /api/v1/leads/assigned`.

export type NhomId = "lead-moi" | "ep-gia" | "goi-lai" | "thieu-tin" | "moi-doi";

export const NHOM: { id: NhomId; ten: string }[] = [
  { id: "lead-moi", ten: "Lead mới" },
  { id: "ep-gia", ten: "Nên gọi ép giá" },
  { id: "goi-lai", ten: "Cần gọi lại" },
  { id: "thieu-tin", ten: "Thiếu thông tin" },
  { id: "moi-doi", ten: "Mới đổi" },
];

export const DAU_CHU = "[Mẫu] Đầu chủ 1";

export type LeadMau = {
  kind: "lead";
  id: string;
  toa: string;
  /** `null` khi telesales chỉ biết toà. */
  can: string | null;
  nhuCau: "Bán" | "Cho thuê";
  /** Giá đọc thành câu. */
  gia: string;
  gioNhap: string;
  nac: "Đã gửi" | "Đã nhận";
  han: string;
  quaHan: boolean;
};

export type CanMau = {
  kind: "can";
  id: string;
  nhom: Exclude<NhomId, "lead-moi">;
  ma: string;
  toa: string;
  loai: string;
  gia: string;
  lyDo: string;
};

export type Viec = LeadMau | CanMau;

export const LEAD: LeadMau[] = [
  { kind: "lead", id: "l1", toa: "[Tòa B]", can: "B-0712", nhuCau: "Bán", gia: "3,2 tỷ, đã bao phí", gioNhap: "08:42", nac: "Đã gửi", han: "Quá hạn nhận 5 phút", quaHan: true },
  { kind: "lead", id: "l2", toa: "[Tòa C]", can: null, nhuCau: "Cho thuê", gia: "14 triệu/tháng, chưa gồm phí", gioNhap: "09:15", nac: "Đã gửi", han: "Hạn nhận còn 8 phút", quaHan: false },
  { kind: "lead", id: "l3", toa: "[Tòa A]", can: "A-1507", nhuCau: "Bán", gia: "4,1 tỷ, chưa gồm phí", gioNhap: "07:58", nac: "Đã nhận", han: "Hạn gọi còn 12 phút", quaHan: false },
];

export const CAN: CanMau[] = [
  { kind: "can", id: "c1", nhom: "ep-gia", ma: "A-1203", toa: "[Tòa A]", loai: "2PN · 68,5 m²", gia: "3,25 tỷ · Bao phí", lyDo: "Giá giữ 12 ngày" },
  { kind: "can", id: "c2", nhom: "ep-gia", ma: "A-0908", toa: "[Tòa A]", loai: "3PN · 92,0 m²", gia: "4,60 tỷ · Bao phí", lyDo: "Giá giữ 15 ngày" },
  { kind: "can", id: "c3", nhom: "ep-gia", ma: "B-1102", toa: "[Tòa B]", loai: "1PN · 48,2 m²", gia: "2,15 tỷ · Chưa gồm phí", lyDo: "Giá giữ 11 ngày" },
  { kind: "can", id: "c4", nhom: "ep-gia", ma: "C-2001", toa: "[Tòa C]", loai: "2PN · 70,1 m²", gia: "3,40 tỷ · Bao phí", lyDo: "Giá giữ 20 ngày" },
  { kind: "can", id: "c5", nhom: "goi-lai", ma: "A-0605", toa: "[Tòa A]", loai: "2PN · 65,0 m²", gia: "3,05 tỷ · Bao phí", lyDo: "Chưa xác nhận 16 ngày" },
  { kind: "can", id: "c6", nhom: "goi-lai", ma: "B-0304", toa: "[Tòa B]", loai: "Studio · 32,5 m²", gia: "1,60 tỷ · Bao phí", lyDo: "Chưa từng xác nhận" },
  { kind: "can", id: "c7", nhom: "goi-lai", ma: "B-1810", toa: "[Tòa B]", loai: "2PN · 69,8 m²", gia: "3,30 tỷ · Chưa gồm phí", lyDo: "Chưa xác nhận 21 ngày" },
  { kind: "can", id: "c8", nhom: "goi-lai", ma: "C-0707", toa: "[Tòa C]", loai: "3PN · 98,4 m²", gia: "5,20 tỷ · Bao phí", lyDo: "Chưa xác nhận 14 ngày" },
  { kind: "can", id: "c9", nhom: "goi-lai", ma: "C-1512", toa: "[Tòa C]", loai: "1PN · 50,0 m²", gia: "2,30 tỷ · Bao phí", lyDo: "Chưa xác nhận 30 ngày" },
  { kind: "can", id: "c10", nhom: "thieu-tin", ma: "A-1001", toa: "[Tòa A]", loai: "2PN · 67,2 m²", gia: "3,15 tỷ · Bao phí", lyDo: "Thiếu: pháp lý, tài chính" },
  { kind: "can", id: "c11", nhom: "thieu-tin", ma: "B-0506", toa: "[Tòa B]", loai: "3PN · 95,0 m²", gia: "4,85 tỷ · Chưa gồm phí", lyDo: "Thiếu: nội thất" },
  { kind: "can", id: "c12", nhom: "thieu-tin", ma: "C-1109", toa: "[Tòa C]", loai: "Studio · 30,8 m²", gia: "1,55 tỷ · Bao phí", lyDo: "Thiếu: tình trạng, pháp lý" },
  { kind: "can", id: "c13", nhom: "moi-doi", ma: "A-1408", toa: "[Tòa A]", loai: "2PN · 68,0 m²", gia: "2,95 tỷ · Bao phí", lyDo: "Giá 3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua" },
  { kind: "can", id: "c14", nhom: "moi-doi", ma: "B-2203", toa: "[Tòa B]", loai: "2PN · 71,5 m²", gia: "3,45 tỷ · Bao phí", lyDo: "Đang bán → Đã cọc — Trưởng nhóm, hôm nay" },
];
