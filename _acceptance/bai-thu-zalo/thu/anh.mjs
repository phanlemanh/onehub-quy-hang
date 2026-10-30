// Ảnh xem trước PNG 1200×630 dựng bằng zlib của Node — không phụ thuộc gói ngoài.
import { deflateSync } from 'node:zlib';

export const RONG = 1200;
export const CAO = 630;

const BANG_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = BANG_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function khoi(loai, du) {
  const dai = Buffer.alloc(4);
  dai.writeUInt32BE(du.length);
  const ten = Buffer.from(loai, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([ten, du])));
  return Buffer.concat([dai, ten, du, crc]);
}

// Màu nền theo mã để mỗi link có ảnh khác nhau — Zalo lưu đệm theo URL, ảnh khác giúp người thử nhận ra link nào.
function mauTheoMa(ma) {
  let h = 0;
  for (const ch of String(ma)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return [40 + (h % 120), 90 + ((h >> 8) % 100), 140 + ((h >> 16) % 100)];
}

/** PNG 1200×630: nền theo mã, một dải sáng giữa ảnh và một khối ô vuông ở góc. */
export function anhXemTruoc(ma) {
  const [r, g, b] = mauTheoMa(ma);
  const dong = RONG * 3 + 1;
  const tho = Buffer.alloc(dong * CAO);
  for (let y = 0; y < CAO; y++) {
    tho[y * dong] = 0;
    for (let x = 0; x < RONG; x++) {
      const i = y * dong + 1 + x * 3;
      const dai = y > 250 && y < 380;
      const o = x > 60 && x < 300 && y > 60 && y < 200 && ((x >> 5) + (y >> 5)) % 2 === 0;
      tho[i] = dai || o ? 245 : r;
      tho[i + 1] = dai || o ? 245 : g;
      tho[i + 2] = dai || o ? 240 : b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(RONG, 0);
  ihdr.writeUInt32BE(CAO, 4);
  ihdr[8] = 8; // độ sâu bit
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    khoi('IHDR', ihdr),
    khoi('IDAT', deflateSync(tho, { level: 9 })),
    khoi('IEND', Buffer.alloc(0)),
  ]);
}

/** Đọc chữ ký và cỡ trong IHDR — dùng cho bài kiểm. */
export function docCoPng(buf) {
  const chuKy = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!chuKy || buf.subarray(12, 16).toString('ascii') !== 'IHDR') return null;
  return { rong: buf.readUInt32BE(16), cao: buf.readUInt32BE(20) };
}
