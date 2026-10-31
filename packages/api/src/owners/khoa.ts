import { createHash, timingSafeEqual } from "node:crypto";
import type { KhoaSoChu } from "./ma-hoa";

/**
 * Khoá mã hoá số chủ (hàng 62, ADR-0013). `OWNER_PHONE_KEY` = base64 của đúng 32 byte, chỉ ở môi trường chạy app.
 * Bản thật thiếu khoá hay dùng khoá dev thì ném — API không dựng thay vì ghi số rõ (cùng nếp bộ gửi mã, ADR-0009 §8).
 * Ngoài bản thật thiếu khoá thì dùng khoá dev công khai: vẫn mã hoá, chỉ cho máy dev, CI và test. Thông điệp lỗi chỉ nêu
 * tên biến, không bao giờ giá trị.
 */

export const KHOA_DEV: KhoaSoChu = { key: createHash("sha256").update("quy-hang-khoa-dev-so-chu-khong-dung-cho-du-lieu-that").digest() };

export const laKhoaDev = (k: KhoaSoChu) => k.key.length === KHOA_DEV.key.length && timingSafeEqual(k.key, KHOA_DEV.key);

const BASE64_32 = /^[A-Za-z0-9+/]{43}=$/;

/** `choPhepKhoaDev` mặc định đúng khi không phải bản thật; lệnh mã hoá lại luôn tắt nó. */
export function khoaSoChu(env: NodeJS.ProcessEnv = process.env, opts: { choPhepKhoaDev?: boolean } = {}): KhoaSoChu {
  const choPhepKhoaDev = opts.choPhepKhoaDev ?? env.NODE_ENV !== "production";
  const tho = env.OWNER_PHONE_KEY?.trim();
  if (!tho) {
    if (choPhepKhoaDev) return KHOA_DEV;
    throw new Error("thiếu OWNER_PHONE_KEY — không dựng khi chưa có khoá mã hoá số chủ");
  }
  if (!BASE64_32.test(tho)) throw new Error("OWNER_PHONE_KEY sai dạng — cần base64 của đúng 32 byte");
  const khoa = { key: Buffer.from(tho, "base64") };
  if (!choPhepKhoaDev && laKhoaDev(khoa)) throw new Error("OWNER_PHONE_KEY đang là khoá dev — không dùng cho dữ liệu thật");
  return khoa;
}
