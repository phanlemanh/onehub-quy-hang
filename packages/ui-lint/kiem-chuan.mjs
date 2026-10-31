#!/usr/bin/env node
// Kiểm trạng thái cây của bộ chuẩn giao diện (hồ sơ tang-5-giao-dien) — chạy cuối `npm run lint`, nên job `check` của
// CI bắt khi bộ chuẩn lệch: style thành phần, thành phần nền, hai skill và symlink, danh mục khớp đĩa, cấu hình cổng,
// chính job `check` còn chạy `npm run lint`, và bản đồ khuôn design/patterns/ (hàng 59): đọc được, mọi màn của nhóm
// dựng qua khuôn.
//
//   node packages/ui-lint/kiem-chuan.mjs [--root <kho>]      0 đạt · 1 lệch (mỗi chỗ lệch một dòng stderr)
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { docBanDo, kiemCay, manNgoaiBanDo } from "./lib/ban-do.mjs";

export const THANH_PHAN_NEN = { ui: ["button", "badge", "input", "separator", "skeleton", "tooltip"], reui: ["frame"] };
const SKILLS = ["quy-hang-ui", "reui"];
const doc = (root, rel) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), "utf8") : null);

function kiemComponents(root, loi, dong) {
  const raw = doc(root, "apps/web/components.json");
  if (raw === null) return loi.push("components.json: thiếu apps/web/components.json");
  const c = JSON.parse(raw);
  if (c.style !== "base-nova") loi.push(`components.json: style phải là base-nova (đang là ${c.style})`);
  if (c.tailwind?.baseColor !== "neutral") loi.push(`components.json: baseColor phải là neutral (đang là ${c.tailwind?.baseColor})`);
  if (c.iconLibrary !== "lucide") loi.push(`components.json: iconLibrary phải là lucide (đang là ${c.iconLibrary})`);
  if (!c.registries?.["@reui"]) loi.push("components.json: thiếu registry @reui");
  dong.push("components.json: base-nova · neutral · lucide · @reui");
}

const daCai = (root, thuMuc) => {
  const d = join(root, "apps/web/src/components", thuMuc);
  // Thành phần là một tệp .tsx, hay một thư mục (ReUI cài data-grid, filters… thành thư mục cùng tên).
  if (!existsSync(d)) return [];
  return readdirSync(d, { withFileTypes: true })
    .filter((e) => e.isDirectory() || e.name.endsWith(".tsx"))
    .map((e) => e.name.replace(/\.tsx$/, ""));
};

function kiemThanhPhan(root, loi) {
  for (const [thuMuc, ten] of Object.entries(THANH_PHAN_NEN)) {
    const co = new Set(daCai(root, thuMuc));
    for (const t of ten) if (!co.has(t)) loi.push(`thiếu thành phần: ${t} (apps/web/src/components/${thuMuc}/${t}.tsx)`);
  }
}

function kiemSkill(root, loi, dong) {
  for (const s of SKILLS) {
    const nguon = join(root, ".agents/skills", s);
    const md = doc(root, `.agents/skills/${s}/SKILL.md`);
    if (md === null) {
      loi.push(`skill ${s}: thiếu .agents/skills/${s}/SKILL.md`);
      continue;
    }
    if (!new RegExp(`^name: ${s}$`, "m").test(md)) loi.push(`skill ${s}: SKILL.md thiếu dòng «name: ${s}»`);
    const lienKet = join(root, ".claude/skills", s);
    let dung = false;
    try {
      dung = realpathSync(lienKet) === realpathSync(nguon);
    } catch {
      /* symlink vắng hay gãy */
    }
    if (!dung) loi.push(`skill ${s}: symlink .claude/skills/${s} không trỏ tới .agents/skills/${s}`);
  }
  dong.push("skill: quy-hang-ui, reui — symlink đúng");
}

