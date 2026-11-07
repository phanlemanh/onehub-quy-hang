// Bộ chặn của nút «Ghim lại hồ sơ cần bản thật» (hàng ghim-lai-ban-that-qua-ci). Đọc evals.yaml của hồ sơ, giải lệnh
// `config:` theo _acceptance/config.yaml, và từ chối khi một eval còn chạy (không khai `status: not-run`) gọi bộ kiểm ghi —
// cách ly hay API trên cơ sở dữ liệu — vì làn ghim lại chạy eval với chuỗi kết nối bản thật. Kiểm thêm khoá
// feature_loop.repin_ci_blank_env để trống DATABASE_URL cho bộ kiểm chung. Chỉ đọc. Thoát 0 = cho chạy, 1 = chặn, 2 = gọi sai.
// `--root <thư mục>`: đọc kho khác (chỉ để phá thử).
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const iRoot = args.indexOf("--root");
const ROOT = iRoot >= 0 ? resolve(args[iRoot + 1]) : process.cwd();
const slug = args.find((a, i) => !a.startsWith("--") && (iRoot < 0 || i !== iRoot + 1));
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error("dùng: chan-ghim-ban-that.mjs <slug> [--root <thư mục>]");
  process.exit(2);
}
const GHI = /test:isolation|test:db|db:test/;
const config = readFileSync(join(ROOT, "_acceptance/config.yaml"), "utf8");
const evals = readFileSync(join(ROOT, "_acceptance", slug, "evals.yaml"), "utf8");

// Giải `config:executors.<nhóm>.<khoá>`: dòng `<khoá>: "<lệnh>"` nằm dưới `  <nhóm>:` của khối executors.
const giai = (ref) => {
  const [, nhom, khoa] = ref.split(".");
  const khoi = config.slice(config.indexOf(`\n  ${nhom}:`));
  const m = khoi.match(new RegExp(`\\n    ${khoa}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1].replace(/\\"/g, '"') : null;
};

const loi = [];
const khoi = evals.split(/\n {2}- id: /).slice(1);
for (const k of khoi) {
  const id = k.split("\n")[0].trim();
  if (/\n\s+status:\s*not-run\b/.test(k)) continue;
  const cmd = (k.match(/\n\s+cmd:\s*(.+)/) ?? [])[1]?.trim() ?? "";
  const lenh = cmd.startsWith("config:") ? giai(cmd.slice("config:".length)) : cmd;
  if (lenh === null) loi.push(`${id}: không giải được ${cmd}`);
  else if (GHI.test(lenh)) loi.push(`${id}: chạy bộ kiểm ghi trên bản thật (${lenh})`);
}
const trong = (config.match(/\n {2}repin_ci_blank_env:\s*\[([^\]]*)\]/) ?? [])[1] ?? "";
if (!trong.split(",").map((s) => s.trim()).includes("DATABASE_URL")) loi.push("feature_loop.repin_ci_blank_env không để trống DATABASE_URL cho bộ kiểm chung");

if (loi.length) {
  for (const l of loi) console.log(`CHẶN ${l}`);
  process.exit(1);
}
console.log(`CHO CHẠY ${slug}: ${khoi.length} eval, không eval còn chạy nào gọi bộ kiểm ghi; bộ kiểm chung chạy với DATABASE_URL trống`);
