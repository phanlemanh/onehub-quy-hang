// Một cửa truy vấn — lớp mã nguồn (AC-8, E8). Lớp thời chạy ở test-db/api.test.ts.
// «Gọi truy vấn» ở đây là mở kết nối hay chạy câu thẳng trên pool, hoặc dựng Pool/Client mới. Câu chạy trên client do
// withCompany trao (đã đặt vai quy_hang_app) là đi qua cửa, nên không bị tính.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

/** Tệp được phép: cửa của bảng công ty, và phần danh tính (chỉ chạm schema identity). */
const ALLOWED = new Set(["db.ts", "auth/otp-limit.ts", "auth/accounts.ts", "auth/may-bi-bao.ts"]);
const POOL_CALL = /\b\w*[Pp]ool\.(query|connect)\(|new\s+(?:pg\.)?(?:Pool|Client)\(/;

export function scanQueries(dir: string): { file: string; line: number }[] {
  const out: { file: string; line: number }[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith(".ts") && !p.endsWith(".test.ts")) {
        const rel = relative(dir, p).split("\\").join("/");
        if (ALLOWED.has(rel)) continue;
        readFileSync(p, "utf8")
          .split("\n")
          .forEach((text, i) => {
            if (!text.trim().startsWith("//") && POOL_CALL.test(text)) out.push({ file: rel, line: i + 1 });
          });
      }
    }
  };
  walk(dir);
  return out;
}

const SRC = fileURLToPath(new URL(".", import.meta.url));

test("một cửa truy vấn: mã nguồn", () => {
  assert.deepEqual(scanQueries(SRC), [], "có truy vấn ngoài cửa withCompany");
  const exports = readFileSync(join(SRC, "db.ts"), "utf8").match(/^export\s/gm) ?? [];
  assert.equal(exports.length, 1, "db.ts phải chỉ xuất một hàm");
});

test("một cửa truy vấn: đối chứng trên thư mục mẫu", () => {
  const dir = mkdtempSync(join(tmpdir(), "mot-cua-"));
  mkdirSync(join(dir, "routes"));
  writeFileSync(join(dir, "db.ts"), "export async function withCompany() { await pool.connect(); }\n");
  writeFileSync(join(dir, "routes/lanh.ts"), "await withCompany(pool, ctx, (tx) => tx.query('select 1'));\n");
  assert.deepEqual(scanQueries(dir), [], "tệp lành bị tính vi phạm");
  writeFileSync(join(dir, "routes/hong.ts"), "const r = await appPool.query('select * from companies');\n");
  assert.deepEqual(scanQueries(dir), [{ file: "routes/hong.ts", line: 1 }]);
});
