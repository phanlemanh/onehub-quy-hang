import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizePhone } from "../access/owner-input";
import { buildCatalogIndex, lookupUnit } from "../catalog/lookup";
import { docDuLieuMau } from "../../test/import/sinh";
import {
  area,
  bedrooms,
  date,
  direction,
  feeCondition,
  floor,
  phone,
  price,
  status,
  text,
  unitCode,
  type Cell,
  type ImportContext,
  type Outcome,
} from "./transforms";

// Ma trận viết tay trước khi có thực đơn (AC-5) — không sinh từ mã đang đo. Mỗi dòng: đầu vào, kết cục đúng.
// Kết cục: ["keep", giá trị] · ["fixed", giá trị] · ["needs_person"] · ["blocked"].
type KetCuc = ["keep" | "fixed", string | number | null] | ["needs_person" | "blocked"];

const danhMuc = docDuLieuMau().danhMuc as unknown as NonNullable<ImportContext["catalog"]>;
const CTX: ImportContext = { today: "2026-11-03", catalog: danhMuc };

function soMaTran(ten: string, mt: readonly [Cell, KetCuc][], chay: (c: Cell) => Outcome) {
  let dem = 0;
  for (const [vao, [mark, gt]] of mt) {
    const r = chay(vao);
    assert.equal(r.mark, mark, `${ten}(«${String(vao)}»): dấu ${r.mark}, cần ${mark}`);
    if (mark === "keep" || mark === "fixed") assert.deepEqual((r as { value: unknown }).value, gt, `${ten}(«${String(vao)}»): giá trị`);
    if (mark !== "keep") assert.ok((r as { reason?: string }).reason?.trim(), `${ten}(«${String(vao)}»): thiếu lý do`);
    dem++;
  }
  assert.equal(dem, mt.length);
}

test("thực đơn: price", () => {
  const ty: [Cell, KetCuc][] = [
    [4.65, ["keep", 4_650_000_000]],
    ["4,65", ["keep", 4_650_000_000]],
    ["4.650", ["keep", 4_650_000_000]],
    ["4 tỷ 650", ["keep", 4_650_000_000]],
    ["4,65 tỷ", ["keep", 4_650_000_000]],
    ["4650tr", ["fixed", 4_650_000_000]],
    ["4.65 BP", ["fixed", 4_650_000_000]],
    ["4.6–4.8", ["needs_person"]],
    ["4,6 - 4,8", ["needs_person"]],
    ["TL", ["needs_person"]],
    ["thương lượng", ["needs_person"]],
    ["thu về 4.2", ["needs_person"]],
    ["giá tốt", ["needs_person"]],
    [0, ["blocked"]],
    [-3, ["blocked"]],
    [2000, ["blocked"]],
    [null, ["keep", null]],
  ];
  soMaTran("price ty", ty, (c) => price(c, { unit: "ty" }));
  const dong: [Cell, KetCuc][] = [
    [4_650_000_000, ["keep", 4_650_000_000]],
    ["4.650.000.000", ["keep", 4_650_000_000]],
    [4.65, ["needs_person"]],
  ];
  soMaTran("price dong", dong, (c) => price(c, { unit: "dong" }));
  const r = price("4.65 BP", { unit: "ty" });
  assert.deepEqual(r.mark === "fixed" && r.also, { feeInclusion: "included" }, "«4.65 BP» phải tách điều kiện phí");
});

test("thực đơn: fee_condition", () => {
  soMaTran("fee", [
    ["BP", ["keep", "included"]],
    ["kbp", ["keep", "excluded"]],
    ["Đã gồm phí", ["keep", "included"]],
    ["Chưa gồm phí", ["keep", "excluded"]],
    ["bao sang tên", ["keep", "included"]],
    ["chưa phí", ["keep", "excluded"]],
    ["thu về 4.2", ["needs_person"]],
    ["phí gì đó", ["needs_person"]],
  ], (c) => feeCondition(c));
});

test("thực đơn: area", () => {
  soMaTran("area", [
    [75, ["keep", 75]],
    ["75m2", ["keep", 75]],
    ["75,5", ["keep", 75.5]],
    ["75 (TT)", ["keep", 75]],
    ["75 m²", ["keep", 75]],
    ["80 (tim tường)", ["fixed", 80]],
    [0, ["blocked"]],
    ["rộng", ["needs_person"]],
  ], (c) => area(c));
});

