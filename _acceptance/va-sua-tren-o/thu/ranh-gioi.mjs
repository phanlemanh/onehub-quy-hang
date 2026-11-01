// Ranh giới tệp của hàng va-sua-tren-o (E8): mọi tệp đổi từ điểm cắt nhánh với main phải thuộc danh sách cho phép đã
// giao (hang-viec.json của đợt). Chạy đối chứng đỏ trong cùng lệnh: danh sách giả có một tệp của bộ đồng bộ phải bị gọi tên.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHO_PHEP = [
  /^packages\/core\/src\/pricing\//,
  /^apps\/web\/src\/app\/\(app\)\/inventory\/cell-edit\//,
  /^_acceptance\/va-sua-tren-o\//,
  // Tệp sinh của kho: thêm hàng lộ trình (lo_trinh.chan) và vẽ lại bản đồ, trang lộ trình ở mỗi cổng.
  /^docs\/plan\/lo-trinh\.json$/,
  /^LO-TRINH\.html$/,
  /^PRODUCT-MAP\.md$/,
  // Dòng §12 của hàng trong Tham chiếu — luật thường trực của giám sát (B-19).
  /^docs\/product\/tham-chieu\.md$/,
];
const ngoai = (tep) => tep.filter((t) => !CHO_PHEP.some((r) => r.test(t)));

const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const goc = git("merge-base", "HEAD", "origin/main");
const tep = git("diff", "--name-only", goc, "HEAD").split("\n").filter(Boolean);

const GIA = "apps/web/src/lib/sync/dong-bo.ts";
if (!ngoai([...tep, GIA]).includes(GIA)) {
  console.error("thước không phân biệt được: tệp bộ đồng bộ giả không bị bắt");
  process.exit(1);
}
console.log(`điểm cắt ${goc.slice(0, 7)} · ${tep.length} tệp đổi`);
for (const t of tep) console.log(`  ${t}`);
const sai = ngoai(tep);
console.log(sai.length ? `${sai.length} tệp ngoài ranh giới:\n${sai.map((t) => `  ${t}`).join("\n")}` : "0 tệp ngoài ranh giới");
process.exit(sai.length ? 1 : 0);
