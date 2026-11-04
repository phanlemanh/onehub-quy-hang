// Dữ liệu mẫu của trang ba lối hàng 36 (ADR-0019): ba Lần gửi mẫu, nhãn mẫu, không người thật. Gỡ cùng trang khi chủ kho
// chọn lối (luật đợt 45).
export type CanMau = { ten: string; gia: string; quanTam: number; doi?: string; thay?: string[] };
export type LanGuiMau = { id: string; nguoiNhan: string; luc: string; mo: number; quanTam: number; moCuoi: string | null; tat?: boolean; can: CanMau[] };

export const LAN_GUI_MAU: readonly LanGuiMau[] = [
  {
    id: "1",
    nguoiNhan: "[Tên khách 1]",
    luc: "Hôm nay 09:12",
    mo: 3,
    quanTam: 2,
    moCuoi: "10 phút trước",
    can: [
      { ten: "Toà A · Tầng cao", gia: "4,25 tỷ", quanTam: 2 },
      { ten: "Toà B · Tầng thấp", gia: "2,98 tỷ", quanTam: 0, doi: "Vừa đổi giá: 3,2 tỷ → 2,98 tỷ" },
      { ten: "Toà A · Tầng cao", gia: "5,6 tỷ", quanTam: 0, doi: "Đã có người đặt cọc", thay: ["Toà A · Tầng cao · 5,4 tỷ", "Toà C · Tầng thấp · 5,7 tỷ"] },
    ],
  },
  { id: "2", nguoiNhan: "Nhóm môi giới", luc: "Hôm qua 16:40", mo: 0, quanTam: 0, moCuoi: null, can: [{ ten: "Toà C · C-14.02", gia: "3,7 tỷ", quanTam: 0 }, { ten: "Toà C · C-09.05", gia: "3,1 tỷ", quanTam: 0 }] },
  { id: "3", nguoiNhan: "[Tên khách 2]", luc: "02/11 11:05", mo: 1, quanTam: 0, moCuoi: "02/11 20:31", tat: true, can: [{ ten: "Toà B · Tầng cao", gia: "4,1 tỷ", quanTam: 0 }] },
];
