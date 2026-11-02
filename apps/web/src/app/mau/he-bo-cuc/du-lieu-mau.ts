import { navigationFor } from "@quy-hang/core";

// Dữ liệu mẫu của trang mẫu sống — không người thật, không số thật (AGENTS.md «Dữ liệu cá nhân thật không vào kho»).
// Trang không gọi API: mọi thứ màn mẫu cần nằm ở đây.

export const NGUOI_MAU = {
  userId: "00000000-0000-4000-8000-000000000091",
  email: "truong-nhom@mau.quy-hang.test",
  companies: [{ id: "00000000-0000-4000-8000-0000000000a1", name: "[Mẫu] Sàn thử" }],
  activeCompany: { id: "00000000-0000-4000-8000-0000000000a1", name: "[Mẫu] Sàn thử", roles: ["team_lead", "company_admin"] },
};

// Trưởng nhóm kiêm quản trị sàn: mọi nhà của trang mẫu đều có cột thứ hai như màn thật (bố cục Đọc đứng ở Cài đặt sàn).
export const NAV_MAU = navigationFor(NGUOI_MAU.activeCompany.roles);

export type CanMau = { ma: string; toa: string; gia: string; trangThai: string; tuoi: string };

export const CAN_MAU: CanMau[] = [
  { ma: "A-06.01", toa: "Toà A", gia: "3,10 tỷ", trangThai: "Đang bán", tuoi: "2 ngày" },
  { ma: "A-12.08", toa: "Toà A", gia: "4,25 tỷ", trangThai: "Đang bán", tuoi: "9 ngày" },
  { ma: "B-03.05", toa: "Toà B", gia: "2,80 tỷ", trangThai: "Giữ chỗ", tuoi: "1 ngày" },
  { ma: "B-15.02", toa: "Toà B", gia: "5,60 tỷ", trangThai: "Đang bán", tuoi: "16 ngày" },
  { ma: "C-08.11", toa: "Toà C", gia: "3,95 tỷ", trangThai: "Chờ duyệt", tuoi: "4 ngày" },
  { ma: "C-21.03", toa: "Toà C", gia: "6,10 tỷ", trangThai: "Đang bán", tuoi: "21 ngày" },
];

export const TIN_MAU = [
  { ai: "[Tên khách 1]", viec: "mở link A-06.01", luc: "5 phút trước" },
  { ai: "[Tên khách 2]", viec: "xem 3 căn Toà B", luc: "40 phút trước" },
  { ai: "[Tên khách 3]", viec: "hẹn xem C-08.11 chiều mai", luc: "2 giờ trước" },
  { ai: "[Tên khách 1]", viec: "mở lại link A-06.01", luc: "hôm qua" },
];

export const SO_MAU = [
  { nhan: "Căn đang bán", so: "128" },
  { nhan: "Xác nhận trong 14 ngày", so: "82%" },
  { nhan: "Lead mới tuần này", so: "37" },
  { nhan: "Link khách mở", so: "214" },
];
