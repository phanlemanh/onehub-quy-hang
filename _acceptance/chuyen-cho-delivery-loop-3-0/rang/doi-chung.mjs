#!/usr/bin/env node
// AC-6 (chuyen-cho-delivery-loop-3-0): chuyển chợ không đổi phán quyết của hồ sơ cũ nào.
//   1. Trên merge-base với origin/main: kit v2.39.0 và v3.0.0 `--recheck-all` cùng 0 VIOLATION, cùng tập hồ sơ OK.
//   2. Trên HEAD: kit v3.0.0 `--recheck-all` OK mọi hồ sơ OK ở bước 1; dòng VIOLATION chỉ được thuộc hồ sơ của vòng
//      ([PR] hay [<slug>]) — trước chữ ký; sau chữ ký không còn dòng nào.
// Kit lấy từ GitHub theo thẻ, kiểm commit ghim (thẻ trỏ commit khác → đỏ to tiếng), ra thư mục tạm ngoài cây kho.
// Hàm thuần xuất ra để bài đo hai chiều ở thu/ thử trên văn bản tổng hợp.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SLUG = "chuyen-cho-delivery-loop-3-0";
export const KIT_CU = { tag: "v2.39.0", url: "https://github.com/phanlemanh/acceptance-gate-kit", sha: "0c4e503b1d9649faa6948dd169573717b6dddce4", loi: "" };
export const KIT_MOI = { tag: "v3.0.0", url: "https://github.com/phanlemanh/delivery-loop", sha: "c16d25dbe224ec0b122b6d578118731750b6a4e3", loi: "plugins/acceptance-gate" };

const GOC = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const git = (cwd, ...a) => execFileSync("git", ["-C", cwd, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 }).trim();

export function hoSoOk(out) {
  return [...out.matchAll(/^OK \[([^\]]+)\]/gm)].map((m) => m[1]).sort();
}
export function dongVipham(out) {
  return out.split("\n").filter((l) => l.startsWith("VIOLATION"));
}
const coChayLuat = (out) => /^pre-merge-check: rules ran=/m.test(out);

// Bước 1: null khi hai kit cùng chạy luật, cùng 0 VIOLATION, cùng tập OK; ngược lại là dòng đỏ.
export function soHaiKit(outCu, outMoi) {
  for (const [ten, out] of [[KIT_CU.tag, outCu], [KIT_MOI.tag, outMoi]]) {
    if (!coChayLuat(out)) return `doi-chung: kit ${ten} không chạy luật nào`;
    const v = dongVipham(out);
    if (v.length) return `doi-chung: kit ${ten} có ${v.length} VIOLATION trên merge-base — ${v[0]}`;
  }
  const a = hoSoOk(outCu);
  const b = hoSoOk(outMoi);
  const chiCu = a.filter((x) => !b.includes(x));
  const chiMoi = b.filter((x) => !a.includes(x));
  if (chiCu.length || chiMoi.length) return `doi-chung: tập OK lệch (chỉ ${KIT_CU.tag}: ${chiCu.join(",") || "-"}; chỉ ${KIT_MOI.tag}: ${chiMoi.join(",") || "-"})`;
  return null;
}

// Bước 2: null khi HEAD giữ OK mọi hồ sơ của nền và mọi VIOLATION thuộc vòng; ngược lại là dòng đỏ.
export function soDauNhanh(okNen, outDau, slug = SLUG) {
  if (!coChayLuat(outDau)) return `doi-chung: kit ${KIT_MOI.tag} không chạy luật nào trên HEAD`;
  const ok = hoSoOk(outDau);
  const mat = okNen.filter((x) => !ok.includes(x));
  if (mat.length) return `doi-chung: hồ sơ thôi OK trên HEAD: ${mat.join(",")}`;
  const la = dongVipham(outDau).filter((l) => !l.startsWith("VIOLATION [PR]") && !l.startsWith(`VIOLATION [${slug}]`));
  if (la.length) return `doi-chung: VIOLATION ngoài vòng trên HEAD — ${la[0]}`;
  return null;
}

function layKit(kit) {
  const dir = join(tmpdir(), `cc30-kit-${kit.tag}`);
  try {
    if (git(dir, "rev-parse", "HEAD") === kit.sha) return join(dir, kit.loi);
  } catch {
    // chưa lấy
  }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  git(dir, "init", "-q");
  git(dir, "fetch", "-q", "--depth", "1", kit.url, `refs/tags/${kit.tag}`);
  git(dir, "checkout", "-q", "FETCH_HEAD");
  const dau = git(dir, "rev-parse", "HEAD");
  if (dau !== kit.sha) throw new Error(`doi-chung: ${kit.url} ${kit.tag} là ${dau.slice(0, 8)}, cần ${kit.sha.slice(0, 8)}`);
  return join(dir, kit.loi);
}

function chayCong(loi, cay, base) {
  const r = spawnSync("bash", [join(loi, "scripts/pre-merge-check.sh"), ".", "--base", base, "--recheck-all"], {
    cwd: cay,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: loi },
    maxBuffer: 64 << 20,
  });
  return `${r.stdout ?? ""}${r.stderr ?? ""}`;
}

function caySach(rev) {
  const dir = join(mkdtempSync(join(tmpdir(), "cc30-wt-")), "cay");
  git(GOC, "worktree", "add", "-q", "--detach", dir, rev);
  return { dir, bo: () => { try { git(GOC, "worktree", "remove", "--force", dir); } catch { rmSync(dir, { recursive: true, force: true }); git(GOC, "worktree", "prune"); } } };
}

