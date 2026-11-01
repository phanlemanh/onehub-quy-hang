import assert from "node:assert/strict";
import { test } from "node:test";
import { docGia, vietGia, type KetQuaDocGia } from "./doc-gia";

// Viết tay trước khi có bộ đọc (AC-1) — không sinh từ mã đang đo.
const DUNG: [string, number][] = [
  ["4,65 tỷ", 4_650_000_000],
  ["4.65 tỷ", 4_650_000_000],
  ["4,65t", 4_650_000_000],
  ["4,65 t", 4_650_000_000],
  ["4 tỷ 650", 4_650_000_000],
  ["4ty65", 4_650_000_000],
  ["4 tỷ 650 triệu", 4_650_000_000],
  ["950 triệu", 950_000_000],
  ["950tr", 950_000_000],
  ["950 tr", 950_000_000],
  ["4650000000", 4_650_000_000],
  ["4.650.000.000", 4_650_000_000],
  ["4 650 000 000", 4_650_000_000],
  ["1,2 tỷ", 1_200_000_000],
  ["12 tỷ", 12_000_000_000],
  ["3 tỷ", 3_000_000_000],
  ["  3,25 TỶ  ", 3_250_000_000],
  ["3 tỉ", 3_000_000_000],
  ["2 ti 5", 2_500_000_000],
  ["1,5 triệu", 1_500_000],
  ["4.650.000.000 đ", 4_650_000_000],
  ["1000 tỷ", 1_000_000_000_000],
];

const CHUA_HIEU = ["", "   ", "abc", "12", "950", "4,65", "4,65 tỷ 3 triệu 2", "-5 tỷ", "1001 tỷ", "4,65 đô", "tỷ", "4,65 tỷ 650", "4 tỷ 1000 triệu", "4,1234567891 tỷ", "x".repeat(41)];

for (const [chu, dong] of DUNG) {
  test(`đọc «${chu}» → ${dong}`, () => {
    assert.deepEqual(docGia(chu), { ok: true, dong }, `dòng «${chu}»`);
  });
}

for (const chu of CHUA_HIEU) {
  test(`chưa hiểu «${chu.slice(0, 12)}»`, () => {
    assert.deepEqual(docGia(chu), { ok: false }, `dòng «${chu}» phải là chưa hiểu`);
  });
}

test("đối chứng đỏ: bộ đọc coi số trần là tỷ thì dòng «12» bị bắt", () => {
  const docSai = (chu: string): KetQuaDocGia => (/^\d+$/.test(chu.trim()) ? { ok: true, dong: Number(chu) * 1e9 } : docGia(chu));
  const loi = CHUA_HIEU.filter((c) => docSai(c).ok);
  assert.deepEqual(loi, ["12", "950"], "bảng chưa-hiểu phải gọi tên dòng «12» khi bộ đọc đoán");
});

test("viết giá gọn khi số tròn", () => {
  assert.equal(vietGia(4_650_000_000), "4,65 tỷ");
  assert.equal(vietGia(950_000_000), "950 triệu");
});

// Viết rồi đọc lại (va-sua-tren-o AC-1) — bảng viết tay trước bộ viết.
const VIET: [number, string][] = [
  [4_655_000_000, "4,655 tỷ"],
  [4_650_500_000, "4,6505 tỷ"],
  [1_500_000, "1,5 triệu"],
  [1_234_567, "1,234567 triệu"],
  [950_000_000, "950 triệu"],
  [4_800_000_000, "4,8 tỷ"],
  [1_000_000_000_000, "1000 tỷ"],
  [1_000_000, "1 triệu"],
  [999_999_999, "999,999999 triệu"],
  [1_000_000_001, "1,000000001 tỷ"],
];

/** Lệch của một bộ viết trên bảng viết trước: chữ sai hoặc đọc lại không bằng số. */
const lechVoi = (viet: (dong: number) => string) =>
  VIET.flatMap(([dong, chu]) => {
    const kq = docGia(viet(dong));
    return viet(dong) === chu && kq.ok && kq.dong === dong ? [] : [dong];
  });

for (const [dong, chu] of VIET) {
  test(`viết ${dong} → «${chu}», đọc lại bằng chính nó`, () => {
    assert.equal(vietGia(dong), chu, `số ${dong}`);
    assert.deepEqual(docGia(chu), { ok: true, dong }, `đọc lại «${chu}»`);
  });
}

test("2.000 số sinh theo hạt giống: viết rồi đọc lại bằng chính nó", () => {
  // mulberry32, hạt giống cố định — cùng dãy mỗi lần chạy.
  let h = 20261101;
  const ngauNhien = () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const hong: number[] = [];
  for (let i = 0; i < 2000; i++) {
    const dong = 1_000_000 + Math.floor(ngauNhien() * ngauNhien() * (1_000_000_000_000 - 1_000_000));
    const kq = docGia(vietGia(dong));
    if (!kq.ok || kq.dong !== dong) hong.push(dong);
  }
  assert.deepEqual(hong, [], `số đọc lại sai: ${hong.slice(0, 5).join(", ")}`);
});

test("đối chứng đỏ: bộ viết làm tròn hai số lẻ của tỷ thì dòng 4655000000 bị gọi tên", () => {
  const SO_2 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
  const vietTron = (dong: number) => (dong >= 1e9 ? `${SO_2.format(dong / 1e9)} tỷ` : `${SO_2.format(dong / 1e6)} triệu`);
  assert.deepEqual(lechVoi(vietGia), []);
  assert.ok(lechVoi(vietTron).includes(4_655_000_000), `bảng phải gọi tên 4655000000, gọi: ${lechVoi(vietTron).join(", ")}`);
});
