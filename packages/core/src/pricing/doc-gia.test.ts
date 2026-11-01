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

test("viết giá như cột Giá", () => {
  assert.equal(vietGia(4_650_000_000), "4,65 tỷ");
  assert.equal(vietGia(950_000_000), "950 triệu");
});
