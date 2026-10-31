// Gõ mã căn ra thuộc tính căn (hàng 9, hồ sơ danh-muc-go-ma-can) — E1…E7.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { CEILING } from "../data-classes";
import { UNIT_CODE_RULES, type UnitCodeRule } from "./code-rule";
import { buildCatalogIndex, checkRuleAgainstProject, lookupUnit, UNIT_ATTRIBUTE_CLASS, UNIT_ATTRIBUTE_FIELDS } from "./lookup";
import type { CatalogData, CatalogProjectData, CatalogUnitData } from "./types";

const can = (unitNumber: string, o: Partial<CatalogUnitData> = {}): CatalogUnitData => {
  const [, f, s] = /^[A-Z]-(\d{2})\.(\d{2})$/.exec(unitNumber) ?? [];
  return {
    upi: `urn:onehub:upi:thu:${unitNumber}`,
    unitNumber,
    stack: s ?? null,
    floor: f ? Number(f) : null,
    livingArea: 60,
    bedroomsTotal: 2,
    directionFaces: "Đông",
    ...o,
  };
};

/** Fixture viết tay: giá trị khác nhau từng căn để bắt việc trả nhầm căn kề. */
const DU_AN_MAU: CatalogProjectData = {
  projectKey: "mau-du-an-thu",
  projectName: "[Mẫu] Dự án căn hộ thử",
  complexName: null,
  buildings: [
    {
      buildingKey: "A",
      buildingName: "Toà A",
      units: [
        can("A-12.06", { livingArea: 82.3, bedroomsTotal: 3, directionFaces: "Tây Nam" }),
        can("A-12.05", { livingArea: 75, bedroomsTotal: 2, directionFaces: "Tây Bắc" }),
        can("A-15.01", { livingArea: 54.2, bedroomsTotal: 1, directionFaces: "Đông Nam" }),
        can("A-02.02", { livingArea: 68.5, bedroomsTotal: 2, directionFaces: "Đông Bắc" }),
        can("A-03.02", { livingArea: null, bedroomsTotal: null, directionFaces: null }),
        can("A-04.02", { livingArea: 68.7, bedroomsTotal: 2, directionFaces: "Đông Bắc" }),
        can("A-01.01"),
        can("A-01.02"),
      ],
    },
    { buildingKey: "B", buildingName: "Toà B", units: [can("B-01.01")] },
  ],
};
const MOT_DU_AN: CatalogData = { projects: [DU_AN_MAU] };
const idx = buildCatalogIndex(MOT_DU_AN);
const KHOA_THUOC_TINH = new Set<string>(UNIT_ATTRIBUTE_FIELDS);

/** Mọi khoá ở mọi cấp của một đối tượng — để kiểm «không thuộc tính nào» bằng giao tập, không bằng vắng một khoá. */
function moiKhoa(v: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(v)) v.forEach((x) => moiKhoa(x, out));
  else if (v && typeof v === "object") {
    for (const [k, x] of Object.entries(v)) {
      out.add(k);
      moiKhoa(x, out);
    }
  }
  return out;
}
const giaoThuocTinh = (v: unknown) => [...moiKhoa(v)].filter((k) => KHOA_THUOC_TINH.has(k) && k !== "projectKey" && k !== "projectName" && k !== "unitNumber");

test("tra mã chuẩn: found đủ mười thuộc tính theo danh mục", () => {
  const kq = lookupUnit(idx, "A-12.06");
  assert.equal(kq.status, "found");
  assert.deepEqual(kq.status === "found" && kq.unit, {
    projectKey: "mau-du-an-thu",
    projectName: "[Mẫu] Dự án căn hộ thử",
    buildingName: "Toà A",
    unitNumber: "A-12.06",
    upi: "urn:onehub:upi:thu:A-12.06",
    floor: 12,
    stack: "06",
    livingArea: 82.3,
    bedroomsTotal: 3,
    directionFaces: "Tây Nam",
  });
  assert.deepEqual(Object.keys(kq.status === "found" ? kq.unit : {}).sort(), [...UNIT_ATTRIBUTE_FIELDS].sort());
  // Đối chứng cùng fixture: căn kề là căn khác.
  const ke = lookupUnit(idx, "A-12.05");
  assert.equal(ke.status === "found" && ke.unit.upi, "urn:onehub:upi:thu:A-12.05");
});

