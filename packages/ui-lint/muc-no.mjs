#!/usr/bin/env node
// Mức nợ lint giao diện — chạy sau `eslint` trong `npm run lint` ở gốc kho, nên job `check` của CI chặn khi nợ tăng.
//
// Nợ = tổng `count` của luật `quy-hang-ui/*` trong `eslint-suppressions.json` ở gốc kho — tệp ESLint 9 ghi khi chạy
// `--suppress-rule`/`--suppress-all` để cho qua vi phạm hàng loạt (vắng tệp = 0). Ngoại lệ ghi tay
// `eslint-disable… quy-hang-ui/<luật> -- <lý do>` được đếm và in riêng, KHÔNG cộng vào nợ (Manh Phan duyệt 30/10,
// Hỏi-1 của hồ sơ tang-5-giao-dien): người duyệt PR thấy từng dòng có lý do.
//
// Trần nợ ở `packages/ui-lint/muc-no.json` (`{"tran": n}`), chỉ được giảm so với trần trên nhánh chính.
// Thoát 1 khi: nợ > trần · trần > trần nhánh chính · trên CI (`CI=true`) không đọc được nhánh chính.
// Nhánh chính chưa có tệp trần → đặt trần lần đầu, không chặn. Ngoài CI không đọc được nhánh chính → chỉ cảnh báo.
//
//   node packages/ui-lint/muc-no.mjs [--root <kho>] [--main-ref <ref>]      (mặc định: gốc suy từ vị trí script, origin/main)
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { VENDOR_DIRS } from "./lib/vendor.mjs";

const PREFIX = "quy-hang-ui/";
const TRAN_TEP = "packages/ui-lint/muc-no.json";
const DIRECTIVE = /^\s*eslint-disable(?:-next-line|-line)?(?=\s|$)/;
const SEPARATOR = /\s-{2,}\s/;
const COMMENT = /\/\/([^\n]*)|\/\*([\s\S]*?)\*\//g;
const VENDOR = VENDOR_DIRS.map((d) => join("components", d) + sep);

/** Nợ theo luật từ nội dung eslint-suppressions.json: { "<luật>": tổng count }. */
export function noTheoLuat(suppressions) {
  const tong = {};
  for (const rules of Object.values(suppressions ?? {})) {
    for (const [rule, info] of Object.entries(rules ?? {})) {
      if (!rule.startsWith(PREFIX)) continue;
      tong[rule] = (tong[rule] ?? 0) + (info?.count ?? 0);
    }
  }
  return tong;
}

/** Số directive eslint-disable nêu luật quy-hang-ui/* và có lý do sau ` -- ` trong một tệp. */
export function demNgoaiLe(text) {
  let n = 0;
  for (const m of text.matchAll(COMMENT)) {
    const body = m[1] ?? m[2];
    const d = DIRECTIVE.exec(body);
    if (!d) continue;
    const rest = body.slice(d[0].length);
    const s = SEPARATOR.exec(rest);
    if (!s || !rest.slice(s.index + s[0].length).trim()) continue;
    if (rest.slice(0, s.index).split(",").some((r) => r.trim().startsWith(PREFIX))) n++;
  }
  return n;
}

function* tepGiaoDien(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* tepGiaoDien(full);
    else if (/\.(ts|tsx)$/.test(e.name)) yield full;
  }
}

/** Đếm ngoại lệ có lý do trong apps/web/src, trừ thư mục vendor. */
export function ngoaiLeCuaKho(root) {
  const src = join(root, "apps", "web", "src");
  let n = 0;
  for (const f of tepGiaoDien(src)) {
    if (VENDOR.some((v) => relative(src, f).startsWith(v))) continue;
    n += demNgoaiLe(readFileSync(f, "utf8"));
  }
  return n;
}

const git = (root, ...a) => execFileSync("git", ["-C", root, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

/** Trần trên nhánh chính: { tran } · { chuaCo: true } (ref có, tệp chưa có) · { loi: "<lý do>" } (không đọc được ref). */
export function tranNhanhChinh(root, ref) {
  const coRef = () => {
    try {
      git(root, "rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
      return true;
    } catch {
      return false;
    }
  };
  if (!coRef() && ref.startsWith("origin/")) {
    // CI checkout nông không có origin/main — lấy một lớp của nhánh chính.
    const nhanh = ref.slice("origin/".length);
    try {
      git(root, "fetch", "--quiet", "--depth=1", "origin", `${nhanh}:refs/remotes/${ref}`);
    } catch {
      /* rơi xuống lỗi có tên bên dưới */
    }
  }
  if (!coRef()) return { loi: `không có ref ${ref} và không lấy được từ remote` };
  try {
    return { tran: JSON.parse(git(root, "show", `${ref}:${TRAN_TEP}`)).tran };
  } catch {
    return { chuaCo: true };
  }
}

export function kiemMucNo(root, { mainRef = "origin/main", ci = process.env.CI === "true" } = {}) {
  const loi = [];
  const canh = [];
  const supP = join(root, "eslint-suppressions.json");
  const theoLuat = existsSync(supP) ? noTheoLuat(JSON.parse(readFileSync(supP, "utf8"))) : {};
  const no = Object.values(theoLuat).reduce((a, b) => a + b, 0);
  const tranP = join(root, TRAN_TEP);
  if (!existsSync(tranP)) return { ma: 1, dong: [`thiếu ${TRAN_TEP}`] };
  const tran = JSON.parse(readFileSync(tranP, "utf8")).tran;
  const ngoaiLe = ngoaiLeCuaKho(root);
  const dong = [`mức nợ giao diện: ${no}/${tran} · ngoại lệ có lý do: ${ngoaiLe}`];

  if (no > tran) {
    for (const [rule, n] of Object.entries(theoLuat).sort()) loi.push(`nợ vượt trần: ${rule} ${n}`);
    loi.push("Sửa vi phạm thay vì cho qua hàng loạt; ngoại lệ thật ghi `eslint-disable-next-line <luật> -- <lý do>`.");
  }
  const chinh = tranNhanhChinh(root, mainRef);
  if (chinh.loi) {
    const msg = `không so được trần với nhánh chính: ${chinh.loi}`;
    (ci ? loi : canh).push(msg);
  } else if (chinh.chuaCo) {
    dong.push("nhánh chính chưa có trần — đặt trần lần đầu");
  } else if (tran > chinh.tran) {
    loi.push(`trần chỉ được giảm: ${TRAN_TEP} ${chinh.tran} → ${tran}`);
  }
  return { ma: loi.length ? 1 : 0, dong: [...dong, ...canh.map((c) => `cảnh báo: ${c}`), ...loi] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1])) {
  const a = process.argv.slice(2);
  const opt = (k) => (a.includes(k) ? a[a.lastIndexOf(k) + 1] : undefined); // cờ lặp: lần sau thắng
  const root = opt("--root") ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const { ma, dong } = kiemMucNo(root, { mainRef: opt("--main-ref") ?? "origin/main" });
  for (const d of dong) (ma && /^(nợ vượt|trần chỉ|không so|thiếu|Sửa)/.test(d) ? console.error : console.log)(d);
  process.exit(ma);
}
