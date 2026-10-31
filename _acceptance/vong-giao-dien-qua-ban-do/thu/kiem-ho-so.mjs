#!/usr/bin/env node
// Hồ sơ vong-giao-dien-qua-ban-do tự áp số đo và trang đối chiếu (E9, AC-9). Đọc hồ sơ, không ghi gì.
//   node _acceptance/vong-giao-dien-qua-ban-do/thu/kiem-ho-so.mjs [--root <kho>] [--ho-so <thư mục hồ sơ>]
// Mã 0 đạt · 1 thiếu hay lệch (mỗi lỗi một dòng nêu tệp hay nhóm).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const root = resolve(arg("--root") ?? join(DAY, "../../.."));
const hs = resolve(arg("--ho-so") ?? join(DAY, ".."));
const { docBanDo } = await import(join(root, "packages/ui-lint/lib/ban-do.mjs"));

const loi = [];
const docJson = (t) => {
  const p = join(hs, t);
  if (!existsSync(p)) return loi.push(`${t}: không có`), null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    return loi.push(`${t}: không đọc được JSON (${e.message})`), null;
  }
};

const s = docJson("khuon-so-do.json");
if (s) {
  if (!Array.isArray(s.tep_theo_khuon)) loi.push("khuon-so-do.json: tep_theo_khuon không phải mảng");
  for (const k of ["rang_bat", "lech_lot"]) if (typeof s[k] !== "number") loi.push(`khuon-so-do.json: ${k} không phải số`);
  try {
    execFileSync("git", ["-C", root, "merge-base", "--is-ancestor", s.base, "HEAD"], { stdio: "ignore" });
  } catch {
    loi.push(`khuon-so-do.json: base «${s.base}» không phải tổ tiên của HEAD`);
  }
}

const k = docJson("doi-chieu/ke-hoach.json");
if (k) {
  const co = new Set(k.cap.map((c) => c.nhom));
  for (const g of docBanDo(root).nhom) if (!co.has(g.data.nhom)) loi.push(`doi-chieu/ke-hoach.json: thiếu nhóm ${g.data.nhom}`);
  const p = join(hs, "doi-chieu/index.html");
  if (!existsSync(p)) loi.push("doi-chieu/index.html: không có");
  else {
    const html = readFileSync(p, "utf8");
    const n = (html.match(/<tr data-cap="/g) ?? []).length;
    if (n !== k.cap.length) loi.push(`doi-chieu/index.html: ${n} hàng, kế hoạch ${k.cap.length} mục`);
    for (const m of html.matchAll(/thiếu ảnh ([^<]+)/g)) loi.push(`doi-chieu/index.html: thiếu ảnh ${m[1]}`);
  }
}

for (const l of loi) console.error(l);
if (loi.length) process.exit(1);
console.log(`hồ sơ: số đo (khuôn ${s.tep_theo_khuon.length} tệp · răng bắt ${s.rang_bat} · lệch lọt ${s.lech_lot}) · đối chiếu ${k.cap.length} mục, đủ ảnh`);