test("thực đơn: unit_code", () => {
  const mt: [Cell, KetCuc][] = [
    ["A-01.03", ["keep", "A-01.03"]],
    ["a1-03", ["fixed", "A-01.03"]],
    ["A 01 03", ["fixed", "A-01.03"]],
    ["A0103", ["fixed", "A-01.03"]],
    ["b-12.06", ["fixed", "B-12.06"]],
    ["A-16.01", ["needs_person"]],
    ["xyz", ["needs_person"]],
  ];
  soMaTran("unit_code", mt, (c) => unitCode(c, CTX));
  const r = unitCode("A-16.01", CTX);
  assert.match(r.mark === "needs_person" ? r.reason : "", /chưa có trong danh mục/);
  // Quan hệ với bộ đọc hàng 9: cùng đầu vào, cùng mã; không đọc / không có trong danh mục ⇔ cần người.
  const chiMuc = buildCatalogIndex(danhMuc);
  for (const [vao] of mt) {
    const r9 = lookupUnit(chiMuc, String(vao));
    const ra = unitCode(vao, CTX);
    if (r9.status === "found") assert.equal((ra as { value: unknown }).value, r9.unit.unitNumber, `«${String(vao)}» lệch hàng 9`);
    else assert.equal(ra.mark, "needs_person", `«${String(vao)}»: hàng 9 ra ${r9.status}`);
  }
});

test("thực đơn: floor", () => {
  soMaTran("floor", [
    [12, ["keep", 12]],
    ["T12", ["keep", 12]],
    ["tầng 3", ["keep", 3]],
    ["12A", ["needs_person"]],
    ["cao", ["needs_person"]],
  ], (c) => floor(c));
});

test("thực đơn: bedrooms", () => {
  soMaTran("bedrooms", [
    [2, ["keep", 2]],
    ["2PN", ["keep", 2]],
    ["2N1WC", ["keep", 2]],
    ["3 PN", ["keep", 3]],
    ["2PN+1", ["fixed", 2]],
    ["studio", ["keep", 0]],
    ["nhiều", ["needs_person"]],
  ], (c) => bedrooms(c));
});

test("thực đơn: direction", () => {
  soMaTran("direction", [
    ["Đông Nam", ["keep", "Đông Nam"]],
    ["ĐN", ["keep", "Đông Nam"]],
    ["Đ-N", ["keep", "Đông Nam"]],
    ["dong nam", ["keep", "Đông Nam"]],
    ["TB", ["keep", "Tây Bắc"]],
    ["N", ["keep", "Nam"]],
    ["hướng đẹp", ["needs_person"]],
  ], (c) => direction(c));
});

test("thực đơn: status", () => {
  soMaTran("status", [
    ["Đang bán", ["keep", "Active"]],
    ["Đang GD", ["keep", "Pending"]],
    ["cọc", ["keep", "Pending"]],
    ["dang ban", ["keep", "Active"]],
    ["đã chốt", ["keep", "Closed"]],
    ["Ngừng", ["keep", "Withdrawn"]],
    ["Chưa đủ để rao", ["keep", "Incomplete"]],
    ["chờ sổ", ["needs_person"]],
  ], (c) => status(c));
});

test("thực đơn: date", () => {
  const ctx = { today: "2026-11-03" };
  soMaTran("date dmy", [
    ["12/03/2026", ["keep", "2026-03-12"]],
    ["2026-03-12", ["keep", "2026-03-12"]],
    [46093, ["keep", "2026-03-12"]],
    ["12/3/26", ["fixed", "2026-03-12"]],
    ["12/3", ["needs_person"]],
    ["30/02/2026", ["needs_person"]],
    ["01/12/2026", ["blocked"]],
    ["hôm qua", ["needs_person"]],
  ], (c) => date(c, { order: "dmy" }, ctx));
  soMaTran("date mdy", [["03/12/2026", ["keep", "2026-03-12"]]], (c) => date(c, { order: "mdy" }, ctx));
});

test("thực đơn: phone", () => {
  const mt: [Cell, KetCuc][] = [
    ["0900 000 012", ["keep", "0900000012"]],
    ["+84 900 000 012", ["keep", "0900000012"]],
    ["0900.000.012", ["keep", "0900000012"]],
    ["84900000012", ["keep", "0900000012"]],
    ["12345", ["needs_person"]],
  ];
  soMaTran("phone", mt, (c) => phone(c));
  // Quan hệ với bộ chuẩn số của hàng 18: cùng đầu vào, cùng số; null ⇔ cần người.
  for (const [vao] of mt) {
    const n = normalizePhone(String(vao));
    const ra = phone(vao);
    if (n) assert.equal((ra as { value: unknown }).value, n, `«${String(vao)}» lệch normalizePhone`);
    else assert.equal(ra.mark, "needs_person", `«${String(vao)}»`);
  }
});

test("thực đơn: text", () => {
  soMaTran("text", [
    ["  Toà A  ", ["keep", "Toà A"]],
    ["Tòa A", ["keep", "Tòa A"]],
    ["a   b", ["keep", "a b"]],
    [null, ["keep", null]],
  ], (c) => text(c));
});
