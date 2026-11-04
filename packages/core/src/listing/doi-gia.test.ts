import assert from "node:assert/strict";
import { test } from "node:test";
import { DOI_GIA_DA_BAN, kiemDoiGia, LY_DO_DOI_GIA_DA_BAN } from "./doi-gia";
import { STANDARD_STATUSES, type StandardStatus } from "./status";

// Ma trận viết tay (AC-1): sáu trạng thái chuẩn, kết cục đúng.
const MA_TRAN: [StandardStatus, typeof DOI_GIA_DA_BAN | null][] = [
  ["Incomplete", null],
  ["Active", null],
  ["Pending", null],
  ["Closed", DOI_GIA_DA_BAN],
  ["Hold", null],
  ["Withdrawn", null],
];

test("đổi giá: chỉ căn Đã bán bị từ chối", () => {
  assert.deepEqual(new Set(MA_TRAN.map(([s]) => s)), new Set(STANDARD_STATUSES), "ma trận phải phủ đúng sáu trạng thái chuẩn");
  let dem = 0;
  for (const [s, mong] of MA_TRAN) {
    assert.equal(kiemDoiGia({ standardStatus: s }), mong, `trạng thái ${s}`);
    dem++;
  }
  assert.equal(dem, 6);
});

test("đổi giá: lý do tiếng Việt", () => {
  assert.equal(LY_DO_DOI_GIA_DA_BAN, "Căn đã bán không đổi giá — giá chốt đã ghi");
});
