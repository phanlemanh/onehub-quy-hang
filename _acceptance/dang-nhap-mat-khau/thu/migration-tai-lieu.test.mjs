// E15 (AC-11): migration 034 là tệp mới, không sửa migration đã commit, và tài liệu đã cập nhật.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const GOC = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const doc = (p) => readFileSync(join(GOC, p), "utf8");

function nenChinh() {
  for (const ref of ["origin/main", "main"]) {
    try {
      return execFileSync("git", ["merge-base", "HEAD", ref], { cwd: GOC, encoding: "utf8" }).trim();
    } catch {
      // thử ref kế
    }
  }
  throw new Error("không tìm được merge-base với nhánh chính");
}

/** Dòng `git diff --name-status` dưới packages/db/migrations không phải thêm mới. */
export const daSua = (dong) =>
  dong
    .split("\n")
    .filter(Boolean)
    .filter((d) => d.split("\t")[1]?.startsWith("packages/db/migrations/") && !d.startsWith("A\t"))
    .map((d) => d.split("\t").at(-1));

test("migration: 034 là tệp mới", () => {
  const tep = readdirSync(join(GOC, "packages/db/migrations")).filter((f) => /^034_.*\.sql$/.test(f));
  assert.equal(tep.length, 1, `có ${tep.length} tệp 034`);
  const sql = doc(`packages/db/migrations/${tep[0]}`);
  for (const bang of ["identity.password_state", "identity.password_failures", "identity.password_events"]) {
    assert.match(sql, new RegExp(`create table ${bang.replace(".", "\\.")}\\b`), `thiếu ${bang}`);
  }
  assert.match(sql, /function app\.cap_mat_khau_tam\([^)]*\)[^$]*security definer/s, "hàm cấp không security definer");
  assert.match(sql, /revoke all on identity\.password_state, identity\.password_failures, identity\.password_events from public/);
  assert.match(sql, /revoke all on identity\.password_state, identity\.password_failures, identity\.password_events from quy_hang_app/);
  assert.match(sql, /grant execute on function app\.cap_mat_khau_tam\([^)]*\) to quy_hang_app/);
});

test("migration: không sửa migration đã commit", () => {
  const ds = execFileSync("git", ["diff", "--name-status", nenChinh(), "HEAD", "--", "packages/db/migrations"], { cwd: GOC, encoding: "utf8" });
  assert.deepEqual(daSua(ds), []);
  // Đối chứng: danh sách viết trước có một tệp sửa thì ca nêu đúng tệp ấy.
  assert.deepEqual(daSua("A\tpackages/db/migrations/034_mat_khau.sql\nM\tpackages/db/migrations/002_dang_nhap_theo_san.sql\n"), [
    "packages/db/migrations/002_dang_nhap_theo_san.sql",
  ]);
});

test("tài liệu: ADR, khuôn, Tham chiếu", () => {
  assert.match(doc("docs/adr/0005-dang-nhap-theo-san.md"), /^## .*Bổ sung 04\/11.*mật khẩu/m);
  assert.match(doc("design/patterns/xac-thuc.md"), /Đặt mật khẩu mới/);
  const tc = doc("docs/product/tham-chieu.md");
  const s12 = tc.slice(tc.indexOf("## 12. Sổ quyết định"));
  assert.ok(s12.split("\n").some((d) => d.startsWith("| ") && d.includes("dang-nhap-mat-khau")), "§12 thiếu dòng dang-nhap-mat-khau");
});
