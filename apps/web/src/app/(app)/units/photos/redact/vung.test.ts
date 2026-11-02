// Che vùng ảnh (hàng 19) — E1–E4. Bảng viết tay trước mã; mỗi bảng một đối chứng đỏ.
import assert from "node:assert/strict";
import { test } from "node:test";
import { BAN_CHE_CANH_DAI } from "@quy-hang/core/photos";
import { coBanChe, coExif, khungTuMan, toKin, type Khung } from "./vung";

// E1 — [tên, điểm a, điểm b, cỡ hiện, cỡ ảnh đã xoay, khung mong đợi].
type O = [string, [number, number], [number, number], [number, number], [number, number], Khung | null];
const TOA_DO: O[] = [
  ["thu nhỏ 2,5", [10, 20], [110, 220], [800, 600], [2000, 1500], { x: 25, y: 50, w: 250, h: 500 }],
  ["kéo ngược chiều", [110, 220], [10, 20], [800, 600], [2000, 1500], { x: 25, y: 50, w: 250, h: 500 }],
  ["tràn mép", [-5, -5], [900, 700], [800, 600], [2000, 1500], { x: 0, y: 0, w: 2000, h: 1500 }],
  ["phóng to 0,5", [100, 100], [300, 200], [800, 600], [400, 300], { x: 50, y: 50, w: 100, h: 50 }],
  ["khung rỗng", [50, 50], [50, 200], [800, 600], [2000, 1500], null],
  // Ảnh dọc điện thoại: điểm ảnh lưu 2000x1500 kèm hướng 6, trình duyệt vẽ ảnh đã xoay 1500x2000, hiện 600x800.
  ["ảnh dọc theo EXIF", [0, 0], [60, 80], [600, 800], [1500, 2000], { x: 0, y: 0, w: 150, h: 200 }],
];
for (const [ten, a, b, hien, anh, mong] of TOA_DO) {
  test(`E1 ${ten}`, () => {
    assert.deepEqual(khungTuMan({ x: a[0], y: a[1] }, { x: b[0], y: b[1] }, { w: hien[0], h: hien[1] }, { w: anh[0], h: anh[1] }), mong, `ô ${ten}`);
  });
}

test("E1 đối chứng đỏ: không kẹp mép thì ô tràn mép bị gọi tên", () => {
  const khongKep = (a: { x: number; y: number }, b: { x: number; y: number }, hien: { w: number }, anh: { w: number }) => {
    const k = anh.w / hien.w;
    return { x: Math.round(Math.min(a.x, b.x) * k), y: Math.round(Math.min(a.y, b.y) * k) };
  };
  const lech = TOA_DO.filter(([, a, b, hien, anh, m]) => m && JSON.stringify(khongKep({ x: a[0], y: a[1] }, { x: b[0], y: b[1] }, { w: hien[0] }, { w: anh[0] })) !== JSON.stringify({ x: m.x, y: m.y })).map(([t]) => t);
  assert.ok(lech.includes("tràn mép"), `ô lệch: ${lech.join(", ")}`);
});

// E2 — tô kín trên mảng RGBA 8x6, mỗi điểm mang giá trị riêng để thấy điểm nào bị đổi.
const R = 8, C = 6;
const mau = () => Uint8ClampedArray.from({ length: R * C * 4 }, (_, i) => (i % 251) + 1);
const trong = (x: number, y: number, ks: Khung[]) => ks.some((k) => x >= k.x && x < k.x + k.w && y >= k.y && y < k.y + k.h);
function lechDiem(ra: Uint8ClampedArray, goc: Uint8ClampedArray, ks: Khung[]): string[] {
  const lech: string[] = [];
  let dem = 0;
  for (let y = 0; y < C; y++) for (let x = 0; x < R; x++) {
    dem++;
    const i = (y * R + x) * 4;
    const mong = trong(x, y, ks) ? [0, 0, 0, 255] : [goc[i], goc[i + 1], goc[i + 2], goc[i + 3]];
    if ([0, 1, 2, 3].some((j) => ra[i + j] !== mong[j])) lech.push(`(${x},${y})`);
  }
  assert.equal(dem, 48);
  return lech;
}
const CA_TO: [string, Khung[]][] = [
  ["một khung", [{ x: 2, y: 1, w: 3, h: 2 }]],
  ["hai khung chồng nhau", [{ x: 1, y: 1, w: 3, h: 3 }, { x: 3, y: 2, w: 3, h: 3 }]],
  ["khung 1x1 góc phải dưới", [{ x: 7, y: 5, w: 1, h: 1 }]],
  ["không khung", []],
];
for (const [ten, ks] of CA_TO) {
  test(`E2 ${ten}: trong khung tô kín, ngoài khung giữ nguyên`, () => {
    const goc = mau();
    const ra = Uint8ClampedArray.from(goc);
    toKin(ra, R, C, ks);
    assert.deepEqual(lechDiem(ra, goc, ks), [], ten);
  });
}

