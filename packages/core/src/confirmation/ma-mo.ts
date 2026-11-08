/**
 * Mã sàn và mã người mờ (Cổng Phạm vi Hỏi-5): HMAC-SHA256 với khoá riêng của từng bên nhận, có tiền tố miền để mã sàn
 * không trùng mã người khi hai mã gốc trùng nhau. Cùng sàn, cùng bên nhận → cùng mã; khác bên nhận → khác mã; không giải
 * ngược được khi không có khoá. Xoay khoá của một bên là đổi mọi mã của bên ấy — khoá sống lâu, chỉ xoay khi lộ.
 */
import { createHmac } from "node:crypto";

export const KHOA_BEN_NHAN_TOI_THIEU = 32;

/** 43 ký tự base64url (32 byte, không đệm). */
export function maMo(khoa: Uint8Array, mien: "office" | "member", id: string): string {
  return createHmac("sha256", khoa).update(`quy-hang/xac-nhan/v1/${mien}:${id}`).digest("base64url");
}
