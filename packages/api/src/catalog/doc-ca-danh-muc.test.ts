// Đọc cả danh mục (hàng 14, hồ sơ bang-hang-kieu-sheet) — E1. Cơ sở dữ liệu thay bằng kết nối giả trả danh sách sàn của
// người: luật vào chỉ cần biết người thuộc mấy sàn; cổng theo dòng thật đã có ở packages/api/test-db/catalog.
import assert from "node:assert/strict";
import { test } from "node:test";
import { OpenAPIHono } from "@hono/zod-openapi";
import { buildLotIndex, lookupLot, type CatalogData, type LotCatalogData } from "@quy-hang/core";
import { readFileSync } from "node:fs";
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
            { upi: "urn:mau:A-01.01", unitNumber: "A-01.01", stack: "01", floor: 1, livingArea: 54.2, bedroomsTotal: 1, directionFaces: "Đông Nam", propertyType: "Residential", propertySubType: "Condominium", ownerPhone: "0900 000 001" },
            { upi: "urn:mau:A-01.02", unitNumber: "A-01.02", stack: "02", floor: 1, livingArea: null, bedroomsTotal: 0, directionFaces: null, propertyType: "Residential", propertySubType: "Condominium" },
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
  "upi", "unitNumber", "stack", "floor", "livingArea", "bedroomsTotal", "directionFaces", "propertyType", "propertySubType",
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
  assert.deepEqual(Object.keys(u[0] ?? {}).sort(), ["bedroomsTotal", "directionFaces", "floor", "livingArea", "propertySubType", "propertyType", "stack", "unitNumber", "upi"]);
  assert.deepEqual(u[0], { upi: "urn:mau:A-01.01", unitNumber: "A-01.01", stack: "01", floor: 1, livingArea: 54.2, bedroomsTotal: 1, directionFaces: "Đông Nam", propertyType: "Residential", propertySubType: "Condominium" });
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

// ——— Hàng 79 (bang-hang-theo-loai-hinh) E7a: khu thấp tầng của danh mục lô nối vào đường đọc cả danh mục ———

/** Danh mục lô mẫu — rút nguyên từ dữ liệu mẫu thấp tầng (hàng 73), không chép tay; chèn hai khoá lạ để chứng khuôn chặt. */
const MAU_THAP_TANG = JSON.parse(
  readFileSync(new URL("../../../db/seed/mau-thap-tang/du-lieu-mau-thap-tang.json", import.meta.url), "utf8"),
) as { danhMucThapTang: LotCatalogData };
function danhMucLoMau(): LotCatalogData {
  const lo = structuredClone(MAU_THAP_TANG.danhMucThapTang) as unknown as { subdivisions: { blocks: { units: Record<string, unknown>[] }[] }[] };
  lo.subdivisions[0]!.blocks[0]!.units[0]!.ownerPhone = "0900 000 001";
  lo.subdivisions[0]!.blocks[0]!.units[0]!.khoaLa = "x";
  return lo as unknown as LotCatalogData;
}
function apiLo(lots?: LotCatalogData) {
  const app = new OpenAPIHono();
  const pool = poolGia([SAN_1]);
  registerCatalogReadAll(app, { appPool: pool, identityPool: pool, auth: coPhien } as ApiDeps, DANH_MUC, lots);
  return app;
}
const KHOA_LO = new Set([...KHOA_DUOC, "blocks", "blockKey", "blockName", "nhanSan", "lotSizeArea", "storiesTotal", "frontageLength", "accessRoadWidth"]);
const khoaLaLo = (v: unknown): string[] => khoaLa(v).filter((k) => !KHOA_LO.has(k));

test("E7a: danh mục lô mặc định — thân trả giữ đúng khuôn cũ, không khu thấp tầng nào", async () => {
  const than = (await (await apiLo().request("/api/v1/catalog")).json()) as CatalogData;
  assert.equal(than.subdivisions.length, 1);
  assert.equal("blocks" in than.subdivisions[0]!, false, "khu có toà không mang khoá blocks");
  assert.deepEqual(khoaLa(than), []);
});

test("E7a: danh mục lô mẫu — khu thấp tầng mang dãy và lô với trường thấp tầng, khoá lạ và khoá nguồn không lọt", async () => {
  const than = (await (await apiLo(danhMucLoMau()).request("/api/v1/catalog")).json()) as CatalogData;
  assert.equal(than.subdivisions.length, 2);
  assert.deepEqual(Object.keys(than.subdivisions[0]!.buildings[0]!.units[0]!).sort(), ["bedroomsTotal", "directionFaces", "floor", "livingArea", "propertySubType", "propertyType", "stack", "unitNumber", "upi"], "khuôn căn hộ giữ chín khoá");
  const khu = than.subdivisions[1]!;
  assert.deepEqual(khu.buildings, []);
  const mau = MAU_THAP_TANG.danhMucThapTang.subdivisions[0]!;
  assert.equal(khu.subdivisionName, mau.subdivisionName);
  assert.deepEqual(khu.blocks!.map((b) => b.blockKey), mau.blocks!.map((b) => b.blockKey));
  assert.deepEqual(khoaLaLo(than), [], "thân trả có khoá ngoài khuôn danh mục lô");
  const chu = JSON.stringify(than);
  assert.ok(!chu.includes("0900 000 001") && !chu.includes("khoaLa"), "khoá nguồn hay khoá lạ của gói vào lọt ra thân trả");
  // Round-trip: bên đọc là chính hàm đọc lô của lõi mà Bảng hàng dùng.
  const idx = buildLotIndex(than as unknown as LotCatalogData);
  const lo = lookupLot(idx, "LK1-01", khu.subdivisionKey);
  assert.equal(lo.status, "found", JSON.stringify(lo));
  const goc = mau.blocks![0]!.units.find((u) => u.unitNumber === "LK1-01")!;
  if (lo.status === "found") {
    assert.equal(lo.unit.propertySubType, "Townhouse");
    assert.equal(lo.unit.lotSizeArea, goc.lotSizeArea);
    assert.equal(lo.unit.storiesTotal, goc.storiesTotal);
    assert.equal(lo.unit.frontageLength, goc.frontageLength);
    assert.equal(lo.unit.accessRoadWidth, goc.accessRoadWidth);
  }
});

test("E7a đối chứng đỏ: hàm quét khoá của lô bắt được khoá nguồn chèn vào gói", () => {
  const la = khoaLaLo(danhMucLoMau());
  assert.ok(la.includes("ownerPhone") && la.includes("khoaLa"), `quét khoá phải bắt ownerPhone và khoaLa, được ${la.join(", ")}`);
});