test("E2 đối chứng đỏ: tô thiếu cột cuối của khung thì điểm lệch bị gọi tên", () => {
  const goc = mau();
  const ra = Uint8ClampedArray.from(goc);
  toKin(ra, R, C, [{ x: 2, y: 1, w: 2, h: 2 }]); // bản giả: rộng 2 thay vì 3
  assert.deepEqual(lechDiem(ra, goc, [{ x: 2, y: 1, w: 3, h: 2 }]), ["(4,1)", "(4,2)"]);
});

// E3 — cỡ bản che.
const CO: [number, number, number, number][] = [[4000, 3000, 1600, 1200], [3000, 4000, 1200, 1600], [1600, 900, 1600, 900], [800, 600, 800, 600], [4001, 1, 1600, 1]];
for (const [w, h, mw, mh] of CO) test(`E3 ${w}x${h} → ${mw}x${mh}`, () => assert.deepEqual(coBanChe(w, h), { w: mw, h: mh }, `ca ${w}x${h}`));
test("E3 cỡ đọc từ hằng mặc định của sàn ở lõi", () => assert.equal(BAN_CHE_CANH_DAI, 1600));
test("E3 đối chứng đỏ: dùng cạnh ngắn thì ca 3000x4000 bị gọi tên", () => {
  const sai = (w: number, h: number) => { const k = 1600 / Math.min(w, h); return { w: Math.round(w * k), h: Math.round(h * k) }; };
  const lech = CO.filter(([w, h, mw, mh]) => JSON.stringify(sai(w, h)) !== JSON.stringify({ w: mw, h: mh })).map(([w, h]) => `${w}x${h}`);
  assert.ok(lech.includes("3000x4000"), `ca lệch: ${lech.join(", ")}`);
});

// E4 — dò EXIF trên byte viết tay.
const jpeg = (doan: number[][]) => Uint8Array.from([0xff, 0xd8, ...doan.flat(), 0xff, 0xda, 0, 2]);
const app = (loai: number, noiDung: string) => { const b = [...noiDung].map((c) => c.charCodeAt(0)); const dai = b.length + 2; return [0xff, loai, dai >> 8, dai & 255, ...b]; };
const webp = (chunks: [string, number][]) => {
  const than = chunks.flatMap(([ten, n]) => [...[...ten].map((c) => c.charCodeAt(0)), n & 255, 0, 0, 0, ...Array(n + (n % 2)).fill(0)]);
  return Uint8Array.from([..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBP"].map((c) => c.charCodeAt(0)), than));
};
const EXIF: [string, Uint8Array, boolean][] = [
  ["JPEG có APP1 Exif", jpeg([app(0xe0, "JFIF\0"), app(0xe1, "Exif\0\0MM")]), true],
  ["JPEG không APP1", jpeg([app(0xe0, "JFIF\0")]), false],
  ["WebP có chunk EXIF", webp([["VP8 ", 4], ["EXIF", 6]]), true],
  ["WebP không EXIF", webp([["VP8 ", 4]]), false],
];
for (const [ten, b, mong] of EXIF) test(`E4 ${ten} → ${mong}`, () => assert.equal(coExif(b), mong, `ca ${ten}`));
test("E4 đối chứng đỏ: bộ kiểm chỉ đọc JPEG thì ca WebP có EXIF bị gọi tên", () => {
  const sai = (b: Uint8Array) => b[0] === 0xff && coExif(b);
  const lech = EXIF.filter(([, b, m]) => sai(b) !== m).map(([t]) => t);
  assert.deepEqual(lech, ["WebP có chunk EXIF"]);
});
