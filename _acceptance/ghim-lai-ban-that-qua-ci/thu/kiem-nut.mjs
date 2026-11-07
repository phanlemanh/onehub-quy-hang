// Bộ đo của hàng ghim-lai-ban-that-qua-ci. Chỉ đọc cây kho; bản sao và kho tạm ở thư mục tạm của hệ điều hành.
//   --tinh   luồng .github/workflows/ghim-lai-ban-that.yml đủ mười hai vế gác (đọc tệp thật)
//   --pha    ma trận phá thử viết trước: mỗi ca sửa MỘT chỗ của bản sao luồng → vế ghim đỏ
//   --chan   bộ chặn .github/scripts/chan-ghim-ban-that.mjs trên bản sao rút từ hồ sơ moi-truong-that thật
//   --quet   bộ quét bí mật .github/scripts/quet-bi-mat.mjs hai chiều trên tệp tạm, chuỗi kết nối giả
//   --trong  kho git tạm + làn ghim lại của kit: bộ kiểm chung thấy DATABASE_URL trống, eval của hồ sơ thấy đủ
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const KIT_DO = process.env.CLAUDE_PLUGIN_ROOT || execFileSync(process.execPath, [join(GOC, "packages/ui-lint/tim-kit.mjs")], { encoding: "utf8" }).trim();
const LUONG = readFileSync(join(GOC, ".github/workflows/ghim-lai-ban-that.yml"), "utf8");
const CI = readFileSync(join(GOC, ".github/workflows/ci.yml"), "utf8");
const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));

/** Mười hai vế gác của luồng — trả danh sách vế HỎNG. */
function veHong(y) {
  const h = [];
  const v = (ok, ten) => ok || h.push(ten);
  const on = y.slice(y.indexOf("\non:"), y.indexOf("\npermissions:"));
  const buoc = y.slice(y.indexOf("\n    steps:")).split(/\n {6}- /).slice(1);
  const tim = (dau) => buoc.findIndex((b) => b.startsWith(dau));
  const iGhim = tim("name: Ghim lại\n");
  const iChan = tim("name: Chặn hồ sơ còn eval chạy bộ kiểm ghi");
  const iQuet = tim("name: Quét bí mật trong tệp sắp tải");
  const iTai = tim("name: Gửi dòng ghim lại ra tệp đính kèm");
  const coGoc = buoc.some((b) => b.startsWith("uses: actions/checkout@v4") && /path: goc(\n|$)/.test(b) && !/ref:/.test(b));
  const coNhanh = buoc.some((b) => b.startsWith("uses: actions/checkout@v4") && /ref: \$\{\{ inputs\.nhanh \}\}/.test(b) && /path: nhanh/.test(b));
  const kitTag = (s) => (s.match(/KIT_TAG:\s*(\S+)/) ?? [])[1];
  const coBiMat = buoc.map((b, i) => (b.includes("secrets.") ? i : -1)).filter((i) => i >= 0);
  v(/\n {2}workflow_dispatch:/.test(on) && !/\n {2}(push|pull_request|pull_request_target|schedule|workflow_run):/.test(on), "chỉ chạy bằng tay (workflow_dispatch)");
  v(/ho_so:[\s\S]*?type: choice[\s\S]*?options: \[[^\]]+\]/.test(on), "hồ sơ chọn từ danh sách cố định");
  v(/\npermissions:\n {2}contents: read\n/.test(y) && !/contents: write/.test(y), "quyền chỉ đọc kho");
  v(/\n {4}environment: production\n/.test(y), "bí mật ở environment production");
  v(y.includes('[ "$GITHUB_REF" = "refs/heads/main" ] || {') && y.includes('[ "$NHANH" != "main" ]'), "chỉ chạy từ main, không ghim chính main");
  v(coGoc && coNhanh && iChan >= 0 && buoc[iChan].includes("node goc/.github/scripts/chan-ghim-ban-that.mjs") && iQuet >= 0 && buoc[iQuet].includes("node goc/.github/scripts/quet-bi-mat.mjs"), "gác lấy từ main: bộ chặn và bộ quét chạy từ bản checkout main");
  v(iChan >= 0 && iGhim > iChan && buoc[iChan].includes("--root nhanh"), "bộ chặn chạy trước bước ghim lại, đọc cây nhánh PR");
  v(coBiMat.length === 2 && coBiMat.includes(iGhim) && coBiMat.includes(iQuet) && (y.match(/secrets\./g) ?? []).length === 2, "bí mật chỉ ở bước ghim lại và bước quét");
  v(iGhim >= 0 && buoc[iGhim].includes("repin-lane.mjs") && buoc[iGhim].includes("--write") && /working-directory: nhanh/.test(buoc[iGhim]) && !/test:isolation|test:db|db:test/.test(y), "bước ghim lại chạy làn của kit trên cây nhánh, không gọi bộ kiểm ghi");
  v(iQuet > iGhim && iTai > iQuet && buoc[iTai].includes("steps.quet.outcome == 'success'"), "quét bí mật trước khi tải, chỉ tải khi quét sạch");
  v(iQuet >= 0 && /if: always\(\)/.test(buoc[iQuet]) && iTai >= 0 && /if: always\(\)/.test(buoc[iTai]) && /run-log\.jsonl/.test(buoc[iTai]) && /evidence-report\.md/.test(buoc[iTai]), "dòng ghim lại ra tệp đính kèm cả khi làn đỏ");
  v(kitTag(y) && kitTag(y) === kitTag(CI), "cùng bản kit với CI");
  return h;
}
const VE = 12;

