/**
 * Loại máy của người làm (hàng 52, AC-5). Hỏi-2 — chủ kho duyệt ở Cổng Phạm vi: đo loại máy theo CẠNH NGẮN của màn hình,
 * không theo bề rộng cửa sổ — điện thoại xoay ngang (844×390) vẫn là điện thoại; máy tính bảng cạnh ngắn từ 768px tính là
 * máy tính. Mốc 768 cùng con số `md` của vỏ.
 */
export type ThietBi = "mobile" | "desktop";

/** Cạnh ngắn dưới mốc này là điện thoại (cùng `md` của vỏ). */
export const MOC_THIET_BI = 768;

export function thietBi(rong: number, cao: number): ThietBi {
  return Math.min(rong, cao) < MOC_THIET_BI ? "mobile" : "desktop";
}

/** Thiết bị của máy đang chạy, đọc lúc gọi. Không có màn hình (máy chủ, bài kiểm) thì là máy tính. */
export function thietBiCuaMay(): ThietBi {
  const s = (globalThis as { screen?: { width: number; height: number } }).screen;
  return s ? thietBi(s.width, s.height) : "desktop";
}
