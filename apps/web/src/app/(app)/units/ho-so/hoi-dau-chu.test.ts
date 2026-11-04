// Nút «Hỏi đầu chủ» (hàng 33) — E5.
import assert from "node:assert/strict";
import { test } from "node:test";
import { cachMo, CHU_CHUA_GIU, moHoi, NHAN_HOI, nhanNutHoi, nutHoi, type CachMo, type MayChiaSe } from "./hoi-dau-chu";

const share = async () => {};
const clipboard = { writeText: async () => {} };

test("hỏi đầu chủ: chọn cách mở", () => {
  const BANG: [string, MayChiaSe, CachMo][] = [
    ["có navigator.share và canShare", { share, canShare: () => true, clipboard }, "chia-se"],
    ["không share mà có clipboard", { clipboard }, "chep"],
    ["không cả hai", {}, "khong"],
  ];
  for (const [o, may, mong] of BANG) assert.equal(cachMo(may), mong, o);
});

test("hỏi đầu chủ: căn chưa ai giữ", () => {
  assert.deepEqual(nutHoi(null, null), { tat: true, chu: "Căn chưa có đầu chủ giữ" });
  assert.equal(CHU_CHUA_GIU, "Căn chưa có đầu chủ giữ");
  assert.deepEqual(nutHoi("u-1", "[Tên đầu chủ]"), { tat: false, chu: "Hỏi đầu chủ · [Tên đầu chủ]" });
});

test("hỏi đầu chủ: nhãn", () => {
  // Nhãn chủ kho chọn ở Hỏi-2 (Cổng Phạm vi 04/11).
  assert.equal(NHAN_HOI, "Hỏi đầu chủ");
  assert.equal(nhanNutHoi(null), "Hỏi đầu chủ", "mất mạng: nút không tên");
});

test("hỏi đầu chủ: mở không gọi mạng, huỷ thì im", async () => {
  const tin = { text: "Hỏi về căn A-04.06 · Toà A", url: "https://quy-hang.test/inventory?unit=A-04.06" };
  let fetchDem = 0;
  const fetchCu = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchDem++;
    throw new Error("không được gọi mạng");
  }) as typeof fetch;
  try {
    const goi: unknown[] = [];
    assert.equal(await moHoi(tin, { share: async (d) => void goi.push(d) }), "chia-se");
    assert.deepEqual(goi, [{ title: tin.text, text: tin.text, url: tin.url }]);
    const chep: string[] = [];
    assert.equal(await moHoi(tin, { clipboard: { writeText: async (x) => void chep.push(x) } }), "da-chep");
    assert.ok(chep[0]!.includes(tin.text) && chep[0]!.includes(tin.url));
    const huy = Object.assign(new Error("huỷ"), { name: "AbortError" });
    assert.equal(await moHoi(tin, { share: () => Promise.reject(huy), clipboard }), "huy");
    assert.equal(fetchDem, 0);
  } finally {
    globalThis.fetch = fetchCu;
  }
});
