// Mức đủ có mục ảnh (anh-khong-chan-ban, AC-4 phần lõi, AC-5): không truyền số ảnh thì năm mục như cũ; truyền thì sáu.
import assert from "node:assert/strict";
import { test } from "node:test";
import { completeness, COMPLETENESS_ITEMS } from "./completeness";

const DU = { listPrice: 3_500_000_000, feeInclusion: "excluded", furnished: "full", legalStatus: "pink_book", financing: "cash", occupantType: "vacant" };

test("mục ảnh của mức đủ", () => {
  assert.equal(completeness(DU).total, 5, "không truyền ảnh: năm mục");
  assert.ok(!(COMPLETENESS_ITEMS as readonly string[]).includes("photos"), "danh sách hỏi không có ảnh");
  const khong = completeness(DU, { photosCount: 0 });
  assert.equal(khong.total, 6, "truyền ảnh: sáu mục");
  assert.deepEqual(khong.missing, ["photos"], "0 ảnh: thiếu đúng mục ảnh");
  assert.equal(khong.filled, 5);
  const co = completeness(DU, { photosCount: 1 });
  assert.deepEqual([co.filled, co.total, co.missing], [6, 6, []], "1 ảnh: đủ");
  const thieuHai = completeness({ ...DU, legalStatus: null }, { photosCount: 0 });
  assert.deepEqual(thieuHai.missing, ["legalStatus", "photos"], "mục ảnh đứng sau năm mục mô tả");
});
