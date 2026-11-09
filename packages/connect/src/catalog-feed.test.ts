import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { CatalogData } from "@quy-hang/core";
import { CATALOG_FEED_SCHEMA_VERSION, parseCatalogFeed } from "./catalog-feed";

const condo = {
  upi: "urn:onehub:upi:thu:a:2305",
  unitNumber: "A.2305",
  stack: "05",
  floor: 23,
  livingArea: 42.9,
  bedroomsTotal: 1,
  directionFaces: "Đông Nam",
  propertyType: "Residential",
  propertySubType: "Condominium",
};

const townhouse = {
  upi: "urn:onehub:upi:thu:lk:07",
  unitNumber: "LK-07",
  stack: null,
  floor: null,
  livingArea: 240,
  bedroomsTotal: 4,
  directionFaces: "Nam",
  propertyType: "Residential",
  propertySubType: "Townhouse",
  lotSizeArea: 90,
  storiesTotal: 4,
  frontageLength: 6,
  accessRoadWidth: 13.5,
};

/** Gói mẫu: 2 khu, 3 toà; căn hộ đủ chín trường, nhà phố đủ bốn trường thấp tầng. */
const mau = () => ({
  schemaVersion: 1,
  provider: "[Mẫu] Nguồn danh mục thử",
  measuredAt: "2026-10-29T08:00:00+07:00",
  subdivisions: [
    {
      subdivisionKey: "thu-khu-1",
      subdivisionName: "[Mẫu] Khu căn hộ",
      complexName: null,
      buildings: [
        { buildingKey: "a", buildingName: "Toà A", units: [structuredClone(condo)] },
        {
          buildingKey: "b",
          buildingName: "Toà B",
          units: [{ ...structuredClone(condo), upi: "urn:onehub:upi:thu:b:1201", unitNumber: "B.1201", floor: 12, stack: "01" }],
        },
      ],
    },
    {
      subdivisionKey: "thu-khu-2",
      subdivisionName: "[Mẫu] Khu liền kề",
      complexName: "[Mẫu] Phân khu 1",
      buildings: [{ buildingKey: "lk", buildingName: "Dãy LK", units: [structuredClone(townhouse)] }],
    },
  ],
});

const unitPath = (i: number, j: number, k: number) => ["subdivisions", i, "buildings", j, "units", k];

test("khuôn v1: gói mẫu đúng khuôn đọc ra đủ khu, toà, căn", () => {
  assert.equal(CATALOG_FEED_SCHEMA_VERSION, 1);
  const goi = mau();
  const r = parseCatalogFeed(goi);
  assert.ok(r.ok, JSON.stringify(!r.ok && r.errors));
  assert.equal(r.feed.subdivisions.length, 2);
  assert.equal(r.feed.subdivisions.flatMap((s) => s.buildings).length, 3);
  assert.equal(r.feed.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units)).length, 3);
  assert.deepEqual(r.feed, goi);
  const nhaPho = r.feed.subdivisions[1]!.buildings[0]!.units[0]!;
  const thapTang = [nhaPho.lotSizeArea, nhaPho.storiesTotal, nhaPho.frontageLength, nhaPho.accessRoadWidth];
  assert.ok(thapTang.every((v) => v !== null && v !== undefined), "bốn trường thấp tầng phải khác null");
  assert.equal(new Set(thapTang).size, 4, "bốn trường thấp tầng phải khác nhau");

  const v0 = parseCatalogFeed({ ...mau(), schemaVersion: 0 });
  assert.equal(v0.ok, false, "gói phiên bản 0 phải bị từ chối");
});

test("khuôn v1: dữ liệu mẫu của lõi đổi sang khuôn rồi đọc lại", () => {
  const tep = fileURLToPath(new URL("../../db/seed/mau/du-lieu-mau.json", import.meta.url));
  const loi = (JSON.parse(readFileSync(tep, "utf8")) as { danhMuc: CatalogData }).danhMuc;
  const r = parseCatalogFeed({
    schemaVersion: 1,
    provider: "[Mẫu]",
    measuredAt: "2026-10-30T00:00:00+07:00",
    subdivisions: loi.subdivisions,
  });
  assert.ok(r.ok, JSON.stringify(!r.ok && r.errors.slice(0, 3)));
  const khoa = (xs: readonly object[]) => [...new Set(xs.flatMap((x) => Object.keys(x)))].sort();
  const khuLoi = loi.subdivisions;
  const khuKhuon = r.feed.subdivisions;
  assert.deepEqual(khoa(khuKhuon), khoa(khuLoi), "khoá cấp khu");
  assert.deepEqual(khoa(khuKhuon.flatMap((s) => s.buildings)), khoa(khuLoi.flatMap((s) => s.buildings)), "khoá cấp toà");
  assert.deepEqual(
    khoa(khuKhuon.flatMap((s) => s.buildings.flatMap((b) => b.units))),
    khoa(khuLoi.flatMap((s) => s.buildings.flatMap((b) => b.units))),
    "khoá cấp căn",
  );
  assert.ok(khuLoi.flatMap((s) => s.buildings.flatMap((b) => b.units)).length > 0, "dữ liệu mẫu phải có căn");
});

