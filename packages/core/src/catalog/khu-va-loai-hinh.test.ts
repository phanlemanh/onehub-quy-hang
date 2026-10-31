// Khu và loại hình RESO (hàng 72, hồ sơ khu-va-loai-hinh) — E1, E6, E7, E8, E9.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { buildCatalogIndex, lookupUnit, UNIT_ATTRIBUTE_CLASS, UNIT_ATTRIBUTE_FIELDS } from "./lookup";
import { catalogFieldErrors, PROPERTY_SUBTYPE_FIELDS, unitFieldErrors } from "./property-type";
import type { CatalogData } from "./types";

/** Gốc kho suy từ vị trí tệp này (packages/core/src/catalog), không hằng. */
const GOC = fileURLToPath(new URL("../../../../", import.meta.url));
const TEP_NAY = fileURLToPath(import.meta.url);
const docMau = (): CatalogData => JSON.parse(readFileSync(path.join(GOC, "packages/db/seed/mau/du-lieu-mau.json"), "utf8")).danhMuc as CatalogData;

function moiTep(goc: string): string[] {
  const st = statSync(goc);
  if (st.isFile()) return [goc];
  return readdirSync(goc).flatMap((t) => (t === "node_modules" || t === ".next" ? [] : moiTep(path.join(goc, t))));
}

test("đổi tên khu: không còn tên dự án trong vùng danh mục", () => {
  const CHO = [
    "packages/core/src/catalog",
    "packages/api/src/catalog",
    "packages/api/test-db/catalog",
    "packages/db/seed",
    "apps/web/src",
    "CONTEXT.md",
    "docs/product/tham-chieu.md",
  ];
  const CAM = [/projectKey/, /projectName/, /"projects"/, /\bprojects:/, /\?project=/];
  const NGOAI_LE = { tep: "packages/api/test-db/catalog/catalog.test.ts", ca: "danh mục: tham số project cũ bị từ chối 400" };
  const MA = new Set(["packages/core/src/catalog", "packages/api/src/catalog", "packages/api/test-db/catalog", "packages/db/seed"]);
  const gap: string[] = [];
  let ngoaiLeGap = 0;
  for (const cho of CHO) {
    const tep = moiTep(path.join(GOC, cho)).filter((t) => /\.(ts|tsx|mjs|json|md)$/.test(t) && t !== TEP_NAY);
    assert.ok(tep.length > 0, `không đọc được tệp nào ở ${cho}`);
    let coTenMoi = false;
    for (const t of tep) {
      const rel = path.relative(GOC, t);
      const noi = readFileSync(t, "utf8");
      if (noi.includes("subdivisionKey")) coTenMoi = true;
      // Thân ca ngoại lệ: từ dòng test(«tên ca») tới dòng test( kế tiếp.
      const dong = noi.split("\n");
      let trongNgoaiLe = false;
      dong.forEach((d, i) => {
        if (/^test\(/.test(d)) trongNgoaiLe = rel === NGOAI_LE.tep && d.includes(NGOAI_LE.ca);
        for (const c of CAM) {
          if (!c.test(d)) continue;
          if (trongNgoaiLe && c.source === "\\?project=") ngoaiLeGap++;
          else gap.push(`${rel}:${i + 1}: ${d.trim()}`);
        }
      });
    }
    if (MA.has(cho)) assert.ok(coTenMoi, `${cho}: không tệp nào mang subdivisionKey`);
  }
  assert.deepEqual(gap, [], `còn tên cũ:\n${gap.join("\n")}`);
  assert.equal(ngoaiLeGap, 1, "ca «tham số project cũ bị từ chối 400» phải nhắc ?project= đúng một lần");
});

test("loại hình: 180/180 căn mẫu là Residential / Condominium", () => {
  const dm = docMau();
  const can = dm.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units));
  assert.equal(can.length, 180);
  const sai = (d: CatalogData) =>
    d.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units)).filter((u) => u.propertyType !== "Residential" || u.propertySubType !== "Condominium").map((u) => u.upi);
  assert.deepEqual(sai(dm), []);
  // Đối chứng âm trên bản sao: đổi một căn sang nhà phố thì gọi đúng UPI căn ấy.
  const banSao = structuredClone(dm);
  const mot = banSao.subdivisions[0]!.buildings[1]!.units[7]!;
  (mot as { propertySubType: string }).propertySubType = "Townhouse";
  assert.deepEqual(sai(banSao), [mot.upi]);
});

test("dữ liệu mẫu sinh lại tất định", async () => {
  const duong = path.join(GOC, "packages/db/seed/du-lieu-mau.mjs");
  const { sinhDuLieuMau } = (await import(duong)) as { sinhDuLieuMau: () => { danhMuc: CatalogData } };
  const a = JSON.stringify(sinhDuLieuMau().danhMuc);
  const b = JSON.stringify(sinhDuLieuMau().danhMuc);
  assert.equal(a, b, "hai lần sinh khác nhau");
  assert.equal(a, JSON.stringify(docMau()), "tệp đã commit lệch với đầu ra sinh lại");
});

