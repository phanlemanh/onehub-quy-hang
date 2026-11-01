// Đọc cả danh mục (hàng 14, hồ sơ bang-hang-kieu-sheet) — E1. Cơ sở dữ liệu thay bằng kết nối giả trả danh sách sàn của
// người: luật vào chỉ cần biết người thuộc mấy sàn; cổng theo dòng thật đã có ở packages/api/test-db/catalog.
import assert from "node:assert/strict";
import { test } from "node:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { CatalogData } from "@quy-hang/core";
import type pg from "pg";
import type { ApiDeps } from "../app";
import type { Auth } from "../auth/auth";
import { registerCatalogReadAll } from "./doc-ca-danh-muc";

const SAN_1 = "00000000-0000-4000-8000-000000000001";
const SAN_2 = "00000000-0000-4000-8000-000000000002";

/** Kết nối giả: câu đọc danh sách sàn trả `san`; mọi câu khác (begin, set role, commit) trả rỗng. */
function poolGia(san: string[]): pg.Pool {
  const client = {
    query: async (sql: string) => ({ rows: sql.includes("from companies") ? san.map((id) => ({ id, name: `[Tên sàn] ${id.slice(-1)}`, roles: ["listing_agent"] })) : [] }),
    release: () => {},
  };
  return { connect: async () => client } as unknown as pg.Pool;
}

const coPhien = { api: { getSession: async () => ({ user: { id: "nguoi-mau-1" } }) } } as unknown as Auth;
const khongPhien = { api: { getSession: async () => null } } as unknown as Auth;

/** Danh mục đưa vào — dựng tay, có một khoá lạ chèn thêm để chứng thân trả không chở khoá ngoài khuôn. */
const DANH_MUC = {
  subdivisions: [
    {
      subdivisionKey: "mau",
      subdivisionName: "[Mẫu] Khu",
      complexName: null,
      buildings: [
        {
          buildingKey: "A",
          buildingName: "Toà A",
          units: [
            { upi: "urn:mau:A-01.01", unitNumber: "A-01.01", stack: "01", floor: 1, livingArea: 54.2, bedroomsTotal: 1, directionFaces: "Đông Nam", ownerPhone: "0900 000 001" },
            { upi: "urn:mau:A-01.02", unitNumber: "A-01.02", stack: "02", floor: 1, livingArea: null, bedroomsTotal: 0, directionFaces: null },
          ],
        },
      ],
    },
  ],
} as unknown as CatalogData;

function api(auth: Auth, san: string[]) {
  const app = new OpenAPIHono();
  const pool = poolGia(san);
  registerCatalogReadAll(app, { appPool: pool, identityPool: pool, auth } as ApiDeps, DANH_MUC);
  return app;
}

/** Khoá được phép ở từng tầng của khuôn danh mục — viết tay, không rút từ mã đang đo. */
const KHOA_DUOC = new Set([
  "subdivisions", "subdivisionKey", "subdivisionName", "complexName", "buildings", "buildingKey", "buildingName", "units",
  "upi", "unitNumber", "stack", "floor", "livingArea", "bedroomsTotal", "directionFaces",
]);
function khoaLa(v: unknown, ra: string[] = []): string[] {
  if (Array.isArray(v)) v.forEach((x) => khoaLa(x, ra));
  else if (v && typeof v === "object")
    for (const [k, x] of Object.entries(v)) {
      if (!KHOA_DUOC.has(k)) ra.push(k);
      khoaLa(x, ra);
    }
  return ra;
}

test("đọc cả danh mục: thành viên một sàn nhận đúng danh mục, chỉ khoá của khuôn", async () => {
  const res = await api(coPhien, [SAN_1]).request("/api/v1/catalog");
  assert.equal(res.status, 200);
  const than = (await res.json()) as CatalogData;
  assert.deepEqual(khoaLa(than), [], "thân trả có khoá ngoài khuôn danh mục");
  const u = than.subdivisions[0]?.buildings[0]?.units ?? [];
  assert.equal(u.length, 2);
  assert.deepEqual(Object.keys(u[0] ?? {}).sort(), ["bedroomsTotal", "directionFaces", "floor", "livingArea", "stack", "unitNumber", "upi"]);
  assert.deepEqual(u[0], { upi: "urn:mau:A-01.01", unitNumber: "A-01.01", stack: "01", floor: 1, livingArea: 54.2, bedroomsTotal: 1, directionFaces: "Đông Nam" });
  assert.equal(u[1]?.bedroomsTotal, 0);
});

test("đối chứng đỏ: hàm quét khoá bắt được khoá lạ", () => {
  assert.deepEqual(khoaLa(DANH_MUC), ["ownerPhone"]);
});

test("đọc cả danh mục: cùng luật vào với tra mã căn — 401, 403, 409", async () => {
  const r401 = await api(khongPhien, [SAN_1]).request("/api/v1/catalog");
  assert.equal(r401.status, 401);
  assert.deepEqual(await r401.json(), { error: "unauthenticated" });
  const r403 = await api(coPhien, []).request("/api/v1/catalog");
  assert.equal(r403.status, 403);
  assert.deepEqual(await r403.json(), { error: "no-company" });
  const r409 = await api(coPhien, [SAN_1, SAN_2]).request("/api/v1/catalog");
  assert.equal(r409.status, 409);
  assert.deepEqual(await r409.json(), { error: "select-company" });
  const chon = await api(coPhien, [SAN_1, SAN_2]).request("/api/v1/catalog", { headers: { cookie: `qh_san=${SAN_2}` } });
  assert.equal(chon.status, 200);
});
