// Ranh giới tệp của hàng va-nap-mau-co-anh (E5): từ điểm cắt nhánh với main, dưới packages/ và apps/ chỉ đúng tệp bài
// kiểm nạp mẫu đổi — bộ nạp, chonKhoAnh, khoS3, kho Postgres và mọi helper giữ nguyên; ngoài hai thư mục ấy chỉ tệp của
// hồ sơ, bản thiết kế và tệp sinh của kho. Đối chứng đỏ trong cùng lệnh: tệp kho.ts giả phải bị gọi tên.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CHO_PHEP = [
  /^packages\/db\/seed\/nap-ban-that\.test\.ts$/,
  /^_acceptance\/va-nap-mau-co-anh\//,
  /^docs\/superpowers\/(specs|plans)\/2026-11-02-va-nap-mau-co-anh(-design)?\.md$/,
  // Tệp sinh của kho: thêm hàng lộ trình (lo_trinh.chan) và vẽ lại bản đồ, trang lộ trình ở mỗi cổng.
  /^docs\/plan\/lo-trinh\.json$/,
  /^LO-TRINH\.html$/,
  /^PRODUCT-MAP\.md$/,
];
const ngoai = (tep) => tep.filter((t) => !CHO_PHEP.some((r) => r.test(t)));

const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const goc = git("merge-base", "HEAD", "origin/main");
const tep = git("diff", "--name-only", goc, "HEAD").split("\n").filter(Boolean);

const GIA = "packages/api/src/photos/kho.ts";
if (!ngoai([...tep, GIA]).includes(GIA)) {
  console.error("thước không phân biệt được: tệp kho.ts giả không bị bắt");
  process.exit(1);
}
console.log(`điểm cắt ${goc.slice(0, 7)} · ${tep.length} tệp đổi`);
for (const t of tep) console.log(`  ${t}`);
const sai = ngoai(tep);
console.log(sai.length ? `${sai.length} tệp ngoài ranh giới:\n${sai.map((t) => `  ${t}`).join("\n")}` : "0 tệp ngoài ranh giới");
process.exit(sai.length ? 1 : 0);