/** Mười hai trường của một căn tra ra — viết tay ở đây, không lấy từ hằng của lõi. */
const MUOI_HAI = [
  "subdivisionKey", "subdivisionName", "buildingName", "unitNumber", "upi", "floor", "stack", "livingArea",
  "bedroomsTotal", "directionFaces", "propertyType", "propertySubType",
];

test("loại hình: căn tra ra mang đúng mười hai trường lớp danh mục", () => {
  assert.deepEqual([...UNIT_ATTRIBUTE_FIELDS], MUOI_HAI);
  let so = 0;
  for (const f of MUOI_HAI) {
    assert.equal(UNIT_ATTRIBUTE_CLASS[f as (typeof UNIT_ATTRIBUTE_FIELDS)[number]], "catalog", f);
    so++;
  }
  assert.equal(so, 12);
  const kq = lookupUnit(buildCatalogIndex(docMau()), "A-12.06");
  assert.equal(kq.status, "found");
  if (kq.status !== "found") return;
  const thua = Object.keys(kq.unit).filter((k) => !MUOI_HAI.includes(k));
  assert.deepEqual(thua, [], `khoá thừa: ${thua.join(", ")}`);
  assert.deepEqual(Object.keys(kq.unit).sort(), [...MUOI_HAI].sort());
  assert.equal(kq.unit.propertyType, "Residential");
});

test("loại hình: bảng trường đúng bốn loại theo ADR-0016", () => {
  const NHA = ["lotSizeArea", "livingArea", "storiesTotal", "frontageLength", "bedroomsTotal", "directionFaces", "accessRoadWidth"];
  const MONG: Record<string, { propertyType: string; fields: string[] }> = {
    Condominium: { propertyType: "Residential", fields: ["buildingName", "floor", "stack", "livingArea", "bedroomsTotal", "directionFaces"] },
    Townhouse: { propertyType: "Residential", fields: NHA },
    "Single Family Residence": { propertyType: "Residential", fields: NHA },
    "Unimproved Land": { propertyType: "Land", fields: ["lotSizeArea", "frontageLength", "accessRoadWidth"] },
  };
  assert.deepEqual(Object.keys(PROPERTY_SUBTYPE_FIELDS).sort(), Object.keys(MONG).sort());
  let so = 0;
  for (const [sub, m] of Object.entries(MONG)) {
    const dong = (PROPERTY_SUBTYPE_FIELDS as Record<string, { propertyType: string; fields: readonly string[] }>)[sub]!;
    assert.equal(dong.propertyType, m.propertyType, sub);
    assert.deepEqual([...dong.fields].sort(), [...m.fields].sort(), `${sub}: tập trường lệch`);
    so++;
  }
  assert.equal(so, 4);
});

const canHo = { propertyType: "Residential", propertySubType: "Condominium" };
test("loại hình: lõi từ chối trường không thuộc loại hình", () => {
  const SAI: [Record<string, unknown>, string, string][] = [
    [{ propertyType: "Land", propertySubType: "Unimproved Land", floor: 3 }, "floor", "Unimproved Land"],
    [{ ...canHo, lotSizeArea: 80 }, "lotSizeArea", "Condominium"],
    [{ propertyType: "Residential", propertySubType: "Townhouse", stack: "02" }, "stack", "Townhouse"],
    [{ propertyType: "Residential", propertySubType: "Land" }, "propertySubType", "Land"],
  ];
  let so = 0;
  for (const [can, field, subType] of SAI) {
    const loi = unitFieldErrors(can as { propertyType: string; propertySubType: string });
    assert.equal(loi.length, 1, `${subType}/${field}: nhận ${loi.length} lỗi`);
    assert.equal(loi[0]!.field, field);
    assert.equal(loi[0]!.subType, subType);
    so++;
  }
  assert.equal(so, 4);
  // Đối chứng dương: đúng loại hình thì không lỗi; trường mang null không tính là lỗi.
  assert.deepEqual(unitFieldErrors({ ...canHo, floor: 12, stack: "06", livingArea: 82, bedroomsTotal: 3, directionFaces: "Tây", lotSizeArea: null }), []);
  assert.deepEqual(unitFieldErrors({ propertyType: "Residential", propertySubType: "Townhouse", lotSizeArea: 90, storiesTotal: 4 }), []);
  assert.deepEqual(unitFieldErrors({ propertyType: "Land", propertySubType: "Unimproved Land", lotSizeArea: 120 }), []);
});

test("loại hình: danh mục có căn sai loại không dựng được chỉ mục", () => {
  const dm = docMau();
  assert.deepEqual(catalogFieldErrors(dm), []);
  assert.doesNotThrow(() => buildCatalogIndex(dm));
  const banSao = structuredClone(dm);
  const mot = banSao.subdivisions[0]!.buildings[0]!.units[3]!;
  mot.lotSizeArea = 75;
  assert.throws(() => buildCatalogIndex(banSao), (e: Error) => e.message.includes(mot.upi) && e.message.includes("lotSizeArea"));
});
