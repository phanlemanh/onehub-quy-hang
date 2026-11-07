// Bộ quét của nút «Ghim lại hồ sơ cần bản thật» (hàng ghim-lai-ban-that-qua-ci): trước khi tải tệp đính kèm, tìm trong các
// tệp chuỗi kết nối ở biến BI_MAT và riêng phần mật khẩu của nó. Gặp thì thoát 1 và KHÔNG in giá trị — chỉ in tên tệp.
// GitHub che bí mật trong nhật ký, không che trong tệp đính kèm. Thoát 0 = sạch, 1 = có bí mật, 2 = gọi sai.
import { existsSync, readFileSync } from "node:fs";

const tep = process.argv.slice(2);
const bi = process.env.BI_MAT ?? "";
if (!tep.length || bi.length < 8) {
  console.error("dùng: BI_MAT=<chuỗi> quet-bi-mat.mjs <tệp>… (BI_MAT phải có)");
  process.exit(2);
}
const manh = [bi];
try {
  const u = new URL(bi);
  if (u.password) manh.push(decodeURIComponent(u.password), u.password);
} catch {
  // không phải URL: chỉ dò cả chuỗi
}
const dinh = [];
for (const t of tep) {
  if (!existsSync(t)) continue;
  const s = readFileSync(t, "utf8");
  if (manh.some((m) => m.length >= 8 && s.includes(m))) dinh.push(t);
}
if (dinh.length) {
  for (const t of dinh) console.log(`CHẶN tệp mang bí mật: ${t}`);
  process.exit(1);
}
console.log(`SẠCH ${tep.length} tệp: không có chuỗi kết nối hay mật khẩu của nó`);
