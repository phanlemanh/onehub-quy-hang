// Hàng 38 (E5, E5b): loại máy và trình duyệt suy từ userAgent — ma trận viết trước sáu chuỗi mẫu.
import assert from "node:assert/strict";
import { test } from "node:test";
import { loaiMay, trinhDuyet, type LoaiMay } from ".";

const MAU: [string, string, LoaiMay, string][] = [
  ["iPhone Safari", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1", "iphone", "Safari"],
  ["iPad báo Mac", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15", "may-tinh", "Safari"],
  ["Android Chrome", "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36", "android", "Chrome"],
  ["Mac Chrome", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36", "may-tinh", "Chrome"],
  ["Windows Edge", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0", "may-tinh", "Edge"],
  ["không rõ", "curl/8.4.0", "khac", ""],
];

test("thiết bị: loại máy và trình duyệt của sáu chuỗi mẫu", () => {
  assert.equal(MAU.length, 6);
  for (const [ten, ua, loai, td] of MAU) {
    assert.equal(loaiMay(ua), loai, ten);
    assert.equal(trinhDuyet(ua), td, ten);
  }
  assert.equal(loaiMay(null), "khac");
});
