import type { DataClass } from "../data-classes";
import { normalizeCode, readUnitCode, UNIT_CODE_RULES, type UnitCodeRule } from "./code-rule";
import { catalogFieldErrors } from "./property-type";
import type { CatalogData, CatalogSubdivisionData } from "./types";

/**
 * Mười hai thuộc tính căn mà một lần tra trả ra (mười của hàng 9, khu đổi tên và thêm loại hình ở hàng 72) — đều thuộc lớp `catalog` (trần `external`). Kết quả tra không mang trường
 * nào khác: không giá, không chủ nhà, không ghi chú (AC-9).
 */
export const UNIT_ATTRIBUTE_FIELDS = [
  "subdivisionKey",
  "subdivisionName",
  "buildingName",
  "unitNumber",
  "upi",
  "floor",
  "stack",
  "livingArea",
  "bedroomsTotal",
  "directionFaces",
  "propertyType",
  "propertySubType",
] as const;
export type UnitAttributeField = (typeof UNIT_ATTRIBUTE_FIELDS)[number];

export const UNIT_ATTRIBUTE_CLASS: Readonly<Record<UnitAttributeField, DataClass>> = {
  subdivisionKey: "catalog",
  subdivisionName: "catalog",
  buildingName: "catalog",
  unitNumber: "catalog",
  upi: "catalog",
  floor: "catalog",
  stack: "catalog",
  livingArea: "catalog",
  bedroomsTotal: "catalog",
  directionFaces: "catalog",
  propertyType: "catalog",
  propertySubType: "catalog",
};

export type UnitAttributes = {
  subdivisionKey: string;
  subdivisionName: string;
  buildingName: string;
  unitNumber: string;
  upi: string;
  floor: number | null;
  stack: string | null;
  livingArea: number | null;
  bedroomsTotal: number | null;
  directionFaces: string | null;
  propertyType: string;
  propertySubType: string;
};

/**
 * Bốn kết cục của một lần tra, cộng một cho dự án không có trong danh mục:
 * - `found` — đúng một căn; trường danh mục trống trả `null`, không lấy từ căn khác.
 * - `not_in_catalog` — đọc được theo cách đọc của dự án, danh mục không có căn nào; không thuộc tính nào.
 * - `unreadable` — không cách đọc nào đọc được; kèm mẫu mã từng dự án.
 * - `ambiguous` — «nhiều căn»: mã khớp hơn một căn, ở hai dự án hay ở hai toà cùng dự án (hàng 63); không chọn hộ.
 * - `unknown_subdivision` — dự án được chọn không có trong danh mục.
 * - `unknown_building` — toà được chọn không có trong các dự án đang xét.
 */
export type LookupResult =
  | { status: "found"; unit: UnitAttributes }
  | { status: "not_in_catalog"; read: { subdivisionKey: string; unitNumber: string }[] }
  | { status: "unreadable"; input: string; examples: { subdivisionKey: string; subdivisionName: string; example: string }[] }
  | { status: "ambiguous"; candidates: UnitAttributes[] }
  | { status: "unknown_subdivision"; subdivisionKey: string }
  | { status: "unknown_building"; building: string };

type SubdivisionIndex = {
  subdivision: CatalogSubdivisionData;
  rule: UnitCodeRule | undefined;
  /** Mã danh mục đã chuẩn hoá → mọi căn mang mã ấy; hai toà có thể trùng mã, căn nạp sau không đè căn nạp trước. */
  units: Map<string, UnitAttributes[]>;
};

export type CatalogIndex = { subdivisions: SubdivisionIndex[] };

/**
 * Dựng chỉ mục tra một lần cho cả danh mục; khoá căn là mã danh mục đã chuẩn hoá. Danh mục có căn sai loại hình không
 * lên được — lỗi gọi tên căn và trường, không lặng lẽ bỏ căn hay giữ trường sai (hàng 72).
 */
export function buildCatalogIndex(catalog: CatalogData, rules: readonly UnitCodeRule[] = UNIT_CODE_RULES): CatalogIndex {
  const loi = catalogFieldErrors(catalog);
  if (loi.length > 0) throw new Error(`Danh mục có căn sai loại hình: ${loi.map((e) => `${e.upi} — ${e.message}`).join("; ")}`);
  return {
    subdivisions: catalog.subdivisions.map((subdivision) => {
      const units = new Map<string, UnitAttributes[]>();
      for (const b of subdivision.buildings) {
        for (const u of b.units) {
          const key = normalizeCode(u.unitNumber);
          if (!units.has(key)) units.set(key, []);
          units.get(key)!.push({
            subdivisionKey: subdivision.subdivisionKey,
            subdivisionName: subdivision.subdivisionName,
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
          });
        }
      }
      return { subdivision, rule: rules.find((r) => r.subdivisionKey === subdivision.subdivisionKey), units };
    }),
  };
}

