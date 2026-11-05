// Dữ liệu mẫu của trang ba lối «Hồ sơ căn trên điện thoại» (ADR-0019, hồ sơ ho-so-dien-thoai-product-detail-5) — nhãn
// mẫu, không người thật, không số thật. Màn thật đọc kho trên máy và danh mục. Không có phần chủ nhà: đầu khách không
// thấy nguồn, và trang này không trình nguồn cho vai nào.

export type SuKienMau = { luc: string; ai: string; viec: string; chiTiet?: string };
export type LanRaoMau = { ma: string; trangThai: string; gia: string; tu: string; den: string | null; dangMo: boolean };
export type AnhMau = { id: string; nhan: string };

export const CAN = {
  ma: "A-01.02",
  toa: "[Mẫu] Toà A",
  khu: "[Mẫu] Khu A",
  loaiHinh: "Căn hộ",
  trangThai: "Đang bán",
  gia: "3,25 tỷ",
  phi: "Bao phí",
  mucDu: { co: 4, tren: 5, thieu: "Tài chính" },
  tuoi: "Xác nhận 3 ngày trước",
  dauChu: "[Mẫu] Đầu chủ 1",
  /** Ba thông số chính của hàng dưới tên căn (lối ReUI). */
  chinh: [
    ["Diện tích", "68,5 m²"],
    ["Phòng ngủ", "2"],
    ["Hướng", "Đông Nam"],
  ] as [string, string][],
  thuocTinh: [
    ["Loại căn", "2PN"],
    ["Diện tích", "68,5 m²"],
    ["Tầng", "01"],
    ["Hướng", "Đông Nam"],
    ["Trục", "02"],
    ["Toà", "[Mẫu] Toà A"],
  ] as [string, string][],
  phanLanRao: [
    ["Giá", "3,25 tỷ · Bao phí"],
    ["Nội thất", "[Mẫu] Cơ bản"],
    ["Pháp lý", "[Mẫu] Sổ hồng"],
    ["Tài chính", "—"],
    ["Tình trạng", "[Mẫu] Để trống"],
  ] as [string, string][],
};

export const ANH: AnhMau[] = [
  { id: "a1", nhan: "Phòng khách" },
  { id: "a2", nhan: "Phòng ngủ chính" },
  { id: "a3", nhan: "Bếp" },
  { id: "a4", nhan: "Ban công" },
  { id: "a5", nhan: "Mặt bằng" },
];

export const LAN_RAO: LanRaoMau[] = [
  { ma: "Lần 2", trangThai: "Đang bán", gia: "3,25 tỷ", tu: "02/10", den: null, dangMo: true },
  { ma: "Lần 1", trangThai: "Ngừng bán", gia: "3,10 tỷ", tu: "14/03", den: "20/06", dangMo: false },
];

export const SU_KIEN: SuKienMau[] = [
  { luc: "02/11 16:40", ai: "[Mẫu] Đầu chủ 1", viec: "Xác nhận với chủ nhà" },
  { luc: "28/10 09:12", ai: "[Mẫu] Trưởng nhóm", viec: "Đổi giá", chiTiet: "3,40 tỷ → 3,25 tỷ" },
  { luc: "15/10 14:05", ai: "[Mẫu] Đầu chủ 1", viec: "Đổi phần lần rao", chiTiet: "Pháp lý: Sổ hồng" },
  { luc: "02/10 10:30", ai: "[Mẫu] Đầu chủ 1", viec: "Đổi trạng thái", chiTiet: "Sắp bán → Đang bán" },
  { luc: "02/10 10:21", ai: "[Mẫu] Đầu chủ 1", viec: "Đổi giá", chiTiet: "— → 3,40 tỷ" },
  { luc: "02/10 10:20", ai: "[Mẫu] Đầu chủ 1", viec: "Tạo lần rao" },
];
