// Bài kiểm tài liệu của hàng 89 (E8, AC-8): ADR-0021 có mục sửa đổi 05/11 trỏ hồ sơ, nói lối hàng loạt đổi người giữ và lối
// gán một căn giữ nguyên, chữ cũ (bản ở nhánh chính) là tiền tố; Tham chiếu §12 có dòng 05/11. Gốc kho suy từ vị trí tệp.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const ADR = "docs/adr/0021-lien-he.md";
const doc = (p) => readFileSync(join(ROOT, p), "utf8");
const goc = (p) => {
  for (const ref of ["origin/main", "main"]) {
    try {
      const base = execFileSync("git", ["merge-base", "HEAD", ref], { cwd: ROOT }).toString().trim();
      return execFileSync("git", ["show", `${base}:${p}`], { cwd: ROOT, maxBuffer: 64 << 20 }).toString();
    } catch {
      // ref vắng ở máy này — thử ref kế
    }
  }
  return null;
};

export function lechAdr(moi, cu) {
  const out = [];
  const dau = /^## [^\n]*Sửa đổi 05\/11[^\n]*$/m.exec(moi);
  const sau = dau ? moi.slice(dau.index + dau[0].length) : "";
  const k = sau.search(/\n## /);
  const than = k >= 0 ? sau.slice(0, k) : sau;
  if (!dau) out.push(`${ADR}: thiếu mục «Sửa đổi 05/11»`);
  else {
    if (!than.includes("doi-dau-chu-hang-loat")) out.push(`${ADR}: mục sửa đổi không trỏ hồ sơ`);
    if (!/người giữ của liên hệ chủ nhà đổi sang đầu chủ mới/.test(than)) out.push(`${ADR}: không nói lối hàng loạt đổi người giữ`);
    if (!/Lối gán một căn[\s\S]*giữ nguyên/.test(than)) out.push(`${ADR}: không nói lối gán một căn giữ nguyên`);
  }
  if (cu !== null && !moi.startsWith(cu.trimEnd())) out.push(`${ADR}: chữ cũ bị viết đè`);
  return out;
}

test("E8: ADR-0021 có mục sửa đổi 05/11 đủ ba ý, chữ cũ còn nguyên", () => {
  assert.deepEqual(lechAdr(doc(ADR), goc(ADR)), []);
});

test("E8: đối chứng đỏ — bản sao ADR bỏ mục sửa đổi → gọi tên tệp", () => {
  const cat = doc(ADR).replace(/\n## Sửa đổi 05\/11[\s\S]*$/, "\n");
  assert.deepEqual(lechAdr(cat, goc(ADR)), [`${ADR}: thiếu mục «Sửa đổi 05/11»`]);
});

test("E8: Tham chiếu §12 có dòng 05/11 trỏ hồ sơ", () => {
  const t = doc("docs/product/tham-chieu.md");
  const s12 = t.slice(t.indexOf("## 12."), t.indexOf("## 13."));
  assert.match(s12, /\| 05\/11 \| Đổi đầu chủ hàng loạt[^\n]*`_acceptance\/doi-dau-chu-hang-loat\/` \|/);
});
