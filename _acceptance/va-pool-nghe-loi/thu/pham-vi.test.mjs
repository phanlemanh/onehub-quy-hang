// va-pool-nghe-loi AC-4: bản vá chỉ chạm lớp kết nối của máy chủ web và vật của hồ sơ. Cặp hai chiều trên `ngoaiPhamVi`
// và `loiConfig`. Ca cây thật tự bỏ qua khi nhánh đã nằm trong nhánh chính (diff rỗng) — không đỏ giả sau khi gộp.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();

const DUOC = [
  /^apps\/web\/src\/lib\/api\.ts$/,
  /^apps\/web\/src\/lib\/api\.test\.ts$/,
  /^_acceptance\/va-pool-nghe-loi\//,
  /^_acceptance\/config\.yaml$/,
  /^docs\/superpowers\/specs\/2026-11-06-va-pool-nghe-loi-design\.md$/,
  /^docs\/superpowers\/plans\/2026-11-06-va-pool-nghe-loi\.md$/,
  /^docs\/plan\/lo-trinh\.json$/,
  /^docs\/product\/tham-chieu\.md$/,
  /^PRODUCT-MAP\.md$/,
  /^LO-TRINH\.html$/,
];
export const ngoaiPhamVi = (paths) => paths.filter((p) => !DUOC.some((re) => re.test(p)));

export function loiConfig(diff) {
  const doi = diff.split("\n").filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l));
  if (doi.length === 0) return null;
  if (doi.length === 1 && /^\+\s+va_pool_nghe_loi: /.test(doi[0])) return null;
  return `config.yaml đổi ngoài khoá executor của hồ sơ: ${doi.join(" | ")}`;
}

function diemRe() {
  for (const ref of ["origin/main", "main"]) {
    try {
      return git("merge-base", "HEAD", ref);
    } catch {
      // ref vắng ở bản sao này — thử ref kế
    }
  }
  throw new Error("pham-vi: không tìm được điểm rẽ với main");
}

test("phạm vi: đối chứng dương và chiều đỏ của danh sách cho phép", () => {
  assert.deepEqual(ngoaiPhamVi(["apps/web/src/lib/api.ts", "_acceptance/va-pool-nghe-loi/contract.md", "docs/product/tham-chieu.md"]), []);
  const sai = ["packages/api/src/db.ts", "packages/db/migrations/051_x.sql", ".claude/hooks/x.sh", "_acceptance/hang-khac/contract.md"];
  assert.deepEqual(ngoaiPhamVi(["apps/web/src/lib/api.ts", ...sai]), sai, "pham-vi: bộ lọc không gọi tên đường ngoài phạm vi");
});

test("phạm vi: config.yaml chỉ thêm khoá va_pool_nghe_loi", () => {
  assert.equal(loiConfig('@@\n+    va_pool_nghe_loi: "node --test x"\n'), null);
  assert.match(loiConfig("@@\n-gap_probe: required\n+gap_probe: off\n") ?? "", /config\.yaml đổi ngoài khoá executor/);
  const that = git("diff", diemRe(), "HEAD", "--", "_acceptance/config.yaml");
  assert.equal(loiConfig(that), null, loiConfig(that) ?? "");
});

test("phạm vi: cây thật — không tệp nào ngoài danh sách cho phép đổi so với điểm rẽ khỏi main", (t) => {
  const doi = git("diff", "--name-only", diemRe(), "HEAD").split("\n").filter(Boolean);
  if (doi.length === 0) return t.skip("nhánh đã nằm trong nhánh chính — không còn diff để soi");
  assert.ok(doi.includes("apps/web/src/lib/api.ts"), "pham-vi: diff không chứa apps/web/src/lib/api.ts — đo nhầm cây");
  assert.deepEqual(ngoaiPhamVi(doi), [], `pham-vi: đổi ngoài danh sách cho phép: ${ngoaiPhamVi(doi).join(", ")}`);
});
