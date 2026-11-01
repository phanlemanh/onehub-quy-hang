// Ranh giới tệp của hàng che-vung-anh (E13): mọi tệp đổi từ điểm cắt nhánh với main phải thuộc danh sách cho phép đã
// giao (hang-viec.json của đợt). Chạy đối chứng đỏ trong cùng lệnh: danh sách giả có một tệp của bộ đồng bộ phải bị gọi tên.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHO_PHEP = [
  /^apps\/web\/src\/app\/\(app\)\/units\/photos\/redact\//,
  // Móc menu, hằng cỡ bản nhẹ, dòng đối chiếu ngành (xin giám sát, B-23).
  /^apps\/web\/src\/app\/\(app\)\/units\/photos\/muc-anh\.tsx$/,
  /^packages\/core\/src\/photos\/index\.ts$/,
  /^docs\/product\/doi-chieu-nganh\.md$/,
  // Bảng nhận diện của bài quét khuôn cho tệp giao diện mới (luật thường trực, ranh-gioi-them).
  /^packages\/ui-lint\/tests\/ban-do-khuon\.test\.mjs$/,
  /^_acceptance\/che-vung-anh\//,
  // Tệp sinh của kho ở mỗi cổng, và dòng §12 của hàng trong Tham chiếu (luật thường trực, B-19).
  /^docs\/plan\/lo-trinh\.json$/,
  /^LO-TRINH\.html$/,
  /^PRODUCT-MAP\.md$/,
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
