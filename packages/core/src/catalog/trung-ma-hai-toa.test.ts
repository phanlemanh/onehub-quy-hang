// Căn trùng mã ở hai toà cùng dự án (hàng 63, hồ sơ can-trung-ma-hai-toa) — E1…E4.
import assert from "node:assert/strict";
import { test } from "node:test";
import { UNIT_CODE_RULES } from "./code-rule";
import { buildCatalogIndex, lookupUnit, UNIT_ATTRIBUTE_FIELDS, type LookupResult, type UnitAttributes } from "./lookup";
import type { CatalogBuildingData, CatalogSubdivisionData, CatalogUnitData } from "./types";

const can = (unitNumber: string, upi: string, o: Partial<CatalogUnitData> = {}): CatalogUnitData => ({
  upi,
  unitNumber,
  stack: null,
  floor: null,
  livingArea: 60,
  bedroomsTotal: 2,
  directionFaces: "Đông",
  propertyType: "Residential",
  propertySubType: "Condominium",
  ...o,
});

/** Dự án không có dòng cách đọc: mã danh mục không mang toà, hai toà cùng có căn `1206`. */
const TOA_A1: CatalogBuildingData = {
  buildingKey: "A1",
  buildingName: "[Mẫu] Toà A1",
  units: [
    can("1206", "urn:onehub:upi:thu:trung:A1-1206", { floor: 12, stack: "06", livingArea: 82.3, directionFaces: "Tây Nam" }),
    can("0801", "urn:onehub:upi:thu:trung:A1-0801", { floor: 8, stack: "01", livingArea: 54.2, directionFaces: "Đông Nam" }),
  ],
};
const TOA_A2: CatalogBuildingData = {
  buildingKey: "A2",
  buildingName: "[Mẫu] Toà A2",
  units: [can("1206", "urn:onehub:upi:thu:trung:A2-1206", { floor: 12, stack: "06", livingArea: 75, directionFaces: "Đông Bắc" })],
};
const trungMa = (buildings: CatalogBuildingData[]): CatalogSubdivisionData => ({
  subdivisionKey: "mau-trung-ma",
  subdivisionName: "[Mẫu] Dự án trùng mã",
  complexName: null,
  buildings,
});
const TRUNG = trungMa([TOA_A1, TOA_A2]);

/** Mười trường viết trước của một căn danh mục — so ứng viên với chính căn toà mình. */
function muoiTruong(p: CatalogSubdivisionData, b: CatalogBuildingData, u: CatalogUnitData): UnitAttributes {
  return {
    subdivisionKey: p.subdivisionKey,
    subdivisionName: p.subdivisionName,
    buildingName: b.buildingName,
    unitNumber: u.unitNumber,
    upi: u.upi,
    floor: u.floor,
    stack: u.stack,
    livingArea: u.livingArea,
    bedroomsTotal: u.bedroomsTotal,
    directionFaces: u.directionFaces,
    propertyType: u.propertyType,
    propertySubType: u.propertySubType,
  };
}

const THUOC_TINH = new Set<string>(UNIT_ATTRIBUTE_FIELDS);
function khoaThuocTinh(v: unknown): string[] {
  if (Array.isArray(v)) return v.flatMap(khoaThuocTinh);
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => [...(THUOC_TINH.has(k) ? [k] : []), ...khoaThuocTinh(x)]);
  return [];
}
const upiCua = (kq: LookupResult) => (kq.status === "found" ? kq.unit.upi : null);

test("trùng mã hai toà một dự án: ambiguous, không found", () => {
  const idx = buildCatalogIndex({ subdivisions: [TRUNG] });
  const theoUpi = new Map([TOA_A1, TOA_A2].flatMap((b) => b.units.map((u) => [u.upi, muoiTruong(TRUNG, b, u)] as const)));
  const lan: UnitAttributes[][] = [];
  for (const [input, subdivision] of [["1206", undefined], ["  1206 ", undefined], ["1206", "mau-trung-ma"]] as const) {
    const kq = lookupUnit(idx, input, subdivision);
    assert.equal(kq.status, "ambiguous", `«${input}» khu ${subdivision ?? "(không chọn)"}: nhận ${kq.status}`);
    if (kq.status !== "ambiguous") continue;
    assert.equal(kq.candidates.length, 2);
    assert.deepEqual(new Set(kq.candidates.map((c) => c.buildingName)), new Set(["[Mẫu] Toà A1", "[Mẫu] Toà A2"]));
    for (const c of kq.candidates) assert.deepEqual(c, theoUpi.get(c.upi), `ứng viên ${c.upi} mang thuộc tính căn khác`);
    lan.push(kq.candidates);
  }
  const dao = lookupUnit(buildCatalogIndex({ subdivisions: [trungMa([TOA_A2, TOA_A1])] }), "1206");
  assert.deepEqual(dao.status === "ambiguous" && dao.candidates, lan[0], "đảo thứ tự nạp hai toà thì thứ tự ứng viên đổi");
  assert.equal(upiCua(lookupUnit(idx, "0801")), "urn:onehub:upi:thu:trung:A1-0801", "đối chứng: mã chỉ ở toà A1 ra found");
});

