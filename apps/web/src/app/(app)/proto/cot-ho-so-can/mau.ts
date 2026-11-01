// Dữ liệu mẫu của trang ba lối (hàng 17, ADR-0019) — nhãn mẫu, không người thật. Màn thật đọc kho trên máy và danh mục.

export type SuKienMau = { luc: string; ai: string; viec: string; chiTiet?: string; loai: "gia" | "trang-thai" | "lan-rao" | "xac-nhan" | "tao" };
export type LanRaoMau = { ma: string; trangThai: string; gia: string; tu: string; den: string | null; dangMo: boolean };

export const CAN = {
  ma: "A-1203",
  toa: "[Tòa A]",
  khu: "[Khu mẫu]",
  loaiHinh: "Căn hộ",
  trangThai: "Đang bán",
  gia: "3,25 tỷ",
  phi: "Bao phí",
  mucDu: { co: 4, tren: 5, thieu: "Tài chính" },
  tuoi: "Xác nhận 3 ngày trước",
  thuocTinh: [
    ["Loại căn", "2PN"],
    ["Diện tích", "68,5 m²"],
    ["Tầng", "12"],
    ["Hướng", "Đông Nam"],
    ["Trục", "03"],
    ["Toà", "[Tòa A]"],
  ] as [string, string][],
  phanLanRao: [
    ["Giá", "3,25 tỷ · Bao phí"],
    ["Nội thất", "Cơ bản"],
    ["Pháp lý", "Sổ hồng"],
    ["Tài chính", "—"],
    ["Tình trạng", "Đang trống"],
  ] as [string, string][],
};

export const LAN_RAO: LanRaoMau[] = [
  { ma: "Lần 2", trangThai: "Đang bán", gia: "3,25 tỷ", tu: "02/10", den: null, dangMo: true },
  { ma: "Lần 1", trangThai: "Ngừng bán", gia: "3,10 tỷ", tu: "14/03", den: "20/06", dangMo: false },
];

export const SU_KIEN: SuKienMau[] = [
  { luc: "Hôm qua 16:40", ai: "Bạn", viec: "Xác nhận với chủ nhà", loai: "xac-nhan" },
  { luc: "28/10 09:12", ai: "Trưởng nhóm", viec: "Đổi giá", chiTiet: "3,40 tỷ → 3,25 tỷ", loai: "gia" },
  { luc: "15/10 14:05", ai: "Bạn", viec: "Đổi phần lần rao", chiTiet: "Pháp lý: Sổ hồng", loai: "lan-rao" },
  { luc: "02/10 10:30", ai: "Bạn", viec: "Đổi trạng thái", chiTiet: "Sắp bán → Đang bán", loai: "trang-thai" },
  { luc: "02/10 10:21", ai: "Bạn", viec: "Đổi giá", chiTiet: "— → 3,40 tỷ", loai: "gia" },
  { luc: "02/10 10:20", ai: "Bạn", viec: "Tạo lần rao", loai: "tao" },
];

/** Dòng giả của Bảng hàng cạnh cột hồ sơ — chỉ để thấy bảng còn bấm được. */
export const DONG: [string, string, string, string][] = [
  ["A-1201", "2PN", "Đang bán", "3,10 tỷ"],
  ["A-1202", "Studio", "Sắp bán", "1,95 tỷ"],
  ["A-1203", "2PN", "Đang bán", "3,25 tỷ"],
  ["A-1205", "3PN", "Đã cọc", "4,60 tỷ"],
  ["A-1206", "2PN", "Đang bán", "3,30 tỷ"],
  ["A-1208", "1PN", "Tạm ngừng", "2,40 tỷ"],
  ["B-0904", "2PN", "Đang bán", "2,95 tỷ"],
  ["B-0907", "3PN", "Đang bán", "4,10 tỷ"],
];
