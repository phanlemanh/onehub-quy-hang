/**
 * Cửa ra và người nhận (hàng 31, Tham chiếu §3 «Ba cửa ra», luật 23–24). Mọi cửa ra dùng chung một luật ẩn
 * (`banRaNgoai`); thêm cửa mới là thêm một giá trị ở đây, không viết luật riêng.
 */

/** Gửi link (trang khách) · gửi ảnh + tin · phát hàng (ảnh, PDF, Excel). Đăng Platform thêm sau. */
export const CUA_RA = ["gui_link", "gui_anh_tin", "phat_hang"] as const;
export type CuaRa = (typeof CUA_RA)[number];

/** Khách riêng ẩn mã căn; nhóm môi giới thấy đủ mã (luật 24). */
export const NGUOI_NHAN = ["khach_rieng", "nhom_moi_gioi"] as const;
export type NguoiNhan = (typeof NGUOI_NHAN)[number];

/**
 * Đầu URL của các trang web là cửa ra. Rào `timCuaRaThieuKiem` (rao-cua-ra.ts) bắt mỗi trang có URL bắt đầu bằng một
 * tiền tố ở đây phải có bài kiểm rò rỉ của riêng nó. Route API công khai (`/api/v1/public/…`) có rào riêng ở hàng 35, đọc
 * danh sách route đã đăng ký trên app API.
 */
export const TIEN_TO_CUA_RA = ["/s/", "/shares/new", "/exports"] as const;