test("biến thể viết: mọi kiểu viết ra cùng căn và cùng mã chuẩn", () => {
  const BIEN_THE = ["a-12.06", "  A-12.06 ", "A.12.06", "A/12/06", "A_12_06", "A 12 06", "A1206", "a 12 6", "A-12-6"];
  let so = 0;
  for (const s of BIEN_THE) {
    const kq = lookupUnit(idx, s);
    assert.equal(kq.status, "found", `biến thể «${s}» không ra found`);
    assert.equal(kq.status === "found" && kq.unit.unitNumber, "A-12.06", `biến thể «${s}» ra mã khác`);
    assert.equal(kq.status === "found" && kq.unit.upi, "urn:onehub:upi:thu:A-12.06", `biến thể «${s}» ra căn khác`);
    so++;
  }
  assert.equal(so, BIEN_THE.length);
  // Viết liền mà trục thiếu chữ số không thành A-12.06.
  const sai = lookupUnit(idx, "A126");
  assert.ok(!(sai.status === "found" && sai.unit.unitNumber === "A-12.06"), "«A126» không được ra A-12.06");
});

test("đọc được mà ngoài danh mục: not_in_catalog, không thuộc tính nào", () => {
  const CA: [string, string][] = [
    ["C-01.01", "C-01.01"],
    ["A-16.01", "A-16.01"],
    ["A-01.07", "A-01.07"],
    ["a1601", "A-16.01"],
  ];
  for (const [go, chuan] of CA) {
    const kq = lookupUnit(idx, go);
    assert.equal(kq.status, "not_in_catalog", `«${go}» phải là not_in_catalog`);
    assert.deepEqual(kq.status === "not_in_catalog" && kq.read, [{ projectKey: "mau-du-an-thu", unitNumber: chuan }]);
    assert.deepEqual(giaoThuocTinh(kq), [], `«${go}» bị điền thuộc tính`);
  }
  assert.equal(lookupUnit(idx, "A-15.01").status, "found", "đối chứng: A-15.01 có trong danh mục");
});

test("không đọc được: unreadable kèm mẫu mã từng dự án", () => {
  for (const go of ["", "   ", "XYZ", "A-12", "A-12.06.01", "12.06"]) {
    const kq = lookupUnit(idx, go);
    assert.equal(kq.status, "unreadable", `«${go}» phải là unreadable`);
    assert.ok(
      kq.status === "unreadable" && kq.examples.some((e) => e.projectKey === "mau-du-an-thu" && e.example === "A-12.06"),
      `«${go}» thiếu mẫu mã của dự án mẫu`,
    );
    assert.deepEqual(giaoThuocTinh(kq), [], `«${go}» bị điền thuộc tính`);
  }
  assert.notEqual(lookupUnit(idx, "A-12.06").status, "unreadable", "đối chứng: A-12.06 đọc được");
});

/** Gói danh mục mẫu thật của hàng 5 — đường suy từ vị trí tệp này. */
function goiMau(): CatalogData {
  const p = fileURLToPath(new URL("../../../db/seed/mau/du-lieu-mau.json", import.meta.url));
  return (JSON.parse(readFileSync(p, "utf8")) as { danhMuc: CatalogData }).danhMuc;
}

test("cách đọc dự án mẫu khớp 180/180 căn danh mục mẫu", () => {
  const dm = goiMau();
  const duAn = dm.projects.find((p) => p.projectKey === "mau-du-an-thu");
  assert.ok(duAn, "gói mẫu thiếu dự án mau-du-an-thu");
  const soCan = duAn.buildings.reduce((n, b) => n + b.units.length, 0);
  assert.equal(soCan, 180, "danh mục mẫu phải có 180 căn");
  const rule = UNIT_CODE_RULES.find((r) => r.projectKey === "mau-du-an-thu")!;
  assert.deepEqual(checkRuleAgainstProject(rule, duAn), []);
  // Đối chứng âm trên bản sao: đổi tầng của một căn thì lệch đúng căn ấy.
  const banSao = structuredClone(duAn) as CatalogProjectData & { buildings: { units: CatalogUnitData[] }[] };
  banSao.buildings[0]!.units[0] = { ...banSao.buildings[0]!.units[0]!, floor: 14 };
  const lech = checkRuleAgainstProject(rule, banSao);
  assert.equal(lech.length, 1);
  assert.equal(`${lech[0]!.unitNumber}: ${lech[0]!.field}`, `${duAn.buildings[0]!.units[0]!.unitNumber}: floor`);
});

