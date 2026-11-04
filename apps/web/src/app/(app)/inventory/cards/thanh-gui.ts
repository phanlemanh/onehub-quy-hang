/**
 * Thanh Gửi của Bảng hàng thẻ (hàng 34): chọn ≥ 1 căn thì đáy màn có «n căn · Xem trước · Gửi»; hai nút cùng dẫn sang màn
 * Gửi với căn theo thứ tự chọn (Luật sản phẩm 4 — căn đang chọn đi theo người), Xem trước mở thẳng ngăn xem trước.
 */

/** Chữ đếm của thanh; `null` = không có thanh. */
export const chuThanhGui = (n: number): string | null => (n > 0 ? `${n} căn` : null);

/** Đường sang màn Gửi — giữ thứ tự chọn (thứ tự chèn của tập chọn). */
export function duongGui(chon: Iterable<string>, xem = false): string {
  const q = new URLSearchParams({ can: [...chon].join(",") });
  if (xem) q.set("xem", "1");
  return `/shares/new?${q.toString().replaceAll("%2C", ",")}`;
}
