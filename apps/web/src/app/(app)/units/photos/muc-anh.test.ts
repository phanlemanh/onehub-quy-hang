// Ảnh không lưu trên máy (hàng 18: phần web của E6). Đọc mã nguồn thật: mục Ảnh không nhập bộ đồng bộ hay IndexedDB, và
// bộ đồng bộ không kéo đường ảnh nào.
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ANH = fileURLToPath(new URL(".", import.meta.url));
const SYNC = fileURLToPath(new URL("../../../../lib/sync/", import.meta.url));

function quet(anh: string, sync: string): string[] {
  const loi: string[] = [];
  for (const ten of readdirSync(anh).filter((t) => /\.tsx?$/.test(t) && !t.endsWith(".test.ts"))) {
    const t = readFileSync(join(anh, ten), "utf8");
    if (/from\s+["'][^"']*lib\/sync/.test(t)) loi.push(`${ten}: nhập bộ đồng bộ`);
    if (/indexedDB|localStorage|caches\.open/.test(t)) loi.push(`${ten}: chạm bộ nhớ trình duyệt`);
  }
  for (const ten of readdirSync(sync).filter((t) => /\.tsx?$/.test(t) && !/\.test(-helpers)?\.ts$/.test(t))) {
    if (/units\/photos/.test(readFileSync(join(sync, ten), "utf8"))) loi.push(`lib/sync/${ten}: kéo ảnh`);
  }
  return loi;
}

test("E6 phía web: mục Ảnh không qua bộ đồng bộ, không IndexedDB; bản sao thêm một dòng nhập thì bị gọi tên", () => {
  assert.deepEqual(quet(ANH, SYNC), []);
  const sao = mkdtempSync(join(tmpdir(), "quet-anh-"));
  cpSync(ANH, sao, { recursive: true });
  const muc = join(sao, "muc-anh.tsx");
  writeFileSync(muc, `import { useBoDongBo } from "@/lib/sync/react";\n${readFileSync(muc, "utf8")}`);
  assert.deepEqual(quet(sao, SYNC), ["muc-anh.tsx: nhập bộ đồng bộ"]);
});
