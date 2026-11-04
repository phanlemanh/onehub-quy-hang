/**
 * Tập căn của một lần Xuất bảng hàng (hàng 43, AC-1, design §2): có căn đang tích trong các căn đang hiện → các căn ấy,
 * theo thứ tự góc nhìn; không tích căn nào đang hiện → mọi căn đang hiện theo bộ lọc. Căn đã tích mà bộ lọc nay ẩn thì
 * không vào. Không căn nào → nút tắt kèm lời. Thuần — chỉ đọc mã dòng, không đọc trường nào khác của dòng.
 */
export const LOI_KHONG_CO_CAN = "Không có căn nào để xuất";

export type TapCan<T> = { tat: false; dong: T[]; loi: null } | { tat: true; dong: []; loi: typeof LOI_KHONG_CO_CAN };

/** `dongHien`: dòng đã lọc VÀ đã sắp theo góc nhìn (`sapDong(locDong(…))`). `tich`: mã căn đang tích. */
export function tapCanXuat<T extends { id: string }>(dongHien: readonly T[], tich: ReadonlySet<string>): TapCan<T> {
  const daTich = dongHien.filter((d) => tich.has(d.id));
  const dong = daTich.length > 0 ? daTich : [...dongHien];
  return dong.length === 0 ? { tat: true, dong: [], loi: LOI_KHONG_CO_CAN } : { tat: false, dong, loi: null };
}
