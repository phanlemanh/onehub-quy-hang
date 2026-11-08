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
export const MAU_MA_TRUC = /^[A-Z0-9]{1,6}$/;
export const MAU_MA_TOA = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/;
export const MAU_UPI = /^urn:onehub:upi:[A-Za-z0-9_.:-]+$/;
export const MAU_NGAY = /^\d{4}-\d{2}-\d{2}$/;

/** Mã căn chuẩn hoá như ô Gõ mã căn; ngoài dạng đóng thì `null`. */
export function chuanHoaMaCan(raw: string): string | null {
  const n = normalizeCode(raw);
  return MAU_MA_CAN.test(n) && n.length <= DO_DAI_MA_CAN && !MAU_DAY_SO.test(n) ? n : null;
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
