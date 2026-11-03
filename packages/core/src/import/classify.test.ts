import assert from "node:assert/strict";
import { test } from "node:test";
import { sinhBoThu } from "../../test/import/sinh";
import { classifyColumns, type ColumnClass } from "./classify";
import { readTable, type Grid, type Table } from "./grid";
import type { Cell } from "./transforms";

/** Bảng một cột 10 dòng từ danh sách ô. */
function bangMot(header: string, cells: Cell[]): Table {
  return readTable([[header, "Mã căn"], ...cells.map((c) => [c, "A-01.01"])] as Grid);
}

const so = (n: number) => `0900 000 ${String(n + 1).padStart(3, "0")}`;
const lap = (f: (i: number) => Cell) => Array.from({ length: 10 }, (_, i) => f(i));

// Ma trận viết tay (AC-2): tiêu đề, ô, lớp đúng. Tiêu đề lạ để lớp phải đến từ bộ dò hay dáng giá trị.
const MA_TRAN: [string, Cell[], ColumnClass][] = [
  ["Cột X", lap((i) => so(i)), "source"],
  ["Cột X", lap((i) => `+84 900 000 ${String(i + 1).padStart(3, "0")}`), "source"],
  ["Cột X", lap((i) => `84900000${String(i + 1).padStart(3, "0")}`), "source"],
  ["Cột X", lap((i) => `0900.000.${String(i + 1).padStart(3, "0")}`), "source"],
  ["Cột X", lap((i) => `0900-000-${String(i + 1).padStart(3, "0")}`), "source"],
  ["Cột X", lap((i) => `(0900) 000 ${String(i + 1).padStart(3, "0")}`), "source"],
  ["Cột X", lap((i) => `chu${i}@mau.quy-hang.test`), "source"],
  ["Cột X", lap((i) => `000000000${String(i + 1).padStart(3, "0")}`), "source"],
  ["Cột X", lap((i) => `000000${String(i + 1).padStart(3, "0")}`), "source"],
  ["Cột X", lap((i) => (i === 0 ? `gọi ${so(1)}` : "ok")), "free_text"],
  ["Cột X", lap((i) => (i < 3 ? so(i) : "ok")), "source"],
  ["Cột X", lap((i) => (i < 2 ? so(i) : "ok")), "free_text"],
  ["Chủ nhà", lap((i) => `[Mẫu] Chủ nhà ${i}`), "source"],
  ["Giá đáy", lap(() => 4.2), "source"],
  ["Đầu chủ", lap((i) => `[Mẫu] Đầu chủ ${i}`), "person_name"],
  ["Cột X", lap((i) => (i % 2 ? "Nguyễn Văn An" : "Trần Thị Bình")), "person_name"],
  ["Ghi chú", lap(() => "ok"), "free_text"],
  ["Cột X", lap(() => "Căn góc, view hồ, nội thất đầy đủ, chủ thiện chí"), "free_text"],
  ["Toà", lap(() => "Toà A"), "catalog"],
  ["Cột X", lap((i) => `A-0${(i % 9) + 1}.01`), "catalog"],
  ["Hướng", lap(() => "ĐN"), "catalog"],
  ["Cột X", lap(() => "Đông Nam"), "catalog"],
  ["Giá", lap(() => 4.65), "shareable_listing"],
  ["Cột X", lap(() => "Đang GD"), "shareable_listing"],
  ["Cột X", lap(() => "KBP"), "shareable_listing"],
  ["Cột X", lap((i) => i * 3.7), "unknown"],
  ["Cột X", lap(() => "xyz"), "unknown"],
];

test("phân loại: ma trận cột ra đúng lớp", () => {
  let dem = 0;
  for (const [h, cells, lop] of MA_TRAN) {
    const k = classifyColumns(bangMot(h, cells))[0]!;
    assert.equal(k.cls, lop, `cột «${h}» [${String(cells[0])}, …]: ra ${k.cls} (${k.reason}), cần ${lop}`);
    dem++;
  }
  assert.equal(dem, MA_TRAN.length);
});

test("phân loại: cột hai file mẫu", () => {
  const DUNG: Record<string, ColumnClass[]> = {
    "mau-a": ["catalog", "catalog", "catalog", "catalog", "catalog", "shareable_listing", "shareable_listing", "shareable_listing", "source", "source", "person_name", "free_text", "unknown"],
    "mau-b": ["unknown", "shareable_listing", "catalog", "catalog", "catalog", "catalog", "catalog", "catalog", "catalog", "shareable_listing", "shareable_listing", "person_name", "source", "source", "free_text", "unknown"],
  };
  for (const t of sinhBoThu().filter((x) => x.ten in DUNG)) {
    const ra = classifyColumns(readTable(t.grid!)).map((k) => k.cls);
    assert.deepEqual(ra, DUNG[t.ten], t.ten);
  }
});