if (process.argv.includes("--tinh")) {
  const h = veHong(LUONG);
  dat(h.length === 0, `luồng ghim lại: ${VE - h.length}/${VE} vế gác ĐẠT${h.length ? ` — hỏng: ${h.join(" | ")}` : ""}`);
} else if (process.argv.includes("--pha")) {
  const sua = (tu, sang) => (s) => {
    if (!s.includes(tu)) throw new Error(`ca phá thử lệch luồng: không thấy «${tu.trim().slice(0, 50)}»`);
    return s.replace(tu, sang);
  };
  const MA_TRAN = [
    ["thêm kích hoạt khi push", sua("on:\n  workflow_dispatch:", "on:\n  push:\n  workflow_dispatch:"), "chỉ chạy bằng tay (workflow_dispatch)"],
    ["hồ sơ gõ tự do", sua("        type: choice\n        options: [moi-truong-that]", "        type: string"), "hồ sơ chọn từ danh sách cố định"],
    ["quyền ghi kho", sua("  contents: read\n", "  contents: write\n"), "quyền chỉ đọc kho"],
    ["bỏ environment production", sua("    environment: production\n", ""), "bí mật ở environment production"],
    ["bỏ chặn chạy ngoài main", sua('[ "$GITHUB_REF" = "refs/heads/main" ] || {', '[ -n "$GITHUB_REF" ] || {'), "chỉ chạy từ main, không ghim chính main"],
    ["bộ chặn lấy từ cây nhánh PR", sua("        run: node goc/.github/scripts/chan-ghim-ban-that.mjs", "        run: node nhanh/.github/scripts/chan-ghim-ban-that.mjs"), "gác lấy từ main: bộ chặn và bộ quét chạy từ bản checkout main"],
    ["bộ chặn đọc cây main thay cây nhánh", sua(' "$HO_SO" --root nhanh', ' "$HO_SO" --root goc'), "bộ chặn chạy trước bước ghim lại, đọc cây nhánh PR"],
    ["bí mật ở mức job", sua("      NHANH: ${{ inputs.nhanh }}\n", "      NHANH: ${{ inputs.nhanh }}\n      OWNER_PHONE_KEY: ${{ secrets.OWNER_PHONE_KEY }}\n"), "bí mật chỉ ở bước ghim lại và bước quét"],
    ["chạy bộ kiểm cách ly", sua("      # Thông báo lỗi kết nối", "      - run: npm run test:isolation -w @quy-hang/db\n      # Thông báo lỗi kết nối"), "bước ghim lại chạy làn của kit trên cây nhánh, không gọi bộ kiểm ghi"],
    ["tải dù quét thấy bí mật", sua("        if: always() && steps.quet.outcome == 'success'\n", "        if: always()\n"), "quét bí mật trước khi tải, chỉ tải khi quét sạch"],
    ["quét chỉ khi làn xanh", sua("        id: quet\n        if: always()\n", "        id: quet\n"), "dòng ghim lại ra tệp đính kèm cả khi làn đỏ"],
    ["kit lệch bản CI", sua("      KIT_TAG: v2.37.0", "      KIT_TAG: v2.36.0"), "cùng bản kit với CI"],
  ];
  let so = 0;
  for (const [ten, f, ve] of MA_TRAN) {
    let y;
    try {
      y = f(LUONG);
    } catch (e) {
      dat(false, `${ten}: ${e.message}`);
      continue;
    }
    const h = veHong(y);
    dat(h.length === 1 && h[0] === ve, `phá thử «${ten}» → hỏng đúng vế «${ve}» (hỏng: ${h.join(" | ") || "không vế nào"})`);
    so++;
  }
  dat(so === VE && MA_TRAN.length === VE, `ma trận phá thử chạy đủ ${VE}/${VE} ca, mỗi vế một ca (chạy ${so})`);
  dat(veHong(LUONG).length === 0, "đối chứng dương: luồng không sửa thì mười hai vế đều ĐẠT");
} else if (process.argv.includes("--quet")) {
  const QUET = join(GOC, ".github/scripts/quet-bi-mat.mjs");
  const GIA = "postgres://vai_thu:matkhau-gia-0123@db.example.test:5432/postgres";
  const g = mkdtempSync(join(tmpdir(), "quet-"));
  try {
    const chay = (noiDung) => {
      writeFileSync(join(g, "run-log.jsonl"), noiDung);
      writeFileSync(join(g, "evidence-report.md"), "---\nverdict: PASS\n---\n");
      const r = spawnSync(process.execPath, [QUET, join(g, "run-log.jsonl"), join(g, "evidence-report.md")], { encoding: "utf8", env: { ...process.env, BI_MAT: GIA } });
      return { exit: r.status, out: r.stdout + r.stderr };
    };
    const CA = [
      ["nhật ký sạch", '{"kind":"repin","sha":"abc"}\n', 0, "SẠCH 2 tệp", true],
      ["nhật ký mang nguyên chuỗi kết nối", `{"kind":"repin-do","loi":"connect ${GIA} refused"}\n`, 1, "CHẶN tệp mang bí mật", false],
      ["nhật ký chỉ mang mật khẩu", '{"kind":"repin-do","loi":"password matkhau-gia-0123 sai"}\n', 1, "CHẶN tệp mang bí mật", false],
    ];
    for (const [ten, nd, ma, chu, sach] of CA) {
      const r = chay(nd);
      dat(r.exit === ma && r.out.includes(chu) && !r.out.includes("matkhau-gia-0123"), `bộ quét «${ten}» → thoát ${ma}, «${chu}», không in giá trị (được: thoát ${r.exit})${sach ? "" : ""}`);
    }
  } finally {
    rmSync(g, { recursive: true, force: true });
  }
} else if (process.argv.includes("--chan")) {
  const CHAN = join(GOC, ".github/scripts/chan-ghim-ban-that.mjs");
  const cfgThat = readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8");
  const evThat = readFileSync(join(GOC, "_acceptance/moi-truong-that/evals.yaml"), "utf8");
  // Rút từ vật thật: bản «sẵn bấm» là hồ sơ moi-truong-that với E3 khai không chạy và E8 gọi thẳng bản thật — đúng bản mà
  // nhánh PR #192 đặt trước khi bấm (thiết kế mục 5). Mỗi ca sửa MỘT chỗ của bản ấy hay của config nhánh.
  const khoi = (ev, id, sau) => ev.slice(ev.indexOf(`  - id: ${id}`), ev.indexOf(`  - id: ${sau}`));
  const e3 = khoi(evThat, "E3", "E4"), e8 = khoi(evThat, "E8", "E9");
  if (!e3.includes("cmd: config:executors.script.cach_ly_that")) dat(false, "vật thật lệch: E3 của moi-truong-that không còn trỏ cach_ly_that");
  const e3Khai = /status:\s*not-run/.test(e3) ? e3 : e3.replace("    cmd: config:executors.script.cach_ly_that\n", "    cmd: config:executors.script.cach_ly_that\n    status: not-run\n");
  const e8That = e8.replace(/cmd: config:executors\.script\.suc_khoe_\w+/, "cmd: config:executors.script.suc_khoe_that");
  const sanBam = evThat.replace(e3, e3Khai).replace(e8, e8That);
  const e3Cua = (ev) => khoi(ev, "E3", "E4");
  const chay = (cfgNhanh, ev) => {
    const g = mkdtempSync(join(tmpdir(), "chan-"));
    const m = mkdtempSync(join(tmpdir(), "chan-goc-"));
    try {
      mkdirSync(join(g, "_acceptance/moi-truong-that"), { recursive: true });
      mkdirSync(join(m, "_acceptance"), { recursive: true });
      writeFileSync(join(g, "_acceptance/config.yaml"), cfgNhanh);
      writeFileSync(join(m, "_acceptance/config.yaml"), cfgThat);
      writeFileSync(join(g, "_acceptance/moi-truong-that/evals.yaml"), ev);
      const r = spawnSync(process.execPath, [CHAN, "moi-truong-that", "--root", g, "--goc", m], { encoding: "utf8", env: { ...process.env, CLAUDE_PLUGIN_ROOT: KIT_DO } });
      return { exit: r.status, out: r.stdout + r.stderr };
    } finally {
      rmSync(g, { recursive: true, force: true });
      rmSync(m, { recursive: true, force: true });
    }
  };
  const doiE3 = (thanh) => sanBam.replace(e3Cua(sanBam), thanh);
  const CA = [
    ["bản sẵn bấm (E3 khai không chạy, E8 gọi bản thật)", cfgThat, sanBam, 0, "CHO CHẠY moi-truong-that"],
    ["E3 còn chạy bộ kiểm cách ly", cfgThat, doiE3(e3Cua(sanBam).replace(/ {4}status: not-run\n/, "").replace(/ {4}superseded_by: .*\n/, "")), 1, "CHẶN E3: khoá executors.script.cach_ly_that không trong danh sách cho phép"],
    ["E3 trỏ bộ nạp dữ liệu mẫu", cfgThat, doiE3("  - id: E3\n    criterion: AC-3\n    executor: script\n    cmd: config:executors.script.du_lieu_mau\n    expected: \"x\"\n\n"), 1, "CHẶN E3: khoá executors.script.du_lieu_mau không trong danh sách cho phép"],
    ["E3 trỏ bộ kiểm chặn trùng tên", cfgThat, doiE3("  - id: E3\n    criterion: AC-3\n    executor: test\n    cmd: config:executors.test.chan_trung_ten\n    expected: \"x\"\n\n"), 1, "CHẶN E3: khoá executors.test.chan_trung_ten không trong danh sách cho phép"],
    ["E3 viết thẳng lệnh cách ly", cfgThat, doiE3("  - id: E3\n    criterion: AC-3\n    executor: script\n    cmd: node --test packages/db/tests/isolation.test.mjs\n    expected: \"x\"\n\n"), 1, "CHẶN E3: lệnh viết thẳng, không qua khoá cho phép"],
    ["E3 viết dạng khối nhiều dòng", cfgThat, doiE3("  - id: E3\n    criterion: AC-3\n    executor: script\n    cmd: >\n      config:executors.script.cach_ly_that\n    expected: \"x\"\n\n"), 1, "CHẶN E3: khoá executors.script.cach_ly_that không trong danh sách cho phép"],
    ["nhánh định nghĩa lại khoá cho phép", cfgThat.replace(/(\n {4}moi_truong_that: )"[^"]*"/, '$1"npm run test:isolation -w @quy-hang/db"'), sanBam, 1, "CHẶN E1: khoá executors.script.moi_truong_that ở nhánh giải khác main"],
    ["thiếu khoá để trống DATABASE_URL", cfgThat.replace(/repin_ci_blank_env: \[DATABASE_URL, /, "repin_ci_blank_env: ["), sanBam, 1, "CHẶN feature_loop.repin_ci_blank_env không để trống DATABASE_URL"],
  ];
  for (const [ten, cfg, ev, ma, chu] of CA) {
    const r = chay(cfg, ev);
    dat(r.exit === ma && r.out.includes(chu), `bộ chặn «${ten}» → thoát ${ma}, «${chu}» (được: thoát ${r.exit}${r.exit !== ma ? ` — ${r.out.trim().split("\n")[0]}` : ""})`);
  }
  dat(CA.length === 8, `ma trận bộ chặn đủ 8 ca (có ${CA.length})`);
} else if (process.argv.includes("--trong")) {
  // Kho git tạm có một hồ sơ: bộ kiểm chung thoát 0 chỉ khi DATABASE_URL trống, eval thoát 0 chỉ khi nó có.
  // Kit đúng bản luồng dùng: KIT_TAG đọc từ ci.yml, lấy từ kho kit theo tag (cùng cách luồng lấy).
  const TAG = (CI.match(/KIT_TAG:\s*(\S+)/) ?? [])[1];
  const KIT = mkdtempSync(join(tmpdir(), "kit-"));
  execFileSync("git", ["init", "-q", KIT]);
  execFileSync("git", ["-C", KIT, "fetch", "-q", "--depth", "1", "https://github.com/phanlemanh/acceptance-gate-kit", `refs/tags/${TAG}`]);
  execFileSync("git", ["-C", KIT, "checkout", "-q", "FETCH_HEAD"]);
  const khoaThat = (readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8").match(/\n {2}repin_ci_blank_env:.*\n/) ?? [])[0];
  if (!khoaThat) dat(false, "config.yaml của kho thiếu feature_loop.repin_ci_blank_env");
  const g = mkdtempSync(join(tmpdir(), "trong-"));
  try {
    const git = (...a) => execFileSync("git", ["-C", g, ...a], { encoding: "utf8" });
    git("init", "-q");
    git("config", "user.email", "may@example.test");
    git("config", "user.name", "may");
    mkdirSync(join(g, "_acceptance/thu-trong"), { recursive: true });
    writeFileSync(join(g, "_acceptance/config.yaml"), [
      "executors:",
      "  script:",
      '    bo_chung: "node -e \\"process.exit(process.env.DATABASE_URL ? 1 : 0)\\""',
      '    eval_ho_so: "node -e \\"process.exit(process.env.DATABASE_URL ? 0 : 1)\\""',
      "feature_loop:",
      khoaThat.replace(/\n$/, ""),
      "  suite_keys:",
      "    - executors.script.bo_chung",
      "",
    ].join("\n"));
    writeFileSync(join(g, "_acceptance/thu-trong/evals.yaml"), "evals:\n  - id: E1\n    criterion: AC-1\n    executor: script\n    cmd: config:executors.script.eval_ho_so\n    expected: \"exit 0\"\n");
    writeFileSync(join(g, "README.md"), "kho tạm\n");
    git("add", "-A");
    git("commit", "-q", "-m", "khoi");
    const sha = git("rev-parse", "HEAD").trim();
    writeFileSync(join(g, "_acceptance/thu-trong/evidence-report.md"), `---\nverdict: PASS\nverified_commit: ${sha}\n---\n`);
    const r = spawnSync(process.execPath, [join(KIT, "feature-loop/scripts/repin-lane.mjs"), "--root", g, "--slug", "thu-trong", "--reason", "đo bộ kiểm chung để trống biến"], {
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: "postgres://khong-ket-noi@127.0.0.1:1/x", CLAUDE_PLUGIN_ROOT: KIT },
    });
    const out = r.stdout + r.stderr;
    const suiteOk = /suite 1\/1: .* → exit 0/.test(out);
    const evalOk = /thu-trong E1: .* → exit 0/.test(out);
    dat(suiteOk && evalOk && r.status === 0, `làn ghim lại của kit ${TAG}: bộ kiểm chung thấy DATABASE_URL trống (exit 0: ${suiteOk}), eval thấy đủ (exit 0: ${evalOk}), làn xanh (thoát ${r.status})`);
    // Đối chứng: gỡ khoá để trống thì bộ kiểm chung thấy chuỗi kết nối và đỏ.
    writeFileSync(join(g, "_acceptance/config.yaml"), readFileSync(join(g, "_acceptance/config.yaml"), "utf8").replace(khoaThat.replace(/\n$/, ""), "  # bỏ khoá"));
    git("commit", "-qam", "bo khoa");
    const sha2 = git("rev-parse", "HEAD").trim();
    writeFileSync(join(g, "_acceptance/thu-trong/evidence-report.md"), `---\nverdict: PASS\nverified_commit: ${sha2}\n---\n`);
    const r2 = spawnSync(process.execPath, [join(KIT, "feature-loop/scripts/repin-lane.mjs"), "--root", g, "--slug", "thu-trong", "--reason", "đối chứng"], {
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: "postgres://khong-ket-noi@127.0.0.1:1/x", CLAUDE_PLUGIN_ROOT: KIT },
    });
    dat(/suite 1\/1: .* → exit 1/.test(r2.stdout + r2.stderr) && r2.status !== 0, `đối chứng: gỡ khoá để trống thì bộ kiểm chung thấy chuỗi kết nối, làn đỏ (thoát ${r2.status})`);
  } finally {
    rmSync(g, { recursive: true, force: true });
    rmSync(KIT, { recursive: true, force: true });
  }
} else {
  console.error("dùng: kiem-nut.mjs --tinh | --pha | --chan | --quet | --trong");
  process.exit(2);
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
