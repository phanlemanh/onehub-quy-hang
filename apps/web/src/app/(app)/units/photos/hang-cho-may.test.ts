// Hàng chờ của cả app khi đổi người trên cùng máy (hàng 41 chup-anh-dien-thoai, AC-4, AC-6): hàng của người trước dừng
// hẳn — không gửi thêm ảnh nào (gửi bằng phiên người mới là sai người), không ghi kho cũ. Chạy hàm thật của vỏ với
// trình duyệt giả tối thiểu: fetch đếm lời gọi, không IndexedDB (kho mở lỗi → hàng chờ chỉ trong bộ nhớ, vẫn gửi).
import assert from "node:assert/strict";
import { test } from "node:test";

import type { TepSanSang } from "./tai-len";

const g = globalThis as unknown as Record<string, unknown>;
g.window = { addEventListener() {}, removeEventListener() {} };
Object.defineProperty(globalThis, "navigator", { value: { onLine: true }, configurable: true });
let goi = 0;
g.fetch = async () => {
  goi++;
  throw new TypeError("Failed to fetch");
};

const tep = (): TepSanSang => ({
  ok: true,
  file: new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "a.jpg", { type: "image/jpeg" }),
  type: "image/jpeg",
  takenAt: null,
  thumb: new Blob([new Uint8Array([1])]),
  width: 10,
  height: 10,
});

test("E4 đổi người trên cùng máy: hàng của người trước không gửi thêm ảnh nào; đối chứng dương: hàng đang chạy có gửi", { timeout: 5000 }, async () => {
  const { dungHangCho, khoiDongHangCho } = await import("./hang-cho-may");
  const a = khoiDongHangCho("u-a");
  await a.them("[Mẫu] Toà A", "A-01.02", "shareable", tep());
  await a.cho();
  assert.ok(goi > 0, "đối chứng dương: hàng của A đang chạy thì gửi");
  khoiDongHangCho("u-b");
  const truoc = goi;
  await a.them("[Mẫu] Toà A", "A-01.02", "internal", tep());
  await a.day();
  await a.cho();
  assert.equal(goi, truoc, "hàng của A sau khi đổi sang B không gửi lời nào");
  await dungHangCho();
});
