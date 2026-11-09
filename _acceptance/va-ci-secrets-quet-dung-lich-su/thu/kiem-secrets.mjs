// Bộ đo của hàng va-ci-secrets-quet-dung-lich-su. Chỉ đọc cây kho; kho tạm và báo cáo ở thư mục tạm của hệ điều hành.
//   --ma-tran  mười một ca viết trước trên kho tạm dựng đúng refspec của actions/checkout@v4 với fetch-depth 0; mỗi ca chạy
//              dòng lệnh rút từ job secrets của ci.yml và lệnh trước bản vá, so mã thoát và tập commit phát hiện; đối số
//              git log thật đo qua GIT_TRACE; .gitleaksignore còn đủ dấu vân tay, không commit nào của hàng chạm nó
//   --tinh     bảy vế của rào trên ci.yml, mười một bản phá trên bản sao văn bản so tập vế hỏng; từng commit của hàng chỉ
//              đổi khối job secrets
//   --that     hai lần đỏ thật 08/11 trên lịch sử kho: kho tạm mượn đối tượng, mỗi mốc đúng một ref đã khai
// Khoá mẫu sinh lúc chạy, không có trong kho.
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const SLUG = "va-ci-secrets-quet-dung-lich-su";
const TEP_CI = ".github/workflows/ci.yml";
const CI = readFileSync(join(GOC, TEP_CI), "utf8");
const LENH_CU = `"$HOME/bin/gitleaks" git --redact --no-banner --log-level warn .`;
const OPTS = `--log-opts="--full-history --diff-filter=tuxdb HEAD"`;
const BASE_MO_VONG = "fb62d52e";

const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));
const ketThuc = () => {
  console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
  process.exit(loi.length ? 1 : 0);
};

const MOI_TRUONG_GIT = {
  ...process.env,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "may do",
  GIT_AUTHOR_EMAIL: "may-do@example.invalid",
  GIT_COMMITTER_NAME: "may do",
  GIT_COMMITTER_EMAIL: "may-do@example.invalid",
};

