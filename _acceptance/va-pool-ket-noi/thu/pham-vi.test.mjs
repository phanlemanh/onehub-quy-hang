// va-pool-ket-noi AC-4: bản vá chỉ chạm lớp web (pool, phân loại /me, ranh giới lỗi) — không tệp nào của cơ sở dữ liệu,
// luật cách ly, lõi hay API đổi so với điểm rẽ khỏi nhánh chính. Cặp hai chiều trên cùng hàm `ngoaiPhamVi`.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();

// Danh sách cho phép, đích danh. Mọi đường khác — packages/** (db, api, core, connect), .github, .githooks, .claude/** trừ
// launch.json, hồ sơ khác dưới _acceptance/ — là ngoài phạm vi. _acceptance/config.yaml được phép, nhưng chỉ thêm đúng một
// dòng khoá executor của hồ sơ (ca riêng dưới).
const DUOC = [
  /^apps\/web\//,
  /^package-lock\.json$/,
  /^\.claude\/launch\.json$/,
  /^_acceptance\/va-pool-ket-noi\//,
  /^_acceptance\/config\.yaml$/,
  /^docs\/superpowers\/specs\/2026-11-06-va-pool-ket-noi-design\.md$/,
  /^docs\/superpowers\/plans\/2026-11-06-va-pool-ket-noi\.md$/,
  /^docs\/plan\/lo-trinh\.json$/,
  /^docs\/product\/tham-chieu\.md$/,
  /^PRODUCT-MAP\.md$/,
  /^LO-TRINH\.html$/,
];
export const ngoaiPhamVi = (paths) => paths.filter((p) => !DUOC.some((re) => re.test(p)));

/** Dòng đổi của một diff hợp nhất (bỏ đầu tệp) → lỗi khi không đúng một dòng thêm khoá va_pool_ket_noi. */
export function loiConfig(diff) {
  const doi = diff.split("\n").filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l));
  if (doi.length === 0) return null;
  if (doi.length === 1 && /^\+\s+va_pool_ket_noi: /.test(doi[0])) return null;
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

test("phạm vi: đối chứng dương — danh sách chỉ gồm lớp web thì không đường nào ngoài phạm vi", () => {
  assert.deepEqual(ngoaiPhamVi(["apps/web/src/lib/api.ts", "package-lock.json", "_acceptance/va-pool-ket-noi/contract.md"]), []);
});

test("phạm vi: chiều đỏ — migration, luật cách ly hay API trong danh sách thì bị gọi tên", () => {
  const sai = [
    "packages/db/migrations/051_x.sql",
    "packages/api/src/db.ts",
    "packages/db/tests/isolation.test.mjs",
    ".claude/hooks/chan-migration.sh",
    "_acceptance/hang-khac/contract.md",
  ];
  assert.deepEqual(ngoaiPhamVi(["apps/web/src/lib/api.ts", ...sai]), sai, "pham-vi: bộ lọc không gọi tên đường ngoài phạm vi");
});

test("phạm vi: cây thật — không tệp nào ngoài lớp web đổi so với điểm rẽ khỏi main", () => {
  const doi = git("diff", "--name-only", diemRe(), "HEAD").split("\n").filter(Boolean);
  assert.ok(doi.includes("apps/web/src/lib/api.ts"), "pham-vi: diff không chứa apps/web/src/lib/api.ts — đo nhầm cây");
  assert.deepEqual(ngoaiPhamVi(doi), [], `pham-vi: đổi ngoài lớp web: ${ngoaiPhamVi(doi).join(", ")}`);
});

test("phạm vi: config.yaml — chỉ một dòng thêm khoá va_pool_ket_noi; đổi ngưỡng cổng bị gọi tên", () => {
  assert.equal(loiConfig("--- a/x\n+++ b/x\n@@\n+    va_pool_ket_noi: \"node --test x\"\n"), null);
  assert.match(loiConfig("@@\n-gap_probe: required\n+gap_probe: off\n") ?? "", /config\.yaml đổi ngoài khoá executor/);
  assert.match(loiConfig("@@\n+    va_pool_ket_noi: \"x\"\n+    khac: \"y\"\n") ?? "", /config\.yaml đổi ngoài khoá executor/);
  const that = git("diff", diemRe(), "HEAD", "--", "_acceptance/config.yaml");
  assert.equal(loiConfig(that), null, loiConfig(that) ?? "");
});
