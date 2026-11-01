// Kiểm kiểu gói db (hàng va-nap-mau, E6): bộ nạp TypeScript nằm trong `npm run typecheck` của gốc kho — đúng lệnh job
// `check` của CI chạy. Chiều đỏ đo trên chính lệnh ấy, không chỉ trên `tsc -p packages/db`.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const GOC = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP_TAM = "packages/db/seed/__loi-kieu-tam.ts";
const chay = (lenh, args) => spawnSync(lenh, args, { cwd: GOC, encoding: "utf8" });

test("liet-tep: tsc của gói db phủ bộ nạp và bộ kiểm của nó", () => {
  const r = chay("npx", ["tsc", "-p", "packages/db", "--listFilesOnly"]);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const t of ["packages/db/seed/nap-ban-that.ts", "packages/db/seed/nap-ban-that.test.ts"]) {
    assert.ok(r.stdout.includes(path.join(GOC, t)), `tsc không phủ ${t}`);
  }
});

test("do-khi-loi-kieu: lỗi kiểu trong packages/db/seed làm npm run typecheck ở gốc đỏ", () => {
  writeFileSync(path.join(GOC, TEP_TAM), 'const x: number = "a";\nexport { x };\n');
  try {
    const r = chay("npm", ["run", "typecheck"]);
    assert.notEqual(r.status, 0, "npm run typecheck phải đỏ khi gói db có lỗi kiểu");
    assert.match(r.stdout + r.stderr, /__loi-kieu-tam\.ts/);
  } finally {
    rmSync(path.join(GOC, TEP_TAM), { force: true });
  }
  // Đối chứng dương: gỡ tệp tạm thì cùng lệnh xanh.
  const sach = chay("npm", ["run", "typecheck"]);
  assert.equal(sach.status, 0, sach.stdout + sach.stderr);
});
