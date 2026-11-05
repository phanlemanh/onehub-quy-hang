// E8 (AC-7): migration 038 là tệp mới, thay hàm trigger và xoá phiên; không sửa migration đã commit; tài liệu có dòng.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../..");
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

test("migration: 038 là tệp mới, thay hàm trigger và xoá phiên", () => {
  const tep = readdirSync(join(GOC, "packages/db/migrations")).filter((f) => /^038_.*\.sql$/.test(f));
  assert.equal(tep.length, 1, `có ${tep.length} tệp 038`);
  const sql = doc(`packages/db/migrations/${tep[0]}`);
  assert.match(sql, /create or replace function app\.vo_hieu_mat_khau_khi_vao_san/);
  assert.match(sql, /delete from identity\.session/);
});

test("migration: không sửa migration đã commit", () => {
  const ds = execFileSync("git", ["diff", "--name-status", nenChinh(), "HEAD", "--", "packages/db/migrations"], { cwd: GOC, encoding: "utf8" });
  assert.deepEqual(daSua(ds), []);
  assert.deepEqual(daSua("A\tpackages/db/migrations/038_vao_san_khac_thu_phien.sql\nM\tpackages/db/migrations/034_mat_khau.sql\n"), [
    "packages/db/migrations/034_mat_khau.sql",
  ]);
});

test("tài liệu", () => {
  assert.match(doc("docs/adr/0005-dang-nhap-theo-san.md"), /va-dang-nhap-mat-khau/);
  const tc = doc("docs/product/tham-chieu.md");
  const s12 = tc.slice(tc.indexOf("## 12. Sổ quyết định"));
  assert.ok(s12.split("\n").some((d) => d.startsWith("| ") && d.includes("va-dang-nhap-mat-khau")), "§12 thiếu dòng va-dang-nhap-mat-khau");
});
