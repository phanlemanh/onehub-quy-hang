// pooler-che-do-giao-dich AC-8 (E6): bản vá chỉ chạm các tệp đã kê ở mục Notes của hợp đồng — không migration, không
// `packages/api/src/db.ts`, không rào của kho. Danh sách cho phép rút từ chính hợp đồng (một nguồn). Ca cây thật tự bỏ qua
// khi nhánh đã nằm trong nhánh chính.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const DAY = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(DAY, "../../..");
const HOP_DONG = resolve(DAY, "../contract.md");
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).trim();

const theoMau = (g) =>
  new RegExp(`^${g.split("**").map((phan) => phan.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")).join(".*")}$`);

/** Danh sách cho phép: mọi đường trong backtick của gạch «Danh sách cho phép của AC-8», cộng design doc và kế hoạch. */
export function danhSachChoPhep(hopDong = readFileSync(HOP_DONG, "utf8")) {
  const gach = hopDong.match(/- Danh sách cho phép của AC-8:([\s\S]*?)(?=\n- |\n## |$)/);
  if (!gach) throw new Error("pham-vi: hợp đồng thiếu gạch «Danh sách cho phép của AC-8»");
  const duong = [...gach[1].matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  const thietKe = hopDong.match(/^design_doc:\s*(\S+)/m)?.[1];
  if (!thietKe) throw new Error("pham-vi: hợp đồng thiếu design_doc");
  duong.push(thietKe, thietKe.replace("/specs/", "/plans/").replace(/-design\.md$/, ".md"));
  return duong;
}

const DUOC = danhSachChoPhep().map(theoMau);
export const ngoaiPhamVi = (paths) => paths.filter((p) => !DUOC.some((re) => re.test(p)));

const KHOA = ["pooler_giao_dich", "pooler_xem_truoc"];
export function loiConfig(diff) {
  const doi = diff.split("\n").filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---) /.test(l));
  const la = doi.filter((l) => !KHOA.some((k) => new RegExp(`^\\+\\s+${k}: `).test(l)));
  return la.length === 0 ? null : `config.yaml đổi ngoài khoá executor của hồ sơ: ${la.join(" | ")}`;
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
  const dung = [
    "apps/web/src/lib/api.ts",
    "packages/api/src/auth/auth.ts",
    "packages/api/test-db/helpers.ts",
    "_acceptance/pooler-che-do-giao-dich/thu/pham-vi.test.mjs",
    "docs/superpowers/plans/2026-11-06-pooler-che-do-giao-dich.md",
    "docs/adr/0009-moi-truong-that.md",
  ];
  assert.deepEqual(ngoaiPhamVi(dung), [], `pham-vi: đường hợp lệ bị gọi tên: ${ngoaiPhamVi(dung).join(", ")}`);
  const sai = [
    "packages/db/migrations/051_x.sql",
    "packages/api/src/db.ts",
    ".claude/hooks/x.sh",
    "packages/core/src/data-classes.ts",
    "_acceptance/hang-khac/contract.md",
  ];
  assert.deepEqual(ngoaiPhamVi([...dung, ...sai]), sai, "pham-vi: bộ lọc không gọi tên đường ngoài phạm vi");
});

test("phạm vi: config.yaml chỉ thêm khoá của hồ sơ", () => {
  assert.equal(loiConfig('@@\n+    pooler_giao_dich: "node --test x"\n+    pooler_xem_truoc: "node y"\n'), null);
  assert.match(loiConfig("@@\n-gap_probe: required\n+gap_probe: off\n") ?? "", /config\.yaml đổi ngoài khoá executor/);
  assert.match(loiConfig('@@\n+    khoa_la: "node z"\n') ?? "", /khoa_la/);
  const that = git("diff", diemRe(), "HEAD", "--", "_acceptance/config.yaml");
  assert.equal(loiConfig(that), null, loiConfig(that) ?? "");
});

test("phạm vi: cây thật — không tệp nào ngoài danh sách cho phép đổi so với điểm rẽ khỏi main", (t) => {
  const doi = git("diff", "--name-only", diemRe(), "HEAD").split("\n").filter(Boolean);
  if (doi.length === 0) return t.skip("nhánh đã nằm trong nhánh chính — không còn diff để soi");
  assert.ok(doi.includes("packages/api/src/auth/auth.ts"), "pham-vi: diff không chứa packages/api/src/auth/auth.ts — đo nhầm cây");
  assert.deepEqual(ngoaiPhamVi(doi), [], `pham-vi: đổi ngoài danh sách cho phép: ${ngoaiPhamVi(doi).join(", ")}`);
});
