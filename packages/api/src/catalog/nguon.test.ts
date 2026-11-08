// Nguồn danh mục (hàng 99) — E5, E9: bộ đọc giả cho từng trạng thái của vùng; tuyến tra mã thật với nguồn ném lỗi.
import { OpenAPIHono } from "@hono/zod-openapi";
import { lookupUnit, type CatalogData } from "@quy-hang/core";
import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";
import type { ApiDeps } from "../app";
import type { Auth } from "../auth/auth";
import { LOI_DOC_DANH_MUC, taoNguon, tenToa, type BoDocVung } from "./nguon";
import { registerCatalogRoutes } from "./routes";
import { SAMPLE_CATALOG } from "./sample";

const MA_MAU = SAMPLE_CATALOG.subdivisions[0]!.buildings[0]!.units[0]!.unitNumber;
const THAT: CatalogData = {
  subdivisions: [
    {
      subdivisionKey: "khu-that",
      subdivisionName: "[Mẫu] Khu thật",
      complexName: null,
      buildings: [
        {
          buildingKey: "T1",
          buildingName: "[Mẫu] Toà T1",
          units: [
            {
              upi: "urn:onehub:upi:thu:T1-09.09",
              unitNumber: "T1-09.09",
              stack: "09",
              floor: 9,
              livingArea: 71.5,
              bedroomsTotal: 2,
              directionFaces: "Đông",
              propertyType: "Residential",
              propertySubType: "Condominium",
            },
          ],
        },
      ],
    },
  ],
};

/** Khu mang khoá có cách đọc mã trong lõi (`UNIT_CODE_RULES`), dữ liệu riêng, không phải gói mẫu. */
const THAT_CO_CACH_DOC: CatalogData = {
  subdivisions: [
    {
      ...THAT.subdivisions[0]!,
      subdivisionKey: "mau-du-an-thu",
      buildings: [
        { buildingKey: "A", buildingName: "Toà A", units: [{ ...THAT.subdivisions[0]!.buildings[0]!.units[0]!, upi: "urn:onehub:upi:thu:A-09.09", unitNumber: "A-09.09" }] },
      ],
    },
  ],
};

/** Bộ đọc giả: `trangThai` đổi được giữa các lần đọc; `null` là ném lỗi. */
function boGia(ban: { soKhu: number; chuoi: string } | null) {
  const hop = { trangThai: ban };
  const bo: BoDocVung = {
    dau: async () => {
      if (!hop.trangThai) throw new Error("mất kết nối");
      return hop.trangThai;
    },
    docCa: async () => THAT,
  };
  return { hop, bo };
}
const CO_KHU = { soKhu: 1, chuoi: "1|a" };
const RONG = { soKhu: 0, chuoi: "0" };

test("vùng rỗng: đọc gói mẫu, mã mẫu ra found", async () => {
  const ban = await taoNguon(boGia(RONG).bo).doc();
  assert.equal(lookupUnit(ban.index, MA_MAU).status, "found");
});

test("vùng có một khu mang cách đọc mã: cùng mã mẫu thành not_in_catalog, gói mẫu tắt hẳn", async () => {
  const bo: BoDocVung = { ...boGia(CO_KHU).bo, docCa: async () => THAT_CO_CACH_DOC };
  const ban = await taoNguon(bo).doc();
  assert.equal(lookupUnit(ban.index, MA_MAU).status, "not_in_catalog");
  assert.equal(lookupUnit(ban.index, "A-09.09").status, "found");
});

test("vùng có một khu chưa có cách đọc mã: mã mẫu không còn found (không đọc được), mã của khu vẫn found", async () => {
  const ban = await taoNguon(boGia(CO_KHU).bo).doc();
  assert.equal(lookupUnit(ban.index, MA_MAU).status, "unreadable");
  assert.equal(lookupUnit(ban.index, "T1-09.09").status, "found");
});

test("đọc lỗi khi đang giữ bản thật: trả bản ấy, không phải gói mẫu", async () => {
  const { hop, bo } = boGia(CO_KHU);
  const nguon = taoNguon(bo);
  await nguon.doc();
  hop.trangThai = null;
  const ban = await nguon.doc();
  assert.equal(ban.catalog, THAT);
});

test("đọc lỗi khi chưa giữ bản nào: ném, không trả gói mẫu", async () => {
  await assert.rejects(taoNguon(boGia(null).bo).doc(), /mất kết nối/);
});

test("vùng rỗng đang dùng gói mẫu rồi đọc lỗi: ném, gói mẫu không phải bản giữ", async () => {
  const { hop, bo } = boGia(RONG);
  const nguon = taoNguon(bo);
  await nguon.doc();
  hop.trangThai = null;
  await assert.rejects(nguon.doc(), /mất kết nối/);
});

test("từng có bản thật, vùng thành rỗng rồi lỗi: không dùng lại bản cũ", async () => {
  const { hop, bo } = boGia(CO_KHU);
  const nguon = taoNguon(bo);
  await nguon.doc();
  hop.trangThai = RONG;
  assert.equal((await nguon.doc()).catalog, SAMPLE_CATALOG);
  hop.trangThai = null;
  await assert.rejects(nguon.doc(), /mất kết nối/);
});

test("dấu không đổi: không dựng lại; dấu đổi: dựng lại (đối chứng dương)", async () => {
  const { hop, bo } = boGia(CO_KHU);
  const nguon = taoNguon(bo);
  await nguon.doc();
  await nguon.doc();
  assert.equal(nguon.soLanDung(), 1);
  hop.trangThai = { soKhu: 1, chuoi: "1|b" };
  await nguon.doc();
  assert.equal(nguon.soLanDung(), 2);
});

test("tên toà: không trùng, theo thứ tự chữ", () => {
  assert.deepEqual(tenToa(THAT), ["[Mẫu] Toà T1"]);
});

/** Tuyến tra mã thật, cửa vào qua được: một sàn. */
function appVoi(bo: BoDocVung) {
  const client = {
    query: async (sql: string) => ({ rows: sql.includes("from companies") ? [{ id: "00000000-0000-4000-8000-000000000001", name: "[Tên sàn]", roles: ["admin"] }] : [] }),
    release: () => {},
  };
  const pool = { connect: async () => client } as unknown as pg.Pool;
  const auth = { api: { getSession: async () => ({ user: { id: "nguoi-mau-1" } }) } } as unknown as Auth;
  const app = new OpenAPIHono();
  registerCatalogRoutes(app, { appPool: pool, identityPool: pool, auth } as ApiDeps, taoNguon(bo));
  return app;
}

test("tuyến tra mã, nguồn ném: 500 có mã lỗi, thân không có thuộc tính gói mẫu", async () => {
  const res = await appVoi(boGia(null).bo).request(`/api/v1/catalog/units/${MA_MAU}`);
  assert.equal(res.status, 500);
  const chu = await res.text();
  assert.deepEqual(JSON.parse(chu), { error: LOI_DOC_DANH_MUC.code });
  assert.ok(!chu.includes(MA_MAU), "thân trả chứa mã của gói mẫu");
});

test("tuyến tra mã, bộ đọc lành: 200 với dữ liệu (đối chứng dương)", async () => {
  const res = await appVoi(boGia(CO_KHU).bo).request("/api/v1/catalog/units/T1-09.09");
  assert.equal(res.status, 200);
  assert.equal(((await res.json()) as { status: string }).status, "found");
});
