// AC-7 (ADR-0009 §7, sửa 06/11 — hàng va-deploy-csdl-tam; thước đưa về bước mới ở hàng va-thuoc-ci-ho-so-moi-truong-that):
// job deploy chỉ chạy khi push main, chờ check/isolation/secrets/gate (bộ cách ly chạy trên Postgres tạm của job isolation),
// áp migration → kiểm nhanh chỉ đọc → deploy hook, không chạy bộ kiểm ghi trên bản thật, không nằm trong ci-ok; main tắt
// tự deploy ở vercel.json, ghim sin1. Chỉ đọc tệp của kho. Đối chứng đỏ chạy trước trên bản sao sửa trong bộ nhớ.
import { readFileSync } from "node:fs";

const goc = (p) => new URL(`../../../${p}`, import.meta.url);
const YML = readFileSync(goc(".github/workflows/ci.yml"), "utf8");
const VERCEL = JSON.parse(readFileSync(goc("apps/web/vercel.json"), "utf8"));

const VE = {
  khiNao: "chỉ chạy khi push main",
  cho: "chờ check, isolation, secrets, gate",
  env: "bí mật ở environment production",
  thuTu: "thứ tự: migration → kiểm nhanh → deploy hook",
  khongGhi: "không chạy bộ kiểm ghi trên bản thật",
  ngoaiCiOk: "deploy không nằm trong ci-ok",
  tatTuDeploy: "vercel.json tắt tự deploy main",
  sin1: "vercel.json ghim sin1",
};

/** Danh sách tên vế hỏng của một văn bản ci.yml (vercel.json đọc thật). */
export function xet(yml, vercel = VERCEL) {
  const hong = [];
  const job = yml.slice(yml.indexOf("\n  deploy:"), yml.indexOf("\n  ci-ok:"));
  const ciOk = yml.slice(yml.indexOf("\n  ci-ok:"));
  if (!job.includes("if: github.event_name == 'push' && github.ref == 'refs/heads/main'")) hong.push(VE.khiNao);
  const needs = (job.match(/needs:\s*\[([^\]]*)\]/)?.[1] ?? "").split(",").map((s) => s.trim());
  if (!["check", "isolation", "secrets", "gate"].every((j) => needs.includes(j))) hong.push(VE.cho);
  if (!job.includes("environment: production")) hong.push(VE.env);
  const a = job.indexOf("run: npm run db:migrate"), b = job.indexOf("run: npm run kiem-nhanh -w @quy-hang/db"), c = job.indexOf("VERCEL_DEPLOY_HOOK");
  if (!(a > 0 && b > a && c > b)) hong.push(VE.thuTu);
  if (/test:isolation|test:db|db:test/.test(job)) hong.push(VE.khongGhi);
  if (/needs:\s*\[[^\]]*deploy/.test(ciOk)) hong.push(VE.ngoaiCiOk);
  if (vercel?.git?.deploymentEnabled?.main !== false) hong.push(VE.tatTuDeploy);
  if (!(Array.isArray(vercel.regions) && vercel.regions.join() === "sin1")) hong.push(VE.sin1);
  return hong;
}

const loi = [];
// Đối chứng đỏ: mỗi bản sao phải đỏ đúng vế của nó; in «ĐỐI CHỨNG …», không bắt đầu bằng «ĐẠT » (E7 đếm tám dòng ĐẠT).
const CA = [
  ["chèn test:isolation", (s) => s.replace("        run: npm run kiem-nhanh -w @quy-hang/db\n", "        run: npm run kiem-nhanh -w @quy-hang/db\n      - run: npm run test:isolation -w @quy-hang/db\n"), VE.khongGhi],
  ["kiểm nhanh sau deploy hook", (s) => s.replace("run: npm run kiem-nhanh -w @quy-hang/db", "run: echo bo").replace('run: curl -fsS -X POST "$HOOK" > /dev/null', 'run: curl -fsS -X POST "$HOOK" > /dev/null\n      - run: npm run kiem-nhanh -w @quy-hang/db'), VE.thuTu],
  ["bỏ isolation khỏi needs", (s) => s.replace(/(\n  deploy:[\s\S]*?needs: \[)check, isolation, /, "$1check, "), VE.cho],
];
for (const [ten, sua, ve] of CA) {
  const banSao = sua(YML);
  const hong = banSao === YML ? null : xet(banSao);
  const ok = hong !== null && hong.includes(ve);
  console.log(`${ok ? "ĐỐI CHỨNG đỏ đúng vế" : "HỎNG đối chứng"} «${ten}» → «${ve}»${hong === null ? " (bản sao không đổi — khuôn lệch tệp thật)" : ""}`);
  if (!ok) loi.push(`đối chứng ${ten}`);
}

const hong = xet(YML);
for (const ve of Object.values(VE)) {
  const ok = !hong.includes(ve);
  console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ve}`);
  if (!ok) loi.push(ve);
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
