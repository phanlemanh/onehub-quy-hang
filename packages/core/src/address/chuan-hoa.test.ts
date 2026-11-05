// Chuẩn hoá số nhà, tên đường và khoá (hàng 75, hồ sơ dia-chi-chuan) — E7.
import assert from "node:assert/strict";
import { test } from "node:test";
import { khoaDiaChi, tachSoNha, tenDuongChuan } from "./chuan-hoa";

/** Ma trận số nhà viết trước: chữ gõ (phần số nhà + đường) → số nhà chuẩn. */
const MA_TRAN_SO_NHA: readonly [string, string][] = [
  ["45/12/3 Đường Mẫu 1", "45/12/3"],
  ["45 / 12 / 3 Đường Mẫu 1", "45/12/3"],
  ["số 3 hẻm 45/12 Đường Mẫu 1", "45/12/3"],
  ["số 3, HXH 45/12, Đường Mẫu 1", "45/12/3"],
  ["số 3 hẻm xe hơi 45/12 Đường Mẫu 1", "45/12/3"],
  ["số 3 kiệt 45/12 Đường Mẫu 1", "45/12/3"],
  ["số 3 ngách 12 ngõ 45 Phố Mẫu 1", "45/12/3"],
  ["Số 3 Ngõ 45 Ngách 12 Phố Mẫu 1", "45/12/3"],
  ["45a Đường Mẫu 1", "45A"],
  ["số 45 Đường Mẫu 1", "45"],
];

/** Ma trận tên đường viết trước → tên đường chuẩn hoá. */
const MA_TRAN_TEN_DUONG: readonly [string, string][] = [
  ["Đường Mẫu 1", "mau 1"],
  ["đường  mẫu   1", "mau 1"],
  ["Duong Mau 1", "mau 1"],
  ["DUONG MAU 1", "mau 1"],
  ["Mẫu 1", "mau 1"],
  ["Phố Mẫu 1", "mau 1"],
];

type BoTach = (phan: string) => { streetNumber: string | null };

/** Hàm kiểm: mỗi dòng ma trận ra đúng số nhà. Trả danh sách lỗi. */
function kiemSoNha(tach: BoTach): string[] {
  return MA_TRAN_SO_NHA.flatMap(([chu, dung]) => (tach(chu).streetNumber === dung ? [] : [`số nhà lệch: ${chu.replace(/ (Đường|Phố) Mẫu 1$/, "")}`]));
}

test("AC-7 chuẩn hoá số nhà, tên đường, khoá", () => {
  let soAssert = 0;
  for (const [chu, dung] of MA_TRAN_SO_NHA) {
    assert.equal(tachSoNha(chu).streetNumber, dung, `số nhà của «${chu}»`);
    soAssert++;
  }
  for (const [chu, dung] of MA_TRAN_TEN_DUONG) {
    assert.equal(tenDuongChuan(chu), dung, `tên đường của «${chu}»`);
    soAssert++;
  }
  assert.equal(khoaDiaChi("79", "26740", "Đường Mẫu 1", "45/12/3"), "79|26740|mau 1|45/12/3");
  soAssert++;
  assert.equal(soAssert, MA_TRAN_SO_NHA.length + MA_TRAN_TEN_DUONG.length + 1, "số assert phải bằng số dòng ma trận");
  console.log(`AC-7: ${MA_TRAN_SO_NHA.length} dòng số nhà, ${MA_TRAN_TEN_DUONG.length} dòng tên đường, 1 khoá`);
  // Hẻm không kèm số nhà là địa chỉ của hẻm.
  assert.deepEqual(tachSoNha("hẻm 45 Đường Mẫu 1"), { streetNumber: null, streetName: "Đường Mẫu 1", hemKhongSo: true });
  assert.deepEqual(kiemSoNha(tachSoNha), []);
});

test("AC-7 chuẩn hoá — phá thử: bộ tách không đảo ngõ · ngách thì đỏ", () => {
  // Bản sao của bộ tách nối hẻm theo đúng thứ tự chữ xuất hiện (không đảo về ngõ → ngách → số).
  const boSai: BoTach = (phan) => {
    const r = tachSoNha(phan);
    const m = /số (\d+) ngách (\d+) ngõ (\d+)/i.exec(phan);
    return m ? { streetNumber: `${m[1]}/${m[2]}/${m[3]}` } : r;
  };
  assert.deepEqual(kiemSoNha(boSai), ["số nhà lệch: số 3 ngách 12 ngõ 45"]);
});
