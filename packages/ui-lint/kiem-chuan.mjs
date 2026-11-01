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

// Vết chọn khối (hàng 83, ADR-0019 quyết định 3–4): bảng «Khối đã chuyển thể» của catalog.md và bảng «Chỗ hở» của
// vo-va-ia.md §3 — mỗi dòng đủ ô, trỏ đúng tệp. Chỉ đọc đúng hai bảng, nên sửa phần khác của hai tệp không đổi đầu ra.
export const COT_KHOI = ["Khối gốc", "Archetype", "Nhóm đang dùng", "Tệp đang dùng", "Màn", "Ảnh chuẩn", "Phiên bản ReUI", "Duyệt", "Đã đổi gì khi chuyển thể"];
export const COT_CHO_HO = ["Chỗ", "Ghép", "Đã tra trên ReUI", "Vì sao không đứng", "Hạn xem lại"];
const VO_VA_IA = "docs/design/vo-va-ia.md";
const CATALOG = ".agents/skills/quy-hang-ui/catalog.md";
const rong = (o) => o === "" || /^[—–-]$/.test(o);
const trongVet = (s) => [...s.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
// Tên khối ReUI: chữ thường có gạch nối, kết bằng số, không dính chữ cái liền trước («Hỏi-3» không ra «i-3»).
const TEN_KHOI = /(?<![\p{L}\p{N}-])(?:@reui\/)?([a-z][a-z0-9]*(?:-[a-z0-9]+)*-\d+)(?![\p{L}\p{N}-])/gu;

/** Bảng markdown đầu tiên dưới tiêu đề mục: { dau: tên cột, dong: [[ô…]] } — null khi không có mục. */
export function docBang(md, tieuDe) {
  const muc = md.split(tieuDe)[1]?.split(/\n## /)[0];
  if (muc === undefined) return null;
  const hang = muc.split("\n").filter((l) => /^\|.*\|\s*$/.test(l)).map((l) => l.trim().slice(1, -1).split("|").map((o) => o.trim()));
  if (hang.length < 2) return { dau: [], dong: [] };
  return { dau: hang[0], dong: hang.slice(2) };
}

/** Khối ReUI mà mã đã chuyển thể: tên đứng SAU chữ «chuyển thể» trong một dòng của apps/web/src. */
export function khoiDaChuyenThe(root) {
  const goc = join(root, "apps/web/src");
  const thay = new Map();
  const di = (d) => {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) di(p);
      else if (/\.(tsx?|mjs|css)$/.test(e.name))
        readFileSync(p, "utf8")
          .split("\n")
          .forEach((l, i) => {
            const k = l.indexOf("chuyển thể");
            if (k < 0) return;
            for (const m of l.slice(k).matchAll(TEN_KHOI)) if (!thay.has(m[1])) thay.set(m[1], `${p.slice(root.length + 1)}:${i + 1}`);
          });
    }
  };
  di(goc);
  return thay;
}

const nhomBanDo = (root) => {
  const d = join(root, "design/patterns");
  if (!existsSync(d)) return new Set();
  return new Set(
    readdirSync(d)
      .filter((f) => f.endsWith(".md"))
      .map((f) => /^nhom:\s*(\S+)/m.exec(readFileSync(join(d, f), "utf8"))?.[1])
      .filter(Boolean),
  );
};

/** Tệp ngoài apps/web mà bài vết khối đọc — cây thử chép kèm. */
export function tepVetKhoi(root) {
  const tep = [VO_VA_IA];
  const b = docBang(doc(root, CATALOG) ?? "", "## Khối đã chuyển thể");
  for (const o of b?.dong ?? []) {
    tep.push(...trongVet(o[COT_KHOI.indexOf("Ảnh chuẩn")] ?? ""));
    const ho = /·\s*([a-z0-9-]+)\s*$/.exec(o[COT_KHOI.indexOf("Duyệt")] ?? "")?.[1];
    if (ho) tep.push(`_acceptance/${ho}/contract.md`);
  }
  return tep.filter((t) => existsSync(join(root, t)));
}

