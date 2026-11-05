// Luật «Xem thêm» của danh sách Liên hệ (hàng vá va-ho-so-lien-he, AC-2 hàng 103): một trang chỉ được nối vào danh sách
// khi nó thuộc đúng bộ lọc đang hiện. Bộ lọc đổi thì con trỏ cũ hết hiệu lực ngay, không chờ hết 250 ms chờ gõ.

/** Khoá của một bộ lọc: chuỗi tìm (đã cắt khoảng trắng), loại, dấu, và lượt thử lại. */
export function khoaLoc(l: { q: string; type: string; status: string; lan: number }): string {
  return JSON.stringify([l.q.trim(), l.type, l.status, l.lan]);
}

/** Trang cuối đã hiện: thuộc bộ lọc nào, và con trỏ đọc tiếp (null = hết). */
export type TrangCuoi = { khoa: string; tiep: string | null };

/** Con trỏ để gửi «Xem thêm», hoặc null khi không được gửi (đang tải, hết trang, hay trang cuối của bộ lọc khác). */
export function conTroXemThem(trang: TrangCuoi | null, khoaHienTai: string, dangHien: boolean): string | null {
  if (!dangHien || !trang || trang.tiep === null) return null;
  return trang.khoa === khoaHienTai ? trang.tiep : null;
}

/** Kết quả «Xem thêm» về: chỉ nối khi lượt đọc và bộ lọc lúc gửi vẫn là lượt và bộ lọc hiện tại. */
export function duocNoi(guiLuc: { luot: number; khoa: string }, hienTai: { luot: number; khoa: string }): boolean {
  return guiLuc.luot === hienTai.luot && guiLuc.khoa === hienTai.khoa;
}
