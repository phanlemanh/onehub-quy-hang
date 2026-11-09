/**
 * Dạng đóng của chuỗi trong sự kiện xác nhận — không chữ tự do (câu bật khi của hàng 95). Mỗi chuỗi hoặc khớp mẫu, hoặc
 * thuộc một tập đóng; sai thì hàm dựng từ chối, không sửa thay.
 */
import { normalizeCode } from "../catalog/code-rule";
import { DIRECTIONS } from "../import/dictionaries";
import { HUONG_RESO, type Huong } from "./khuon";

export const MAU_MA_CAN = /^[A-Z0-9]+([.\-_/][A-Z0-9]+)*$/;
export const DO_DAI_MA_CAN = 12;
/** Tám chữ số liền là dáng số điện thoại — không phải mã căn. */
export const MAU_DAY_SO = /\d{8,}/;
/**
 * Dáng số điện thoại trong mã người gõ: từ 9 chữ số nối nhau, cho phép một dấu `.-_/` giữa hai chữ số. Tám số có dấu
 * nối vẫn là mã căn được (`12.34.56.78`).
 */
export const MAU_DANG_SDT = /\+?\d(?:[.\-_/]?\d){8}/;
/**
 * Dáng số điện thoại trong khoá máy cấp: dãy 9–11 chữ số, giữa các chữ số có thể có dấu tách mà khoá cho phép. Chặn khi hai
 * đầu dãy không dính chữ hay số, hoặc khi trong dãy có dấu tách dù hai đầu dính chữ. Số liền không dấu tách dính chữ thì
 * qua: ULID của Invest cỡ 1/2000 khoá có đoạn như vậy (ADR-0027).
 */
export const MAU_DOAN_SDT = /(?<![A-Za-z0-9])\d(?:[.\-_:]*\d){8,10}(?![A-Za-z0-9])|(?<!\d)(?=\d+[.\-_:]+\d)\d(?:[.\-_:]*\d){8,10}(?!\d)/;
export const MAU_MA_TRUC = /^[A-Z0-9]{1,6}$/;
export const MAU_MA_TOA = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/;
export const MAU_UPI = /^urn:onehub:upi:[A-Za-z0-9_.:-]+$/;
export const MAU_NGAY = /^\d{4}-\d{2}-\d{2}$/;

/** Mã căn chuẩn hoá như ô Gõ mã căn; ngoài dạng đóng thì `null`. */
export function chuanHoaMaCan(raw: string): string | null {
  const n = normalizeCode(raw);
  return MAU_MA_CAN.test(n) && n.length <= DO_DAI_MA_CAN && !MAU_DAY_SO.test(n) && !MAU_DANG_SDT.test(n) ? n : null;
}

const HUONG_VIET: Readonly<Record<(typeof DIRECTIONS)[number], Huong>> = {
  Đông: "East",
  Tây: "West",
  Nam: "South",
  Bắc: "North",
  "Đông Nam": "Southeast",
  "Đông Bắc": "Northeast",
  "Tây Nam": "Southwest",
  "Tây Bắc": "Northwest",
};

/** Nhãn hướng tiếng Việt của từ điển nhập hoặc giá trị RESO → giá trị RESO; khác thì `null`. */
export function docHuong(raw: string): Huong | null {
  const s = raw.normalize("NFC").trim();
  if ((HUONG_RESO as readonly string[]).includes(s)) return s as Huong;
  return (HUONG_VIET as Readonly<Record<string, Huong>>)[s] ?? null;
}

export function laMaTruc(s: string): boolean {
  return MAU_MA_TRUC.test(s);
}

/** Chuỗi có đoạn dáng số điện thoại — để lỗi nói đúng nguyên nhân. */
export function coDangSdt(s: unknown): boolean {
  return typeof s === "string" && MAU_DOAN_SDT.test(s);
}

/** Khoá toà đúng dạng khuôn — kiểm trước khi tra danh mục. */
export function laMaToa(s: unknown): s is string {
  return typeof s === "string" && MAU_MA_TOA.test(s) && !MAU_DOAN_SDT.test(s);
}

/** UPI đúng dạng khuôn — kiểm trước khi tra danh mục. */
export function laUpi(s: unknown): s is string {
  return typeof s === "string" && MAU_UPI.test(s) && !MAU_DOAN_SDT.test(s);
}
