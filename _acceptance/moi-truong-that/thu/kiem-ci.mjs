// AC-7 (ADR-0009 §7, «Sửa đổi 06/11 — bộ kiểm cách ly chạy trên cơ sở dữ liệu tạm»): job deploy chỉ chạy khi push main,
// chờ năm job (bộ kiểm cách ly chạy ở job isolation trên Postgres tạm của đúng commit), áp migration → kiểm nhanh chỉ đọc →
// deploy hook theo đúng thứ tự, không chạy bộ kiểm ghi nào trên bản thật, chuỗi kết nối bản thật chỉ ở hai bước cần nó,
// không nằm trong ci-ok; main tắt tự deploy ở vercel.json. Chỉ đọc tệp. Thước sửa ở hàng va-thuoc-ci-moi-truong-that-ban-that.
// `--ci <tệp>` / `--vercel <tệp>`: đọc bản khác thay tệp của kho (chỉ để phá thử phép đo).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const arg = (ten) => {
  const i = process.argv.indexOf(ten);
  return i >= 0 ? resolve(process.argv[i + 1]) : null;
};
const yml = readFileSync(arg("--ci") ?? new URL("../../../.github/workflows/ci.yml", import.meta.url), "utf8");
const vercel = JSON.parse(readFileSync(arg("--vercel") ?? new URL("../../../apps/web/vercel.json", import.meta.url), "utf8"));
const job = yml.slice(yml.indexOf("\n  deploy:"), yml.indexOf("\n  ci-ok:"));
const ciOk = yml.slice(yml.indexOf("\n  ci-ok:"));
// Thân các bước (sau «steps:»), mỗi bước một khối bắt đầu bằng «      - ».
const buoc = job.slice(job.indexOf("\n    steps:")).split(/\n {6}- /).slice(1);
const dauJob = job.slice(0, job.indexOf("\n    steps:"));

const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));
dat(job.includes("if: github.event_name == 'push' && github.ref == 'refs/heads/main'"), "chỉ chạy khi push main");
dat(/needs:\s*\[check, isolation, secrets, gate, ro-ri\]/.test(job), "chờ check, isolation (bộ kiểm cách ly trên Postgres tạm), secrets, gate, ro-ri");
const coUrl = buoc.filter((b) => b.includes("secrets.PROD_DATABASE_URL"));
dat(
  job.includes("environment: production") &&
    !dauJob.includes("PROD_DATABASE_URL") &&
    coUrl.length === 2 &&
    coUrl.every((b) => b.includes("npm run db:migrate") || b.includes("npm run kiem-nhanh -w @quy-hang/db")),
  "bí mật ở environment production; chuỗi kết nối bản thật chỉ ở bước migrate và bước kiểm nhanh",
);
const a = job.indexOf("npm run db:migrate"), b = job.indexOf("npm run kiem-nhanh -w @quy-hang/db"), c = job.indexOf("VERCEL_DEPLOY_HOOK");
dat(a > 0 && b > a && c > b, "thứ tự: migration → kiểm nhanh chỉ đọc → deploy hook");
dat(!/test:isolation|test:db|db:test/.test(job), "không chạy bộ kiểm ghi nào (cách ly, API) trên cơ sở dữ liệu thật");
dat(!/needs:\s*\[[^\]]*deploy/.test(ciOk), "deploy không nằm trong ci-ok");
dat(vercel?.git?.deploymentEnabled?.main === false, "vercel.json tắt tự deploy main");
dat(Array.isArray(vercel.regions) && vercel.regions.join() === "sin1", "vercel.json ghim vùng sin1");
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
