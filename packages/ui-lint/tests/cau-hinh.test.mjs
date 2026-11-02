// Phạm vi áp luật đọc từ eslint.config.mjs THẬT của kho (không dựng lại cấu hình trong test).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import plugin from "../index.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const eslint = new ESLint({ cwd: ROOT });
const MUOI = Object.keys(plugin.rules).map((r) => `quy-hang-ui/${r}`);
const luatGiaoDien = async (rel) => {
  const cfg = await eslint.calculateConfigForFile(join(ROOT, rel));
  return Object.fromEntries(Object.entries(cfg?.rules ?? {}).filter(([k]) => k.startsWith("quy-hang-ui/")));
};

describe("eslint.config.mjs áp luật quy-hang-ui", () => {
  it("mã giao diện của app: đủ mười bốn luật ở mức error", async () => {
    const got = await luatGiaoDien("apps/web/src/app/page.tsx");
    assert.equal(MUOI.length, 14);
    for (const r of MUOI) assert.equal(got[r]?.[0], 2, `${r} phải mức error (2) cho page.tsx`);
  });
  it("khối đã chuyển thể (components/blocks) chịu đủ mười bốn luật", async () => {
    const got = await luatGiaoDien("apps/web/src/components/blocks/khoi.tsx");
    for (const r of MUOI) assert.equal(got[r]?.[0], 2, `${r} phải mức error cho components/blocks`);
  });
  for (const vendor of ["apps/web/src/components/ui/button.tsx", "apps/web/src/components/reui/frame.tsx"]) {
    it(`thành phần cài nguyên bản không bị quét: ${vendor}`, async () => {
      assert.deepEqual(await luatGiaoDien(vendor), {});
    });
  }
});