test("khuôn v1: luật loại hình nằm trong khuôn", () => {
  const maTran: { ten: string; sua: (g: ReturnType<typeof mau>) => void; path: (string | number)[]; truong: string }[] = [
    {
      ten: "Residential/Land",
      sua: (g) => Object.assign(g.subdivisions[0]!.buildings[0]!.units[0]!, { propertySubType: "Land" }),
      path: [...unitPath(0, 0, 0), "propertySubType"],
      truong: "Land",
    },
    {
      ten: "căn hộ mang lotSizeArea",
      sua: (g) => Object.assign(g.subdivisions[0]!.buildings[1]!.units[0]!, { lotSizeArea: 50 }),
      path: [...unitPath(0, 1, 0), "lotSizeArea"],
      truong: "lotSizeArea",
    },
    {
      ten: "nhà phố mang stack",
      sua: (g) => Object.assign(g.subdivisions[1]!.buildings[0]!.units[0]!, { stack: "01" }),
      path: [...unitPath(1, 0, 0), "stack"],
      truong: "stack",
    },
  ];
  let soLanSo = 0;
  for (const pt of maTran) {
    const g = mau();
    pt.sua(g);
    const r = parseCatalogFeed(g);
    assert.ok(!r.ok, `${pt.ten}: phải bị từ chối`);
    assert.equal(r.errors.length, 1, `${pt.ten}: đúng một lỗi, có ${JSON.stringify(r.errors)}`);
    assert.deepEqual(r.errors[0]!.path, pt.path, pt.ten);
    assert.ok(r.errors[0]!.message.includes(pt.truong), `${pt.ten}: message phải nêu «${pt.truong}»: ${r.errors[0]!.message}`);
    soLanSo++;
  }
  assert.equal(soLanSo, 3);
  assert.ok(parseCatalogFeed(mau()).ok, "đối chứng dương: gói lành nhận");
});

test("khuôn v1: khoá lạ ở từng cấp bị từ chối, nêu đúng đường khoá", () => {
  const maTran: { khoa: string; path: (string | number)[]; gan: (g: ReturnType<typeof mau>) => object }[] = [
    { khoa: "extra", path: [], gan: (g) => g },
    { khoa: "ownerName", path: ["subdivisions", 1], gan: (g) => g.subdivisions[1]! },
    { khoa: "note", path: ["subdivisions", 0, "buildings", 1], gan: (g) => g.subdivisions[0]!.buildings[1]! },
    { khoa: "ownerPhone", path: unitPath(1, 0, 0), gan: (g) => g.subdivisions[1]!.buildings[0]!.units[0]! },
  ];
  for (const pt of maTran) {
    const g = mau();
    Object.assign(pt.gan(g), { [pt.khoa]: "[Mẫu]" });
    const r = parseCatalogFeed(g);
    assert.ok(!r.ok, `${pt.khoa}: phải bị từ chối`);
    const loi = r.errors.find((e) => e.message.includes(pt.khoa));
    assert.ok(loi, `${pt.khoa}: lỗi phải nêu khoá, có ${JSON.stringify(r.errors)}`);
    assert.deepEqual(loi.path, pt.path, pt.khoa);
  }
  assert.ok(parseCatalogFeed(mau()).ok, "đối chứng dương: gói lành nhận");
});

test("khuôn v1: phiên bản sai và UPI trùng bị từ chối", () => {
  for (const v of [0, 3, undefined]) {
    const g: Record<string, unknown> = mau();
    if (v === undefined) delete g.schemaVersion;
    else g.schemaVersion = v;
    const r = parseCatalogFeed(g);
    assert.ok(!r.ok, `schemaVersion ${String(v)}: phải bị từ chối`);
    assert.deepEqual(r.errors.map((e) => e.path), [["schemaVersion"]], `schemaVersion ${String(v)}`);
  }

  const trungUpi = mau();
  trungUpi.subdivisions[0]!.buildings[1]!.units[0]!.upi = condo.upi;
  const r1 = parseCatalogFeed(trungUpi);
  assert.ok(!r1.ok, "UPI trùng ở hai toà phải bị từ chối");
  assert.equal(r1.errors.length, 1);
  assert.deepEqual(r1.errors[0]!.path, [...unitPath(0, 1, 0), "upi"]);
  assert.ok(r1.errors[0]!.message.includes(condo.upi), r1.errors[0]!.message);

  const trungKhu = mau();
  trungKhu.subdivisions[1]!.subdivisionKey = "thu-khu-1";
  const r2 = parseCatalogFeed(trungKhu);
  assert.ok(!r2.ok, "khoá khu trùng phải bị từ chối");
  assert.equal(r2.errors.length, 1);
  assert.deepEqual(r2.errors[0]!.path, ["subdivisions", 1, "subdivisionKey"]);
  assert.ok(r2.errors[0]!.message.includes("thu-khu-1"), r2.errors[0]!.message);

  assert.ok(parseCatalogFeed(mau()).ok, "đối chứng dương: gói lành nhận");
});
