// Chỗ thử của hàng anh-khong-chan-ban trên máy dãy G (dev 3493, Postgres 5573): dùng lại chỗ thử của màn Nhập Excel.
//   node _acceptance/anh-khong-chan-ban/thu/dung.mjs          bật (Postgres + migrate + bộ mẫu + máy chủ dev)
//   node _acceptance/anh-khong-chan-ban/thu/dung.mjs --tat    tắt máy chủ dev (chỉ PID chỗ thử đã ghi)
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG_G = path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs");
execFileSync("node", [DUNG_G, ...(process.argv.includes("--tat") ? ["--tat"] : [])], { cwd: GOC, stdio: "inherit" });
