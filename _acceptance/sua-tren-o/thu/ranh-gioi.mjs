// Ranh giới tệp của hàng 15 (E14): mọi tệp đổi từ điểm cắt nhánh với main phải thuộc danh sách cho phép đã duyệt
// (hàng-việc + B-9, B-10). Chạy đối chứng đỏ trong cùng lệnh: danh sách giả có một tệp lib/sync phải bị gọi tên.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHO_PHEP = [
  /^packages\/core\/src\/pricing\//,
  /^packages\/core\/package\.json$/,
  /^apps\/web\/src\/app\/\(app\)\/inventory\/cell-edit\//,
  /^apps\/web\/src\/app\/\(app\)\/inventory\/bang-hang\.tsx$/,
  /^apps\/web\/src\/app\/\(app\)\/inventory\/cot\.ts$/,
  /^apps\/web\/src\/app\/\(app\)\/proto\/sua-tren-o\//,
  // Luật thường trực của đợt (31/10): bộ kiểm ui-lint chụp cây thật — dãy được sửa dòng chụp cho tệp màn của mình.
  /^packages\/ui-lint\/tests\/ban-do-khuon\.test\.mjs$/,
  /^docs\/design\/vo-va-ia\.md$/,
  /^docs\/product\/tham-chieu\.md$/,
  /^PRODUCT-MAP\.md$/,
  /^LO-TRINH\.html$/,
  /^_acceptance\/sua-tren-o\//,
];
const ngoai = (tep) => tep.filter((t) => !CHO_PHEP.some((r) => r.test(t)));

const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const goc = git("merge-base", "HEAD", "origin/main");
const tep = git("diff", "--name-only", goc, "HEAD").split("\n").filter(Boolean);

const doChung = ngoai([...tep, "apps/web/src/lib/sync/gui.ts"]);
if (!doChung.includes("apps/web/src/lib/sync/gui.ts")) {
  console.error("thước không phân biệt được: tệp lib/sync giả không bị bắt");
  process.exit(1);
}
console.log(`điểm cắt ${goc.slice(0, 7)} · ${tep.length} tệp đổi`);
for (const t of tep) console.log(`  ${t}`);
const sai = ngoai(tep);
console.log(sai.length ? `${sai.length} tệp ngoài ranh giới:\n${sai.map((t) => `  ${t}`).join("\n")}` : "0 tệp ngoài ranh giới");
process.exit(sai.length ? 1 : 0);
