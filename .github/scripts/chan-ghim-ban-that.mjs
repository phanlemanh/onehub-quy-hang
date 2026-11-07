// Bộ chặn của nút «Ghim lại hồ sơ cần bản thật» (hàng ghim-lai-ban-that-qua-ci). Làn ghim lại của kit chạy mọi eval máy của
// hồ sơ với chuỗi kết nối bản thật, nên bộ chặn đòi DANH SÁCH CHO PHÉP, không danh sách cấm:
//   1. mọi eval máy còn chạy (đọc bằng chính bộ đọc của kit — parseEvals, isRepinMachineEval) phải trỏ `config:<khoá>` với
//      khoá nằm trong CHO_PHEP — các lệnh chỉ đọc hay không chạm cơ sở dữ liệu; lệnh viết thẳng bị chặn;
//   2. mỗi khoá được dùng phải giải RA CÙNG MỘT LỆNH ở config của main (`--goc`) và config của nhánh (`--root`) — nhánh không
//      định nghĩa lại được khoá cho phép thành lệnh ghi;
//   3. config của nhánh để trống DATABASE_URL cho bộ kiểm chung (feature_loop.repin_ci_blank_env);
//   4. config của nhánh không khai model_carry_cmd, repin_cost_cmd — kit chạy hai lệnh ấy với đủ biến môi trường.
// Giới hạn đã biết (chủ kho chọn 08/11): bộ chặn chống NHẦM LẪN; lệnh cho phép vẫn chạy tệp của nhánh, nên một nhánh cố ý
// sửa nội dung tệp ấy thì không chặn được.
// Danh sách CHO_PHEP sống trong tệp này, ở main; thêm khoá là sửa tệp qua PR. Thoát 0 = cho chạy, 1 = chặn, 2 = gọi sai.
// Kit tìm qua CLAUDE_PLUGIN_ROOT (luồng đặt) hoặc packages/ui-lint/tim-kit.mjs của kho.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

/** Khoá executor được phép chạy với chuỗi kết nối bản thật: chỉ đọc hay không chạm cơ sở dữ liệu. */
export const CHO_PHEP = [
  "executors.script.moi_truong_that", // kiem-moi-truong.mjs — chỉ đọc
  "executors.script.suc_khoe_that", // GET /api/v1/health
  "executors.script.kiem_ci", // đọc ci.yml, vercel.json
  "executors.test.api", // test đơn vị của API, không cơ sở dữ liệu
  "executors.script.hooks", // bài tự kiểm của rào
];

const args = process.argv.slice(2);
const co = (ten) => {
  const i = args.indexOf(ten);
  return i >= 0 ? resolve(args[i + 1]) : null;
};
const ROOT = co("--root") ?? process.cwd();
const GOC = co("--goc") ?? process.cwd();
const slug = args.find((a, i) => !a.startsWith("--") && !["--root", "--goc"].includes(args[i - 1]));
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("dùng: chan-ghim-ban-that.mjs <slug> [--root <cây nhánh>] [--goc <cây main>]");
  process.exit(2);
}
const KIT = process.env.CLAUDE_PLUGIN_ROOT || execFileSync(process.execPath, [join(GOC, "packages/ui-lint/tim-kit.mjs")], { encoding: "utf8" }).trim();
const req = createRequire(import.meta.url);
const ey = req(join(KIT, "lib/eval-yaml.cjs"));
const core = req(join(KIT, "lib/evidence-core.cjs"));

const cfgNhanh = readFileSync(join(ROOT, "_acceptance/config.yaml"), "utf8");
const cfgGoc = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
const evals = readFileSync(join(ROOT, "_acceptance", slug, "evals.yaml"), "utf8");

const loi = [];
const ds = ey.parseEvals(evals, ["executor", "cmd", "status"]);
const may = ds.filter((e) => core.isRepinMachineEval(e));
for (const e of may) {
  const cmd = String(e.cmd ?? "").trim();
  if (!cmd.startsWith("config:")) {
    loi.push(`${e.id}: lệnh viết thẳng, không qua khoá cho phép (${cmd || "trống"})`);
    continue;
  }
  const khoa = cmd.slice("config:".length);
  if (!CHO_PHEP.includes(khoa)) {
    loi.push(`${e.id}: khoá ${khoa} không trong danh sách cho phép`);
    continue;
  }
  const lenhNhanh = core.resolveConfigKey(cfgNhanh, khoa);
  const lenhGoc = core.resolveConfigKey(cfgGoc, khoa);
  if (!lenhNhanh || lenhNhanh !== lenhGoc) loi.push(`${e.id}: khoá ${khoa} ở nhánh giải khác main`);
}
// Kit chạy hai khoá này với ĐỦ biến môi trường trong làn ghim lại (không qua bộ để trống) — cấm khai ở nhánh.
for (const k of ["model_carry_cmd", "repin_cost_cmd"]) {
  if (new RegExp(`^[ \\t]+${k}[ \\t]*:`, "m").test(cfgNhanh)) loi.push(`config của nhánh khai feature_loop.${k} — lệnh ấy chạy với chuỗi kết nối bản thật`);
}
const trong = (cfgNhanh.match(/\n {2}repin_ci_blank_env:\s*\[([^\]]*)\]/) ?? [])[1] ?? "";
if (!trong.split(",").map((s) => s.trim()).includes("DATABASE_URL")) loi.push("feature_loop.repin_ci_blank_env không để trống DATABASE_URL cho bộ kiểm chung");

if (loi.length) {
  for (const l of loi) console.log(`CHẶN ${l}`);
  process.exit(1);
}
console.log(`CHO CHẠY ${slug}: ${may.length} eval máy, mọi lệnh qua khoá cho phép và giải như main; bộ kiểm chung chạy với DATABASE_URL trống`);
