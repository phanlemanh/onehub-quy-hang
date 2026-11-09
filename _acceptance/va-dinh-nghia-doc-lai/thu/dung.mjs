// Chỗ thử E4: dùng lại chỗ thử hàng 49 (Postgres dãy Q 5577, máy dev 3497, phiên đầu chủ 1, căn bao phí A-49.01).
//   node _acceptance/va-dinh-nghia-doc-lai/thu/dung.mjs [--tat]
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
if (!process.argv.includes("--tat")) {
  const song = await fetch("http://localhost:3497/api/v1/health").then((r) => r.status === 200, () => false);
  // Bộ nhớ đệm dev của lần chạy trước làm trang tự nạp lại liên tục: máy mới dựng từ đầu.
  if (!song) rmSync(path.join(GOC, "apps/web/.next/dev"), { recursive: true, force: true });
}
const r = spawnSync(process.execPath, ["_acceptance/thue-phi/thu/dung-q.mjs", ...process.argv.slice(2)], { cwd: GOC, stdio: ["ignore", 2, 2] });
process.exit(r.status ?? 1);