/**
 * Tra một chuỗi gõ. Dự án có cách đọc: đọc ra mã chuẩn rồi tra. Dự án chưa có cách đọc: chỉ khớp đúng mã danh mục sau
 * chuẩn hoá — không đoán cách tách. Chọn toà (hàng 63): khớp tên toà hoặc khoá toà sau chuẩn hoá; chỉ giữ căn của toà
 * ấy, và mã không có ở toà đã chọn là «chưa có trong danh mục» — người đã nói rõ toà.
 */
export function lookupUnit(index: CatalogIndex, input: string, subdivisionKey?: string, building?: string): LookupResult {
  let subdivisions = index.subdivisions;
  if (subdivisionKey !== undefined) {
    subdivisions = subdivisions.filter((p) => p.subdivision.subdivisionKey === subdivisionKey);
    if (subdivisions.length === 0) return { status: "unknown_subdivision", subdivisionKey };
  }
  let toa: ((u: UnitAttributes) => boolean) | undefined;
  if (building !== undefined) {
    const b = normalizeCode(building);
    const ten = new Set<string>();
    for (const p of subdivisions) {
      for (const x of p.subdivision.buildings) {
        if (normalizeCode(x.buildingName) === b || normalizeCode(x.buildingKey) === b) ten.add(`${p.subdivision.subdivisionKey}\u0000${x.buildingName}`);
      }
    }
    if (ten.size === 0) return { status: "unknown_building", building };
    subdivisions = subdivisions.filter((p) => p.subdivision.buildings.some((x) => ten.has(`${p.subdivision.subdivisionKey}\u0000${x.buildingName}`)));
    toa = (u) => ten.has(`${u.subdivisionKey}\u0000${u.buildingName}`);
  }
  const hits: UnitAttributes[] = [];
  const read: { subdivisionKey: string; unitNumber: string }[] = [];
  for (const p of subdivisions) {
    if (p.rule) {
      const parts = readUnitCode(p.rule, input);
      if (!parts) continue;
      const hit = (p.units.get(normalizeCode(parts.unitNumber)) ?? []).filter((u) => !toa || toa(u));
      if (hit.length > 0) hits.push(...hit);
      else read.push({ subdivisionKey: p.subdivision.subdivisionKey, unitNumber: parts.unitNumber });
    } else {
      const ma = normalizeCode(input);
      const hit = (p.units.get(ma) ?? []).filter((u) => !toa || toa(u));
      if (hit.length > 0) hits.push(...hit);
      else if (toa && ma) read.push({ subdivisionKey: p.subdivision.subdivisionKey, unitNumber: ma });
    }
  }
  if (hits.length === 1) return { status: "found", unit: hits[0]! };
  if (hits.length > 1) {
    return {
      status: "ambiguous",
      candidates: [...hits].sort((a, b) => a.subdivisionKey.localeCompare(b.subdivisionKey) || a.buildingName.localeCompare(b.buildingName) || a.upi.localeCompare(b.upi)),
    };
  }
  if (read.length > 0) return { status: "not_in_catalog", read };
  return {
    status: "unreadable",
    input,
    examples: subdivisions.map((p) => ({
      subdivisionKey: p.subdivision.subdivisionKey,
      subdivisionName: p.subdivision.subdivisionName,
      example: p.rule?.example ?? p.subdivision.buildings[0]?.units[0]?.unitNumber ?? "",
    })),
  };
}

export type RuleMismatch = { unitNumber: string; field: "unreadable" | "unitNumber" | "building" | "floor" | "stack"; expected: string; actual: string };

/**
 * Đối chiếu cách đọc với danh mục của dự án: mã danh mục đọc được, mã chuẩn đọc ra trùng mã danh mục, toà/tầng/trục đọc
 * ra trùng toà/tầng/trục danh mục ghi. Rỗng mới là khớp.
 */
export function checkRuleAgainstSubdivision(rule: UnitCodeRule, subdivision: CatalogSubdivisionData): RuleMismatch[] {
  const out: RuleMismatch[] = [];
  for (const b of subdivision.buildings) {
    for (const u of b.units) {
      const parts = readUnitCode(rule, u.unitNumber);
      if (!parts) {
        out.push({ unitNumber: u.unitNumber, field: "unreadable", expected: rule.example, actual: u.unitNumber });
        continue;
      }
      if (parts.unitNumber !== u.unitNumber) out.push({ unitNumber: u.unitNumber, field: "unitNumber", expected: u.unitNumber, actual: parts.unitNumber });
      if (parts.building !== b.buildingKey) out.push({ unitNumber: u.unitNumber, field: "building", expected: b.buildingKey, actual: parts.building });
      if (u.floor !== null && parts.floor !== u.floor) out.push({ unitNumber: u.unitNumber, field: "floor", expected: String(u.floor), actual: String(parts.floor) });
      if (u.stack !== null && parts.stack !== u.stack) out.push({ unitNumber: u.unitNumber, field: "stack", expected: u.stack, actual: parts.stack });
    }
  }
  return out;
}