function kiemKhoi(root, loi, dong) {
  const b = docBang(doc(root, CATALOG) ?? "", "## Khối đã chuyển thể");
  if (b === null) return loi.push("catalog.md khối: thiếu mục «Khối đã chuyển thể»");
  if (b.dau.join("|") !== COT_KHOI.join("|")) return loi.push(`catalog.md khối: bảng phải có chín cột ${COT_KHOI.join(" · ")}`);
  const vvi = doc(root, VO_VA_IA) ?? "";
  const nhom = nhomBanDo(root);
  const co = new Set();
  const sai = (ten, cot, dieu) => loi.push(`catalog.md khối ${ten}: ${cot} — ${dieu}`);
  for (const o of b.dong) {
    const ten = trongVet(o[0])[0]?.replace(/^@reui\//, "") ?? o[0];
    co.add(ten);
    COT_KHOI.forEach((cot, i) => rong(o[i] ?? "") && sai(ten, cot, "trống"));
    const [, archetype, nhomDung, tepDung, , anh, phienBan, duyet] = o;
    if (!rong(archetype) && !vvi.includes(archetype)) sai(ten, "Archetype", `«${archetype}» không có trong ${VO_VA_IA}`);
    if (!rong(nhomDung))
      for (const n of nhomDung.split(",").map((x) => x.trim()))
        if (n !== "vỏ" && !nhom.has(n)) sai(ten, "Nhóm đang dùng", `«${n}» không là nhóm của design/patterns`);
    let thuMuc = "";
    if (!rong(tepDung ?? "") && trongVet(tepDung).length === 0) sai(ten, "Tệp đang dùng", "phải ghi đường trong dấu `…`");
    for (const t of trongVet(tepDung ?? "")) {
      const duong = t.includes("/") ? t : join(thuMuc, t);
      if (t.endsWith("/")) thuMuc = t;
      if (!existsSync(join(root, duong))) sai(ten, "Tệp đang dùng", `${duong} không có`);
    }
    const a = trongVet(anh ?? "")[0];
    if (!rong(anh ?? "") && (!a || !a.endsWith(".png") || !existsSync(join(root, a)))) sai(ten, "Ảnh chuẩn", `${a ?? anh} không có hay không là ảnh PNG`);
    if (!rong(phienBan ?? "") && !/^reui skill [0-9a-f]{7,}$/.test(phienBan)) sai(ten, "Phiên bản ReUI", "phải là «reui skill <mã>»");
    if (!rong(duyet ?? "")) {
      const m = /^(\d{4}-\d{2}-\d{2}) · (.+) · ([a-z0-9-]+)$/.exec(duyet);
      if (!m) sai(ten, "Duyệt", "phải là «YYYY-MM-DD · tên · hồ sơ»");
      else {
        const ky = /^approved_by:\s*(.+)$/m.exec(doc(root, `_acceptance/${m[3]}/contract.md`) ?? "")?.[1]?.trim();
        if (ky !== m[2]) sai(ten, "Duyệt", `«${m[2]}» không khớp approved_by của _acceptance/${m[3]} (${ky ?? "không có"})`);
      }
    }
  }
  for (const [ten, noi] of khoiDaChuyenThe(root)) if (!co.has(ten)) loi.push(`catalog.md thiếu khối: ${ten} (chuyển thể ở ${noi})`);
  dong.push(`khối: ${b.dong.length} dòng đủ chín ô`);
}

function kiemChoHo(root, loi, canhBao, homNay) {
  const b = docBang(doc(root, VO_VA_IA) ?? "", "## 3. Chỗ hở");
  if (b === null) return loi.push(`vo-va-ia.md chỗ hở: thiếu mục «3. Chỗ hở» của ${VO_VA_IA}`);
  if (b.dau.join("|") !== COT_CHO_HO.join("|")) return loi.push(`vo-va-ia.md chỗ hở: bảng phải có năm cột ${COT_CHO_HO.join(" · ")}`);
  for (const o of b.dong) {
    const cho = o[0];
    const sai = (cot, dieu) => loi.push(`vo-va-ia.md chỗ hở «${cho}»: ${cot} — ${dieu}`);
    COT_CHO_HO.forEach((cot, i) => rong(o[i] ?? "") && sai(cot, "trống"));
    if (!rong(o[2] ?? "") && !/^`[^`]+` → \S/.test(o[2])) sai("Đã tra trên ReUI", "phải là «`<truy vấn>` → <ứng viên>» (hay → không có)");
    const han = o[4] ?? "";
    if (rong(han)) continue;
    const ngay = /^(\d{4}-\d{2}-\d{2})/.exec(han)?.[1];
    if (!ngay && !/^khi /.test(han)) sai("Hạn xem lại", "phải mở đầu bằng ngày YYYY-MM-DD hay «khi »");
    else if (ngay && ngay <= homNay) canhBao.push(`vo-va-ia.md chỗ hở «${cho}»: hạn xem lại ${ngay} đã tới`);
  }
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

/** `homNay` (YYYY-MM-DD) để so hạn xem lại — mặc định ngày chạy. Cảnh báo không làm đỏ. */
export function kiemChuan(root, { homNay = new Date().toISOString().slice(0, 10) } = {}) {
  const loi = [];
  const dong = [];
  const canhBao = [];
  kiemComponents(root, loi, dong);
  kiemThanhPhan(root, loi);
  kiemSkill(root, loi, dong);
  kiemCatalog(root, loi, dong);
  kiemKhoi(root, loi, dong);
  kiemChoHo(root, loi, canhBao, homNay);
  kiemCauHinh(root, loi, dong);
  kiemCi(root, loi, dong);
  kiemBanDo(root, loi, dong);
  return { loi, canhBao, dong: loi.length ? [] : [...dong, "chuẩn giao diện: đạt"] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  const a = process.argv.slice(2);
  const root = a.includes("--root") ? a[a.lastIndexOf("--root") + 1] : join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const { loi, canhBao, dong } = kiemChuan(root);
  for (const c of canhBao) console.log(c);
  for (const d of dong) console.log(d);
  for (const l of loi) console.error(l);
  process.exit(loi.length ? 1 : 0);
}
