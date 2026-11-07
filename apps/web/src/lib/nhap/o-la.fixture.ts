// Tệp mẫu của hàng 69 (E4, E4c, E5, E6, E7b): cột giá đơn vị tỷ, cột trạng thái, KHÔNG có cột điều kiện phí. Ba dòng giá
// cùng chữ dải, một dòng «thu về 4.2», hai dòng trạng thái lạ cùng chữ, một dòng giá thường (đối chứng). Không dữ liệu thật.
import type { Grid } from "@quy-hang/core/import";

export const LUOI_O_LA: Grid = [
  ["Toà", "Mã căn", "Giá (tỷ)", "Trạng thái"],
  ["A", "A-0101", "4.6–4.8 tỷ", "Đang bán"],
  ["A", "A-0102", "4.6–4.8 tỷ", "Đang bán"],
  ["A", "A-0103", "4.6–4.8 tỷ", "đang đàm phán"],
  ["A", "A-0104", "thu về 4.2", "đang đàm phán"],
  ["A", "A-0105", "5 tỷ", "Đang bán"],
];
/** Chỉ số cột trong `LUOI_O_LA`. */
export const COT = { gia: 2, trangThai: 3 } as const;
