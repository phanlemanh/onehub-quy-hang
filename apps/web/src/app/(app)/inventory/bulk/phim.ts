/**
 * Phím tắt của Bảng hàng nhường ô gõ (Ngoài-2 của va-sua-tren-o, hàng 16): đang gõ trong ô lọc cột, input, textarea hay
 * vùng contenteditable thì Ctrl/Cmd+Z là hoàn tác chữ của ô, không phải hoàn tác lần sửa căn.
 */
const KHONG_GO = new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color", "file", "image"]);

/** Phần tử nhận phím là một ô gõ chữ. Kiểu vịt — không cần DOM để kiểm. */
export function laOGo(t: unknown): boolean {
  if (!t || typeof t !== "object") return false;
  const e = t as { tagName?: string; type?: string; isContentEditable?: boolean };
  if (e.isContentEditable) return true;
  if (e.tagName === "TEXTAREA") return true;
  return e.tagName === "INPUT" && !KHONG_GO.has((e.type ?? "text").toLowerCase());
}