test("dự án có cách đọc mà danh mục ghi trùng mã ở hai toà: ambiguous", () => {
  const ghiLoi: CatalogSubdivisionData = {
    subdivisionKey: "mau-du-an-thu",
    subdivisionName: "[Mẫu] Dự án căn hộ thử",
    complexName: null,
    buildings: [
      { buildingKey: "A", buildingName: "Toà A", units: [can("A-12.06", "urn:onehub:upi:thu:X"), can("A-12.05", "urn:onehub:upi:thu:A-12.05")] },
      { buildingKey: "B", buildingName: "Toà B", units: [can("A-12.06", "urn:onehub:upi:thu:Y")] },
    ],
  };
  const idx = buildCatalogIndex({ subdivisions: [ghiLoi] }, UNIT_CODE_RULES);
  for (const input of ["A-12.06", "a1206"]) {
    const kq = lookupUnit(idx, input);
    assert.equal(kq.status, "ambiguous", `«${input}»: nhận ${kq.status}`);
    if (kq.status !== "ambiguous") continue;
    assert.equal(kq.candidates.length, 2);
    assert.deepEqual(new Set(kq.candidates.map((c) => c.upi)), new Set(["urn:onehub:upi:thu:X", "urn:onehub:upi:thu:Y"]));
    assert.deepEqual(new Set(kq.candidates.map((c) => c.buildingName)), new Set(["Toà A", "Toà B"]));
  }
  assert.equal(lookupUnit(idx, "A-12.05").status, "found", "đối chứng: mã chỉ ở toà A ra found");
});

test("mã kèm toà ra đúng một căn", () => {
  const idx = buildCatalogIndex({ subdivisions: [TRUNG] });
  const CACH_GOI: [string, string][] = [
    ["[Mẫu] Toà A1", "urn:onehub:upi:thu:trung:A1-1206"],
    ["[mẫu] toà a1", "urn:onehub:upi:thu:trung:A1-1206"],
    ["  [Mẫu] Toà A1  ", "urn:onehub:upi:thu:trung:A1-1206"],
    ["A1", "urn:onehub:upi:thu:trung:A1-1206"],
    ["a1", "urn:onehub:upi:thu:trung:A1-1206"],
    ["[Mẫu] Toà A2", "urn:onehub:upi:thu:trung:A2-1206"],
    ["A2", "urn:onehub:upi:thu:trung:A2-1206"],
  ];
  let so = 0;
  for (const [toa, upi] of CACH_GOI) {
    const kq = lookupUnit(idx, "1206", undefined, toa);
    assert.equal(kq.status, "found", `toà «${toa}»: nhận ${kq.status}`);
    assert.equal(upiCua(kq), upi, `toà «${toa}» ra căn khác`);
    so++;
  }
  assert.equal(so, CACH_GOI.length);
  const khac = lookupUnit(idx, "0801", undefined, "A2");
  assert.equal(khac.status, "not_in_catalog", `mã chỉ ở toà A1 mà chọn toà A2: nhận ${khac.status}`);
  assert.deepEqual(khac.status === "not_in_catalog" && khac.read, [{ subdivisionKey: "mau-trung-ma", unitNumber: "0801" }]);
  assert.ok(!JSON.stringify(khac).includes("urn:onehub:upi:thu:trung:A1-0801"), "kết quả mang căn của toà A1");
});

test("toà lạ: kết cục riêng, không thuộc tính", () => {
  const mau: CatalogSubdivisionData = {
    subdivisionKey: "mau-du-an-thu",
    subdivisionName: "[Mẫu] Dự án căn hộ thử",
    complexName: null,
    buildings: [{ buildingKey: "A", buildingName: "Toà A", units: [can("A-12.06", "urn:onehub:upi:thu:A-12.06")] }],
  };
  const idx = buildCatalogIndex({ subdivisions: [TRUNG, mau] }, UNIT_CODE_RULES);
  const la = lookupUnit(idx, "1206", undefined, "Toà Z");
  assert.equal(la.status, "unknown_building", `toà lạ: nhận ${la.status}`);
  const duAnKhac = lookupUnit(idx, "A-12.06", "mau-trung-ma", "A");
  assert.equal(duAnKhac.status, "unknown_building", `toà của dự án khác: nhận ${duAnKhac.status}`);
  assert.deepEqual([...khoaThuocTinh(la), ...khoaThuocTinh(duAnKhac)], [], "kết cục toà lạ mang thuộc tính căn");
  assert.equal(upiCua(lookupUnit(idx, "A-12.06", undefined, "A")), "urn:onehub:upi:thu:A-12.06", "đối chứng: toà A không chọn dự án ra found");
});
