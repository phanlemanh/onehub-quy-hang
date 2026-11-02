// Hồ sơ thật của hàng 22 (hom-nay-dau-chu, AC-11, E11b) qua bài chấm vòng ba lối: kho tạm có design/patterns của kho trừ
// hom-nay-dau-chu.md làm base, rồi thêm tệp ấy và hồ sơ thật (design-pass.md, ba-loi/) → đúng một điều «nhóm mới», không
// lỗi. Đối chứng: bản sao design-pass ghi divergence skipped → lỗi nói «skipped».
import { it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kiemVongBaLoi } from "../lib/ba-loi.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const SLUG = "hom-nay-dau-chu";
const NHOM = `design/patterns/${SLUG}.md`;
const VO = "docs/design/vo-va-ia.md";

const git = (d, ...a) => execFileSync("git", ["-C", d, "-c", "user.email=may@example.test", "-c", "user.name=may", ...a], { encoding: "utf8" });
const chep = (d, t) => (mkdirSync(dirname(join(d, t)), { recursive: true }), cpSync(join(ROOT, t), join(d, t), { recursive: true }));

function khoTam(fn) {
  const d = mkdtempSync(join(tmpdir(), "ba-loi-hang-22-"));
  try {
    git(d, "init", "-q", "-b", "main");
    for (const f of readdirSync(join(ROOT, "design/patterns")).filter((f) => f.endsWith(".md") && f !== `${SLUG}.md`)) chep(d, `design/patterns/${f}`);
    chep(d, VO);
    git(d, "add", "-A");
    git(d, "commit", "-q", "-m", "base");
    chep(d, NHOM);
    chep(d, `_acceptance/${SLUG}/design-pass.md`);
    chep(d, `_acceptance/${SLUG}/ba-loi`);
    return fn(d);
  } finally {
    rmSync(d, { recursive: true, force: true });
  }
}

it("ba lối: hồ sơ hàng 22 qua bài chấm vòng", () => {
  khoTam((d) => {
    const kq = kiemVongBaLoi(d, SLUG, "main");
    assert.deepEqual(kq.dieu, [{ loai: "nhóm mới", ten: SLUG }]);
    assert.deepEqual(kq.loi, []);

    // Đối chứng: bước phân kỳ bị bỏ → bài chấm đỏ, gọi tên skipped.
    const dp = join(d, "_acceptance", SLUG, "design-pass.md");
    writeFileSync(dp, readFileSync(dp, "utf8").replace(/^divergence:.*$/m, "divergence: skipped"));
    const sai = kiemVongBaLoi(d, SLUG, "main");
    assert.deepEqual(sai.dieu, [{ loai: "nhóm mới", ten: SLUG }]);
    assert.ok(sai.loi.some((l) => l.includes("skipped")), JSON.stringify(sai.loi));
  });
});
