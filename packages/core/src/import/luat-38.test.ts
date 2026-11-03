/**
 * Ba lỗi hàng 64 mà chủ kho chọn «mở hợp đồng mới» (luật 38 của đợt dau-khach-nhap) — AC-2 của hàng 65a. Mỗi mục một ca
 * hai chiều: phép chặn và đối chứng dương trên cùng bảng dựng bằng `readTable` thật.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { applyPlan } from "./apply";
import { classifyColumns } from "./classify";
import { readTable } from "./grid";
import { planFromDictionary, validatePlan, type ImportPlan, type PlanTarget } from "./plan";

const LUOI_NGUON = [
  ["Mã căn", "Số chủ", "Chủ nhà", "Giá đáy"],
  ["A-01", "0900 000 001", "[Tên] Một", "3,1 tỷ"],
  ["A-02", "0900 000 002", "[Tên] Hai", "2,9 tỷ"],
  ["A-03", "0900 000 003", "[Tên] Ba", "4 tỷ"],
];

const doiDich = (plan: ImportPlan, i: number, target: PlanTarget): ImportPlan => ({
  ...plan,
  columns: plan.columns.map((c, k) => (k === i ? { column: c.column, target, confidence: c.confidence, reason: c.reason } : c)),
});

test("kế hoạch: cột lớp nguồn chỉ vào trường lớp nguồn", () => {
  const bang = readTable(LUOI_NGUON);
  const lop = classifyColumns(bang);
  assert.deepEqual(lop.slice(1).map((c) => c.cls), ["source", "source", "source"], "ba cột lớp nguồn");
  const goc = planFromDictionary(bang);
  assert.deepEqual(validatePlan(goc, bang), [], "kế hoạch từ điển hợp lệ");

  // Viết tay: 3 cột lớp nguồn × 4 đích sai, 3 × 2 đích đúng.
  const cot: [number, string, PlanTarget][] = [
    [1, "Số chủ", "ownerPhone"],
    [2, "Chủ nhà", "ownerName"],
    [3, "Giá đáy", "floorPrice"],
  ];
  const sai: PlanTarget[] = ["privateRemarks", "keep_as_note", "custom:x", "listPrice"];
  let soLan = 0;
  for (const [i, tieuDe, dung] of cot) {
    for (const dich of sai) {
      const loi = validatePlan(doiDich(goc, i, dich), bang).filter((e) => e.path === `columns[${i}].target`);
      assert.equal(loi.length, 1, `${tieuDe} → ${dich} phải bị chặn`);
      assert.match(loi[0]!.reason, new RegExp(`«${tieuDe}».*${dich.replace(":", ".")}`), `lỗi nêu cột và trường (${tieuDe} → ${dich})`);
      soLan++;
    }
    for (const dich of [dung, "ignore_with_reason"] as PlanTarget[]) {
      assert.deepEqual(validatePlan(doiDich(goc, i, dich), bang), [], `${tieuDe} → ${dich} phải qua`);
      soLan++;
    }
  }
  assert.equal(soLan, 18, "đủ 18 phép so");
});

test("kế hoạch: cột lớp nguồn không mang bảng quy đổi", () => {
  const bang = readTable(LUOI_NGUON);
  const goc = planFromDictionary(bang);
  const coMap: ImportPlan = { ...goc, columns: goc.columns.map((c, k) => (k === 1 ? { ...c, valueMap: { "0900 000 001": "0900 000 009" } } : c)) };
  const loi = validatePlan(coMap, bang);
  assert.deepEqual(loi.map((e) => e.path), ["columns[1].valueMap"], "đúng một lỗi ở bảng quy đổi của cột số chủ");
  assert.match(loi[0]!.reason, /«Số chủ».*bảng quy đổi/);
  assert.deepEqual(validatePlan(goc, bang), [], "đối chứng: cùng cột không bảng quy đổi thì qua");
});

test("lưới: tiêu đề có ô trống giữ dòng đầu", () => {
  const bang = readTable([
    ["Mã căn", "", "Giá"],
    ["A-01", "x", "3 tỷ"],
    ["A-02", "y", "2 tỷ"],
  ]);
  assert.equal(bang.headerRows, 1, "một tầng tiêu đề");
  assert.equal(bang.rows[0]?.source, 1, "dòng dữ liệu đầu giữ nguyên");
  assert.equal(bang.rows.length, 2);
  assert.deepEqual(bang.headers, ["Mã căn", "Cột B", "Giá"]);

  // Đối chứng: tiêu đề hai tầng thật (ô gộp dọc, tầng dưới dưới ô trống) vẫn nhận hai tầng.
  const hai = readTable([
    ["Mã căn", "Giá", ""],
    ["", "Chào", "Phí"],
    ["A-01", "3 tỷ", "bao phí"],
  ]);
  assert.equal(hai.headerRows, 2, "hai tầng thật");
  assert.deepEqual(hai.headers, ["Mã căn", "Giá / Chào", "Giá / Phí"]);
  assert.equal(hai.rows[0]?.source, 2);
});

test("áp: ô tên thuộc tính hệ thống không sập", () => {
  const bang = readTable([["Mã căn", "Tình trạng"], ["A-01", "constructor"], ["A-02", "toString"], ["A-03", "__proto__"], ["A-04", "còn"]]);
  const goc = planFromDictionary(bang);
  const plan: ImportPlan = { ...goc, columns: goc.columns.map((c, k) => (k === 1 ? { ...c, valueMap: { còn: "Đang bán" } } : c)) };
  assert.deepEqual(validatePlan(plan, bang), []);
  const kq = applyPlan(bang, plan, {});
  const o = kq.rows.map((r) => r.cells[1]!);
  for (const k of [0, 1, 2]) assert.equal(o[k]!.mark, "needs_person", `ô «${String(o[k]!.raw)}» thành ô cần người`);
  assert.equal(o[3]!.mark, "fixed", "đối chứng: ô có trong bảng quy đổi ra máy sửa");
  assert.equal(o[3]!.value, "Active");
});
