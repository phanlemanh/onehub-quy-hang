/**
 * Che vùng ảnh (hàng 19): phần thuần của trình che — đổi khung trên màn sang điểm ảnh, tô kín, cỡ bản che, dò EXIF.
 * Không DOM, không canvas: trình che và bài kiểm cùng đọc. Toạ độ luôn theo ảnh đã xoay theo hướng EXIF — ảnh trình duyệt
 * vẽ và bản che dùng cùng một khung vẽ, nên khung rơi đúng chỗ người thấy.
 */
import { BAN_CHE_CANH_DAI } from "@quy-hang/core/photos";

/** Khung che theo điểm ảnh của ảnh đã xoay: góc trên trái và cỡ, số nguyên. */
export type Khung = { x: number; y: number; w: number; h: number };
export type Co = { w: number; h: number };

const kep = (v: number, max: number) => Math.min(max, Math.max(0, v));

/**
 * Hai điểm kéo trên màn (cỡ ảnh đang hiện `hien`) → khung trên ảnh `anh`. Kéo chiều nào cũng được; tràn mép thì kẹp; khung
 * rỗng (rộng hay cao 0 sau khi kẹp) trả null.
 */
export function khungTuMan(a: { x: number; y: number }, b: { x: number; y: number }, hien: Co, anh: Co): Khung | null {
  const kx = anh.w / hien.w;
  const ky = anh.h / hien.h;
  const x0 = Math.round(kep(Math.min(a.x, b.x) * kx, anh.w));
  const x1 = Math.round(kep(Math.max(a.x, b.x) * kx, anh.w));
  const y0 = Math.round(kep(Math.min(a.y, b.y) * ky, anh.h));
  const y1 = Math.round(kep(Math.max(a.y, b.y) * ky, anh.h));
  return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
}

/**
 * Điểm trên khung vẽ đang hiện ở cỡ `hienThi` (đã co theo hộp) → điểm trên cỡ vẽ `hien` mà `khungTuMan` đọc. Nhân theo từng
 * trục; không kẹp — `khungTuMan` kẹp mép. Khung hiển thị rỗng (chưa bố trí) trả nguyên điểm.
 */
export function diemTrenKhung(p: { x: number; y: number }, hienThi: Co, hien: Co): { x: number; y: number } {
  if (!hienThi.w || !hienThi.h) return p;
  return { x: (p.x * hien.w) / hienThi.w, y: (p.y * hien.h) / hienThi.h };
}

/** Màu tô: đen đặc, đủ độ đục — làm mờ hay vỡ hạt đọc ngược được chữ số (Hỏi-3). */
export const MAU_TO: readonly [number, number, number, number] = [0, 0, 0, 255];

/** Tô kín từng khung trên mảng RGBA (rộng × cao × 4), tại chỗ; điểm ngoài khung giữ nguyên. */
export function toKin(data: Uint8ClampedArray | Uint8Array, rong: number, cao: number, khung: readonly Khung[], mau = MAU_TO): void {
  for (const k of khung) {
    const x1 = Math.min(rong, k.x + k.w);
    const y1 = Math.min(cao, k.y + k.h);
    for (let y = Math.max(0, k.y); y < y1; y++) {
      for (let x = Math.max(0, k.x); x < x1; x++) {
        const i = (y * rong + x) * 4;
        data[i] = mau[0];
        data[i + 1] = mau[1];
        data[i + 2] = mau[2];
        data[i + 3] = mau[3];
      }
    }
  }
}

/** Cỡ bản che: cạnh dài ≤ mặc định của sàn, giữ tỉ lệ; ảnh nhỏ hơn giữ nguyên. */
export function coBanChe(w: number, h: number): Co {
  const dai = Math.max(w, h);
  if (dai <= BAN_CHE_CANH_DAI) return { w, h };
  const k = BAN_CHE_CANH_DAI / dai;
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

const chu = (b: Uint8Array, at: number, s: string) => [...s].every((c, i) => b[at + i] === c.charCodeAt(0));

/** Byte ảnh còn khối EXIF không: JPEG có đoạn APP1 «Exif», WebP có chunk «EXIF». */
export function coExif(b: Uint8Array): boolean {
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 4 <= b.length && b[i] === 0xff) {
      const loai = b[i + 1]!;
      if (loai === 0xda || loai === 0xd9) return false;
      const dai = (b[i + 2]! << 8) | b[i + 3]!;
      if (loai === 0xe1 && chu(b, i + 4, "Exif")) return true;
      i += 2 + dai;
    }
    return false;
  }
  if (b.length >= 12 && chu(b, 0, "RIFF") && chu(b, 8, "WEBP")) {
    let i = 12;
    while (i + 8 <= b.length) {
      if (chu(b, i, "EXIF")) return true;
      const dai = b[i + 4]! | (b[i + 5]! << 8) | (b[i + 6]! << 16) | (b[i + 7]! << 24);
      i += 8 + dai + (dai % 2);
    }
  }
  return false;
}
