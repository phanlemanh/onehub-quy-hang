// Bộ đo của hàng va-nut-ci-gitleaks. Chỉ đọc cây kho; tệp tải, HOME rỗng và kho tạm ở thư mục tạm của hệ điều hành.
//   --tinh   luồng .github/workflows/ghim-lai-ban-that.yml có bước cài gitleaks đúng năm vế (chấm đủ năm, env hiệu lực
//            cho vế bí mật); ma trận phá thử viết trước, mỗi ca → TẬP vế phải hỏng, so bằng nhau
//   --chay   chạy khối run của bước cài gitleaks như máy chủ GitHub (bash --noprofile --norc -eo pipefail, HOME rỗng,
//            RUNNER_TEMP và GITHUB_PATH tạm, env của job) → thoát 0, GITHUB_PATH trỏ thư mục có gitleaks linux x64;
//            đối chứng: băm ghim lệch một ký tự → thoát khác 0, không dòng GITHUB_PATH, không tệp gitleaks
//   --hooks  bài tự kiểm của rào (lệnh test:hooks của package.json) ở chế độ CI như bước «Ghim lại», so với khối ghim từ
//            nhật ký run 42440631323 (thu/run-42440631323-suite-4-7.txt): tập dòng ĐỎ của run đúng bằng {gitleaks…};
//            gitleaks vắng khỏi PATH → dòng kết luận trùng từng dòng với run; gitleaks tới qua một thư mục đặt trước
//            PATH (cách GitHub áp GITHUB_PATH) → 0 dòng ĐỎ, TỔNG: ĐẠT, kể cả ca chặn bí mật đã stage. Chạy trên bản sao
//            cây tại HEAD (git clone --shared, node_modules nối liên kết) để không giẫm suite test:hooks chạy song song
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, readSync, closeSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const LUONG = readFileSync(join(GOC, ".github/workflows/ghim-lai-ban-that.yml"), "utf8");
const CI = readFileSync(join(GOC, ".github/workflows/ci.yml"), "utf8");
const TEN_CAI = "Cài gitleaks";
const loi = [];
const dat = (ok, ten) => (console.log(`${ok ? "ĐẠT" : "HỎNG"} ${ten}`), ok || loi.push(ten));

/** Các bước của job, mỗi phần tử là văn bản một bước (bỏ «- » đầu). */
const cacBuoc = (y) => y.slice(y.indexOf("\n    steps:")).split(/\n {6}- /).slice(1);
/** Khối run nhiều dòng của một bước, bỏ thụt. */
const khoiRun = (b) => (b.match(/\n {8}run: \|\n((?: {10}[^\n]*\n?)+)/) ?? [])[1]?.replace(/^ {10}/gm, "") ?? "";
/** Một khoá ở env của job ghim-lai (thụt 6). */
const envJob = (y, k) => (y.slice(y.indexOf("\n  ghim-lai:")).match(new RegExp(`\\n {6}${k}: (\\S+)`)) ?? [])[1];
/** GITLEAKS_VERSION ở env cấp tệp của ci.yml (thụt 2). */
const banCi = (CI.match(/\nenv:\n(?: {2}\S[^\n]*\n)*? {2}GITLEAKS_VERSION: (\S+)/) ?? [])[1];

const VE = [
  "có bước «Cài gitleaks» đứng trước «Ghim lại»",
  "bản gitleaks là GITLEAKS_VERSION của ci.yml",
  "tệp tải được kiểm băm sha256 ghim ở luồng trước khi giải nén",
  "thư mục cài được đưa vào GITHUB_PATH",
  "bước cài không mang bí mật",
];

/** Khối env của job ghim-lai (thụt 4), trước `steps:`. */
const khoiEnvJob = (y) => (y.slice(y.indexOf("\n  ghim-lai:"), y.indexOf("\n    steps:")).match(/\n {4}env:\n((?: {6}[^\n]*\n?)+)/) ?? [])[1] ?? "";

