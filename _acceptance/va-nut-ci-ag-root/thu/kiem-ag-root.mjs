// Bộ đo của hàng va-nut-ci-ag-root. Chỉ đọc cây kho; kit, kho tạm và HOME rỗng ở thư mục tạm của hệ điều hành.
//   --tinh   bước «Ghim lại» trỏ --ag-root vào kit lấy theo tag ($CLAUDE_PLUGIN_ROOT), không trỏ cây nhánh; bản phá đỏ
//   --chay   chạy như máy chủ GitHub, mọi thứ rút từ tệp luồng: khối run của bước lấy kit (RUNNER_TEMP, GITHUB_ENV tạm),
//            rồi dòng run của bước «Ghim lại» với env của job + GITHUB_ENV + env của bước, bash --noprofile --norc -eo
//            pipefail, HOME rỗng (không kit cài sẵn), kho git tạm một hồ sơ → làn xanh, pin kind repin; đối chứng bỏ
//            --ag-root → làn đỏ, không pin
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const LUONG = readFileSync(join(GOC, ".github/workflows/ghim-lai-ban-that.yml"), "utf8");
const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));

/** Khối một bước theo tên (tiền tố) và vị trí của nó trong tệp. */
function buoc(y, ten) {
  const re = new RegExp(`\\n( *)- name: ${ten.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^\\n]*\\n([\\s\\S]*?)(?=\\n\\1- |\\n\\1# |$)`);
  const m = y.match(re);
  return m ? { khoi: m[2], viTri: m.index } : null;
}
/** Bước «Ghim lại» và dòng run một dòng của nó. */
function buocGhim(y) {
  const b = buoc(y, "Ghim lại");
  if (!b) return null;
  return { ...b, run: (b.khoi.match(/\n? *run: (.+)/) ?? [])[1] ?? null };
}
/** Ánh xạ `env:` (KHOÁ: giá trị) ở thụt `thut` trong một khối. */
function envCua(khoi, thut) {
  const m = khoi.match(new RegExp(`(?:^|\\n) {${thut}}env:\\n((?: {${thut + 2}}\\S[^\\n]*\\n?)+)`));
  const o = {};
  for (const d of (m?.[1] ?? "").split("\n")) { const k = d.match(/^ *([A-Z_]+): (.*)$/); if (k) o[k[1]] = k[2].trim(); }
  return o;
}
/** Vế tĩnh: trả danh sách vế HỎNG. */
function veHong(y) {
  const h = [];
  const b = buocGhim(y);
  if (!b || !b.run) return ["luồng có bước «Ghim lại» một dòng run"];
  const ag = (b.run.match(/--ag-root\s+("[^"]*"|\S+)/) ?? [])[1];
  if (ag !== '"$CLAUDE_PLUGIN_ROOT"') h.push("bước ghim lại truyền --ag-root \"$CLAUDE_PLUGIN_ROOT\"");
  const k = buoc(y, "Lấy kit theo tag");
  if (!k || !/echo "CLAUDE_PLUGIN_ROOT=\$RUNNER_TEMP\/kit" >> "\$GITHUB_ENV"/.test(k.khoi) || !/refs\/tags\/\$KIT_TAG/.test(k.khoi) || k.viTri > b.viTri)
    h.push("CLAUDE_PLUGIN_ROOT là kit lấy theo KIT_TAG, ngoài cây kho, đặt qua GITHUB_ENV ở bước trước «Ghim lại»");
  return h;
}

if (process.argv.includes("--tinh")) {
  const h = veHong(LUONG);
  dat(h.length === 0, `luồng thật: ${h.length ? "hỏng " + h.join("; ") : "bước ghim lại trỏ --ag-root vào kit lấy theo tag"}`);
  const sua = (a, b) => (LUONG.includes(a) ? LUONG.replace(a, b) : null);
  const run = buocGhim(LUONG)?.run ?? "";
  const ca = [
    ["bỏ --ag-root", sua(run, run.replace(/ --ag-root\s+("[^"]*"|\S+)/, "")), "bước ghim lại truyền --ag-root \"$CLAUDE_PLUGIN_ROOT\""],
    ["--ag-root trỏ cây nhánh", sua(run, run.replace(/--ag-root\s+("[^"]*"|\S+)/, "--ag-root .")), "bước ghim lại truyền --ag-root \"$CLAUDE_PLUGIN_ROOT\""],
    ["kit không lấy theo tag", sua('"refs/tags/$KIT_TAG"', '"refs/heads/main"'), "CLAUDE_PLUGIN_ROOT là kit lấy theo KIT_TAG, ngoài cây kho, đặt qua GITHUB_ENV ở bước trước «Ghim lại»"],
    ["CLAUDE_PLUGIN_ROOT chỉ đặt ở env của bước lấy kit", sua('          echo "CLAUDE_PLUGIN_ROOT=$RUNNER_TEMP/kit" >> "$GITHUB_ENV"\n', "").replace("      - name: Lấy kit theo tag (ngoài cây kho)\n", "      - name: Lấy kit theo tag (ngoài cây kho)\n        env:\n          CLAUDE_PLUGIN_ROOT: ${{ runner.temp }}/kit\n"), "CLAUDE_PLUGIN_ROOT là kit lấy theo KIT_TAG, ngoài cây kho, đặt qua GITHUB_ENV ở bước trước «Ghim lại»"],
  ];
  for (const [ten, banSao, ve] of ca) {
    if (!banSao || banSao === LUONG) { dat(false, `ca phá thử «${ten}» lệch luồng`); continue; }
    const hh = veHong(banSao);
    dat(hh.length === 1 && hh[0] === ve, `phá thử «${ten}» → hỏng đúng vế «${ve}»${hh.length === 1 && hh[0] === ve ? "" : ` (hỏng: ${hh.join("; ") || "không vế nào"})`}`);
  }
} else if (process.argv.includes("--chay")) {
  const b = buocGhim(LUONG);
  const k = buoc(LUONG, "Lấy kit theo tag");
  const jobEnv = envCua(LUONG.slice(LUONG.indexOf("\n  ghim-lai:")), 4);
  if (!b?.run || !k || !jobEnv.KIT_TAG) { dat(false, "luồng thiếu bước «Ghim lại», bước lấy kit hay KIT_TAG ở env của job"); }
  else {
    const TAM = mkdtempSync(join(tmpdir(), "runner-"));
    const RT = join(TAM, "runner-temp"), NHA = join(TAM, "home-rong"), GE = join(TAM, "github-env"), g = join(TAM, "nhanh");
    for (const d of [RT, NHA, g]) mkdirSync(d, { recursive: true });
    writeFileSync(GE, "");
    // Biểu thức của GitHub thay bằng giá trị giả; bí mật thành chuỗi kết nối không kết nối được.
    const giaTri = (v) => v.replace(/\$\{\{\s*inputs\.ho_so\s*\}\}/g, "thu-ag").replace(/\$\{\{\s*inputs\.nhanh\s*\}\}/g, "claude/thu-ag")
      .replace(/\$\{\{\s*secrets\.[A-Z_]+\s*\}\}/g, "postgres://khong-ket-noi@127.0.0.1:1/x").replace(/\$\{\{[^}]*\}\}/g, "gia-tri-gia");
    const job = Object.fromEntries(Object.entries(jobEnv).map(([x, v]) => [x, giaTri(v)]));
    const SHELL = ["--noprofile", "--norc", "-eo", "pipefail", "-c"];
    const goc = { PATH: process.env.PATH, HOME: NHA, RUNNER_TEMP: RT, GITHUB_ENV: GE };
    try {
      // 1. Bước lấy kit, đúng khối run của luồng.
      const runKit = (k.khoi.match(/\n? *run: \|\n((?: {10}[^\n]*\n?)+)/) ?? [])[1]?.replace(/^ {10}/gm, "") ?? "";
      const rk = spawnSync("bash", [...SHELL, runKit], { cwd: TAM, env: { ...goc, ...job }, encoding: "utf8" });
      dat(rk.status === 0, `bước lấy kit của luồng chạy được (thoát ${rk.status})`);
      const geEnv = Object.fromEntries(readFileSync(GE, "utf8").split("\n").filter(Boolean).map((d) => [d.slice(0, d.indexOf("=")), d.slice(d.indexOf("=") + 1)]));
      // 2. Kho tạm đóng vai thư mục nhanh: một hồ sơ, suite chung thoát 0, eval thoát 0 khi có DATABASE_URL.
      const git = (...a) => execFileSync("git", ["-C", g, ...a], { encoding: "utf8" });
      git("init", "-q");
      git("config", "user.email", "may@example.test");
      git("config", "user.name", "may");
      mkdirSync(join(g, "_acceptance/thu-ag"), { recursive: true });
      writeFileSync(join(g, "_acceptance/config.yaml"), [
        "executors:",
        "  script:",
        '    bo_chung: "node -e \\"process.exit(0)\\""',
        '    eval_ho_so: "node -e \\"process.exit(process.env.DATABASE_URL ? 0 : 1)\\""',
        "feature_loop:",
        "  suite_keys:",
        "    - executors.script.bo_chung",
        "",
      ].join("\n"));
      writeFileSync(join(g, "_acceptance/thu-ag/evals.yaml"), "evals:\n  - id: E1\n    criterion: AC-1\n    executor: script\n    cmd: config:executors.script.eval_ho_so\n    expected: \"exit 0\"\n");
      writeFileSync(join(g, "README.md"), "kho tạm\n");
      git("add", "-A");
      git("commit", "-q", "-m", "khoi");
      const sha = git("rev-parse", "HEAD").trim();
      const wd = (b.khoi.match(/\n *working-directory: (\S+)/) ?? [])[1];
      const buocEnv = Object.fromEntries(Object.entries(envCua(b.khoi, 8)).map(([x, v]) => [x, giaTri(v)]));
      const runLog = join(g, "_acceptance/thu-ag/run-log.jsonl");
      const chay = (dong) => {
        // Dòng verify như bộ chấm ghi, để tự kiểm bằng chứng của làn truy được run_id của báo cáo.
        writeFileSync(runLog, JSON.stringify({ ts: "2026-11-08T00:00:00Z", sha, round: 1, evalId: "E1", run_id: "thu-ag-E1", exit_code: 0, cmd: "config:executors.script.eval_ho_so" }) + "\n");
        writeFileSync(join(g, "_acceptance/thu-ag/evidence-report.md"), `---\nverdict: PASS\nverified_commit: ${sha}\n---\n\n- eval: E1\n  run_id: thu-ag-E1\n  exit_code: 0\n  verifier: config:executors.script.eval_ho_so\n  verified_at: 2026-11-08T00:00:00Z\n  output: |\n    exit 0\n`);
        const r = spawnSync("bash", [...SHELL, dong], { cwd: wd === "nhanh" ? g : TAM, env: { ...goc, ...job, ...geEnv, ...buocEnv }, encoding: "utf8" });
        let kinds = [];
        try { kinds = readFileSync(runLog, "utf8").split("\n").filter(Boolean).map((d) => JSON.parse(d).kind).filter(Boolean); } catch { kinds = []; }
        return { ma: r.status, ra: (r.stdout ?? "") + (r.stderr ?? ""), kinds };
      };
      const r = chay(b.run);
      const lanChay = /suite 1\/1: .* → exit 0/.test(r.ra) && /thu-ag E1: .* → exit 0/.test(r.ra);
      dat(r.ma === 0 && lanChay, `dòng lệnh thật của bước «Ghim lại» với kit ${job.KIT_TAG}, HOME rỗng, env của job + GITHUB_ENV + env của bước: làn chạy suite và eval (${lanChay}), thoát ${r.ma}`);
      if (r.ma !== 0) console.log(r.ra.split("\n").filter((d) => /resolve-plugin|recheck|L[0-9]|VIOLATION|repin-lane| {2}/.test(d)).slice(-20).join("\n"));
      dat(r.kinds.includes("repin") && !r.kinds.includes("repin-do"), `làn ghi pin: run-log có dòng kind repin, không repin-do (${JSON.stringify(r.kinds)})`);
      // Đối chứng: cùng dòng bỏ --ag-root thì làn không tìm thấy kit, đỏ, không ghi pin — đúng lỗi run 42421859175.
      const r2 = chay(b.run.replace(/ --ag-root\s+("[^"]*"|\S+)/, ""));
      dat(r2.ma !== 0 && /no usable install of "?acceptance-gate"?/.test(r2.ra) && !r2.kinds.includes("repin"), `đối chứng: bỏ --ag-root thì làn không tìm thấy kit, đỏ, không pin (thoát ${r2.ma})`);
    } finally {
      rmSync(TAM, { recursive: true, force: true });
    }
  }
} else {
  console.error("dùng: kiem-ag-root.mjs --tinh | --chay");
  process.exit(2);
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
