// Chỗ thử «Xử lý bằng AI» của hàng 68 trên máy dãy G (dev 3493, Postgres 5573): chép đề xuất ghi sẵn của hồ sơ ra thư mục
// tạm NGOÀI cây kho (tệp cờ .loi/.cham ghi ở đó), rồi bật chỗ thử của man-nhap-excel với QH_AI_GIA trỏ thư mục ấy — máy
// chủ dev dùng khách AI giả, không khoá thật. Máy dev đang chạy mà không có khách giả thì phải tắt trước (--tat).
//   node _acceptance/nhap-tac-tu-ke-hoach/thu/dung-ai.mjs          bật (in JSON {url, aiGia})
//   node _acceptance/nhap-tac-tu-ke-hoach/thu/dung-ai.mjs --tat    tắt máy dev (chỉ PID chỗ thử đã ghi)
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG_G = path.join(GOC, "_acceptance/man-nhap-excel/thu/dung-g.mjs");
export const AI_GIA = path.join(os.tmpdir(), "quy-hang-ai-gia");

if (process.argv.includes("--tat")) {
  execFileSync("node", [DUNG_G, "--tat"], { cwd: GOC, stdio: "inherit" });
  process.exit(0);
}
rmSync(AI_GIA, { recursive: true, force: true });
mkdirSync(AI_GIA, { recursive: true });
cpSync(path.join(GOC, "_acceptance/nhap-tac-tu-ke-hoach/de-xuat"), AI_GIA, { recursive: true });
let dangChay = false;
try {
  dangChay = (await fetch("http://localhost:3493/api/v1/health")).ok;
} catch {
  // máy dev chưa chạy: bật mới
}
if (dangChay) throw new Error("máy dev 3493 đang chạy — tắt bằng --tat rồi bật lại để máy chủ nhận QH_AI_GIA");
const out = execFileSync("node", [DUNG_G], { cwd: GOC, env: { ...process.env, QH_AI_GIA: AI_GIA }, stdio: ["ignore", "pipe", "inherit"] }).toString();
console.log(JSON.stringify({ ...JSON.parse(out.trim().split("\n").at(-1)), aiGia: AI_GIA }));
