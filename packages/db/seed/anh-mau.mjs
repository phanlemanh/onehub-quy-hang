// Ảnh vẽ bằng mã cho căn mẫu của bộ nạp bản thật (hàng nap-mau-co-anh): một PNG khối màu theo thứ tự hàng trong gói —
// không chữ, không dữ liệu thật của ai. Cùng thứ tự ra cùng từng byte; khác thứ tự ra màu và dải khác. Luật lõi (hàng 23)
// đòi một ảnh thật ngăn Gửi được trước khi vào Đang bán, nên bộ nạp thêm ảnh này qua API ảnh trước lệnh lên Đang bán.
import { crc32, deflateSync } from "node:zlib";

export const RONG = 640;
export const CAO = 480;
export const RONG_NHE = 160;
export const CAO_NHE = 120;

const CHU_KY = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function khoi(loai, du) {
  const dau = Buffer.alloc(8);
  dau.writeUInt32BE(du.length, 0);
  dau.write(loai, 4, "ascii");
  const cuoi = Buffer.alloc(4);
  cuoi.writeUInt32BE(crc32(Buffer.concat([dau.subarray(4), du])) >>> 0, 0);
  return Buffer.concat([dau, du, cuoi]);
}

/** Sắc độ (0–359) sang RGB, độ bão hoà và độ sáng cố định. */
function mau(sac, sang) {
  const c = (1 - Math.abs(2 * sang - 1)) * 0.55;
  const x = c * (1 - Math.abs(((sac / 60) % 2) - 1));
  const m = sang - c / 2;
  const [r, g, b] =
    sac < 60 ? [c, x, 0] : sac < 120 ? [x, c, 0] : sac < 180 ? [0, c, x] : sac < 240 ? [0, x, c] : sac < 300 ? [x, 0, c] : [c, 0, x];
  return [r, g, b].map((v) => Math.round((v + m) * 255));
}

/** Một PNG RGB rộng × cao: nền theo sắc độ của i, một dải dọc sáng hơn ở vị trí theo i. */
function ve(i, rong, cao) {
  const sac = (i * 47) % 360;
  const nen = mau(sac, 0.62);
  const dai = mau((sac + 180) % 360, 0.45);
  const tu = Math.floor(((i * 37) % 80) / 100 * rong);
  const den = tu + Math.max(1, Math.floor(rong / 6));
  const dong = Buffer.alloc(1 + rong * 3);
  for (let x = 0; x < rong; x++) {
    const [r, g, b] = x >= tu && x < den ? dai : nen;
    dong[1 + x * 3] = r;
    dong[2 + x * 3] = g;
    dong[3 + x * 3] = b;
  }
  const tho = Buffer.concat(Array.from({ length: cao }, () => dong));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(rong, 0);
  ihdr.writeUInt32BE(cao, 4);
  ihdr[8] = 8; // 8 bit mỗi kênh
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    CHU_KY,
    khoi("IHDR", ihdr),
    khoi("IDAT", deflateSync(tho, { level: 9 })),
    khoi("IEND", Buffer.alloc(0)),
  ]);
}

/** Ảnh mẫu của hàng thứ i (đếm từ 0) trong gói: bản gốc 640×480 và bản nhẹ 160×120. */
export function anhMau(i) {
  if (!Number.isInteger(i) || i < 0) throw new Error(`anhMau: thứ tự hàng phải là số nguyên ≥ 0, nhận ${i}`);
  return { goc: ve(i, RONG, CAO), nhe: ve(i, RONG_NHE, CAO_NHE), width: RONG, height: CAO };
}
