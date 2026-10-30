#!/usr/bin/env node
// Đo lại bài thử lưới từ main (AC-6): dựng nhánh thử từ tag ghim, build, chạy máy chủ ở cổng 3462 của dãy G, đo bản
// thường và hai bản đối chứng đỏ, so ngưỡng, in JSON. Không ghi gì vào hồ sơ — worktree và nhật ký ở .acceptance-runs/.
//
//   node _acceptance/bai-thu-luoi-5000-dong/thu/do-lai.mjs [--chi-trang] [--cong 3462]
// Thoát 0 khi bản chậm trượt và (ReUI đạt, hoặc ReUI trượt và Glide đã đo) · 1 kết luận không đạt · 2 không dựng được.
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ketLuan } from "./nguong.mjs";

const THU = dirname(fileURLToPath(import.meta.url));
const GOC = execFileSync("git", ["-C", THU, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const a = process.argv.slice(2);
// Cổng riêng của lệnh đo (không phải 3462 — cổng ấy là máy chủ dev của dãy và của bài nhìn giao diện; lượt chấm 1 đụng nhau).
const CONG = a.includes("--cong") ? a[a.indexOf("--cong") + 1] : "3468";
const cfg = JSON.parse(readFileSync(join(THU, "nhanh-thu.json"), "utf8"));
const CHAY = join(GOC, ".acceptance-runs", "bai-thu-luoi-5000-dong");
// --chi-trang có worktree riêng: lượt chấm chạy nó song song với lượt đo đủ, chung thư mục build thì đua nhau.
const WT = join(CHAY, a.includes("--chi-trang") ? "do-lai-trang" : "do-lai");
mkdirSync(CHAY, { recursive: true });

const sh = (cmd, args, cwd = GOC) => execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
const dung = (ma, msg) => {
  console.error(msg);
  process.exit(ma);
};

// 1. Tag ghim phải tới được và trỏ đúng sha đã đo.
let sha;
try {
  try {
    sh("git", ["fetch", "-q", "origin", `refs/tags/${cfg.tag}:refs/tags/${cfg.tag}`]);
  } catch {
    /* không mạng: dùng tag cục bộ nếu có */
  }
  sha = sh("git", ["rev-parse", `${cfg.tag}^{commit}`]).trim();
} catch {
  dung(2, `không tới được tag ${cfg.tag} — nhánh thử ${cfg.nhanh} cần tag này để đo lại`);
}
if (sha !== cfg.sha) dung(2, `tag ${cfg.tag} trỏ ${sha}, không phải sha đã đo ${cfg.sha}`);

// 2. Worktree tạm ở đúng sha, cài và build.
const shaWt = existsSync(WT) ? (() => { try { return sh("git", ["rev-parse", "HEAD"], WT).trim(); } catch { return ""; } })() : "";
if (shaWt !== sha) {
  if (existsSync(WT)) sh("git", ["worktree", "remove", "--force", WT]);
  sh("git", ["worktree", "add", "-q", "--detach", WT, sha]);
}
try {
  if (!existsSync(join(WT, "node_modules", "playwright-core"))) sh("npm", ["ci", "--no-audit", "--no-fund"], WT);
  sh("npm", ["run", "build", "-w", "@quy-hang/web"], WT);
} catch (e) {
  dung(2, `không dựng được nhánh thử: ${String(e.stderr || e.message).slice(-400)}`);
}

// 3. Máy chủ của chính lệnh này — ghi PID, dừng đúng PID đó (luật 8 của đợt).
const may = spawn("npx", ["next", "start", "-p", CONG], { cwd: join(WT, "apps", "web"), stdio: "ignore", detached: true });
const dungMay = () => {
  try {
    process.kill(-may.pid, "SIGTERM");
  } catch {
    /* đã dừng */
  }
};
process.on("exit", dungMay);
let mayChet = null;
may.on("exit", (ma) => (mayChet = ma));
const url = `http://localhost:${CONG}`;
for (let i = 0; ; i++) {
  if (mayChet !== null) dung(2, `máy chủ nhánh thử thoát mã ${mayChet} trước khi lên (cổng ${CONG} bị chiếm?)`);
  try {
    const res = await fetch(`${url}/spikes/luoi`);
    if (res.ok && mayChet === null) break;
  } catch {
    if (i > 120) dung(2, `máy chủ nhánh thử không lên ở cổng ${CONG}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

const doMot = (che) => {
  const args = [join(THU, "do.mjs"), "--url", url, "--nm", WT, "--moc-bench", String(cfg.moc_bench_ms)];
  if (che === "trang") args.push("--chi-trang");
  else if (che) args.push("--cham", che);
  if (mayChet !== null) dung(2, `máy chủ nhánh thử đã thoát (mã ${mayChet}) giữa lượt đo`);
  try {
    return JSON.parse(execFileSync("node", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }));
  } catch (e) {
    dung(2, `máy đo lỗi ở chế độ «${che || "thuong"}»: ${String(e.stderr || e.message).slice(-400)}`);
  }
};

const ra = { tag: cfg.tag, sha };
ra.trang = doMot("trang").trang;
if (a.includes("--chi-trang")) {
  dungMay();
  const ok = ra.trang.dong === 5000 && ra.trang.cot === 20 && String(ra.trang.mau).startsWith("MAU-");
  console.log(JSON.stringify(ra));
  process.exit(ok ? 0 : 1);
}
const thuong = doMot("");
const cham = doMot("1");
const chamPhim = doMot("phim");
dungMay();

ra.may = { hieu_chuan_hop_le: [thuong, cham, chamPhim].every((r) => r.hieu_chuan_hop_le), loadavg: sh("sysctl", ["-n", "vm.loadavg"]).trim() };
ra.thuong = { reui: { ...thuong.trung_vi, ...thuong.danh_gia, luot: thuong.luot.map((l) => ({ may: l.may, cuon: l.cuon, go: l.go, dan: l.dan })) } };
ra.glide = null; // AC-9: chỉ dựng khi ReUI trượt — nhánh thử hiện chỉ có lưới ReUI.
ra.cham = { ...cham.danh_gia, trung_vi: cham.trung_vi };
ra.cham_phim = { ...chamPhim.danh_gia, trung_vi: chamPhim.trung_vi };
const kl = ketLuan({ reui: thuong.danh_gia, glide: ra.glide, cham: cham.danh_gia, chamPhim: chamPhim.danh_gia });
if (!ra.may.hieu_chuan_hop_le) kl.loi.push("hiệu chuẩn máy không hợp lệ sau ba lần thử — máy đang bận");
ra.chon = kl.chon;
ra.ok = kl.ok && ra.may.hieu_chuan_hop_le;
ra.loi = kl.loi;
console.log(JSON.stringify(ra));
process.exit(ra.ok ? 0 : 1);
