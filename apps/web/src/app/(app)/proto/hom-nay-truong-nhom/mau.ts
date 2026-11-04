// Dữ liệu mẫu của trang ba lối Hôm nay của Trưởng nhóm (hàng 42, ADR-0019) — cùng một bộ cho cả ba lối, nhãn mẫu, không
// người thật, không số điện thoại. Màn thật đọc lead quá hạn qua API và căn theo người từ kho trên máy.

export type LoaiViec = "chua-chia" | "qua-han-nhan" | "qua-han-goi";

export const NHAN_LOAI: Record<LoaiViec, string> = {
  "chua-chia": "Chưa chia được",
  "qua-han-nhan": "Quá hạn nhận",
  "qua-han-goi": "Quá hạn gọi",
};

export const BADGE_LOAI = {
  "chua-chia": "warning-light",
  "qua-han-nhan": "destructive-light",
  "qua-han-goi": "info-light",
} as const satisfies Record<LoaiViec, string>;

export type DauChu = {
  id: string;
  ten: string;
  nghi: boolean;
  /** Lead đang mở của người — hiện cạnh tên khi chọn người giao. */
  leadMo: number;
  canMo: number;
  canGoiLai: number;
  /** Tỉ lệ căn tươi (đã xác nhận trong hạn), 0–100. */
  tuoi: number;
};

export const DAU_CHU: DauChu[] = [
  { id: "a", ten: "[Đầu chủ A]", nghi: false, leadMo: 3, canMo: 24, canGoiLai: 4, tuoi: 83 },
  { id: "b", ten: "[Đầu chủ B]", nghi: false, leadMo: 5, canMo: 31, canGoiLai: 9, tuoi: 71 },
  { id: "c", ten: "[Đầu chủ C]", nghi: true, leadMo: 1, canMo: 18, canGoiLai: 7, tuoi: 61 },
  { id: "d", ten: "[Đầu chủ D]", nghi: false, leadMo: 2, canMo: 12, canGoiLai: 1, tuoi: 92 },
];

/** Dòng «Chưa có người giữ» của bảng theo người. */
export const CHUA_CO_NGUOI = { canMo: 6, canGoiLai: 4, tuoi: 33 };

export type DongHangDoi = {
  id: string;
  toa: string;
  /** `null` khi telesales chỉ biết toà. */
  can: string | null;
  loai: LoaiViec;
  /** Đầu chủ đang giữ lead; `null` khi chưa chia được. */
  dauChu: string | null;
  /** Số phút quá hạn — xếp lâu nhất trước. */
  phut: number;
};

export const HANG_DOI: DongHangDoi[] = [
  { id: "h1", toa: "[Toà A]", can: "A-12.03", loai: "chua-chia", dauChu: null, phut: 185 },
  { id: "h2", toa: "[Toà B]", can: "B-07.12", loai: "qua-han-goi", dauChu: "b", phut: 140 },
  { id: "h3", toa: "[Toà C]", can: null, loai: "chua-chia", dauChu: null, phut: 95 },
  { id: "h4", toa: "[Toà A]", can: "A-15.07", loai: "qua-han-nhan", dauChu: "c", phut: 52 },
  { id: "h5", toa: "[Toà B]", can: "B-11.02", loai: "qua-han-goi", dauChu: "a", phut: 30 },
  { id: "h6", toa: "[Toà C]", can: "C-20.01", loai: "qua-han-nhan", dauChu: "b", phut: 12 },
];

export const chuQuaHan = (phut: number) => {
  const g = Math.floor(phut / 60);
  const p = phut % 60;
  return g === 0 ? `${p} phút` : p === 0 ? `${g} giờ` : `${g} giờ ${p} phút`;
};

export const tenDauChu = (ds: DauChu[], id: string | null) => (id ? (ds.find((d) => d.id === id)?.ten ?? "—") : "—");

export const CHU_PHAM_VI = "Chỉ tính căn toàn sàn";
