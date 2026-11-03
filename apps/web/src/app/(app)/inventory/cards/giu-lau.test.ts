// Máy giữ lâu của thẻ (hàng 32) — E4. Đồng hồ giả: thời điểm truyền vào từng sự kiện, không setTimeout thật.
import assert from "node:assert/strict";
import { test } from "node:test";
import { taoGiuLau, type Ra, type SuKien } from "./giu-lau";

const xuong = (t = 0): SuKien => ({ loai: "xuong", t, x: 100, y: 100 });
const dich = (t: number, dx: number): SuKien => ({ loai: "dich", t, x: 100 + dx, y: 100 });
const len = (t: number): SuKien => ({ loai: "len", t, x: 100, y: 100 });
const gio = (t: number): SuKien => ({ loai: "dong-ho", t });

// Ma trận viết trước: sáu ca, mỗi ca đúng chuỗi sự kiện ra.
const MA_TRAN: [string, SuKien[], Ra[]][] = [
  ["(a) xuống, 499 ms, lên → chạm", [xuong(), gio(499), len(499)], ["cham"]],
  ["(b) xuống, 500 ms → giữ lâu, rồi lên không chạm", [xuong(), gio(500), len(700)], ["giu-lau"]],
  ["(c) dời 11 px ở 200 ms → huỷ, không giữ lâu", [xuong(), dich(200, 11), gio(600), len(650)], ["huy"]],
  ["(d) dời 9 px rồi 500 ms → giữ lâu", [xuong(), dich(200, 9), gio(500)], ["giu-lau"]],
  ["(e) cuộn ở 300 ms → huỷ", [xuong(), { loai: "cuon", t: 300 }, gio(600)], ["huy"]],
  ["(f) pointercancel → huỷ", [xuong(), { loai: "huy", t: 100 }, gio(600)], ["huy"]],
];

const chay = (sk: SuKien[], o?: { nguong?: number }) => {
  const m = taoGiuLau(o);
  return sk.flatMap((e) => m.buoc(e));
};

for (const [ten, sk, mong] of MA_TRAN) {
  test(`giữ lâu: ${ten}`, () => assert.deepEqual(chay(sk), mong, ten));
}

test("giữ lâu: nhả đúng lúc đủ ngưỡng mà đồng hồ chưa gõ vẫn là giữ lâu, không chạm", () => {
  assert.deepEqual(chay([xuong(), len(520)]), ["giu-lau"]);
});

test("giữ lâu — đối chứng đỏ: ngưỡng 300 ms làm ca (a) trượt", () => {
  const [ten, sk, mong] = MA_TRAN[0]!;
  assert.throws(() => assert.deepEqual(chay(sk, { nguong: 300 }), mong, `${ten} — ngưỡng giữ lâu`), /ngưỡng giữ lâu/);
});
