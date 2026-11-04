// Bài kiểm tài liệu của hàng cai-dat-hop-nhat (E9, AC-9): ba quyết định đã niêm bị đổi có mục sửa đổi 04/11 trỏ hồ sơ,
// chữ cũ không bị viết đè (so với bản ở nhánh chính), Tham chiếu §9 và §12, từ vựng. Gốc kho suy từ vị trí tệp này.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
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

/** Mục sửa đổi: một tiêu đề mang «Sửa đổi 04/11», thân nhắc hồ sơ; chữ cũ (bản ở nhánh chính) còn nguyên là tiền tố. */
export function lechSuaDoi(ten, moi, cu) {
  const out = [];
  const dau = /^#{2,3} [^\n]*Sửa đổi 04\/11[^\n]*$/m.exec(moi);
  const sau = dau ? moi.slice(dau.index + dau[0].length) : "";
  const than = sau.slice(0, sau.search(/\n#{2,3} /) >= 0 ? sau.search(/\n#{2,3} /) : sau.length);
  if (!dau) out.push(`${ten}: thiếu mục «Sửa đổi 04/11»`);
  else if (!than.includes("cai-dat-hop-nhat")) out.push(`${ten}: mục sửa đổi không trỏ hồ sơ cai-dat-hop-nhat`);
  if (cu !== null && !moi.startsWith(cu.trimEnd())) out.push(`${ten}: chữ cũ bị viết đè`);
  return out;
}

const SUA_DOI = ["docs/design/vo-va-ia.md", "docs/adr/0024-he-bo-cuc.md"];

test("E9: vỏ và ADR-0024 có mục sửa đổi 04/11 trỏ hồ sơ, chữ cũ còn nguyên", () => {
  assert.deepEqual(SUA_DOI.flatMap((p) => lechSuaDoi(p, doc(p), goc(p))), []);
});

test("E9: đối chứng đỏ — bản sao vo-va-ia.md bỏ mục sửa đổi → gọi tên tệp", () => {
  const p = SUA_DOI[0];
  const cat = doc(p).replace(/\n## 6\. Sửa đổi 04\/11[\s\S]*$/, "\n");
  assert.deepEqual(lechSuaDoi(p, cat, goc(p)), [`${p}: thiếu mục «Sửa đổi 04/11»`]);
});

test("E9: đối chứng đỏ — bản sao ADR viết đè một dòng cũ → «chữ cũ bị viết đè»", () => {
  const p = SUA_DOI[1];
  const cu = goc(p);
  assert.ok(cu, "đọc được bản ở nhánh chính");
  const de = doc(p).replace("gỡ max-width ở gốc khối", "giữ 48rem");
  assert.deepEqual(lechSuaDoi(p, de, cu), [`${p}: chữ cũ bị viết đè`]);
});

test("E9: Tham chiếu §9 có nhà Cài đặt cho mọi vai có cột nhà, §12 có dòng 04/11 trỏ hồ sơ", () => {
  const t = doc("docs/product/tham-chieu.md");
  const s9 = t.slice(t.indexOf("## 9. Điều hướng"), t.indexOf("## 10."));
  assert.match(s9, /\| Cài đặt \(nhóm Cá nhân\) \| Qua menu tài khoản \| Có \| Có \| Có \| Có \|/);
  assert.match(s9, /\| Cài đặt \(nhóm Sàn\) \| — \| — \| — \| — \| Có \|/);
  const s12 = t.slice(t.indexOf("## 12."), t.indexOf("## 13."));
  assert.match(s12, /\| 04\/11 \| Khu Cài đặt một chỗ[^\n]*`_acceptance\/cai-dat-hop-nhat\/` \|/);
});

test("E9: CONTEXT.md có nhãn «Cài đặt» và «Cá nhân»", () => {
  const c = doc("CONTEXT.md");
  assert.match(c, /^\| Cài đặt \| `settings` \|/m);
  assert.match(c, /^\| Cá nhân \| `personal` \|/m);
});
