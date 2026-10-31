// AC-7 (ADR-0009 §7): job deploy chỉ chạy khi push main, chờ bốn job, áp migration → bộ kiểm cách ly → deploy hook theo
// đúng thứ tự, không nằm trong ci-ok; main tắt tự deploy ở vercel.json. Chỉ đọc tệp của kho.
import { readFileSync } from "node:fs";

const yml = readFileSync(new URL("../../../.github/workflows/ci.yml", import.meta.url), "utf8");
const vercel = JSON.parse(readFileSync(new URL("../../../apps/web/vercel.json", import.meta.url), "utf8"));
const job = yml.slice(yml.indexOf("\n  deploy:"), yml.indexOf("\n  ci-ok:"));
const ciOk = yml.slice(yml.indexOf("\n  ci-ok:"));

const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));
dat(job.includes("if: github.event_name == 'push' && github.ref == 'refs/heads/main'"), "chỉ chạy khi push main");
dat(job.includes("needs: [check, isolation, secrets, gate]"), "chờ check, isolation, secrets, gate");
dat(job.includes("environment: production"), "bí mật ở environment production");
const a = job.indexOf("npm run db:migrate"), b = job.indexOf("test:isolation"), c = job.indexOf("VERCEL_DEPLOY_HOOK");
dat(a > 0 && b > a && c > b, "thứ tự: migration → bộ kiểm cách ly → deploy hook");
dat(!/test:db|db:test/.test(job), "không chạy test API (ghi dữ liệu) trên cơ sở dữ liệu thật");
dat(!/needs:\s*\[[^\]]*deploy/.test(ciOk), "deploy không nằm trong ci-ok");
dat(vercel?.git?.deploymentEnabled?.main === false, "vercel.json tắt tự deploy main");
dat(Array.isArray(vercel.regions) && vercel.regions.join() === "sin1", "vercel.json ghim vùng sin1");
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