/** Chạy git; thoát khác 0 thì ném lỗi có tên lệnh (trừ khi `{chapNhan:true}`). */
function git(cwd, args, { chapNhan = false } = {}) {
  const r = spawnSync("git", args, { cwd, env: MOI_TRUONG_GIT, encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0 && !chapNhan) throw new Error(`git ${args.join(" ")}: ${(r.stderr ?? "").trim()}`);
  return chapNhan ? { ma: r.status, ra: (r.stdout ?? "").trim() } : (r.stdout ?? "").trim();
}

/** Cắt ci.yml thành phần đầu và từng job; khối chú thích liền trên một job thuộc về job đó. */
function cacKhoi(text) {
  const dong = text.split("\n");
  const iJobs = dong.indexOf("jobs:");
  const moc = [];
  for (let i = iJobs + 1; i < dong.length; i++) {
    const m = /^ {2}([a-z][a-z0-9-]*):\s*$/.exec(dong[i]);
    if (m) {
      let dau = i;
      while (dau - 1 > iJobs && /^ {2}#/.test(dong[dau - 1])) dau--;
      moc.push({ ten: m[1], dau });
    }
  }
  const job = {};
  moc.forEach((m, k) => {
    job[m.ten] = dong.slice(m.dau, k + 1 < moc.length ? moc[k + 1].dau : dong.length).join("\n");
  });
  return { dau: dong.slice(0, moc[0]?.dau ?? dong.length).join("\n"), job };
}
const layJob = (text, ten) => cacKhoi(text).job[ten] ?? "";

/** Dòng gọi gitleaks của job secrets; không đúng một dòng thì null. */
function lenhCi(text) {
  const d = layJob(text, "secrets").split("\n").map((x) => x.trim()).filter((x) => /"\$HOME\/bin\/gitleaks" git\b/.test(x));
  return d.length === 1 ? d[0] : null;
}

// ---------- bảy vế của rào ----------
const VE = {
  V1: "V1 checkout job secrets giữ fetch-depth 0",
  V2: "V2 bước checkout không có ref:",
  V3: "V3 lệnh có --redact",
  V4: "V4 --log-opts đúng phạm vi HEAD, không --all",
  V5: "V5 không cờ nuốt lỗi, job không continue-on-error",
  V6: "V6 ci-ok chờ secrets",
  V7: "V7 deploy chờ secrets",
};
const canSecrets = (t, ten) => {
  const m = layJob(t, ten).match(/\n {4}needs: \[([^\]]*)\]/);
  return !!m && m[1].split(",").map((x) => x.trim()).includes("secrets");
};
/** Tập vế hỏng — chấm đủ bảy vế, không dừng ở vế đầu. */
function chamVe(t) {
  const s = layJob(t, "secrets");
  const l = lenhCi(t) ?? "";
  const h = [];
  if (!/\n\s+fetch-depth: 0\s*(\n|$)/.test(s)) h.push(VE.V1);
  if (/\n\s+ref:/.test(s)) h.push(VE.V2);
  if (!/ --redact\b/.test(l)) h.push(VE.V3);
  if (!l.includes(` ${OPTS} `) || /--all\b/.test(l)) h.push(VE.V4);
  if (/--exit-code\s+0\b/.test(l) || /\|\|\s*true/.test(l) || /continue-on-error/.test(s)) h.push(VE.V5);
  if (!canSecrets(t, "ci-ok")) h.push(VE.V6);
  if (!canSecrets(t, "deploy")) h.push(VE.V7);
  return h;
}

/** Các job/phần đầu tệp khác nhau giữa hai bản, trừ job secrets. */
function ngoaiJobSecrets(cha, con) {
  const a = cacKhoi(cha), b = cacKhoi(con);
  const khac = a.dau === b.dau ? [] : ["phần đầu tệp"];
  for (const ten of new Set([...Object.keys(a.job), ...Object.keys(b.job)])) {
    if (ten !== "secrets" && a.job[ten] !== b.job[ten]) khac.push(ten);
  }
  return khac;
}

/** Commit của hàng: trước khi gộp là commit trên nhánh chạm hai tệp; sau khi gộp là commit mang slug. */
function commitsCuaHang() {
  const co = git(GOC, ["rev-parse", "--verify", "-q", "origin/main"], { chapNhan: true });
  if (co.ma !== 0) throw new Error("không có origin/main — không xác định được commit của hàng");
  const daGop = git(GOC, ["log", "origin/main", "--no-merges", `--grep=${SLUG}`, "--format=%H", "--", TEP_CI]);
  const dsTep = ["--", TEP_CI, ".gitleaksignore"];
  const ra = daGop
    ? git(GOC, ["log", "HEAD", "--no-merges", `--grep=${SLUG}`, "--format=%H", ...dsTep])
    : git(GOC, ["log", `${git(GOC, ["merge-base", "origin/main", "HEAD"])}..HEAD`, "--no-merges", "--format=%H", ...dsTep]);
  return ra.split("\n").filter(Boolean);
}
const tepCuaCommit = (sha) => git(GOC, ["show", "--name-only", "--format=", sha]).split("\n").filter(Boolean);

// ---------- chạy lệnh quét ----------
let demBao = 0;
function dungNha(tam) {
  const nha = join(tam, "nha");
  mkdirSync(join(nha, "bin"), { recursive: true });
  const glMay = spawnSync("bash", ["-c", "command -v gitleaks"], { encoding: "utf8" }).stdout.trim();
  if (!glMay) return null;
  symlinkSync(glMay, join(nha, "bin", "gitleaks"));
  return { nha, glMay };
}
/** Chạy nguyên văn một dòng lệnh trong `cwd`; trả mã thoát, số phát hiện theo commit, và đối số git log khi `trace`. */
function chayLenh(cwd, lenh, nha, { trace = false } = {}) {
  const bao = join(nha, `bao-${++demBao}.json`);
  const env = { ...MOI_TRUONG_GIT, HOME: nha, ...(trace ? { GIT_TRACE: "1" } : {}) };
  const r = spawnSync("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", `${lenh} --report-format json --report-path ${bao}`], { cwd, env, encoding: "utf8", maxBuffer: 1 << 28 });
  const ra = (r.stdout ?? "") + (r.stderr ?? "");
  const commits = new Map();
  if (existsSync(bao)) for (const f of JSON.parse(readFileSync(bao, "utf8"))) commits.set(f.Commit, (commits.get(f.Commit) ?? 0) + 1);
  // gitleaks in lại dòng trace kèm mã màu ANSI ở cuối, bắt đầu bằng ký tự ESC.
  const m = ra.match(/trace: built-in: git log ([^\n]*)/);
  return { ma: r.status, commits, gitLog: m ? `log ${m[1].split(String.fromCharCode(27))[0].trim()}` : null };
}
const inCommit = (m) => `[${[...m.keys()].map((s) => s.slice(0, 8)).join(", ")}]`;
const bangTap = (m, s) => (s ? m.size === 1 && m.has(s) : m.size === 0);

