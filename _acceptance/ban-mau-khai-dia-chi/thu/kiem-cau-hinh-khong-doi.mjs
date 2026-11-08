// E9b: _acceptance/config.yaml không đổi so với điểm rẽ khỏi nhánh chính.
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const git = (...a) => execFileSync("git", a, { cwd: GOC, encoding: "utf8" }).trim();
const i = process.argv.indexOf("--tu");
const goc = i > 0 ? process.argv[i + 1] : git("merge-base", "origin/main", "HEAD");
const r = spawnSync("git", ["diff", "--quiet", goc, "HEAD", "--", "_acceptance/config.yaml"], { cwd: GOC });
if (r.status === 1) {
  console.error("cấu hình nghiệm thu ĐÃ ĐỔI");
  process.exit(1);
}
if (r.status !== 0) {
  console.error(`không so được: git diff mã ${r.status}`);
  process.exit(2);
}
console.log(`cấu hình nghiệm thu không đổi so với ${goc.slice(0, 8)}`);
