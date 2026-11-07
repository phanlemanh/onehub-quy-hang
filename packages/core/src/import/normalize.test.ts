import assert from "node:assert/strict";
import { test } from "node:test";
import { docGia } from "../pricing/doc-gia";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../test/import/sinh";
import { applyPlan } from "./apply";
import { isStandardField } from "./fields";
import { readTable } from "./grid";
import { normalizeValue } from "./normalize";
import { planFromDictionary } from "./plan";
import type { ImportContext } from "./transforms";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };

// Ma trận chữ gõ tay viết trước (AC-7): trường, chữ, giá trị chuẩn.
const GO_TAY: [Parameters<typeof normalizeValue>[0], string, string | number][] = [
  ["directionFaces", "dong nam", "Đông Nam"],
  ["directionFaces", "ĐN", "Đông Nam"],
  ["directionFaces", "Đ-N", "Đông Nam"],
  ["feeInclusion", "bp", "included"],
  ["feeInclusion", "BP", "included"],
  ["feeInclusion", "Đã gồm phí", "included"],
  ["standardStatus", "Đang gd", "Pending"],
  ["standardStatus", "cọc", "Pending"],
  ["unitNumber", "a1-03", "A-01.03"],
  ["listPrice", "4,65 tỷ", 4_650_000_000],
];
const GIA = ["4,65 tỷ", "4ty65", "4 tỷ 650", "950 triệu", "950tr", "4650000000", "4.650.000.000", "1,2 tỷ", "12 tỷ", "4 tỷ 650 triệu"];

test("chuẩn hoá một cửa: ma trận chữ gõ tay", () => {
  let dem = 0;
  for (const [f, chu, dung] of GO_TAY) {
    const r = normalizeValue(f, chu, CTX);
    assert.ok(r.mark === "keep" || r.mark === "fixed", `${f} «${chu}»: dấu ${r.mark}`);
    assert.deepEqual((r as { value: unknown }).value, dung, `${f} «${chu}»`);
    dem++;
  }
  assert.equal(dem, GO_TAY.length);
  // Giá: cùng một bộ đọc với ô giá của Bảng hàng (hàng 15).
  for (const chu of GIA) {
    const r = normalizeValue("listPrice", chu, { ...CTX, transform: { name: "price", params: { unit: "dong" } } });
    const g = docGia(chu);
    assert.ok(g.ok, `docGia «${chu}»`);
    assert.equal((r as { value: unknown }).value, g.ok ? g.dong : null, `«${chu}» lệch docGia`);
  }
});

test("chuẩn hoá một cửa: từ điển của sàn", () => {
  assert.equal(normalizeValue("standardStatus", "Đang deal", CTX).mark, "needs_person", "không từ điển của sàn → cần người");
  const r = normalizeValue("standardStatus", "Đang deal", { ...CTX, companyAliases: [{ field: "standardStatus", raw: "đang deal", value: "Pending" }] });
  assert.deepEqual(r, { mark: "fixed", value: "Pending", reason: "theo từ điển của sàn" });
});

test("chuẩn hoá một cửa: áp kế hoạch dùng cùng bộ", () => {
  let dem = 0;
  let duDieuKien = 0;
  for (const t of sinhBoThu().filter((x) => ["mau-b", "ban-gia", "ban-ngay-trang-thai"].includes(x.ten))) {
    const b = readTable(t.grid!);
    const k = planFromDictionary(b);
    const r = applyPlan(b, k, CTX);
    r.rows.forEach((row) =>
      row.cells.forEach((c, i) => {
        if (!isStandardField(c.target) || c.by !== "normalize") return;
        duDieuKien++;
        const col = k.columns[i]!;
        const o = normalizeValue(c.target, c.raw, { ...CTX, transform: col.transform, valueMap: col.valueMap });
        assert.equal(c.mark, o.mark, `${t.ten} dòng ${row.source} «${c.column}»: dấu`);
        if (o.mark === "keep" || o.mark === "fixed") assert.deepEqual(c.value, o.value, `${t.ten} dòng ${row.source} «${c.column}»: giá trị`);
        assert.equal(c.reason, o.mark === "keep" ? undefined : o.reason, `${t.ten} dòng ${row.source} «${c.column}»: lý do`);
        dem++;
      }),
    );
  }
  assert.ok(dem > 0);
  assert.equal(dem, duDieuKien);
});
