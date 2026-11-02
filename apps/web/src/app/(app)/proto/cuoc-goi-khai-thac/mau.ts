// Dữ liệu mẫu của trang ba lối Chế độ cuộc gọi khai thác (hàng 28, ADR-0019) — một lead, nhãn mẫu, không người thật, không
// số điện thoại. Màn thật đọc lead qua `GET /api/v1/leads/assigned/<mã>` và căn từ kho trên máy.

export const LEAD = {
  toa: "[Mẫu] Toà A",
  can: "A-21.05",
  thuocTinh: "1PN+1 · 42,9 m² · Đông Nam · tầng 21 — tự điền từ mã",
  nhuCau: "Bán",
  gia: "2,75 tỷ · bao phí",
  nhap: "Telesales nhập lúc 09:40 · chia cho bạn 09:42",
  nac: "Đã nhận",
};

export type Nhom = { ma: string; ten: string; luaChon: string[] };

/** Năm mục của mức đủ theo thứ tự của lõi; lựa chọn là bộ mặc định đề xuất ở Hỏi-2. */
export const NHOM: Nhom[] = [
  { ma: "price", ten: "Giá và phí", luaChon: ["Bao phí", "Không bao phí"] },
  { ma: "furnished", ten: "Nội thất", luaChon: ["Đủ đồ", "Cơ bản", "Thô"] },
  { ma: "legalStatus", ten: "Pháp lý", luaChon: ["Có sổ", "Đang làm sổ", "Hợp đồng mua bán"] },
  { ma: "financing", ten: "Tài chính", luaChon: ["Không vay", "Đang vay"] },
  { ma: "occupantType", ten: "Tình trạng sử dụng", luaChon: ["Trống", "Chủ ở", "Đang cho thuê"] },
];

/** Câu trả lời đã có lúc mở (mẫu): giá đã ghi, nội thất và tình trạng sử dụng đã hỏi. */
export const DA_CO: Record<string, number> = { price: 0, furnished: 0, occupantType: 2 };

export const KHOAN = [
  { ten: "Thuế thu nhập cá nhân 2%", so: "− 55 triệu" },
  { ten: "Lệ phí trước bạ 0,5%", so: "− 13,75 triệu" },
  { ten: "Phí môi giới 1%", so: "− 27,5 triệu" },
];

export type CanSo = { ma: string; gia: string; phi: "BP" | "N"; trangThai: "Đang bán" | "Đang giao dịch"; xacNhan: string };

export const CAN_SO: CanSo[] = [
  { ma: "A-15.08", gia: "2,80", phi: "N", trangThai: "Đang bán", xacNhan: "23 ngày" },
  { ma: "A-27.06", gia: "2,62", phi: "N", trangThai: "Đang bán", xacNhan: "6 ngày" },
  { ma: "A-25.07", gia: "2,58", phi: "BP", trangThai: "Đang bán", xacNhan: "16 ngày" },
  { ma: "A-08.07", gia: "2,55", phi: "BP", trangThai: "Đang bán", xacNhan: "28 ngày" },
  { ma: "A-20.06", gia: "2,52", phi: "N", trangThai: "Đang bán", xacNhan: "7 ngày" },
  { ma: "A-19.08", gia: "2,46", phi: "N", trangThai: "Đang giao dịch", xacNhan: "hôm qua" },
  { ma: "A-22.08", gia: "2,40", phi: "N", trangThai: "Đang bán", xacNhan: "3 ngày" },
];

export const DAI = { thap: "2,40", giua: "2,52", cao: "2,80", canNay: "2,65", lech: "cao hơn giữa toà 5,3%", viTri: 62 };
