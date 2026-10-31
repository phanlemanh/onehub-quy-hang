import type { DataClass } from "../data-classes";
import { normalizeCode, readUnitCode, UNIT_CODE_RULES, type UnitCodeRule } from "./code-rule";
import type { CatalogData, CatalogProjectData } from "./types";

/**
 * Mười thuộc tính căn mà một lần tra trả ra — đều thuộc lớp `catalog` (trần `external`). Kết quả tra không mang trường
 * nào khác: không giá, không chủ nhà, không ghi chú (AC-9).
 */
export const UNIT_ATTRIBUTE_FIELDS = [
  "projectKey",
  "projectName",
  "buildingName",
  "unitNumber",
  "upi",
  "floor",
  "stack",
  "livingArea",
  "bedroomsTotal",
  "directionFaces",
] as const;
export type UnitAttributeField = (typeof UNIT_ATTRIBUTE_FIELDS)[number];

export const UNIT_ATTRIBUTE_CLASS: Readonly<Record<UnitAttributeField, DataClass>> = {
  projectKey: "catalog",
  projectName: "catalog",
  buildingName: "catalog",
  unitNumber: "catalog",
  upi: "catalog",
  floor: "catalog",
  stack: "catalog",
  livingArea: "catalog",
  bedroomsTotal: "catalog",
  directionFaces: "catalog",
};

export type UnitAttributes = {
  projectKey: string;
  projectName: string;
  buildingName: string;
  unitNumber: string;
  upi: string;
  floor: number | null;
  stack: string | null;
  livingArea: number | null;
  bedroomsTotal: number | null;
  directionFaces: string | null;
};

/**
 * Bốn kết cục của một lần tra, cộng một cho dự án không có trong danh mục:
 * - `found` — đúng một căn; trường danh mục trống trả `null`, không lấy từ căn khác.
 * - `not_in_catalog` — đọc được theo cách đọc của dự án, danh mục không có căn nào; không thuộc tính nào.
 * - `unreadable` — không cách đọc nào đọc được; kèm mẫu mã từng dự án.
 * - `ambiguous` — «nhiều căn»: mã khớp hơn một căn, ở hai dự án hay ở hai toà cùng dự án (hàng 63); không chọn hộ.
 * - `unknown_project` — dự án được chọn không có trong danh mục.
 * - `unknown_building` — toà được chọn không có trong các dự án đang xét.
 */
export type LookupResult =
  | { status: "found"; unit: UnitAttributes }
  | { status: "not_in_catalog"; read: { projectKey: string; unitNumber: string }[] }
  | { status: "unreadable"; input: string; examples: { projectKey: string; projectName: string; example: string }[] }
  | { status: "ambiguous"; candidates: UnitAttributes[] }
  | { status: "unknown_project"; projectKey: string }
  | { status: "unknown_building"; building: string };

type ProjectIndex = {
  project: CatalogProjectData;
  rule: UnitCodeRule | undefined;
  /** Mã danh mục đã chuẩn hoá → mọi căn mang mã ấy; hai toà có thể trùng mã, căn nạp sau không đè căn nạp trước. */
  units: Map<string, UnitAttributes[]>;
};

export type CatalogIndex = { projects: ProjectIndex[] };

/** Dựng chỉ mục tra một lần cho cả danh mục; khoá căn là mã danh mục đã chuẩn hoá. */
export function buildCatalogIndex(catalog: CatalogData, rules: readonly UnitCodeRule[] = UNIT_CODE_RULES): CatalogIndex {
  return {
    projects: catalog.projects.map((project) => {
      const units = new Map<string, UnitAttributes[]>();
      for (const b of project.buildings) {
        for (const u of b.units) {
          const key = normalizeCode(u.unitNumber);
          if (!units.has(key)) units.set(key, []);
          units.get(key)!.push({
            projectKey: project.projectKey,
            projectName: project.projectName,
            buildingName: b.buildingName,
            unitNumber: u.unitNumber,
            upi: u.upi,
            floor: u.floor,
            stack: u.stack,
            livingArea: u.livingArea,
            bedroomsTotal: u.bedroomsTotal,
            directionFaces: u.directionFaces,
          });
        }
      }
      return { project, rule: rules.find((r) => r.projectKey === project.projectKey), units };
    }),
  };
}

