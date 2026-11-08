// Luật «Xem thêm» của danh sách Liên hệ (hàng vá va-ho-so-lien-he, AC-2 hàng 103): một trang chỉ được nối vào danh sách
// khi nó thuộc đúng bộ lọc đang hiện. Bộ lọc đổi thì con trỏ cũ hết hiệu lực ngay, không chờ hết 250 ms chờ gõ.

/** Khoá của một bộ lọc: chuỗi tìm (đã cắt khoảng trắng), loại, dấu, và lượt thử lại. */
export function khoaLoc(l: { q: string; type: string; status: string; lan: number }): string {
  return JSON.stringify([l.q.trim(), l.type, l.status, l.lan]);
}

/** Trang cuối đã hiện: thuộc bộ lọc nào, và con trỏ đọc tiếp (null = hết). */
export type TrangCuoi = { khoa: string; tiep: string | null };

/** Trang máy chủ đã đọc sẵn: khoá bộ lọc của nó và con trỏ đọc tiếp. */
export type TrangMayChu = { khoa: string; nextCursor: string | null };

/** Trang cuối lúc mở màn (hàng vá va-xem-them-noi-lap-dong): trang máy chủ trao thì là trang ấy, không có thì chưa có. */
export function trangTuMayChu(dau: TrangMayChu | null): TrangCuoi | null {
  return dau ? { khoa: dau.khoa, tiep: dau.nextCursor } : null;
}

/**
 * Trang cuối sau một lượt không đọc lại (bảng đã đúng bộ lọc): máy chủ vừa trao trang mới đúng bộ lọc này thì bảng vừa được
 * thay bằng trang ấy — lấy con trỏ của nó; không thì giữ trang cuối đang có. Quay về trang máy chủ lúc mở màn khi bảng đã nối
 * thêm trang là gửi lại con trỏ cũ và lặp dòng (Ngoài-1 của khung-ho-so-lien-he: gõ rồi xoá ô tìm trong 250 ms).
 */
export function trangKhiKhongDoc(hienTai: TrangCuoi | null, dauMoi: TrangMayChu | null, khoaLuot: string): TrangCuoi | null {
  return dauMoi && dauMoi.khoa === khoaLuot ? { khoa: khoaLuot, tiep: dauMoi.nextCursor } : hienTai;
}

/** Con trỏ để gửi «Xem thêm», hoặc null khi không được gửi (đang tải, hết trang, hay trang cuối của bộ lọc khác). */
export function conTroXemThem(trang: TrangCuoi | null, khoaHienTai: string, dangHien: boolean): string | null {
  if (!dangHien || !trang || trang.tiep === null) return null;
  return trang.khoa === khoaHienTai ? trang.tiep : null;
}

/** Lúc gửi hay lúc về của một lần «Xem thêm»: lượt đọc, khoá bộ lọc, con trỏ trang cuối. */
export type MocXemThem = { luot: number; khoa: string; cursor: string | null };

/**
 * Kết quả «Xem thêm» về: chỉ nối khi lượt đọc, bộ lọc và con trỏ trang cuối lúc gửi vẫn là hiện tại. Con trỏ đã đi tiếp
 * nghĩa là trang này đã được nối (bấm hai lần trước khi trang về) — nối lần nữa là lặp dòng.
 */
export function duocNoi(guiLuc: MocXemThem, hienTai: MocXemThem): boolean {
  return guiLuc.luot === hienTai.luot && guiLuc.khoa === hienTai.khoa && guiLuc.cursor === hienTai.cursor;
}
