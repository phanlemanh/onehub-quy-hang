// Chỗ thử ô lạ của hàng 69 trên máy dãy G (dev 3493, Postgres 5573): bật chỗ thử «Xử lý bằng AI» của hàng 68 (khách AI giả,
// QH_AI_GIA ngoài cây kho) rồi thêm thư mục o-la/ với bảng chữ ô → đề xuất lấy từ bộ đề xuất ghi sẵn của Opus 5.5.
//   node _acceptance/nhap-o-la/thu/dung-o-la.mjs          bật
//   node _acceptance/nhap-o-la/thu/dung-o-la.mjs --tat    tắt máy dev (chỉ PID chỗ thử đã ghi)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DUNG_AI = path.join(GOC, "_acceptance/nhap-tac-tu-ke-hoach/thu/dung-ai.mjs");
if (process.argv.includes("--tat")) {
  execFileSync("node", [DUNG_AI, "--tat"], { cwd: GOC, stdio: "inherit" });
  process.exit(0);
}
const AI_GIA = path.join(os.tmpdir(), "quy-hang-ai-gia");
const out = execFileSync("node", [DUNG_AI], { cwd: GOC, stdio: ["ignore", "pipe", "inherit"] }).toString();
// Đề xuất của Opus theo chữ ô — khách giả dựng đầu ra cho đúng các ô của gói màn gửi.
const tep = JSON.parse(readFileSync(path.join(GOC, "_acceptance/nhap-o-la/de-xuat-o-la/claude-opus-5-5.json"), "utf8"));
const goi = JSON.parse(execFileSync("node", ["--import", "tsx", "-e", `import("../../_acceptance/nhap-o-la/thu/do-o-la.ts").then(m=>console.log(JSON.stringify(m.chuanBi().goi)))`], { cwd: path.join(GOC, "packages/core") }).toString());
const theoChu = {};
for (const d of tep.dauRa.de_xuat) {
  const o = goi.o.find((x) => x.id === d.id);
  if (o) theoChu[o.giaTri] = { gia_tri: d.gia_tri, ly_do: d.ly_do };
}
mkdirSync(path.join(AI_GIA, "o-la"), { recursive: true });
writeFileSync(path.join(AI_GIA, "o-la", "theo-chu.json"), JSON.stringify({ theoChu }, null, 2));
console.log(out.trim().split("\n").at(-1));
