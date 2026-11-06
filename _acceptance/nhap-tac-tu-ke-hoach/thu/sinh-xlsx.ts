/**
 * Ghi bốn file mẫu lạ của hàng 68 thành xlsx để thả vào màn Nhập Excel ở ba ca nhìn màn (E7b, E8c). Chỉ dữ liệu mẫu.
 *   node --import tsx _acceptance/nhap-tac-tu-ke-hoach/thu/sinh-xlsx.ts <thư mục ra>
 */
import ExcelJS from "exceljs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { sinhBoLa } from "./bo-la";

async function main() {
  const ra = process.argv[2];
  if (!ra) throw new Error("dùng: sinh-xlsx.ts <thư mục ra>");
  mkdirSync(ra, { recursive: true });
  for (const t of sinhBoLa()) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Bảng hàng");
    for (const dong of t.grid!) ws.addRow(dong.map((o) => (o === null ? undefined : o)));
    await wb.xlsx.writeFile(join(ra, `${t.ten}.xlsx`));
  }
  console.log(JSON.stringify({ ra, tep: sinhBoLa().map((t) => `${t.ten}.xlsx`) }));
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
