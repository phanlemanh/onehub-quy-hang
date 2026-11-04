// Bộ đọc tệp của màn Nhập Excel (hàng man-nhap-excel, E1). Tệp xlsx của ca sinh bằng exceljs — bên ghi thật — không dựng
// tay khuôn bên đọc. Dữ liệu mẫu: [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { test } from "node:test";
import ExcelJS from "exceljs";
import { decodeText, parseCsv, type Grid } from "@quy-hang/core/import";

import { docXlsx } from "../../../../../packages/core/test/import/doc-xlsx";
import { MAU_URL, sinhBoThu } from "../../../../../packages/core/test/import/sinh";
import { readFileSync } from "node:fs";
import { CO_TOI_DA, DONG_TOI_DA, docTep, LOI_DOC, oTuExcel, type TepDoc } from "./doc-tep";

/** So lưới bỏ đuôi trống: ô null cuối dòng và dòng trống cuối lưới không mang nghĩa với `readTable`. */
function chuan(g: Grid): Grid {
  const out = g.map((r) => {
    const d = [...r];
    while (d.length && (d.at(-1) === null || d.at(-1) === undefined)) d.pop();
    return d.map((c) => (c === undefined ? null : c));
  });
  while (out.length && out.at(-1)!.length === 0) out.pop();
  return out;
}

async function xlsxTu(trang: Record<string, Grid>): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();
  for (const [ten, g] of Object.entries(trang)) {
    const ws = wb.addWorksheet(ten);
    for (const r of g) ws.addRow(r);
  }
  return new Uint8Array(await wb.xlsx.writeBuffer());
}

const laZip = (b: Uint8Array) => b[0] === 0x50 && b[1] === 0x4b;
const tepDoc = (k: Awaited<ReturnType<typeof docTep>>): TepDoc => {
  assert.ok(!("loi" in k), `đọc lỗi: ${"loi" in k ? k.loi : ""}`);
  return k as TepDoc;
};

test("đọc tệp: bộ thử hàng 64 ra đúng lưới lõi", async () => {
  const bo = sinhBoThu();
  let so = 0;
  for (const t of bo) {
    if (t.bytes && laZip(t.bytes)) {
      const doc = tepDoc(await docTep(`${t.ten}.xlsx`, t.bytes));
      assert.deepEqual(chuan(doc.grid), chuan(docXlsx(t.bytes)), t.ten);
    } else if (t.bytes) {
      const doc = tepDoc(await docTep(`${t.ten}.csv`, t.bytes));
      assert.deepEqual(chuan(doc.grid), chuan(parseCsv(decodeText(t.bytes))), t.ten);
    } else {
      // Tệp bộ thử có sẵn lưới: ghi ra xlsx bằng exceljs rồi đọc lại — vòng ghi–đọc qua bên ghi thật.
      const doc = tepDoc(await docTep(`${t.ten}.xlsx`, await xlsxTu({ "Bảng hàng": t.grid! })));
      assert.deepEqual(chuan(doc.grid), chuan(t.grid!), t.ten);
    }
    so++;
  }
  assert.ok(so >= 8, `bộ thử chỉ có ${so} tệp`);
  assert.equal(so, bo.length);
  // Hai tệp xlsx mẫu của bộ thử đọc thẳng từ đĩa: bộ đọc của màn (exceljs) ra đúng lưới của bộ đọc thử của lõi.
  let xlsx = 0;
  for (const [ten, url] of Object.entries(MAU_URL)) {
    const bytes = new Uint8Array(readFileSync(url));
    const doc = tepDoc(await docTep(`${ten}.xlsx`, bytes));
    assert.deepEqual(chuan(doc.grid), chuan(docXlsx(bytes)), `${ten}.xlsx`);
    xlsx++;
  }
  assert.equal(xlsx, 2, "bộ thử phải có đúng hai tệp xlsx mẫu");
});

