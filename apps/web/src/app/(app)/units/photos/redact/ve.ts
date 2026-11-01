/**
 * Dựng bản che trên trình duyệt (hàng 19): ảnh gốc vẽ đã xoay theo hướng EXIF → tô kín bằng `toKin` → thu về cỡ bản che →
 * webp. Lưu qua canvas nên không mang theo EXIF (vị trí, máy chụp) của ảnh gốc. Bản nhỏ của bản che dựng cùng lượt.
 */
import { BAN_CHE_CHAT_LUONG, coBanNhe } from "@quy-hang/core/photos";
import type { BanChe } from "./luu";
import { coBanChe, toKin, type Khung } from "./vung";

/** Ảnh gốc đã xoay theo hướng EXIF — trình che vẽ ảnh này lên màn và dựng bản che từ chính nó. */
export function moAnh(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob, { imageOrientation: "from-image" });
}

async function thuNho(nguon: OffscreenCanvas, co: { w: number; h: number }, chatLuong: number): Promise<Blob> {
  const c = new OffscreenCanvas(co.w, co.h);
  c.getContext("2d")?.drawImage(nguon, 0, 0, co.w, co.h);
  return c.convertToBlob({ type: "image/webp", quality: chatLuong });
}

export async function dungBanChe(anh: ImageBitmap, khung: readonly Khung[]): Promise<BanChe> {
  const goc = new OffscreenCanvas(anh.width, anh.height);
  const ctx = goc.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(anh, 0, 0);
  const diem = ctx.getImageData(0, 0, anh.width, anh.height);
  toKin(diem.data, anh.width, anh.height, khung);
  ctx.putImageData(diem, 0, 0);
  const co = coBanChe(anh.width, anh.height);
  const ban = await thuNho(goc, co, BAN_CHE_CHAT_LUONG);
  const thumb = await thuNho(goc, coBanNhe(anh.width, anh.height), 0.82);
  return { file: new File([ban], "ban-che.webp", { type: "image/webp" }), thumb, width: co.w, height: co.h };
}
