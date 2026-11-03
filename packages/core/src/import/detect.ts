/**
 * Bộ dò dữ liệu cá nhân (Kiến trúc «Nhập dữ liệu» §3) — chạy trên MỌI ô của mọi cột, kể cả cột đã qua từ điển tiêu đề,
 * TRƯỚC khi có gì được dựng để gửi đi. Dò sai về phía che chỉ tốn một câu hỏi; dò sai về phía gửi là sự cố — nên mọi
 * khuôn nghiêng về che.
 */

/** Số Việt Nam viết mọi kiểu: 0 hay +84 hay 84, chín chữ số sau, ngăn bằng cách, chấm, gạch, ngoặc. */
const SO_DIEN_THOAI = /(?<![\d])(?:\+?\s*84|0)[\s.\-()]*[1-9](?:[\s.\-()]*\d){8}(?![\d])/;
const EMAIL = /[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/i;
/** Số giấy tờ: CMND 9 chữ số, CCCD 12 chữ số — đứng riêng, không là phần của số dài hơn. */
const GIAY_TO = /(?<![\d])(?:\d{12}|\d{9})(?![\d])/;

export type PersonalHit = "phone" | "email" | "id_number";

/** Chuỗi chữ số tận cùng bằng năm số 0 trở lên là dáng số tiền («950000000», «84500000000»), không phải số hay giấy tờ. */
const dangTien = (m: string) => /0{5}$/.test(m.replace(/\D/g, ""));
const trung = (re: RegExp, s: string) => {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  for (const m of s.matchAll(g)) if (!dangTien(m[0])) return true;
  return false;
};

/** Ô (dạng chữ) chứa dữ liệu cá nhân loại nào; không chứa → null. Số điện thoại xét trước số giấy tờ. */
export function detectPersonal(cell: string | number | null): PersonalHit | null {
  if (cell === null) return null;
  const s = typeof cell === "number" ? (Number.isInteger(cell) ? String(cell) : "") : cell;
  if (!s) return null;
  if (trung(SO_DIEN_THOAI, s)) return "phone";
  if (EMAIL.test(s)) return "email";
  if (trung(GIAY_TO, s)) return "id_number";
  // Ô số mất số 0 đầu khi Excel đọc «0900000012» thành 900000012.
  if (typeof cell === "number" && /^[1-9]\d{8}$/.test(s) && !dangTien(s)) return "phone";
  return null;
}

/** Họ phổ biến của người Việt (đã bỏ dấu) — chữ đầu của một họ tên. Danh sách mở rộng được, không cần đủ: thiếu họ chỉ
 * làm cột ấy rơi về `unknown` (vẫn chỉ gửi hình dạng). */
const HO = new Set(
  "nguyen tran le pham hoang huynh phan vu vo dang bui do ho ngo duong ly dinh trinh doan lam mai luong ha cao kieu tang ta truong chu chau quach thai la van vuong to tieu hua giang lai luu mac".split(" "),
);
const boDau = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").toLowerCase();

/** Dáng họ tên tiếng Việt: 2–5 chữ viết hoa đầu, không chữ số, chữ đầu là một họ (hay nhãn trong ngoặc vuông như «[Tên]»). */
export function looksLikePersonName(cell: string | number | null): boolean {
  if (typeof cell !== "string") return false;
  const s = cell.normalize("NFC").trim();
  if (!s || /\d/.test(s)) return false;
  const tu = s.split(/\s+/);
  if (tu.length < 2 || tu.length > 5) return false;
  if (!tu.every((t) => /^\[[^\]]+\]$/.test(t) || /^\p{Lu}\p{Ll}*$/u.test(t))) return false;
  return /^\[[^\]]+\]$/.test(tu[0]!) || HO.has(boDau(tu[0]!));
}
