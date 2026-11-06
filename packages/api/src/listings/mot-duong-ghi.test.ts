// AC-3 (ADR-0008): câu ghi vào bảng hàng và bảng sự kiện chỉ nằm ở packages/api/src/listings/ — không đường ghi nào
// ngoài lệnh API. Lớp cơ sở dữ liệu (hàm, trigger) đo ở packages/db/tests/isolation.test.mjs.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const GOC = fileURLToPath(new URL("../../../..", import.meta.url));
const NOI_DUOC_GHI = "packages/api/src/listings/";
/**
 * Ngoại lệ có tên duy nhất: cửa hẹp chuyển nhãn trạng thái của quản trị (migration 049, hàng trang-thai-rieng — chủ kho chốt
 * «Cửa hẹp, mig 049» sau luật 046). Hàm chỉ ghi bước gấp «đổi nhãn tại chỗ»; lớp cơ sở dữ liệu đo ở bộ kiểm cách ly.
 */
const TEP_NGOAI_LE = ["packages/db/migrations/049_cua_hep_nhan_trang_thai.sql"];
const BANG = "(?:public\\.)?(?:listings|listing_events)\\b";
/** Câu SQL ghi, và dạng bộ dựng câu (insertInto("listings"), updateTable(…), deleteFrom(…)). */
const MAU = [
  new RegExp(`\\b(?:insert\\s+into|update|delete\\s+from)\\s+${BANG}`, "i"),
  new RegExp(`\\b(?:insertInto|updateTable|update|deleteFrom)\\(\\s*["'\`]${BANG}`),
];

function tep(dir: string): string[] {
  let ds: import("node:fs").Dirent[];
  try {
    ds = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return ds.flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return d.name === "node_modules" || d.name.startsWith(".") ? [] : tep(p);
    return /\.(ts|tsx|mjs|sql)$/.test(d.name) && !/\.test\.(ts|mjs)$/.test(d.name) ? [p] : [];
  });
}

export function quetDuongGhi(goc: string): string[] {
  const goi = readdirSync(join(goc, "packages"), { withFileTypes: true }).filter((d) => d.isDirectory());
  const ds = [
    ...goi.flatMap((g) => tep(join(goc, "packages", g.name, "src"))),
    ...tep(join(goc, "packages/db/scripts")),
    ...tep(join(goc, "packages/db/migrations")),
    ...tep(join(goc, "apps/web/src")),
  ];
  const out: string[] = [];
  for (const p of ds) {
    const rel = relative(goc, p).split("\\").join("/");
    if (rel.startsWith(NOI_DUOC_GHI) || TEP_NGOAI_LE.includes(rel)) continue;
    readFileSync(p, "utf8")
      .split("\n")
      .forEach((dong, i) => {
        if (MAU.some((m) => m.test(dong))) out.push(`${rel}:${i + 1}`);
      });
  }
  return out;
}

test("đường ghi hàng chỉ ở packages/api/src/listings", () => {
  const ds = quetDuongGhi(GOC);
  assert.deepEqual(ds, [], `câu ghi vào hàng ngoài ${NOI_DUOC_GHI}`);
  // Phép quét thật sự thấy câu ghi trong thư mục được phép — không phải quét trúng thư mục rỗng.
  const store = readFileSync(join(GOC, NOI_DUOC_GHI, "store.ts"), "utf8");
  assert.ok(MAU[0]!.test(store), "phép quét không thấy câu ghi của chính lệnh API");
});

test("đường ghi hàng: đối chứng dương trên cây mẫu", () => {
  const goc = mkdtempSync(join(tmpdir(), "duong-ghi-"));
  for (const d of ["packages/api/src/listings", "packages/connect/src", "packages/db/migrations", "apps/web/src"]) mkdirSync(join(goc, d), { recursive: true });
  writeFileSync(join(goc, "packages/api/src/listings/store.ts"), "await tx.query('insert into listing_events (x) values (1)');\n");
  writeFileSync(join(goc, "packages/db/migrations/009_x.sql"), "create table listings (id uuid);\ngrant select, insert, update on listings to quy_hang_app;\n");
  assert.deepEqual(quetDuongGhi(goc), [], "cây lành bị tính vi phạm");
  writeFileSync(join(goc, "packages/connect/src/nap.ts"), "const a = 1;\nawait db.query(`insert into listing_events values (1)`);\n");
  writeFileSync(join(goc, "apps/web/src/hong.ts"), 'await db.insertInto("listings").values(x);\n');
  assert.deepEqual(quetDuongGhi(goc).sort(), ["apps/web/src/hong.ts:1", "packages/connect/src/nap.ts:2"]);
});
