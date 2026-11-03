import assert from "node:assert/strict";
import { test } from "node:test";
import { readTable } from "./grid";
import { validatePlan } from "./plan";

const BANG = readTable([
  ["STT", "Mã căn", "Giá (tỷ)", "Ghi chú"],
  [1, "A-01.03", 4.65, "x"],
  [2, "A-01.05", 6.39, null],
]);
const tot = () => ({
  headerRow: 0,
  columns: [
    { column: "STT", target: "ignore_with_reason", confidence: "high", reason: "số thứ tự" },
    { column: "Mã căn", target: "unitNumber", transform: { name: "unit_code" }, confidence: "high", reason: "khớp" },
    { column: "Giá (tỷ)", target: "listPrice", transform: { name: "price", params: { unit: "ty" } }, confidence: "high", reason: "khớp" },
    { column: "Ghi chú", target: "privateRemarks", confidence: "high", reason: "khớp" },
  ],
  questions: [],
});
type KeHoach = ReturnType<typeof tot> & Record<string, unknown>;

// Ma trận viết tay (AC-6): mỗi chỗ hỏng một kế hoạch, đường lỗi đúng.
const HONG: [string, (k: KeHoach) => void, string][] = [
  ["khoá lạ ở gốc", (k) => (k.extra = 1), "extra"],
  ["khoá lạ ở cột", (k) => ((k.columns[1] as Record<string, unknown>).owner = "x"), "columns[1].owner"],
  ["khoá lạ ở phép", (k) => ((k.columns[2]!.transform as Record<string, unknown>).script = "x"), "columns[2].transform.script"],
  ["phép ngoài thực đơn", (k) => (k.columns[1]!.transform = { name: "eval" }), "columns[1].transform.name"],
  ["tham số lạ", (k) => (k.columns[2]!.transform = { name: "price", params: { unit: "ty", round: "up" } } as never), "columns[2].transform.params.round"],
  ["tham số trùng tên thuộc tính hệ thống", (k) => (k.columns[1]!.transform = { name: "status", params: { toString: "x" } } as never), "columns[1].transform.params.toString"],
  ["tham số «constructor»", (k) => (k.columns[2]!.transform = { name: "price", params: { unit: "ty", constructor: "x" } } as never), "columns[2].transform.params.constructor"],
  ["tham số sai giá trị", (k) => (k.columns[2]!.transform = { name: "price", params: { unit: "usd" } }), "columns[2].transform.params.unit"],
  ["thiếu tham số bắt buộc", (k) => (k.columns[2]!.transform = { name: "price" } as never), "columns[2].transform.params.unit"],
  ["bỏ cột có dữ liệu", (k) => (k.columns[3]!.target = "ignore_with_reason"), "columns[3].target"],
  ["đích lạ", (k) => (k.columns[3]!.target = "ownerSecret"), "columns[3].target"],
  ["thiếu cột", (k) => k.columns.pop(), "columns"],
  ["sai tiêu đề", (k) => (k.columns[1]!.column = "Mã"), "columns[1].column"],
  ["độ tin lạ", (k) => (k.columns[1]!.confidence = "sure"), "columns[1].confidence"],
  ["thiếu lý do", (k) => (k.columns[1]!.reason = " "), "columns[1].reason"],
];

test("kế hoạch: khuôn chặt từ chối từng chỗ hỏng", () => {
  assert.deepEqual(validatePlan(tot(), BANG), [], "kế hoạch hợp lệ");
  let dem = 0;
  for (const [ten, pha, duong] of HONG) {
    const k = tot() as KeHoach;
    pha(k);
    const loi = validatePlan(k, BANG);
    assert.ok(loi.some((l) => l.path === duong), `${ten}: cần lỗi ở «${duong}», ra ${JSON.stringify(loi)}`);
    dem++;
  }
  assert.equal(dem, HONG.length);
});
