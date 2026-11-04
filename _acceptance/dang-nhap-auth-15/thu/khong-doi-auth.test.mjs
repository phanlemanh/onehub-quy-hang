// Hàng 93 (dang-nhap-auth-15) AC-5 — E5: nhánh của hàng không đổi tệp nào dưới packages/api/src/auth so với nhánh chính.
// Gốc kho suy từ vị trí tệp; nhánh chính là origin/main, vắng thì main. Không tìm được thì đỏ, không bỏ qua.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const git = (...a) => execFileSync("git", ["-C", GOC, ...a], { encoding: "utf8" }).trim();
const VUNG = "packages/api/src/auth/";

/** Tệp đổi nằm trong vùng đăng nhập của API. */
export const trongVungAuth = (tep) => tep.filter((t) => t.startsWith(VUNG));

function nhanhChinh() {
  for (const ref of ["origin/main", "main"]) {
    try {
      git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);
      return ref;
    } catch {}
  }
  return null;
}

test("auth: không tệp nào dưới packages/api/src/auth đổi so với nhánh chính", () => {
  const ref = nhanhChinh();
  assert.ok(ref, "không tìm được nhánh chính (origin/main hay main)");
  const goc = git("merge-base", ref, "HEAD");
  const doi = git("diff", "--name-only", goc, "HEAD").split("\n").filter(Boolean);
  assert.deepEqual(trongVungAuth(doi), [], `tệp đổi trong ${VUNG} từ ${goc.slice(0, 8)}`);
});

test("auth: thước bắt được tệp đổi", () => {
  const vietTruoc = ["apps/web/src/app/(auth)/khung.tsx", "packages/api/src/auth/sender.ts", "packages/api/src/app.ts"];
  assert.deepEqual(trongVungAuth(vietTruoc), ["packages/api/src/auth/sender.ts"]);
  assert.deepEqual(trongVungAuth(["packages/api/src/authx.ts"]), [], "tên gần giống không tính");
});
