// va-pool-nghe-loi AC-7: chỗ duy nhất dựng Pool/Client của pg trong mã chạy của máy chủ web là dungPools
// (apps/web/src/lib/api.ts) — mọi bể kết nối đều qua lưới nghe lỗi. Cặp hai chiều trên `soi`.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const GOC = ["apps/web/src", "packages/api/src"];
const RE_DUNG = /\bnew\s+(?:pg\.)?(?:Pool|Client)\s*\(/;

export function soi(tepGoc) {
  return Object.keys(tepGoc)
    .sort()
    .filter((p) => tepGoc[p].split("\n").some((l) => !/^\s*(\/\/|\*|\/\*)/.test(l) && RE_DUNG.test(l)));
}

function cayThat() {
  const tep = {};
  const di = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (e.name !== "test-db" && e.name !== "node_modules") di(p);
      } else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) tep[relative(ROOT, p)] = readFileSync(p, "utf8");
    }
  };
  for (const g of GOC) di(join(ROOT, g));
  return tep;
}

test("nơi dựng pool: cây thật — chỗ duy nhất dựng Pool/Client của pg là dungPools", () => {
  const kq = soi(cayThat());
  assert.deepEqual(kq, ["apps/web/src/lib/api.ts"], `nơi dựng pool: dựng Pool/Client ngoài dungPools: ${kq.join(", ")}`);
});

test("nơi dựng pool: chiều đỏ — chỗ dựng lạ bị gọi tên", () => {
  const kq = soi({
    "apps/web/src/lib/api.ts": "const appPool = new pg.Pool({ connectionString: url });",
    "packages/api/src/la.ts": "const c = new Client({ connectionString });",
    "apps/web/src/khac.ts": "const p = new pg.Pool();",
    "packages/api/src/kieu.ts": "export function f(client: pg.ClientBase) {}",
    "packages/api/src/chu-thich.ts": "// new pg.Pool() trong chú thích",
  });
  assert.deepEqual(kq, ["apps/web/src/khac.ts", "apps/web/src/lib/api.ts", "packages/api/src/la.ts"], "nơi dựng pool: không gọi tên chỗ dựng lạ");
});
