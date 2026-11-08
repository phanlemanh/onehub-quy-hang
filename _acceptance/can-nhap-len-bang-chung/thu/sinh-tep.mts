// Sinh tệp bảng hàng cho eval ui-check E9 (hàng can-nhap-len-bang-chung): các dòng «Đang bán» đủ giá, phí, KHÔNG cột pháp lý,
// tình trạng sử dụng; cột «Ngày xác nhận» là hôm nay (AC-7 sửa lời 08/11). Dữ liệu mẫu, không người thật.
//   cd apps/web && TSX_TSCONFIG_PATH=tsconfig.test.json node --import tsx ../../_acceptance/can-nhap-len-bang-chung/thu/sinh-tep.mts <ra.xlsx> <mã>...
import { writeFileSync } from "node:fs";
import ExcelJS from "exceljs";

const [ra, ...ma] = process.argv.slice(2);
if (!ra || !ma.length) throw new Error("cần <ra.xlsx> và ít nhất một mã căn");
const homNay = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet("Bảng hàng");
ws.addRow(["Toà", "Mã căn", "Giá", "Phí", "Tình trạng", "Ngày xác nhận"]);
for (const m of ma) ws.addRow([m.startsWith("B") ? "Toà B" : "Toà A", m, "3,5 tỷ", "bao phí", "Đang bán", homNay]);
writeFileSync(ra, new Uint8Array(await wb.xlsx.writeBuffer()));
console.log(`${ma.length} dòng → ${ra}`);
