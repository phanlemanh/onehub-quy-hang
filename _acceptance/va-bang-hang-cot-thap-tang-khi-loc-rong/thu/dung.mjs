// Chỗ thử E5: dựng trên chỗ thử hàng 79 (Postgres dãy X 5576, máy dev 3496, phiên dau-chu-1, căn ngoài khu mỗi loại hình, căn hộ).
//   node _acceptance/va-bang-hang-cot-thap-tang-khi-loc-rong/thu/dung.mjs [--tat]
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const song = async () => {
  try {
    return (await fetch("http://localhost:3496/api/v1/health")).status === 200;
  } catch {
    return false;
  }
};
// Bật máy dev trên bộ đệm cũ làm trang tự nạp lại liên tục: xoá khi máy chưa chạy.
if (!process.argv.includes("--tat") && !(await song())) rmSync(path.join(GOC, "apps/web/.next/dev"), { recursive: true, force: true });
const r = spawnSync("node", ["_acceptance/bang-hang-theo-loai-hinh/thu/dung-x.mjs", ...process.argv.slice(2)], { cwd: GOC, encoding: "utf8" });
if (r.status !== 0) throw new Error(`dung-x hỏng: ${r.stderr}`);
console.log(r.stdout.trim().split("\n").at(-1) ?? "");