function luu(ten, text) {
  const d = join(GOC, ".acceptance-runs", SLUG);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, ten), text);
}

async function main() {
  const nen = git(GOC, "merge-base", "HEAD", "origin/main");
  const dau = git(GOC, "rev-parse", "HEAD");
  const loiCu = layKit(KIT_CU);
  const loiMoi = layKit(KIT_MOI);
  const c = caySach(nen);
  let outCu, outMoi;
  try {
    outCu = chayCong(loiCu, c.dir, nen);
    outMoi = chayCong(loiMoi, c.dir, nen);
  } finally {
    c.bo();
  }
  luu(`nen-${nen.slice(0, 8)}-${KIT_CU.tag}.txt`, outCu);
  luu(`nen-${nen.slice(0, 8)}-${KIT_MOI.tag}.txt`, outMoi);
  const do1 = soHaiKit(outCu, outMoi);
  if (do1) { console.log(`${do1} (merge-base ${nen.slice(0, 8)})`); process.exit(1); }
  const okNen = hoSoOk(outMoi);
  console.log(`doi-chung: merge-base ${nen.slice(0, 8)} --recheck-all — kit ${KIT_CU.tag} và ${KIT_MOI.tag} cùng 0 VIOLATION, cùng ${okNen.length} hồ sơ OK`);
  const h = caySach(dau);
  let outDau;
  try {
    outDau = chayCong(loiMoi, h.dir, nen);
  } finally {
    h.bo();
  }
  luu(`dau-${dau.slice(0, 8)}-${KIT_MOI.tag}.txt`, outDau);
  const do2 = soDauNhanh(okNen, outDau);
  if (do2) { console.log(`${do2} (HEAD ${dau.slice(0, 8)})`); process.exit(1); }
  const vong = dongVipham(outDau).length;
  console.log(`doi-chung: HEAD ${dau.slice(0, 8)} --recheck-all kit ${KIT_MOI.tag} — ${hoSoOk(outDau).length} hồ sơ OK (đủ ${okNen.length} của nền), VIOLATION ngoài vòng 0, của vòng ${vong}`);
}

// --duong (E1c): mọi đường kit mà hai luồng CI gọi có trên cây kit v3.0.0; mọi tên lệnh mới của bảng có trên kit.
const LUONG = [".github/workflows/ci.yml", ".github/workflows/ghim-lai-ban-that.yml"];
export function duongCuaLuong(text) {
  const ra = new Set();
  for (const m of text.matchAll(/\$CLAUDE_PLUGIN_ROOT((?:\/[\w.-]+)+)/g)) ra.add(`$CLAUDE_PLUGIN_ROOT${m[1]}`);
  for (const m of text.matchAll(/\$RUNNER_TEMP\/kit((?:\/[\w.-]+)+)/g)) ra.add(`$RUNNER_TEMP/kit${m[1]}`);
  return [...ra];
}
export function phanGiai(duong, cayKit) {
  const loi = join(cayKit, KIT_MOI.loi);
  return resolve(duong.replace("$CLAUDE_PLUGIN_ROOT", loi).replace("$RUNNER_TEMP/kit", cayKit));
}
export function coLenh(ten, cayKit) {
  const [p, l] = ten.split(":");
  return existsSync(join(cayKit, "plugins", p, "commands", `${l}.md`)) || existsSync(join(cayKit, "plugins", p, "skills", l, "SKILL.md"));
}

async function duong() {
  const { BANG } = await import("./bang-ten.mjs");
  const cay = dirname(layKit(KIT_MOI));
  const goc = resolve(cay, "..");
  const tat = LUONG.flatMap((f) => duongCuaLuong(readFileSync(join(GOC, f), "utf8")));
  const thieu = tat.filter((d) => !existsSync(phanGiai(d, goc)));
  if (tat.length < 4 || thieu.length) { console.log(`duong-kit: ${thieu.length ? `không tồn tại trên cây kit ${KIT_MOI.tag}: ${thieu.join(", ")}` : `chỉ thấy ${tat.length} đường`}`); process.exit(1); }
  console.log(`duong-kit: ${tat.length} đường của hai luồng có trên cây kit ${KIT_MOI.tag} (${KIT_MOI.sha.slice(0, 8)})`);
  if (existsSync(phanGiai("$CLAUDE_PLUGIN_ROOT/feature-loop/scripts/repin-lane.mjs", goc))) { console.log("duong-kit: đối chứng hỏng — đường bố cục cũ vẫn có trên cây 3.0"); process.exit(1); }
  console.log("duong-kit: đối chứng — đường bố cục cũ không có trên cây 3.0");
  const moiThieu = Object.values(BANG).filter((t) => !coLenh(t, goc));
  const cuCon = Object.keys(BANG).filter((t) => coLenh(t, goc));
  if (moiThieu.length || cuCon.length || coLenh("dispatch:khong-co", goc)) { console.log(`duong-kit: tên không có trên kit: ${moiThieu.join(", ") || "-"}; tên cũ còn: ${cuCon.join(", ") || "-"}`); process.exit(1); }
  console.log("duong-kit: đối chứng — dispatch:khong-co không có trên kit");
  console.log(`duong-kit: ${Object.keys(BANG).length} tên lệnh mới của bảng có trên cây kit ${KIT_MOI.tag}, 0 tên cũ còn`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  (process.argv.includes("--duong") ? duong() : main()).catch((e) => { console.log(e.message); process.exit(1); });
}
