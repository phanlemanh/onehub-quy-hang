// Ranh giới tệp của hàng va-thong-bao-lead (E13): mọi tệp đổi từ điểm cắt nhánh với main phải thuộc danh sách cho phép đã
// giao (hang-viec.json của đợt, cộng tệp sinh của kho). Đối chứng đỏ trong cùng lệnh: danh sách giả có migration 018 — tệp
// tầng T3 hàng này không được chạm — phải bị gọi tên.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHO_PHEP = [
  /^packages\/api\/src\/push\//,
  /^packages\/api\/src\/jobs\//,
  /^packages\/core\/src\/push\//,
  /^apps\/web\/src\/lib\/push\//,
  /^apps\/web\/src\/app\/\(app\)\/today\/dai-bat\.tsx$/,
  /^packages\/api\/test-db\/(va-)?thong-bao-lead\.test\.ts$/,
  /^_acceptance\/va-thong-bao-lead\//,
  // Hàng lộ trình máy thêm khi mở vòng từ mô tả, tệp sinh của kho, dòng §12 của hàng (luật 26, ranh-gioi-them).
  /^docs\/plan\/lo-trinh\.json$/,
  /^LO-TRINH\.html$/,
  /^PRODUCT-MAP\.md$/,
  /^docs\/product\/tham-chieu\.md$/,
];
const ngoai = (tep) => tep.filter((t) => !CHO_PHEP.some((r) => r.test(t)));

const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const goc = git("merge-base", "HEAD", "origin/main");
const tep = git("diff", "--name-only", "--no-renames", goc, "HEAD").split("\n").filter(Boolean);

const GIA = "packages/db/migrations/018_thong_bao_lead.sql";
if (!ngoai([...tep, GIA]).includes(GIA)) {
  console.error("thước không phân biệt được: migration 018 giả không bị bắt");
  process.exit(1);
}
console.log(`điểm cắt ${goc.slice(0, 7)} · ${tep.length} tệp đổi`);
for (const t of tep) console.log(`  ${t}`);
const sai = ngoai(tep);
console.log(sai.length ? `${sai.length} tệp ngoài ranh giới:\n${sai.map((t) => `  ${t}`).join("\n")}` : "0 tệp ngoài ranh giới");
process.exit(sai.length ? 1 : 0);