/**
 * Năm vế của bước cài — chấm ĐỦ năm vế, không dừng ở vế hỏng đầu tiên. Trả { hong, khongAp }: vế HỎNG, và vế không
 * chấm được vì luồng không có bước cài (khi ấy bốn vế sau «không áp», chỉ vế đầu hỏng).
 */
function chamVe(y) {
  const b = cacBuoc(y);
  const iCai = b.findIndex((x) => x.startsWith(`name: ${TEN_CAI}`));
  const iGhim = b.findIndex((x) => x.startsWith("name: Ghim lại\n"));
  if (iCai < 0) return { hong: [VE[0]], khongAp: VE.slice(1) };
  const h = [];
  if (iGhim < 0 || iCai > iGhim) h.push(VE[0]);
  const run = khoiRun(b[iCai]);
  const ban = envJob(y, "GITLEAKS_VERSION");
  if (!ban || ban !== banCi || !run.includes("releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz")) h.push(VE[1]);
  const bam = envJob(y, "GITLEAKS_SHA256");
  const dong = run.split("\n");
  const iBam = dong.findIndex((d) => /\$\{?GITLEAKS_SHA256\}?/.test(d) && /\| sha256sum -c -$/.test(d));
  const iTar = dong.findIndex((d) => /^tar /.test(d));
  if (!/^[0-9a-f]{64}$/.test(bam ?? "") || iBam < 0 || iTar < 0 || iBam > iTar) h.push(VE[2]);
  if (!dong.some((d) => /^echo "\$RUNNER_TEMP\/gitleaks" >> "\$GITHUB_PATH"$/.test(d))) h.push(VE[3]);
  // Env HIỆU LỰC của bước: env của job + env của chính bước + khoá mà bước trước ghi vào GITHUB_ENV từ một bí mật.
  const bamBiMat = (s) => /\$\{\{\s*secrets\./.test(s);
  const truocGhiBiMat = b.slice(0, iCai).some((x) => bamBiMat(x) && /GITHUB_ENV/.test(x));
  if (bamBiMat(khoiEnvJob(y)) || bamBiMat(b[iCai]) || truocGhiBiMat) h.push(VE[4]);
  return { hong: h, khongAp: [] };
}
const veHong = (y) => chamVe(y).hong;

if (process.argv.includes("--tinh")) {
  const h = veHong(LUONG);
  dat(h.length === 0, `luồng thật: ${h.length ? `hỏng ${h.join(" | ")}` : `đủ ${VE.length} vế của bước cài gitleaks`}`);
  const b = cacBuoc(LUONG);
  const cai = b.find((x) => x.startsWith(`name: ${TEN_CAI}`)) ?? "";
  const ghim = b.find((x) => x.startsWith("name: Ghim lại\n")) ?? "";
  const run = khoiRun(cai);
  const dongBam = run.split("\n").find((d) => /sha256sum -c/.test(d)) ?? "";
  const dongTar = run.split("\n").find((d) => /^tar /.test(d)) ?? "";
  const sua = (tu, sang) => (tu && LUONG.includes(tu) ? LUONG.replace(tu, sang) : null);
  const dongPath = `          echo "$RUNNER_TEMP/gitleaks" >> "$GITHUB_PATH"\n`;
  const kiemSauTar = (s) => (dongBam && dongTar && s?.includes(`          ${dongBam}\n          ${dongTar}\n`) ? s.replace(`          ${dongBam}\n          ${dongTar}\n`, `          ${dongTar}\n          ${dongBam}\n`) : null);
  // Ma trận viết trước: mỗi ca → TẬP vế phải hỏng (so bằng nhau, không so vế đầu) và tập vế phải «không áp».
  const MA_TRAN = [
    ["bỏ bước cài", cai && sua(`      - ${cai}\n`, ""), [VE[0]], VE.slice(1)],
    ["bước cài đứng sau «Ghim lại»", cai && ghim && sua(`      - ${cai}\n`, "")?.replace(`      - ${ghim}`, `      - ${ghim}\n      - ${cai}`), [VE[0]], []],
    ["bản lệch ci.yml", sua(`      GITLEAKS_VERSION: ${banCi}\n`, "      GITLEAKS_VERSION: 8.30.0\n"), [VE[1]], []],
    ["bỏ dòng kiểm băm", dongBam && sua(`          ${dongBam}\n`, ""), [VE[2]], []],
    ["kiểm băm sau khi giải nén", kiemSauTar(LUONG), [VE[2]], []],
    ["bỏ dòng GITHUB_PATH", sua(dongPath, ""), [VE[3]], []],
    ["bước cài mang bí mật", cai && sua(`      - name: ${TEN_CAI}`, `      - name: ${TEN_CAI}\n        env:\n          BI_MAT: \${{ secrets.PROD_DATABASE_URL }}`), [VE[4]], []],
    ["bí mật ở env của job", sua("      HO_SO: ${{ inputs.ho_so }}\n", "      HO_SO: ${{ inputs.ho_so }}\n      BI_MAT: ${{ secrets.PROD_DATABASE_URL }}\n"), [VE[4]], []],
    ["phá kép: kiểm băm sau giải nén và bỏ GITHUB_PATH", kiemSauTar(sua(dongPath, "")), [VE[2], VE[3]], []],
  ];
  const bang = (a) => [...a].sort().join(" | ");
  for (const [ten, banSao, mong, mongKhongAp] of MA_TRAN) {
    if (!banSao || banSao === LUONG) { dat(false, `ca phá thử «${ten}» lệch luồng`); continue; }
    const { hong, khongAp } = chamVe(banSao);
    const ok = bang(hong) === bang(mong) && bang(khongAp) === bang(mongKhongAp);
    dat(ok, `phá thử «${ten}» → hỏng đúng ${mong.length} vế «${mong.join("» + «")}»${mongKhongAp.length ? ` (${mongKhongAp.length} vế không áp)` : ""}${ok ? "" : ` (hỏng: ${hong.join("; ") || "không vế nào"}; không áp: ${khongAp.length})`}`);
  }
} else if (process.argv.includes("--chay")) {
  const cai = cacBuoc(LUONG).find((x) => x.startsWith(`name: ${TEN_CAI}`));
  const ban = envJob(LUONG, "GITLEAKS_VERSION");
  const bam = envJob(LUONG, "GITLEAKS_SHA256");
  if (!cai || !ban || !bam) dat(false, "luồng thiếu bước «Cài gitleaks», GITLEAKS_VERSION hay GITLEAKS_SHA256 ở env của job");
  else {
    const TAM = mkdtempSync(join(tmpdir(), "runner-gl-"));
    const run = khoiRun(cai);
    /** Chạy khối run với một băm; trả mã thoát, các dòng GITHUB_PATH, và tệp gitleaks (nếu có). */
    const chay = (ten, bamDung) => {
      const RT = join(TAM, ten, "runner-temp"), NHA = join(TAM, ten, "home-rong"), GP = join(TAM, ten, "github-path");
      mkdirSync(RT, { recursive: true });
      mkdirSync(NHA, { recursive: true });
      writeFileSync(GP, "");
      const r = spawnSync("bash", ["--noprofile", "--norc", "-eo", "pipefail", "-c", run], {
        cwd: join(TAM, ten),
        env: { PATH: process.env.PATH, HOME: NHA, RUNNER_TEMP: RT, GITHUB_PATH: GP, CI: "true", GITLEAKS_VERSION: ban, GITLEAKS_SHA256: bamDung },
        encoding: "utf8",
      });
      const dongPath = readFileSync(GP, "utf8").split("\n").filter(Boolean);
      const tep = join(RT, "gitleaks", "gitleaks");
      return { ma: r.status, ra: (r.stdout ?? "") + (r.stderr ?? ""), dongPath, tep: existsSync(tep) ? tep : null };
    };
    /** Bốn byte ELF và e_machine 0x3e (x86-64). */
    const elfX64 = (f) => {
      const fd = openSync(f, "r");
      const b = Buffer.alloc(20);
      readSync(fd, b, 0, 20, 0);
      closeSync(fd);
      return b.subarray(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46])) && b.readUInt16LE(18) === 0x3e;
    };
    try {
      const r = chay("lanh", bam);
      dat(r.ma === 0, `khối run của bước cài chạy như máy chủ GitHub (bash -eo pipefail, HOME rỗng, gitleaks ${ban}): thoát ${r.ma}`);
      if (r.ma !== 0) console.log(r.ra.trim().split("\n").slice(-8).join("\n"));
      const thuMuc = r.dongPath.length === 1 ? r.dongPath[0] : null;
      dat(thuMuc !== null && r.tep !== null && dirname(r.tep) === thuMuc, `GITHUB_PATH trỏ đúng thư mục chứa gitleaks (${r.dongPath.length} dòng)`);
      dat(r.tep !== null && elfX64(r.tep), "tệp gitleaks là bản linux x64 của máy chủ GitHub (ELF, x86-64)");
      if (process.platform === "linux" && process.arch === "x64" && r.tep) {
        const v = spawnSync(r.tep, ["version"], { encoding: "utf8" });
        dat(v.status === 0 && v.stdout.trim().replace(/^v/, "") === ban, `gitleaks version in ${v.stdout.trim()}`);
      } else console.log(`(máy chấm ${process.platform}/${process.arch}: không chạy được bản linux x64 — chỉ kiểm đầu tệp)`);
      // Đối chứng: băm ghim lệch một ký tự → bước dừng trước khi giải nén, không đưa gì vào PATH.
      const lech = (bam[0] === "0" ? "1" : "0") + bam.slice(1);
      const r2 = chay("bam-lech", lech);
      dat(r2.ma !== 0 && r2.dongPath.length === 0 && r2.tep === null && /FAILED|did NOT match/.test(r2.ra), `đối chứng: băm ghim lệch → bước đỏ, không dòng GITHUB_PATH, không tệp gitleaks (thoát ${r2.ma})`);
    } finally {
      rmSync(TAM, { recursive: true, force: true });
    }
  }
} else if (process.argv.includes("--hooks")) {
  const lenh = JSON.parse(readFileSync(join(GOC, "package.json"), "utf8")).scripts?.["test:hooks"];
  const glMay = spawnSync("bash", ["-c", "command -v gitleaks"], { encoding: "utf8" }).stdout.trim();
  if (!lenh) dat(false, "package.json không có lệnh test:hooks");
  else if (!glMay) dat(false, "máy chấm thiếu gitleaks (AGENTS.md: brew install gitleaks) — không dựng được ca có gitleaks");
  else {
    const TAM = mkdtempSync(join(tmpdir(), "hooks-gl-"));
    try {
      // PATH gốc bỏ mọi thư mục có gitleaks: đúng cảnh máy chủ GitHub trước bản vá.
      const sach = (process.env.PATH ?? "").split(delimiter).filter((d) => d && !existsSync(join(d, "gitleaks"))).join(delimiter);
      // Bước «Ghim lại» chạy suite với biến bản thật để trống (feature_loop.repin_ci_blank_env) và CI=true của GitHub.
      const env = { ...process.env, CI: "true", DATABASE_URL: "", SUPABASE_URL: "", SUPABASE_PUBLISHABLE_KEY: "", APP_URL: "" };
      // Bài tự kiểm tạo rồi xoá một tệp tạm cố định trong packages/core/src: chạy nó trên cây kho cùng lúc với suite
      // `npm run test:hooks` của lượt chấm là hai lượt giẫm nhau (S4 r1). Chạy trên bản sao cây tại HEAD — git clone
      // dùng chung đối tượng, các thư mục node_modules của kho nối vào bằng liên kết — để không đụng cây đang chấm.
      const git = (...a) => spawnSync("git", a, { encoding: "utf8" });
      const sha = git("-C", GOC, "rev-parse", "HEAD").stdout.trim();
      const CAY = join(TAM, "cay");
      const cl = git("clone", "-q", "--shared", "--no-checkout", GOC, CAY);
      const co = cl.status === 0 ? git("-C", CAY, "checkout", "-q", "--detach", sha) : cl;
      if (co.status !== 0) throw new Error(`không dựng được bản sao cây tại ${sha}: ${(co.stderr ?? "").trim()}`);
      const nm = git("-C", GOC, "ls-files", "--", "package.json", "*/package.json").stdout.split("\n").filter(Boolean)
        .map((p) => dirname(p)).map((d) => join(d, "node_modules")).filter((d) => existsSync(join(GOC, d)));
      for (const d of nm) symlinkSync(join(GOC, d), join(CAY, d));
      const chay = (path) => {
        const r = spawnSync("bash", ["-c", lenh], { cwd: CAY, env: { ...env, PATH: path }, encoding: "utf8" });
        return { ma: r.status, ra: (r.stdout ?? "") + (r.stderr ?? "") };
      };
      /** Dòng kết luận của bài tự kiểm: «ĐẠT <ca>», «ĐỎ <ca>», «BỎ QUA <ca>» — bỏ thụt và khoảng cách giữa nhãn và tên ca. */
      const ketLuan = (s) => s.split("\n").map((d) => d.trim().match(/^(ĐẠT|ĐỎ|BỎ QUA)\s+(.+)$/)).filter(Boolean).map((m) => `${m[1]} ${m[2]}`);
      const tap = (a, nhan) => a.filter((d) => d.startsWith(`${nhan} `)).sort();
      const bang = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
      // Vật ghim: khối bài tự kiểm trong nhật ký bước «Ghim lại» của run 42440631323 trên máy chủ GitHub (gh run view --log).
      const ghim = ketLuan(readFileSync(join(GOC, "_acceptance/va-nut-ci-gitleaks/thu/run-42440631323-suite-4-7.txt"), "utf8"));
      dat(bang(tap(ghim, "ĐỎ"), ["ĐỎ gitleaks phải có trên CI"]), `máy chủ GitHub (run 42440631323): tập dòng ĐỎ của bài tự kiểm đúng bằng {gitleaks phải có trên CI} (${tap(ghim, "ĐỎ").length} dòng ĐỎ / ${ghim.length} dòng kết luận)`);
      const r1 = chay(sach);
      const kl1 = ketLuan(r1.ra);
      dat(r1.ma !== 0 && /TỔNG: ĐỎ/.test(r1.ra) && bang([...kl1].sort(), [...ghim].sort()), `đối chứng: gitleaks vắng khỏi PATH ở chế độ CI → đủ ${ghim.length} dòng kết luận trùng từng dòng với run 42440631323, TỔNG: ĐỎ (thoát ${r1.ma})`);
      if (!bang([...kl1].sort(), [...ghim].sort())) console.log(`  lệch: máy chấm [${kl1.join(" · ")}]`);
      const them = join(TAM, "gitleaks-bin");
      mkdirSync(them);
      symlinkSync(glMay, join(them, "gitleaks"));
      const r2 = chay(`${them}${delimiter}${sach}`);
      const kl2 = ketLuan(r2.ra);
      const datGhim = tap(ghim, "ĐẠT");
      const okAll = r2.ma === 0 && /TỔNG: ĐẠT/.test(r2.ra) && tap(kl2, "ĐỎ").length === 0 && datGhim.every((d) => kl2.includes(d)) && kl2.includes("ĐẠT chặn bí mật đã stage");
      dat(okAll, `gitleaks tới qua thư mục đặt trước PATH (cách GitHub áp GITHUB_PATH) → 0 dòng ĐỎ, giữ ${datGhim.length} dòng ĐẠT của run, thêm «chặn bí mật đã stage», TỔNG: ĐẠT (thoát ${r2.ma})`);
      if (!okAll) console.log(r2.ra.split("\n").filter((d) => /ĐỎ|TỔNG/.test(d)).join("\n"));
    } finally {
      rmSync(TAM, { recursive: true, force: true });
    }
  }
} else {
  console.error("dùng: kiem-gitleaks.mjs --tinh | --chay | --hooks");
  process.exit(2);
}
console.log(loi.length ? `KẾT: HỎNG ${loi.length}` : "KẾT: ĐẠT");
process.exit(loi.length ? 1 : 0);
