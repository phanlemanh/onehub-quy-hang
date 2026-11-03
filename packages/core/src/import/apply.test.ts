import assert from "node:assert/strict";
import { test } from "node:test";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../test/import/sinh";
import { applyPlan } from "./apply";
import { readTable } from "./grid";
import { planFromDictionary } from "./plan";
import { MARKS, type ImportContext } from "./transforms";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const banMaCan = sinhBoThu().find((t) => t.ten === "ban-ma-can")!;
const bang = readTable(banMaCan.grid!);
const keHoach = planFromDictionary(bang);

test("áp kế hoạch: tất định từng byte, bốn dấu, lý do", () => {
  const a = JSON.stringify(applyPlan(bang, keHoach, CTX));
  const b = JSON.stringify(applyPlan(bang, keHoach, CTX));
  assert.equal(a, b, "hai lần áp ra cùng byte");
  const r = applyPlan(bang, keHoach, CTX);
  let dem = 0;
  for (const row of r.rows) {
    for (const c of row.cells) {
      assert.ok(MARKS.includes(c.mark), `dòng ${row.source}: dấu lạ ${c.mark}`);
      if (c.mark !== "keep") assert.ok(c.reason?.trim(), `dòng ${row.source} cột «${c.column}»: dấu ${c.mark} thiếu lý do`);
      dem++;
    }
  }
  assert.equal(dem, bang.rows.length * bang.headers.length);
});

test("áp kế hoạch: danh mục lệch và trùng mã", () => {
  const r = applyPlan(bang, keHoach, CTX);
  const o = (dong: number, cot: number) => r.rows[dong]!.cells[cot]!;
  // Dòng 6 (i % 10 === 6): toà lệch danh mục.
  const lech = o(6, 2);
  assert.equal(lech.mark, "needs_person");
  assert.match(lech.reason!, new RegExp(`file ghi «${String(bang.rows[6]!.cells[2])}», danh mục ghi «Toà [AB]»`));
  // Dòng 5: toà ghi khoá → lấy theo danh mục.
  assert.equal(o(5, 2).mark, "fixed");
  assert.match(String(o(5, 2).value), /^Toà [AB]$/);
  // Dòng 38 chép mã dòng 0: cả hai cần người, lý do nêu dòng kia (số dòng của file, 1-based).
  for (const [i, j] of [[0, 38], [38, 0]] as const) {
    assert.equal(o(i, 1).mark, "needs_person", `dòng ${i}`);
    assert.match(o(i, 1).reason!, new RegExp(`dòng ${bang.rows[j]!.source + 1}\\b`), `dòng ${i} phải nêu dòng ${j}`);
  }
});