function kiemBanGitleaks(glMay) {
  const ban = (CI.match(/\n {2}GITLEAKS_VERSION: (\S+)/) ?? [])[1];
  const v = spawnSync(glMay, ["version"], { encoding: "utf8" }).stdout.trim().replace(/^v/, "");
  return dat(!!ban && v === ban, `gitleaks của máy chấm là bản ${ban} của ci.yml (máy: ${v})`);
}

// ---------- kho thử dựng đúng cách actions/checkout lấy mã ----------
const khoaMau = () => "gh" + "p_" + randomBytes(27).toString("base64").replace(/[+/=]/g, "a");

/** Kho làm việc tạm với vài thao tác ngắn; `khoa` ghi commit mang khoá của ca. */
function moKho(thuMuc) {
  git(thuMuc, ["init", "-q", "-b", "main"]);
  const k = {
    khoa: null,
    ghi(tep, noiDung, tn = `ghi ${tep}`) {
      writeFileSync(join(thuMuc, tep), noiDung);
      git(thuMuc, ["add", tep]);
      git(thuMuc, ["commit", "-q", "-m", tn]);
      return git(thuMuc, ["rev-parse", "HEAD"]);
    },
    xoa(tep) {
      git(thuMuc, ["rm", "-q", tep]);
      git(thuMuc, ["commit", "-q", "-m", `xoa ${tep}`]);
    },
    nhanh: (ten, tu = "HEAD") => git(thuMuc, ["checkout", "-q", "-b", ten, tu]),
    ve: (ten) => git(thuMuc, ["checkout", "-q", ten]),
    boNhanh: (ten) => git(thuMuc, ["branch", "-q", "-D", ten]),
    gop: (ten) => git(thuMuc, ["merge", "-q", "--no-ff", "-m", `gop ${ten}`, ten]),
    tag: (ten, sha) => git(thuMuc, ["tag", ten, sha]),
    /** Đỉnh main gộp với nhánh PR, như GitHub dựng refs/pull/N/merge; main và nhánh PR giữ nguyên. */
    dungRefGop() {
      git(thuMuc, ["checkout", "-q", "--detach", "main"]);
      git(thuMuc, ["merge", "-q", "--no-ff", "-m", "Merge nhanh-pr into main", "nhanh-pr"]);
      git(thuMuc, ["update-ref", "refs/pull/7/merge", "HEAD"]);
      git(thuMuc, ["checkout", "-q", "main"]);
    },
  };
  return k;
}
const VAN_TAY = ["bi-mat.txt:github-pat:1"].join("\n") + "\n";
const dongKhoa = () => `token = ${khoaMau()}\n`;

