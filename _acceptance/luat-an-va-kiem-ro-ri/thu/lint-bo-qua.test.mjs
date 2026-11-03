// E10 (hàng 31, tin G-0311-6) — lint của kho bỏ qua thư mục đợt `.acceptance-runs/` (chỉ có trên máy) mà vẫn quét mã kho.
// Đối chứng: cấu hình tạm nhập cấu hình thật rồi lọc bỏ đúng khối bỏ qua ấy — cùng đường thì không còn bị bỏ qua.
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ESLint } from "eslint";

const GOC = fileURLToPath(new URL("../../../", import.meta.url));
const DUONG_DOT = ".acceptance-runs/x/loi/a.mjs";

test("E10 lint bỏ qua thư mục đợt, vẫn quét mã kho", async () => {
  const eslint = new ESLint({ cwd: GOC });
  assert.equal(await eslint.isPathIgnored(join(GOC, DUONG_DOT)), true);
  const [kq] = await eslint.lintText("const khongDung = 1;\n", { filePath: join(GOC, "packages/core/src/redaction/x.ts") });
  assert.ok(kq.errorCount > 0, "mã kho phải còn bị quét");
});

test("E10 đối chứng — bỏ khối bỏ qua .acceptance-runs thì đường thư mục đợt không còn bị bỏ qua", async () => {
  const tam = mkdtempSync(join(tmpdir(), "lint-bo-qua-"));
  try {
    const cauHinh = join(tam, "eslint.config.mjs");
    writeFileSync(
      cauHinh,
      `import that from ${JSON.stringify(pathToFileURL(join(GOC, "eslint.config.mjs")).href)};\n` +
        `export default that.filter((c) => !(c.ignores ?? []).includes(".acceptance-runs/**"));\n`,
    );
    const eslint = new ESLint({ cwd: GOC, overrideConfigFile: cauHinh });
    assert.equal(await eslint.isPathIgnored(join(GOC, DUONG_DOT)), false, ".acceptance-runs vẫn bị bỏ qua khi bỏ khối");
  } finally {
    rmSync(tam, { recursive: true, force: true });
  }
});
