// Bộ đo của hàng va-thuoc-ci-moi-truong-that-ban-that. Chỉ đọc cây kho; bản sao ghi ở thư mục tạm của hệ điều hành.
//   --thuoc  thước CI của moi-truong-that (thu/kiem-ci.mjs) trên ci.yml của cây: tám dòng ĐẠT, «KẾT: ĐẠT»
//   --pha    ma trận phá thử viết trước, mỗi ca sửa MỘT chỗ của bản sao ci.yml: thước phải đỏ đúng vế đã ghim
//   --thay   moi-truong-that/E3 «không chạy, thay bởi va-deploy-csdl-tam#AC-2» qua chính bộ đọc của kit, kèm đối chứng
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const THUOC = join(GOC, "_acceptance/moi-truong-that/thu/kiem-ci.mjs");
const CI = readFileSync(join(GOC, ".github/workflows/ci.yml"), "utf8");
const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));
const VERCEL = readFileSync(join(GOC, "apps/web/vercel.json"), "utf8");
const chayThuoc = (ci, vercel = VERCEL) => {
  const d = mkdtempSync(join(tmpdir(), "thuoc-ci-"));
  try {
    const tep = join(d, "ci.yml");
    writeFileSync(tep, ci);
    writeFileSync(join(d, "vercel.json"), vercel);
    const r = spawnSync(process.execPath, [THUOC, "--ci", tep, "--vercel", join(d, "vercel.json")], { encoding: "utf8" });
    return { exit: r.status, out: r.stdout + r.stderr };
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
};

if (process.argv.includes("--thuoc")) {
  const r = spawnSync(process.execPath, [THUOC], { encoding: "utf8" });
  const n = (r.stdout.match(/^ĐẠT /gm) ?? []).length;
  dat(r.status === 0 && n === 8 && r.stdout.includes("KẾT: ĐẠT"), `thước CI của moi-truong-that: ${n}/8 vế ĐẠT trên ci.yml của cây`);
} else if (process.argv.includes("--pha")) {
  // Ma trận viết trước: [tên ca, sửa bản sao, vế thước phải HỎNG]. Mỗi chuỗi tìm phải có trong ci.yml thật.
  const sua = (tu, sang) => (s) => {
    if (!s.includes(tu)) throw new Error(`ca phá thử lệch ci.yml: không thấy «${tu.trim()}»`);
    return s.replace(tu, sang);
  };
  const MA_TRAN = [
    ["deploy chạy lại bộ kiểm cách ly trên bản thật",
      sua("      - name: Deploy bản main lên Vercel", "      - run: npm run test:isolation -w @quy-hang/db\n      - name: Deploy bản main lên Vercel"),
      "không chạy bộ kiểm ghi nào (cách ly, API) trên cơ sở dữ liệu thật"],
    ["deploy chạy bộ kiểm API trên bản thật",
      sua("      - name: Deploy bản main lên Vercel", "      - run: npm run test:db -w @quy-hang/api\n      - name: Deploy bản main lên Vercel"),
      "không chạy bộ kiểm ghi nào (cách ly, API) trên cơ sở dữ liệu thật"],
    ["deploy không chờ job isolation",
      sua("needs: [check, isolation, secrets, gate, ro-ri]", "needs: [check, secrets, gate, ro-ri]"),
      "chờ check, isolation (bộ kiểm cách ly trên Postgres tạm), secrets, gate, ro-ri"],
    ["gọi Vercel trước kiểm nhanh",
      sua("        run: npm run kiem-nhanh -w @quy-hang/db", "        run: echo bo-kiem-nhanh"),
      "thứ tự: migration → kiểm nhanh chỉ đọc → deploy hook"],
    ["chuỗi kết nối bản thật đặt ở mức job",
      sua("    environment: production\n", "    environment: production\n    env:\n      DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}\n"),
      "bí mật ở environment production; chuỗi kết nối bản thật chỉ ở bước migrate và bước kiểm nhanh"],
    ["gọi Vercel trước migration",
      (s) => {
        const hook = "      - name: Deploy bản main lên Vercel\n        env:\n          HOOK: ${{ secrets.VERCEL_DEPLOY_HOOK }}\n        run: curl -fsS -X POST \"$HOOK\" > /dev/null\n";
        const mig = "      - name: Áp migration lên bản thật\n";
        if (!s.includes(hook) || !s.includes(mig)) throw new Error("ca phá thử lệch ci.yml: không thấy bước deploy hook hay bước migration");
        return s.replace(hook, "").replace(mig, hook + mig);
      },
      "thứ tự: migration → kiểm nhanh chỉ đọc → deploy hook"],
    ["chuỗi kết nối bản thật ở bước gọi Vercel",
      sua("          HOOK: ${{ secrets.VERCEL_DEPLOY_HOOK }}\n", "          HOOK: ${{ secrets.VERCEL_DEPLOY_HOOK }}\n          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}\n"),
      "bí mật ở environment production; chuỗi kết nối bản thật chỉ ở bước migrate và bước kiểm nhanh"],
    ["deploy chạy db:test trên bản thật",
      sua("      - name: Deploy bản main lên Vercel", "      - run: npm run db:test\n      - name: Deploy bản main lên Vercel"),
      "không chạy bộ kiểm ghi nào (cách ly, API) trên cơ sở dữ liệu thật"],
    ["vercel.json bật lại tự deploy main",
      { vercel: (v) => { const j = JSON.parse(v); j.git.deploymentEnabled.main = true; return JSON.stringify(j); } },
      "vercel.json tắt tự deploy main"],
    ["vercel.json đổi vùng khỏi sin1",
      { vercel: (v) => { const j = JSON.parse(v); j.regions = ["iad1"]; return JSON.stringify(j); } },
      "vercel.json ghim vùng sin1"],
  ];
  let so = 0;
  for (const [ten, f, ve] of MA_TRAN) {
    let ci = CI, vercel = VERCEL;
    try {
      if (typeof f === "function") ci = f(CI);
      else vercel = f.vercel(VERCEL);
    } catch (e) {
      dat(false, `${ten}: ${e.message}`);
      continue;
    }
    const r = chayThuoc(ci, vercel);
    dat(r.exit === 1 && r.out.includes(`HỎNG ${ve}`), `phá thử «${ten}» → thước đỏ ở vế «${ve}»${r.exit === 1 ? "" : " (thước vẫn xanh)"}`);
    so++;
  }
  dat(so === 10 && MA_TRAN.length === 10, `ma trận phá thử chạy đủ 10/10 ca (chạy ${so})`);
  const lanh = chayThuoc(CI);
  dat(lanh.exit === 0, "đối chứng dương: bản sao ci.yml và vercel.json không sửa qua cùng đường --ci, --vercel thì thước xanh");
} else if (process.argv.includes("--thay")) {
  const KIT = process.env.CLAUDE_PLUGIN_ROOT || execFileSync(process.execPath, [join(GOC, "packages/ui-lint/tim-kit.mjs")], { encoding: "utf8" }).trim();
  const core = createRequire(import.meta.url)(join(KIT, "lib/evidence-core.cjs"));
  const TK = "docs/superpowers/specs/2026-11-06-va-deploy-csdl-tam-design.md";
  const banSao = (suaBan) => {
    const g = mkdtempSync(join(tmpdir(), "thay-"));
    mkdirSync(join(g, "_acceptance"), { recursive: true });
    cpSync(join(GOC, "_acceptance/config.yaml"), join(g, "_acceptance/config.yaml"));
    for (const s of ["moi-truong-that", "va-deploy-csdl-tam"]) cpSync(join(GOC, "_acceptance", s), join(g, "_acceptance", s), { recursive: true });
    mkdirSync(join(g, "docs/superpowers/specs"), { recursive: true });
    cpSync(join(GOC, TK), join(g, TK));
    suaBan(g);
    return g;
  };
  const doi = (g, rel, tu, sang) => writeFileSync(join(g, rel), readFileSync(join(g, rel), "utf8").split(tu).join(sang));
  const DC = [
    ["con trỏ tới AC không có", () => {}, "va-deploy-csdl-tam#AC-9", "ac-thay-vang"],
    ["thẻ dính chữ moi-truong-that/E3a", (g) => doi(g, TK, "moi-truong-that/E3", "moi-truong-that/E3a"), "va-deploy-csdl-tam#AC-2", "thay-khong-nhan"],
    ["hồ sơ thay status verified", (g) => doi(g, "_acceptance/va-deploy-csdl-tam/contract.md", "status: signed-off", "status: verified"), "va-deploy-csdl-tam#AC-2", "ho-so-thay-chua-ky"],
  ];
  for (const [ten, s, conTro, mong] of DC) {
    const g = banSao(s);
    try {
      const r = core.chungThayBoi({ root: g, slug: "moi-truong-that", id: "E3", conTro });
      dat(r.ok === false && r.lyDo === mong, `đối chứng «${ten}» đỏ đúng điều kiện ${mong} (được: ${JSON.stringify(r)})`);
    } finally {
      rmSync(g, { recursive: true, force: true });
    }
  }
  const g = banSao(() => {});
  try {
    const r = core.chungThayBoi({ root: g, slug: "moi-truong-that", id: "E3", conTro: "va-deploy-csdl-tam#AC-2" });
    dat(r.ok === true, `đối chứng dương: bản sao không sửa nhận con trỏ (được: ${JSON.stringify(r)})`);
  } finally {
    rmSync(g, { recursive: true, force: true });
  }
  const doc = (p) => readFileSync(join(GOC, p), "utf8");
  // Làn ghim lại chọn ô bằng core.isRepinMachineEval / core.machineEvalIdsSkipped (repin-lane.mjs); E3 phải bị bỏ, và
  // không ô máy nào khác trỏ executor cach_ly_that (bộ kiểm ghi) — đối chứng dương: gỡ «status: not-run» thì E3 bị chọn.
  const ev = doc("_acceptance/moi-truong-that/evals.yaml");
  const boQua = core.machineEvalIdsSkipped(ev) ?? [];
  const khoiE3 = ev.slice(ev.indexOf("  - id: E3"), ev.indexOf("  - id: E4"));
  const conTroCachLy = (ev.match(/cmd: config:executors\.script\.cach_ly_that/g) ?? []).length;
  dat(boQua.includes("E3") && khoiE3.includes("cach_ly_that") && conTroCachLy === 1, `làn ghim lại bỏ E3 — ô duy nhất trỏ cach_ly_that (bỏ qua: ${JSON.stringify(boQua)})`);
  const boQuaGo = core.machineEvalIdsSkipped(ev.replace(khoiE3, khoiE3.replace("    status: not-run\n", ""))) ?? [];
  dat(!boQuaGo.includes("E3"), `đối chứng dương: gỡ «status: not-run» thì làn chọn E3 (bỏ qua: ${JSON.stringify(boQuaGo)})`);
  const r = core.notRunConflicts(doc("_acceptance/moi-truong-that/evals.yaml"), doc("_acceptance/moi-truong-that/evidence-report.md"), { root: GOC, slug: "moi-truong-that" });
  dat(
    r.xungDot.length === 0 && r.thayBoi.some((t) => t.id === "E3" && t.thay === "va-deploy-csdl-tam" && t.ac === "AC-2"),
    `moi-truong-that/E3 không chạy → va-deploy-csdl-tam#AC-2, không xung đột với báo cáo đã ký (được: ${JSON.stringify(r)})`,
  );
} else {
  console.error("dùng: kiem-thuoc.mjs --thuoc | --pha | --thay");
  process.exit(2);
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