const CA = [
  { id: "M1", ten: "PR, không giá trị nào", su: "pr", mong: 0, mongCu: 0, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-pr"); k.ghi("pr.txt", "p\n"); k.ve("main"); k.dungRefGop(); } },
  { id: "M2", ten: "PR, khoá ở commit nhánh PR đã gỡ", su: "pr", mong: 1, mongCu: 1, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-pr"); k.khoa = k.ghi("bi-mat.txt", dongKhoa()); k.xoa("bi-mat.txt"); k.ve("main"); k.ghi("b.txt", "b\n"); k.dungRefGop(); } },
  { id: "M3", ten: "PR, khoá ở commit main sau điểm rẽ đã gỡ", su: "pr", mong: 1, mongCu: 1, dung: dungM3 },
  { id: "M4", ten: "PR, giá trị trên nhánh khác kèm tệp bỏ qua của nhánh ấy", su: "pr", mong: 0, mongCu: 1, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-pr"); k.ghi("pr.txt", "p\n"); k.ve("main"); k.nhanh("nhanh-khac"); k.ghi(".gitleaksignore", VAN_TAY); k.khoa = k.ghi("bi-mat.txt", dongKhoa()); k.ve("main"); k.dungRefGop(); } },
  { id: "M5", ten: "PR, giá trị ở tag ngoài lịch sử HEAD", su: "pr", mong: 0, mongCu: 1, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-pr"); k.ghi("pr.txt", "p\n"); k.ve("main"); k.nhanh("tam"); k.khoa = k.ghi("bi-mat.txt", dongKhoa()); k.tag("mau", k.khoa); k.ve("main"); k.boNhanh("tam"); k.dungRefGop(); } },
  { id: "M6", ten: "push main, khoá ở lịch sử main đã gỡ", su: "push", mong: 1, mongCu: 1, dung(k) { k.ghi("a.txt", "a\n"); k.khoa = k.ghi("bi-mat.txt", dongKhoa()); k.xoa("bi-mat.txt"); k.ghi("b.txt", "b\n"); } },
  { id: "M7", ten: "push main, khoá ở nhánh đã gộp (cha thứ hai)", su: "push", mong: 1, mongCu: 1, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-pr"); k.khoa = k.ghi("bi-mat.txt", dongKhoa()); k.xoa("bi-mat.txt"); k.ve("main"); k.ghi("b.txt", "b\n"); k.gop("nhanh-pr"); } },
  { id: "M8", ten: "push main, giá trị trên nhánh khác", su: "push", mong: 0, mongCu: 1, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-khac"); k.khoa = k.ghi("bi-mat.txt", dongKhoa()); k.ve("main"); k.ghi("b.txt", "b\n"); } },
  { id: "M9", ten: "PR, giá trị có dấu vân tay trong tệp bỏ qua của nhánh", su: "pr", mong: 0, mongCu: 0, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-pr"); k.ghi(".gitleaksignore", VAN_TAY); k.ghi("bi-mat.txt", dongKhoa()); k.ve("main"); k.dungRefGop(); } },
  { id: "M10", ten: "PR, cùng giá trị, tệp bỏ qua không chứa dấu vân tay", su: "pr", mong: 1, mongCu: 1, dung(k) { k.ghi("a.txt", "a\n"); k.nhanh("nhanh-pr"); k.ghi(".gitleaksignore", "# trong\n"); k.khoa = k.ghi("bi-mat.txt", dongKhoa()); k.ve("main"); k.dungRefGop(); } },
  { id: "M11", ten: "đối chứng: như M3 nhưng HEAD sai về đỉnh nhánh PR", su: "sai-head", mong: 0, mongCu: 1, dung: dungM3 },
];
function dungM3(k) {
  k.ghi("a.txt", "a\n");
  k.nhanh("nhanh-pr");
  k.ghi("pr.txt", "p\n");
  k.ve("main");
  k.khoa = k.ghi("bi-mat.txt", dongKhoa());
  k.xoa("bi-mat.txt");
  k.ghi("b.txt", "b\n");
  k.dungRefGop();
}

/** Kho của máy chạy: đúng các refspec của getRefSpecForAllHistory, rồi checkout như actions/checkout. */
function dungKhoMay(tam, id, nguon, su) {
  const may = join(tam, id, "may");
  mkdirSync(may, { recursive: true });
  git(may, ["init", "-q"]);
  git(may, ["remote", "add", "origin", nguon]);
  const spec = ["+refs/heads/*:refs/remotes/origin/*", "+refs/tags/*:refs/tags/*"];
  if (su === "pr") spec.push("+refs/pull/7/merge:refs/remotes/pull/7/merge");
  git(may, ["fetch", "-q", "origin", ...spec]);
  if (su === "pr") git(may, ["checkout", "-q", "--force", "refs/remotes/pull/7/merge"]);
  else if (su === "push") git(may, ["checkout", "-q", "--force", "-B", "main", "refs/remotes/origin/main"]);
  else git(may, ["checkout", "-q", "--force", "--detach", "refs/remotes/origin/nhanh-pr"]);
  return may;
}

function maTran() {
  const lenh = lenhCi(CI);
  if (!dat(lenh !== null, `rút được đúng một dòng gitleaks từ job secrets của ci.yml`)) return;
  const TAM = mkdtempSync(join(tmpdir(), "secrets-ma-tran-"));
  try {
    const n = dungNha(TAM);
    if (!n) return void dat(false, "máy chấm thiếu gitleaks (AGENTS.md: brew install gitleaks)");
    if (!kiemBanGitleaks(n.glMay)) return;
    for (const ca of CA) {
      const lam = join(TAM, ca.id, "lam");
      mkdirSync(lam, { recursive: true });
      const k = moKho(lam);
      ca.dung(k);
      const nguon = join(TAM, ca.id, "nguon.git");
      git(TAM, ["init", "-q", "--bare", nguon]);
      git(lam, ["push", "-q", nguon, "+refs/heads/*:refs/heads/*", "+refs/tags/*:refs/tags/*", ...(ca.su === "push" ? [] : ["+refs/pull/7/merge:refs/pull/7/merge"])]);
      const may = dungKhoMay(TAM, ca.id, nguon, ca.su);
      const a = chayLenh(may, lenh, n.nha);
      const b = chayLenh(may, LENH_CU, n.nha);
      const ok = a.ma === ca.mong && bangTap(a.commits, ca.mong ? k.khoa : null) && b.ma === ca.mongCu && bangTap(b.commits, ca.mongCu ? k.khoa : null);
      dat(ok, `${ca.id} ${ca.ten}: lệnh ci.yml thoát ${a.ma} (mong ${ca.mong}), phát hiện ${inCommit(a.commits)}; lệnh cũ thoát ${b.ma} (mong ${ca.mongCu}), phát hiện ${inCommit(b.commits)}`);
      if (ca.id === "M1") {
        const ta = chayLenh(may, lenh, n.nha, { trace: true }).gitLog;
        const tb = chayLenh(may, LENH_CU, n.nha, { trace: true }).gitLog;
        const moi = "log -p -U0 --full-history --diff-filter=tuxdb HEAD";
        const cu = "log -p -U0 --full-history --all --diff-filter=tuxdb";
        dat(ta === moi && tb === cu, `đối số git log: lệnh ci.yml «${ta}», lệnh cũ «${tb}», chỉ khác --all và HEAD`);
      }
    }
    // Tệp bỏ qua của kho: đủ dấu vân tay lúc mở vòng, không commit nào của hàng chạm nó.
    const goc = git(GOC, ["show", `${BASE_MO_VONG}:.gitleaksignore`]).split("\n").filter((d) => d && !d.startsWith("#"));
    const nay = readFileSync(join(GOC, ".gitleaksignore"), "utf8").split("\n");
    const thieu = goc.filter((d) => !nay.includes(d));
    dat(goc.length === 9 && thieu.length === 0, thieu.length ? `.gitleaksignore thiếu ${thieu.join(" · ")}` : `.gitleaksignore còn đủ ${goc.length}/9 dấu vân tay của ${BASE_MO_VONG}`);
    const ds = commitsCuaHang();
    const cham = ds.filter((s) => tepCuaCommit(s).includes(".gitleaksignore"));
    dat(cham.length === 0, cham.length ? `commit ${cham.map((s) => s.slice(0, 8)).join(", ")} chạm .gitleaksignore` : `không commit nào của hàng chạm .gitleaksignore (${ds.length} commit)`);
  } finally {
    rmSync(TAM, { recursive: true, force: true });
  }
}

function tinh() {
  const h = chamVe(CI);
  dat(h.length === 0, `ci.yml thật: ${h.length ? `hỏng ${h.join(" | ")}` : `đủ ${Object.keys(VE).length}/7 vế của rào`}`);
  const suaSecrets = (t, tu, sang) => {
    const j = layJob(t, "secrets");
    return j.includes(tu) ? t.replace(j, j.replace(tu, sang)) : null;
  };
  const l = lenhCi(CI) ?? "\0";
  const needs = (ten) => layJob(CI, ten).match(/\n {4}needs: \[[^\]]*\]/)?.[0] ?? "\0";
  const goNeeds = (ten) => {
    const j = layJob(CI, ten);
    const n = needs(ten);
    return j.includes(n) ? CI.replace(j, j.replace(n, n.replace(/\bsecrets, /, ""))) : null;
  };
  const MA_TRAN_PHA = [
    ["bỏ fetch-depth", suaSecrets(CI, "\n        with:\n          fetch-depth: 0", ""), [VE.V1]],
    ["fetch-depth 1", suaSecrets(CI, "fetch-depth: 0", "fetch-depth: 1"), [VE.V1]],
    ["thêm ref: ở checkout", suaSecrets(CI, "fetch-depth: 0", "fetch-depth: 0\n          ref: ${{ github.head_ref }}"), [VE.V2]],
    ["bỏ --redact", suaSecrets(CI, " --redact", ""), [VE.V3]],
    ["đặt lại --all", suaSecrets(CI, `tuxdb HEAD"`, `tuxdb --all"`), [VE.V4]],
    ["bỏ HEAD", suaSecrets(CI, `tuxdb HEAD"`, `tuxdb"`), [VE.V4]],
    ["thêm --exit-code 0", suaSecrets(CI, " --log-level warn", " --log-level warn --exit-code 0"), [VE.V5]],
    ["thêm || true", suaSecrets(CI, l, `${l} || true`), [VE.V5]],
    ["thêm continue-on-error", suaSecrets(CI, "    runs-on: ubuntu-latest", "    continue-on-error: true\n    runs-on: ubuntu-latest"), [VE.V5]],
    ["gỡ secrets khỏi ci-ok", goNeeds("ci-ok"), [VE.V6]],
    ["gỡ secrets khỏi deploy", goNeeds("deploy"), [VE.V7]],
  ];
  const bang = (a) => [...a].sort().join(" | ");
  for (const [ten, banSao, mong] of MA_TRAN_PHA) {
    if (!banSao || banSao === CI) {
      dat(false, `phá thử «${ten}» lệch ci.yml`);
      continue;
    }
    const hong = chamVe(banSao);
    dat(bang(hong) === bang(mong), `phá thử «${ten}» → hỏng đúng «${mong.join("» + «")}»${bang(hong) === bang(mong) ? "" : ` (hỏng: ${hong.join("; ") || "không vế nào"})`}`);
  }
  // Phạm vi từng commit của hàng trong ci.yml.
  const ds = commitsCuaHang().filter((s) => tepCuaCommit(s).includes(TEP_CI));
  const sai = ds.flatMap((s) => {
    const ngoai = ngoaiJobSecrets(git(GOC, ["show", `${s}^:${TEP_CI}`]), git(GOC, ["show", `${s}:${TEP_CI}`]));
    return ngoai.length ? [`${s.slice(0, 8)}: ${ngoai.join(", ")}`] : [];
  });
  dat(ds.length > 0 && sai.length === 0, ds.length === 0 ? "commit của hàng: chưa có commit nào chạm ci.yml" : sai.length ? `commit của hàng đổi ngoài job secrets: ${sai.join(" · ")}` : `commit của hàng chỉ đổi job secrets (${ds.length} commit)`);
  const doiGate = CI.replace(/KIT_TAG: \S+/, "KIT_TAG: v0.0.0-doi-chung");
  dat(doiGate !== CI && ngoaiJobSecrets(CI, doiGate).join() === "gate", `đối chứng: đổi job gate → hỏng «ngoài job secrets»`);
  const chuThich = layJob(CI, "secrets").split("\n")[0];
  const doiChu = chuThich.startsWith("  #") ? CI.replace(chuThich, `${chuThich} (doi chung)`) : CI;
  dat(doiChu !== CI && ngoaiJobSecrets(CI, doiChu).length === 0, `đối chứng: đổi khối chú thích liền trên job secrets → vẫn trong job secrets`);
  const hook = readFileSync(join(GOC, ".githooks/pre-commit"), "utf8");
  dat(/gitleaks git --pre-commit --staged\b/.test(hook), "hook pre-commit gọi gitleaks trên phần đã stage");
  dat(!existsSync(join(GOC, ".gitleaks.toml")), "không có tệp cấu hình gitleaks ở gốc kho");
}

function that() {
  const lenh = lenhCi(CI);
  if (!dat(lenh !== null, `rút được đúng một dòng gitleaks từ job secrets của ci.yml`)) return;
  const TAM = mkdtempSync(join(tmpdir(), "secrets-that-"));
  try {
    const n = dungNha(TAM);
    if (!n) return void dat(false, "máy chấm thiếu gitleaks (AGENTS.md: brew install gitleaks)");
    if (!kiemBanGitleaks(n.glMay)) return;
    const chung = git(GOC, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    const dung = (ten, dungTai, ref) => {
      const k = join(TAM, ten);
      mkdirSync(k);
      git(k, ["init", "-q"]);
      writeFileSync(join(k, ".git/objects/info/alternates"), `${chung}/objects\n`);
      if (ref) git(k, ["update-ref", "refs/heads/mau", ref]);
      git(k, ["checkout", "-q", "--force", "--detach", dungTai]);
      return k;
    };
    const inTheoCommit = (m) => `{${[...m].map(([s, c]) => `${s.slice(0, 8)}: ${c}`).join(", ")}}`;
    const MOC = [
      ["fc0dab7b", "66b6521d", { "66b6521d": 6 }],
      ["001ae667", "f848f717", { f848f717: 3 }],
    ];
    for (const [tai, ref, mong] of MOC) {
      const k = dung(tai, tai, ref);
      const b = chayLenh(k, LENH_CU, n.nha);
      const a = chayLenh(k, lenh, n.nha);
      const dat1 = JSON.stringify(Object.fromEntries([...b.commits].map(([s, c]) => [s.slice(0, 8), c]))) === JSON.stringify(mong);
      dat(b.ma === 1 && dat1 && a.ma === 0 && a.commits.size === 0, `mốc ${tai} + ref ${ref}: lệnh cũ thoát ${b.ma}, phát hiện theo commit ${inTheoCommit(b.commits)}; lệnh ci.yml thoát ${a.ma}`);
    }
    const sha = git(GOC, ["rev-parse", "HEAD"]);
    const k = dung("head", sha, null);
    const a = chayLenh(k, lenh, n.nha);
    dat(a.ma === 0, `HEAD cây đang chấm: lệnh ci.yml thoát ${a.ma}${a.ma === 0 ? "" : `, phát hiện ${inCommit(a.commits)}`}`);
  } finally {
    rmSync(TAM, { recursive: true, force: true });
  }
}

const CHE_DO = { "--ma-tran": maTran, "--tinh": tinh, "--that": that };
const co = process.argv.slice(2).find((a) => CHE_DO[a]);
if (!co) {
  console.error("dùng: kiem-secrets.mjs --ma-tran | --tinh | --that");
  process.exit(2);
}
try {
  CHE_DO[co]();
} catch (e) {
  dat(false, `không chạy hết phép đo: ${e.message}`);
}
ketThuc();