function kiemCatalog(root, loi, dong) {
  const md = doc(root, ".agents/skills/quy-hang-ui/catalog.md");
  if (md === null) return loi.push("catalog.md: thiếu .agents/skills/quy-hang-ui/catalog.md");
  const muc = md.split("## Thành phần đã cài")[1]?.split(/\n## /)[0] ?? "";
  const ghi = new Set();
  for (const l of muc.split("\n")) {
    const m = /^\|\s*([a-z0-9-]+)\s*\|\s*(ui|reui)\s*\|/.exec(l);
    if (m) ghi.add(`${m[2]}/${m[1]}`);
  }
  const tren = ["ui", "reui"].flatMap((d) => daCai(root, d).map((t) => `${d}/${t}`));
  for (const t of tren) if (!ghi.has(t)) loi.push(`catalog.md thiếu: ${t.split("/")[1]} (${t})`);
  for (const t of ghi) if (!tren.includes(t)) loi.push(`catalog.md thừa: ${t.split("/")[1]} (${t}) — không có trên đĩa`);
  dong.push(`catalog khớp ${tren.length} thành phần`);
}

// Đọc khoá YAML hai tầng theo dòng (config.yaml bắt buộc thụt 2 dấu cách — luật của kit).
export function khoaYaml(yaml, cha, con) {
  const dong = yaml.split("\n");
  const i = dong.findIndex((l) => l === `${cha}:` || l.startsWith(`${cha}:`));
  if (i < 0) return undefined;
  for (let k = i + 1; k < dong.length && (dong[k].startsWith(" ") || dong[k] === ""); k++) {
    const m = new RegExp(`^  ${con}:(.*)$`).exec(dong[k]);
    if (m) return m[1].replace(/\s+#.*$/, "").trim();
  }
  return undefined;
}

function kiemCauHinh(root, loi, dong) {
  const y = doc(root, "_acceptance/config.yaml");
  if (y === null) return loi.push("cấu hình cổng: thiếu _acceptance/config.yaml");
  const skill = khoaYaml(y, "feature_loop", "ui_standards_skill");
  if (skill !== "quy-hang-ui") loi.push(`cấu hình cổng: feature_loop.ui_standards_skill phải là quy-hang-ui (đang là ${skill ?? "vắng"})`);
  else if (!existsSync(join(root, ".agents/skills", skill, "SKILL.md"))) loi.push("cấu hình cổng: ui_standards_skill trỏ skill không có");
  const globs = y.split(/\ndesign:\n/)[1]?.split(/\n(?=\S)/)[0] ?? "";
  if (!/surface_globs:/.test(globs) || !/- "apps\/web\/src\/app\/\*\*"/.test(globs)) loi.push("cấu hình cổng: thiếu design.surface_globs cho apps/web/src/app/**");
  else if (!existsSync(join(root, "apps/web/src/app"))) loi.push("cấu hình cổng: design.surface_globs không khớp tệp giao diện nào");
  if (!/^ {2}design:\n {4}floor: /m.test(y)) loi.push("cấu hình cổng: thiếu executors.design.floor");
  if (!/^ {4}ui_lint: /m.test(y)) loi.push("cấu hình cổng: thiếu executors.test.ui_lint");
  dong.push("cấu hình cổng: ui_standards_skill=quy-hang-ui, design.surface_globs, executors.design.floor, executors.test.ui_lint");
}

function kiemCi(root, loi, dong) {
  const y = doc(root, ".github/workflows/ci.yml");
  if (y === null) return loi.push("CI: thiếu .github/workflows/ci.yml");
  const m = /\n {2}check:\n([\s\S]*?)(?=\n {2}[a-z][\w-]*:\n|$)/.exec(y);
  if (!m || !/^\s+- run: npm run lint\s*$/m.test(m[1])) return loi.push("CI: job check thiếu npm run lint");
  dong.push("CI: job check chạy npm run lint");
}

function kiemBanDo(root, loi, dong) {
  const bd = docBanDo(root);
  const cay = kiemCay(root, bd);
  const lech = [...Object.values(cay).flatMap((r) => r.lech), ...manNgoaiBanDo(root, bd)];
  for (const l of bd.loi) loi.push(`khuôn: ${l}`);
  for (const l of lech) loi.push(`khuôn: ${l.tep}: ${l.nhom} — ${l.dieu}`);
  dong.push(`khuôn: ${bd.nhom.length} nhóm · ${bd.loi.length} lỗi đọc · ${lech.length} lệch`);
}

export function kiemChuan(root) {
  const loi = [];
  const dong = [];
  kiemComponents(root, loi, dong);
  kiemThanhPhan(root, loi);
  kiemSkill(root, loi, dong);
  kiemCatalog(root, loi, dong);
  kiemCauHinh(root, loi, dong);
  kiemCi(root, loi, dong);
  kiemBanDo(root, loi, dong);
  return { loi, dong: loi.length ? [] : [...dong, "chuẩn giao diện: đạt"] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  const a = process.argv.slice(2);
  const root = a.includes("--root") ? a[a.lastIndexOf("--root") + 1] : join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const { loi, dong } = kiemChuan(root);
  for (const d of dong) console.log(d);
  for (const l of loi) console.error(l);
  process.exit(loi.length ? 1 : 0);
}
