// Fixture chép từ chính tệp thật của kho (round-trip bên ghi), rồi phá từng chỗ trên một bản sao mới.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kiemChuan } from "../kiem-chuan.mjs";

const PKG = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(PKG, "..", "..");
const SCRIPT = join(PKG, "kiem-chuan.mjs");
const TEP = [
  "apps/web/components.json",
  "apps/web/src",
  "design/patterns",
  ".agents/skills/quy-hang-ui",
  ".agents/skills/reui",
  "_acceptance/config.yaml",
  ".github/workflows/ci.yml",
];

function banSao() {
  const root = mkdtempSync(join(tmpdir(), "kiem-chuan-"));
  for (const rel of TEP) cpSync(join(ROOT, rel), join(root, rel), { recursive: true });
  mkdirSync(join(root, ".claude/skills"), { recursive: true });
  for (const s of ["quy-hang-ui", "reui"]) symlinkSync(`../../.agents/skills/${s}`, join(root, ".claude/skills", s));
  return root;
}
const sua = (root, rel, f) => writeFileSync(join(root, rel), f(readFileSync(join(root, rel), "utf8")));

function phaThu(ten, pha, thongDiep) {
  it(`phá: ${ten} → thoát 1, «${thongDiep}»`, () => {
    const root = banSao();
    try {
      pha(root);
      const r = spawnSync("node", [SCRIPT, "--root", root], { encoding: "utf8" });
      assert.equal(r.status, 1, r.stdout);
      assert.ok(r.stderr.includes(thongDiep), `stderr: ${r.stderr}`);
      assert.doesNotMatch(r.stdout, /chuẩn giao diện: đạt/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

describe("kiem-chuan.mjs", () => {
  it("đối chứng dương: bản sao lành → thoát 0, «chuẩn giao diện: đạt»", () => {
    const root = banSao();
    try {
      const r = spawnSync("node", [SCRIPT, "--root", root], { encoding: "utf8" });
      assert.equal(r.status, 0, r.stderr);
      assert.match(r.stdout, /chuẩn giao diện: đạt/);
      assert.match(r.stdout, /catalog khớp \d+ thành phần/);
      assert.match(r.stdout, /CI: job check chạy npm run lint/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("kho thật đạt", () => assert.deepEqual(kiemChuan(ROOT).loi, []));

  phaThu("style radix-nova", (r) => sua(r, "apps/web/components.json", (s) => s.replace('"base-nova"', '"radix-nova"')), "components.json: style");
  phaThu("bỏ registry @reui", (r) => sua(r, "apps/web/components.json", (s) => s.replace('"@reui"', '"@khac"')), "thiếu registry @reui");
  phaThu("xoá frame", (r) => unlinkSync(join(r, "apps/web/src/components/reui/frame.tsx")), "thiếu thành phần: frame");
  phaThu("thành phần mới chưa vào catalog", (r) => writeFileSync(join(r, "apps/web/src/components/ui/x.tsx"), "export {};\n"), "catalog.md thiếu: x");
  phaThu("catalog ghi thành phần không có", (r) => sua(r, ".agents/skills/quy-hang-ui/catalog.md", (s) => s.replace("| frame | reui |", "| frame | reui |\n| khong-co | ui | x | x |\n| frame-cu | reui |")), "catalog.md thừa: khong-co");
  phaThu(
    "thành phần dạng thư mục chưa vào catalog",
    (r) => {
      // Thư mục giả — data-grid thật đã cài và có dòng từ hàng 14.
      mkdirSync(join(r, "apps/web/src/components/reui/luoi-thu"));
      writeFileSync(join(r, "apps/web/src/components/reui/luoi-thu/luoi-thu.tsx"), "export {};\n");
    },
    "catalog.md thiếu: luoi-thu",
  );
  phaThu(
    "symlink reui trỏ sai",
    (r) => {
      unlinkSync(join(r, ".claude/skills/reui"));
      symlinkSync("../../.agents/skills/quy-hang-ui", join(r, ".claude/skills/reui"));
    },
    "symlink .claude/skills/reui",
  );
  phaThu("cấu hình thiếu ui_standards_skill", (r) => sua(r, "_acceptance/config.yaml", (s) => s.replace(/^ {2}ui_standards_skill:.*\n/m, "")), "ui_standards_skill");
  phaThu("cấu hình thiếu executors.design.floor", (r) => sua(r, "_acceptance/config.yaml", (s) => s.replace(/^ {2}design:\n {4}floor:.*\n/m, "")), "executors.design.floor");
  phaThu("cấu hình thiếu design.surface_globs", (r) => sua(r, "_acceptance/config.yaml", (s) => s.replace(/\ndesign:\n {2}surface_globs:.*\n(?: {4}- .*\n)+/, "\n")), "design.surface_globs");
  phaThu("job check bỏ npm run lint", (r) => sua(r, ".github/workflows/ci.yml", (s) => s.replace("      - run: npm run lint\n", "")), "job check thiếu npm run lint");
});
