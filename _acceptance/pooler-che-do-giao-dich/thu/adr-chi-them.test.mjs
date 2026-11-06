// pooler-che-do-giao-dich AC-7 (E13): ADR-0009 nhận một mục «Sửa đổi 06/11», không viết đè quyết định cũ — so với điểm rẽ
// khỏi nhánh chính, diff của tệp chỉ có dòng thêm.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const ADR = "docs/adr/0009-moi-truong-that.md";
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" });

/** Đọc một diff hợp nhất: dòng bị xoá (ngoài tiêu đề) và dòng thêm. */
export function docDiff(diff) {
  const dong = diff.split("\n");
  const xoa = dong.filter((l) => l.startsWith("-") && !l.startsWith("--- "));
  const them = dong.filter((l) => l.startsWith("+") && !l.startsWith("+++ "));
  return { xoa, them };
}

function diemRe() {
  for (const ref of ["origin/main", "main"]) {
    try {
      return git("merge-base", "HEAD", ref).trim();
    } catch {
      // ref vắng ở bản sao này — thử ref kế
    }
  }
  throw new Error("adr-chi-them: không tìm được điểm rẽ với main");
}

test("ADR-0009: chỉ thêm, không viết đè", (t) => {
  const base = diemRe();
  if (git("diff", "--name-only", base, "HEAD").trim() === "") return t.skip("nhánh đã nằm trong nhánh chính — không còn diff để soi");
  const { xoa, them } = docDiff(git("diff", "--unified=0", base, "HEAD", "--", ADR));
  assert.deepEqual(xoa, [], `ADR-0009 bị sửa dòng cũ: ${xoa.join(" | ")}`);
  assert.ok(them.some((l) => /Sửa đổi 06\/11/.test(l)), "ADR-0009 thiếu mục «Sửa đổi 06/11»");
});

test("ADR-0009: chiều đỏ — sửa một dòng cũ thì đỏ", () => {
  const moi = "--- a/x\n+++ b/x\n@@ -26 +26 @@\n-4. **Kết nối**: pooler chế độ phiên (cổng 5432)\n+4. **Kết nối**: pooler chế độ giao dịch (cổng 6543)\n";
  const { xoa } = docDiff(moi);
  assert.deepEqual(xoa, ["-4. **Kết nối**: pooler chế độ phiên (cổng 5432)"], "adr-chi-them: diff mồi có dòng xoá mà không bị gọi tên");
  assert.deepEqual(docDiff("--- a/x\n+++ b/x\n@@ -70,0 +71 @@\n+## Sửa đổi 06/11\n").xoa, [], "adr-chi-them: diff chỉ thêm bị gọi tên nhầm");
});