test("đọc tệp: xlsx nén nhiều trang tính", async () => {
  const A: Grid = [["Toà", "Mã căn", "Giá"], ["Toà A", "A-01.01", 3200000000], ["Toà A", "A-01.02", "3,5 tỷ"]];
  const B: Grid = [["Toà", "Mã căn", "Ngày xác nhận"], ["Toà B", "B-02.01", "2026-10-01"]];
  const bytes = await xlsxTu({ "Toà A": A, "Toà B": B });
  const a = tepDoc(await docTep("bang-hang.xlsx", bytes, "Toà A"));
  const b = tepDoc(await docTep("bang-hang.xlsx", bytes, "Toà B"));
  assert.deepEqual(chuan(a.grid), A);
  assert.deepEqual(chuan(b.grid), B);
  assert.deepEqual(a.trang, ["Toà A", "Toà B"]);
  assert.equal(b.trangChon, "Toà B");
});

test("đọc tệp: mọi dạng ô của exceljs", async () => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Bảng hàng");
  ws.getCell("A1").value = "Thông tin căn";
  ws.mergeCells("A1:B1");
  ws.getCell("A2").value = { formula: "1+1", result: 3200000000 };
  ws.getCell("B2").value = { richText: [{ text: "Toà " }, { font: { bold: true }, text: "A" }] };
  ws.getCell("C2").value = { text: "A-01.01", hyperlink: "https://example.test/a-01-01" };
  ws.getCell("D2").value = true;
  ws.getCell("E2").value = { error: "#N/A" };
  ws.getCell("F2").value = new Date(Date.UTC(2026, 9, 1));
  const g = tepDoc(await docTep("dang-o.xlsx", new Uint8Array(await wb.xlsx.writeBuffer()))).grid;
  const CA: [string, unknown, unknown][] = [
    ["công thức có kết quả", g[1]![0], 3200000000],
    ["chữ định dạng", g[1]![1], "Toà A"],
    ["liên kết", g[1]![2], "A-01.01"],
    ["đúng/sai", g[1]![3], "Có"],
    ["ô lỗi", g[1]![4], null],
    ["ngày", g[1]![5], "2026-10-01"],
    ["ô gộp: ô chính giữ chữ, ô phụ trống", [g[0]![0], g[0]![1]], ["Thông tin căn", null]],
  ];
  let so = 0;
  for (const [ten, co, mong] of CA) {
    assert.deepEqual(co, mong, ten);
    so++;
  }
  assert.equal(so, 7);
  assert.equal(oTuExcel({ sharedFormula: "A2", result: 5 }), 5);
});

test("đọc tệp: lỗi có tên", async () => {
  const tieuDe = ["Toà", "Mã căn"];
  const nhieu = (n: number): Grid => [tieuDe, ...Array.from({ length: n }, (_, i) => ["Toà A", `A-${i}`])];
  const OLE = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0, 0]);
  const CA: [string, Promise<unknown>, unknown][] = [
    [".xls theo tên", docTep("bang-hang.xls", new Uint8Array([1, 2, 3])), { loi: LOI_DOC.xls }],
    [".xls theo chữ ký OLE", docTep("bang-hang.xlsx", OLE), { loi: LOI_DOC.xls }],
    ["byte rác đuôi .xlsx", docTep("bang-hang.xlsx", new TextEncoder().encode("không phải zip")), { loi: LOI_DOC.hong }],
    ["tệp 10 MB + 1 byte", docTep("bang-hang.csv", new Uint8Array(CO_TOI_DA + 1)), { loi: LOI_DOC.co }],
    ["xlsx 5.001 dòng", docTep("bang-hang.xlsx", await xlsxTu({ "Bảng hàng": nhieu(DONG_TOI_DA + 1) })), { loi: LOI_DOC.dong }],
    ["csv rỗng", docTep("bang-hang.csv", new Uint8Array()), { loi: LOI_DOC.rong }],
  ];
  for (const [ten, p, mong] of CA) assert.deepEqual(await p, mong, ten);
  // Đối chứng dương: đúng 5.000 dòng đọc được.
  const du = tepDoc(await docTep("bang-hang.xlsx", await xlsxTu({ "Bảng hàng": nhieu(DONG_TOI_DA) })));
  assert.equal(chuan(du.grid).length, DONG_TOI_DA + 1);
});
