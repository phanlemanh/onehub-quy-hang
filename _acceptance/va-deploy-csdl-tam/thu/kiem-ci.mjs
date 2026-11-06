// Thước CI của hàng va-deploy-csdl-tam (E1, E2, E3, E7). Đọc .github/workflows/ci.yml và packages/db/package.json của
// kho, chạy kiem-nhanh.mjs KHÔNG có DATABASE_URL (không kết nối đi đâu). Đối chứng đỏ chạy TRƯỚC: mỗi bản sao sửa trong
// bộ nhớ phải đỏ ĐÚNG tên vế của nó; rồi mới xét tệp thật. Gốc kho suy từ vị trí tệp này.
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const yaml = createRequire(join(GOC, "package.json"))("js-yaml");

const LENH_MIGRATE = "npm run db:migrate";
const LENH_KIEM = "npm run kiem-nhanh -w @quy-hang/db";
const SCRIPT_KIEM = "node --env-file-if-exists=../../.env.local scripts/kiem-nhanh.mjs";

export const VE = {
  khongGhi: "deploy không chạy bộ kiểm ghi",
  chuoiThat: "chuỗi bản thật chỉ tới db:migrate và kiem-nhanh",
  isoKhiNao: "isolation chạy ở PR và push main",
  isoTam: "isolation trên postgres:16 trong job, không bí mật bản thật",
  isoLenh: "isolation: db:migrate rồi db:test",
  choIso: "deploy chờ isolation",
  thuTu: "thứ tự: db:migrate → kiem-nhanh → deploy hook",
  khongCoe: "không continue-on-error trong deploy",
  khongIf: "kiem-nhanh và deploy hook không có if ngoài success()",
  runNguyen: "dòng run của kiem-nhanh đúng nguyên lệnh",
  script: "script kiem-nhanh của @quy-hang/db gọi scripts/kiem-nhanh.mjs, nạp .env.local như migrate",
};

const coThat = (env) => Object.values(env ?? {}).some((v) => String(v).includes("secrets.PROD_DATABASE_URL"));

/** Xét văn bản ci.yml và package.json của gói db; trả danh sách tên vế hỏng (rỗng = đạt). */
export function xet(ciText, pkgText) {
  const hong = new Set();
  const ci = yaml.load(ciText);
  const pkg = JSON.parse(pkgText);
  const dep = ci.jobs?.deploy ?? {};
  const iso = ci.jobs?.isolation ?? {};
  const buoc = dep.steps ?? [];
  const run = (s) => String(s.run ?? "").trim();

  // E1
  if (buoc.some((s) => /test:isolation|db:test|test:db|\bnpm (run )?test\b/.test(run(s)))) hong.add(VE.khongGhi);
  const thay = buoc.filter((s) => coThat(s.env)).map(run).sort();
  if (coThat(dep.env) || JSON.stringify(thay) !== JSON.stringify([LENH_KIEM, LENH_MIGRATE].sort())) hong.add(VE.chuoiThat);

  // E2
  const on = ci.on ?? ci[true] ?? {};
  if (!("pull_request" in on) || !(on.push?.branches ?? []).includes("main") || "if" in iso) hong.add(VE.isoKhiNao);
  const isoUrl = String(iso.env?.DATABASE_URL ?? "");
  if (iso.services?.postgres?.image !== "postgres:16" || !isoUrl.includes("localhost") || /secrets\./.test(JSON.stringify(iso)))
    hong.add(VE.isoTam);
  const isoRun = (iso.steps ?? []).map(run);
  const iM = isoRun.indexOf("npm run db:migrate"), iT = isoRun.indexOf("npm run db:test");
  if (!(iM >= 0 && iT > iM)) hong.add(VE.isoLenh);
  if (!(dep.needs ?? []).includes("isolation")) hong.add(VE.choIso);

  // E3
  const iMig = buoc.findIndex((s) => run(s) === LENH_MIGRATE);
  const iKiem = buoc.findIndex((s) => run(s).includes("kiem-nhanh"));
  const iHook = buoc.findIndex((s) => JSON.stringify(s.env ?? {}).includes("VERCEL_DEPLOY_HOOK"));
  if (!(iMig >= 0 && iKiem > iMig && iHook > iKiem)) hong.add(VE.thuTu);
  if ("continue-on-error" in dep || buoc.some((s) => "continue-on-error" in s)) hong.add(VE.khongCoe);
  const ifLa = (s) => s && "if" in s && !/^\$?\{?\{?\s*success\(\)\s*\}?\}?$/.test(String(s.if).trim());
  if (ifLa(buoc[iKiem]) || ifLa(buoc[iHook])) hong.add(VE.khongIf);
  if (iKiem < 0 || run(buoc[iKiem]) !== LENH_KIEM) hong.add(VE.runNguyen);

  // E7 (phần tệp)
  if (pkg.scripts?.["kiem-nhanh"] !== SCRIPT_KIEM || pkg.scripts?.migrate !== "node --env-file-if-exists=../../.env.local scripts/migrate.mjs")
    hong.add(VE.script);
  return [...hong];
}