test("dự án thứ hai chỉ cần một dòng cách đọc", () => {
  const duAnHai: CatalogProjectData = {
    projectKey: "du-an-hai",
    projectName: "[Mẫu] Dự án thứ hai",
    complexName: null,
    buildings: [{ buildingKey: "T1", buildingName: "Tháp 1", units: [{ ...can("A-08.05"), upi: "urn:onehub:upi:thu:T1-0805", unitNumber: "T1-0805", floor: 8, stack: "05" }] }],
  };
  const dongMoi: UnitCodeRule = { projectKey: "du-an-hai", example: "T1-0805", buildingPattern: "[A-Z][0-9]", floorWidth: 2, stackWidth: 2, template: "{b}-{f}{s}" };
  const voiDong = buildCatalogIndex({ projects: [DU_AN_MAU, duAnHai] }, [...UNIT_CODE_RULES, dongMoi]);
  for (const go of ["t1 08 05", "T10805", "t1-08.05"]) {
    const kq = lookupUnit(voiDong, go);
    assert.equal(kq.status === "found" && kq.unit.upi, "urn:onehub:upi:thu:T1-0805", `«${go}» không ra căn của dự án thứ hai`);
  }
  assert.deepEqual(checkRuleAgainstProject(dongMoi, duAnHai), []);
  // Không có dòng cách đọc: chỉ khớp đúng mã danh mục sau chữ hoa.
  const khongDong = buildCatalogIndex({ projects: [DU_AN_MAU, duAnHai] });
  assert.equal(lookupUnit(khongDong, "t1-0805").status, "found");
  assert.equal(lookupUnit(khongDong, "t1 08 05").status, "unreadable");
});

test("trường danh mục trống trả null, không lấy từ căn khác", () => {
  const kq = lookupUnit(idx, "A-03.02");
  assert.equal(kq.status, "found");
  const u = kq.status === "found" ? kq.unit : null;
  assert.equal(u?.livingArea, null);
  assert.equal(u?.bedroomsTotal, null);
  assert.equal(u?.directionFaces, null);
  assert.equal(u?.floor, 3);
  assert.equal(u?.stack, "02");
  assert.equal(u?.buildingName, "Toà A");
  const ke = lookupUnit(idx, "A-02.02");
  assert.equal(ke.status === "found" && ke.unit.livingArea, 68.5, "đối chứng: căn cùng trục có giá trị thật");
});

test("mã khớp hai dự án: ambiguous, không chọn hộ", () => {
  const duAnHai: CatalogProjectData = {
    projectKey: "du-an-hai",
    projectName: "[Mẫu] Dự án thứ hai",
    complexName: null,
    buildings: [{ buildingKey: "A", buildingName: "Toà A", units: [{ ...can("A-01.01"), upi: "urn:onehub:upi:thu:hai:A-01.01" }] }],
  };
  const rules = [...UNIT_CODE_RULES, { ...UNIT_CODE_RULES[0]!, projectKey: "du-an-hai" }];
  const hai = buildCatalogIndex({ projects: [duAnHai, DU_AN_MAU] }, rules);
  const kq = lookupUnit(hai, "A-01.01");
  assert.equal(kq.status, "ambiguous");
  assert.deepEqual(kq.status === "ambiguous" && kq.candidates.map((c) => [c.projectKey, c.upi]), [
    ["du-an-hai", "urn:onehub:upi:thu:hai:A-01.01"],
    ["mau-du-an-thu", "urn:onehub:upi:thu:A-01.01"],
  ]);
  const mot = lookupUnit(hai, "A-01.01", "mau-du-an-thu");
  assert.equal(mot.status === "found" && mot.unit.upi, "urn:onehub:upi:thu:A-01.01");
  const haiChon = lookupUnit(hai, "A-01.01", "du-an-hai");
  assert.equal(haiChon.status === "found" && haiChon.unit.upi, "urn:onehub:upi:thu:hai:A-01.01");
  assert.equal(lookupUnit(hai, "A-01.02").status, "found", "đối chứng: mã chỉ ở một dự án không ambiguous");
});

test("dự án không có trong danh mục", () => {
  assert.deepEqual(lookupUnit(idx, "A-12.06", "khong-co"), { status: "unknown_project", projectKey: "khong-co" });
  assert.equal(lookupUnit(idx, "A-12.06", "mau-du-an-thu").status, "found");
});

test("mười trường ra đều thuộc lớp danh mục, trần ra ngoài được", () => {
  for (const f of UNIT_ATTRIBUTE_FIELDS) {
    assert.equal(UNIT_ATTRIBUTE_CLASS[f], "catalog", f);
    assert.equal(CEILING[UNIT_ATTRIBUTE_CLASS[f]], "external", f);
  }
});
