// Sinh tệp bẩn cho eval ui-check E9 (bước xem trước có ô máy sửa, cần người): tệp «ban-gia» của bộ thử hàng 64, ghi ra
// xlsx bằng exceljs. Dữ liệu mẫu tất định của bộ thử, không người thật.
//   cd apps/web && TSX_TSCONFIG_PATH=tsconfig.test.json node --import tsx ../../_acceptance/man-nhap-excel/thu/sinh-tep-ban.mts
import { writeFileSync } from "node:fs";
import ExcelJS from "exceljs";
import { decodeText, parseCsv } from "@quy-hang/core/import";

import { sinhBoThu } from "../../../packages/core/test/import/sinh";

const t = sinhBoThu().find((x) => x.ten === "ban-gia")!;
const grid = t.grid ?? parseCsv(decodeText(t.bytes!));
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Bảng hàng");
for (const r of grid) ws.addRow(r);
const ra = new URL("./ban-gia.xlsx", import.meta.url);
writeFileSync(ra, new Uint8Array(await wb.xlsx.writeBuffer()));
console.log(`${grid.length} dòng → ${ra.pathname}`);
