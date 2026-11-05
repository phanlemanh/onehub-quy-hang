// Đường tra mã lô thấp tầng (hàng 74, hồ sơ go-ma-lo) — E9. Bộ đăng nhập và kho giả, không Postgres: cổng vào theo sàn đã
// có bộ kiểm Postgres của hàng 9 cho cùng hàm vào cửa (cua-vao.ts).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { OpenAPIHono } from "@hono/zod-openapi";
import { LOT_ATTRIBUTE_FIELDS, type LotCatalogData } from "@quy-hang/core";
import type pg from "pg";
import { createApi } from "../app";
import type { Auth } from "../auth/auth";
import { registerLotRoutes } from "./lots";

/** Khu thấp tầng mẫu của hàng 73, đường suy từ vị trí tệp này. */
const KHU: LotCatalogData = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../../db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json", import.meta.url)), "utf8"),
).danhMucThapTang;

const SAN = { id: "00000000-0000-4000-8000-0000000000a1", name: "[Mẫu] Sàn thử", roles: ["dau_chu"] };
/** Kho giả: mọi câu lệnh của withCompany trả rỗng, câu đọc sàn trả đúng `san`. */
function khoGia(san: unknown[]): pg.Pool {
  const client = { query: async (sql: string) => ({ rows: /from companies/.test(sql) ? san : [] }), release() {} };
  return { connect: async () => client } as unknown as pg.Pool;
}
const dangNhap = (co: boolean) => ({ api: { getSession: async () => (co ? { user: { id: "u-mau" } } : null) } }) as unknown as Auth;

function appLo(co: boolean, san: unknown[]) {
  const api = new OpenAPIHono();
  registerLotRoutes(api, { appPool: khoGia(san), auth: dangNhap(co) }, KHU);
  return api;
}
const appDay = (co: boolean, san: unknown[]) => {
  const pool = khoGia(san);
  return createApi({ appPool: pool, identityPool: pool, auth: dangNhap(co) });
};

/** Hàm kiểm thân trả: unit chỉ mang trường đã khai. */
function kiemThan(than: { unit?: Record<string, unknown> }): string[] {
  const loi: string[] = [];
  for (const k of Object.keys(than.unit ?? {})) if (!(LOT_ATTRIBUTE_FIELDS as readonly string[]).includes(k)) loi.push(`trường ngoài danh sách: ${k}`);
  if (than.unit && Object.keys(than.unit).length !== LOT_ATTRIBUTE_FIELDS.length) loi.push("thiếu trường");
  return loi;
}

test("AC-9 đường tra lô: cửa vào giống hệt đường tra căn", async () => {
  for (const [co, san, ma, loi] of [
    [false, [SAN], 401, "unauthenticated"],
    [true, [], 403, "no-company"],
  ] as const) {
    const lo = await appLo(co, [...san]).request("/api/v1/catalog/lots/LK1-02");
    const can = await appDay(co, [...san]).request("/api/v1/catalog/units/A-12.06");
    assert.equal(lo.status, ma);
    assert.deepEqual(await lo.json(), { error: loi });
    assert.equal(can.status, lo.status);
    assert.deepEqual(await can.json(), { error: loi });
  }
});

test("AC-9 đường tra lô: found, not_in_catalog, unreadable; mặc định theo Hỏi-1", async () => {
  const api = appLo(true, [SAN]);
  const f = await api.request("/api/v1/catalog/lots/lk1%2002");
  assert.equal(f.status, 200);
  const than = (await f.json()) as { status: string; unit: Record<string, unknown> };
  assert.equal(than.status, "found");
  assert.equal(than.unit.unitNumber, "LK1-02");
  assert.equal(than.unit.blockName, "Dãy LK1");
  assert.deepEqual(Object.keys(than.unit).sort(), [...LOT_ATTRIBUTE_FIELDS].sort());
  assert.deepEqual(kiemThan(than), []);
  const n = (await (await api.request("/api/v1/catalog/lots/LK1-15")).json()) as { status: string };
  assert.equal(n.status, "not_in_catalog");
  const u = (await (await api.request("/api/v1/catalog/lots/ABC")).json()) as { status: string };
  assert.equal(u.status, "unreadable");
  // Mặc định (Hỏi-1): createApi không phục vụ lô mẫu.
  const macDinh = appDay(true, [SAN]);
  assert.deepEqual(await (await macDinh.request("/api/v1/catalog/lots/LK1-02")).json(), { status: "unreadable", input: "LK1-02", examples: [] });
  // Đường tra căn hộ vẫn như trước.
  const can = (await (await macDinh.request("/api/v1/catalog/units/A-12.06")).json()) as { status: string; unit: { unitNumber: string } };
  assert.equal(can.status, "found");
  assert.equal(can.unit.unitNumber, "A-12.06");
  const doc = (await (await macDinh.request("/api/v1/openapi.json")).json()) as { paths: Record<string, unknown> };
  assert.ok("/api/v1/catalog/lots/{code}" in doc.paths);
  // Phá thử.
  assert.deepEqual(kiemThan({ unit: { ...than.unit, listPrice: 1 } }), ["trường ngoài danh sách: listPrice", "thiếu trường"]);
});