/** Chạy bản chép kiem-nhanh.mjs ở thư mục tạm, env chỉ PATH + PGHOST không định tuyến được. */
function chayThieuUrl() {
  const tam = mkdtempSync(join(tmpdir(), "kn-"));
  try {
    copyFileSync(join(GOC, "packages/db/scripts/kiem-nhanh.mjs"), join(tam, "kiem-nhanh.mjs"));
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [join(tam, "kiem-nhanh.mjs")], {
      cwd: tam,
      env: { PATH: process.env.PATH, PGHOST: "10.255.255.1" },
      encoding: "utf8",
      timeout: 10_000,
    });
    return { ma: r.status, loi: r.stderr ?? "", giay: (Date.now() - t0) / 1000 };
  } finally {
    rmSync(tam, { recursive: true, force: true });
  }
}

const docTep = (p) => readFileSync(join(GOC, p), "utf8");

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const CI = docTep(".github/workflows/ci.yml");
  const PKG = docTep("packages/db/package.json");
  const loi = [];
  const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));

  // Đối chứng đỏ: [tên ca, hàm sửa ci, hàm sửa pkg, vế phải đỏ]
  const BUOC_KIEM = `      - name: Kiểm nhanh chỉ đọc trên bản thật\n        env:\n          DATABASE_URL: \${{ secrets.PROD_DATABASE_URL }}\n        run: ${LENH_KIEM}\n`;
  const BUOC_HOOK = "      - name: Deploy bản main lên Vercel\n";
  const chen = (s, sau, them) => s.replace(sau, sau + them);
  const CA = [
    ["chèn test:isolation", (s) => chen(s, BUOC_KIEM, "      - run: npm run test:isolation -w @quy-hang/db\n"), null, VE.khongGhi],
    ["chèn db:test", (s) => chen(s, BUOC_KIEM, "      - run: npm run db:test\n"), null, VE.khongGhi],
    ["chèn test:db", (s) => chen(s, BUOC_KIEM, "      - run: npm run test:db -w @quy-hang/api\n"), null, VE.khongGhi],
    ["chèn npm test mang env bản thật", (s) => chen(s, BUOC_KIEM, "      - env:\n          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}\n        run: npm test -w @quy-hang/db\n"), null, VE.chuoiThat],
    ["PROD_DATABASE_URL ở mức job", (s) => s.replace("      cancel-in-progress: false\n    steps:", "      cancel-in-progress: false\n    env:\n      DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}\n    steps:"), null, VE.chuoiThat],
    ["bỏ isolation khỏi needs", (s) => s.replace("needs: [check, isolation, secrets, gate, ro-ri]\n    runs-on: ubuntu-latest\n    environment: production", "needs: [check, secrets, gate, ro-ri]\n    runs-on: ubuntu-latest\n    environment: production"), null, VE.choIso],
    ["isolation dùng bí mật bản thật", (s) => s.replace("      DATABASE_URL: postgres://postgres:quyhang@localhost:5432/postgres", "      DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}"), null, VE.isoTam],
    ["kiem-nhanh sau deploy hook", (s) => s.replace(BUOC_KIEM, "").replace("> /dev/null\n", "> /dev/null\n" + BUOC_KIEM), null, VE.thuTu],
    ["continue-on-error ở kiem-nhanh", (s) => s.replace(`        run: ${LENH_KIEM}\n`, `        run: ${LENH_KIEM}\n        continue-on-error: true\n`), null, VE.khongCoe],
    ["if: always() ở deploy hook", (s) => s.replace(BUOC_HOOK, BUOC_HOOK + "        if: always()\n"), null, VE.khongIf],
    ["if: !cancelled() ở deploy hook", (s) => s.replace(BUOC_HOOK, BUOC_HOOK + "        if: ${{ !cancelled() }}\n"), null, VE.khongIf],
    ["if: false ở kiem-nhanh", (s) => s.replace("      - name: Kiểm nhanh chỉ đọc trên bản thật\n", "      - name: Kiểm nhanh chỉ đọc trên bản thật\n        if: false\n"), null, VE.khongIf],
    ["run nối || true", (s) => s.replace(`        run: ${LENH_KIEM}\n`, `        run: ${LENH_KIEM} || true\n`), null, VE.runNguyen],
    ["run có set +e", (s) => s.replace(`        run: ${LENH_KIEM}\n`, `        run: set +e; ${LENH_KIEM}\n`), null, VE.runNguyen],
    ["script trỏ tệp khác", null, (p) => p.replace("scripts/kiem-nhanh.mjs", "scripts/khac.mjs"), VE.script],
  ];
  for (const [ten, suaCi, suaPkg, ve] of CA) {
    const ci = suaCi ? suaCi(CI) : CI;
    const pkg = suaPkg ? suaPkg(PKG) : PKG;
    if (ci === CI && pkg === PKG) {
      dat(false, `đối chứng «${ten}»: bản sao không đổi — khuôn sửa lệch tệp thật`);
      continue;
    }
    const hong = xet(ci, pkg);
    dat(hong.includes(ve), `đối chứng «${ten}» đỏ đúng vế «${ve}» (được: ${JSON.stringify(hong)})`);
  }

  // Tệp thật
  const hong = xet(CI, PKG);
  for (const ve of Object.values(VE)) dat(!hong.includes(ve), ve);
  const r = chayThieuUrl();
  dat(r.ma !== 0 && r.ma !== null && r.loi.includes("DATABASE_URL") && r.giay < 2, `thiếu DATABASE_URL thì thoát khác 0 có câu báo (mã ${r.ma}, ${r.giay}s)`);

  console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
  process.exit(loi.length ? 1 : 0);
}