/**
 * Tra một chuỗi gõ. Dự án có cách đọc: đọc ra mã chuẩn rồi tra. Dự án chưa có cách đọc: chỉ khớp đúng mã danh mục sau
 * chuẩn hoá — không đoán cách tách. Chọn toà (hàng 63): khớp tên toà hoặc khoá toà sau chuẩn hoá; chỉ giữ căn của toà
 * ấy, và mã không có ở toà đã chọn là «chưa có trong danh mục» — người đã nói rõ toà.
 */
export function lookupUnit(index: CatalogIndex, input: string, projectKey?: string, building?: string): LookupResult {
  let projects = index.projects;
  if (projectKey !== undefined) {
    projects = projects.filter((p) => p.project.projectKey === projectKey);
    if (projects.length === 0) return { status: "unknown_project", projectKey };
  }
  let toa: ((u: UnitAttributes) => boolean) | undefined;
  if (building !== undefined) {
    const b = normalizeCode(building);
    const ten = new Set<string>();
    for (const p of projects) {
      for (const x of p.project.buildings) {
        if (normalizeCode(x.buildingName) === b || normalizeCode(x.buildingKey) === b) ten.add(`${p.project.projectKey}\u0000${x.buildingName}`);
      }
    }
    if (ten.size === 0) return { status: "unknown_building", building };
    projects = projects.filter((p) => p.project.buildings.some((x) => ten.has(`${p.project.projectKey}\u0000${x.buildingName}`)));
    toa = (u) => ten.has(`${u.projectKey}\u0000${u.buildingName}`);
  }
  const hits: UnitAttributes[] = [];
  const read: { projectKey: string; unitNumber: string }[] = [];
  for (const p of projects) {
    if (p.rule) {
      const parts = readUnitCode(p.rule, input);
      if (!parts) continue;
      const hit = (p.units.get(normalizeCode(parts.unitNumber)) ?? []).filter((u) => !toa || toa(u));
      if (hit.length > 0) hits.push(...hit);
      else read.push({ projectKey: p.project.projectKey, unitNumber: parts.unitNumber });
    } else {
      const ma = normalizeCode(input);
      const hit = (p.units.get(ma) ?? []).filter((u) => !toa || toa(u));
      if (hit.length > 0) hits.push(...hit);
      else if (toa && ma) read.push({ projectKey: p.project.projectKey, unitNumber: ma });
    }
  }
  if (hits.length === 1) return { status: "found", unit: hits[0]! };
  if (hits.length > 1) {
    return {
      status: "ambiguous",
      candidates: [...hits].sort((a, b) => a.projectKey.localeCompare(b.projectKey) || a.buildingName.localeCompare(b.buildingName) || a.upi.localeCompare(b.upi)),
    };
  }
  if (read.length > 0) return { status: "not_in_catalog", read };
  return {
    status: "unreadable",
    input,
    examples: projects.map((p) => ({
      projectKey: p.project.projectKey,
      projectName: p.project.projectName,
      example: p.rule?.example ?? p.project.buildings[0]?.units[0]?.unitNumber ?? "",
    })),
  };
}

export type RuleMismatch = { unitNumber: string; field: "unreadable" | "unitNumber" | "building" | "floor" | "stack"; expected: string; actual: string };

/**
 * Đối chiếu cách đọc với danh mục của dự án: mã danh mục đọc được, mã chuẩn đọc ra trùng mã danh mục, toà/tầng/trục đọc
 * ra trùng toà/tầng/trục danh mục ghi. Rỗng mới là khớp.
 */
export function checkRuleAgainstProject(rule: UnitCodeRule, project: CatalogProjectData): RuleMismatch[] {
  const out: RuleMismatch[] = [];
  for (const b of project.buildings) {
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
