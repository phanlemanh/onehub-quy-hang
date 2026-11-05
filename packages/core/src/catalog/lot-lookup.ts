import type { DataClass } from "../data-classes";
import { LOT_CODE_RULES, normalizeLotInput, readLotCode, type LotCodeRule } from "./lot-code";
import { PROPERTY_SUBTYPE_FIELDS, unitFieldErrors } from "./property-type";
import type { CatalogBlockData } from "./types";

/**
 * Thuộc tính lô mà một lần tra mã lô trả ra (hàng 74) — đều lớp `catalog` (trần `external`). Không giá, không chủ nhà,
 * không ghi chú. Trường loại hình không dùng (bảng loại hình hàng 72) là `null`.
 */
export const LOT_ATTRIBUTE_FIELDS = [
  "subdivisionKey",
  "subdivisionName",
  "blockKey",
  "blockName",
  "blockLabel",
  "unitNumber",
  "upi",
  "propertyType",
  "propertySubType",
  "lotSizeArea",
  "storiesTotal",
  "frontageLength",
  "accessRoadWidth",
  "livingArea",
  "bedroomsTotal",
  "directionFaces",
] as const;
export type LotAttributeField = (typeof LOT_ATTRIBUTE_FIELDS)[number];

export const LOT_ATTRIBUTE_CLASS: Readonly<Record<LotAttributeField, DataClass>> = Object.fromEntries(
  LOT_ATTRIBUTE_FIELDS.map((f) => [f, "catalog"]),
) as Record<LotAttributeField, DataClass>;

export type LotAttributes = {
  subdivisionKey: string;
  subdivisionName: string;
  blockKey: string;
  blockName: string;
  /** Nhãn sàn của dãy, như «Shophouse». */
  blockLabel: string | null;
  unitNumber: string;
  upi: string;
  propertyType: string;
  propertySubType: string;
  lotSizeArea: number | null;
  storiesTotal: number | null;
  frontageLength: number | null;
  accessRoadWidth: number | null;
  livingArea: number | null;
  bedroomsTotal: number | null;
  directionFaces: string | null;
};

/**
 * Năm kết cục của một lần tra mã lô:
 * - `found` — đúng một lô.
 * - `not_in_catalog` — đọc được theo cách đọc của khu, danh mục không có lô ấy; nói dãy có trong danh mục hay không.
 * - `unreadable` — không cách đọc nào đọc được; kèm mẫu mã từng khu (danh mục rỗng → danh sách rỗng).
 * - `ambiguous` — mã khớp lô ở hơn một khu; không chọn hộ.
 * - `unknown_subdivision` — khu được chọn không có.
 */
export type LotLookupResult =
  | { status: "found"; unit: LotAttributes }
  | { status: "not_in_catalog"; read: { subdivisionKey: string; blockKey: string; unitNumber: string; blockKnown: boolean }[] }
  | { status: "unreadable"; input: string; examples: { subdivisionKey: string; subdivisionName: string; example: string }[] }
  | { status: "ambiguous"; candidates: LotAttributes[] }
  | { status: "unknown_subdivision"; subdivisionKey: string };

/** Danh mục lô: khu mang dãy. Cùng hình phần dãy của `CatalogSubdivisionData`. */
export type LotCatalogData = {
  subdivisions: readonly { subdivisionKey: string; subdivisionName: string; blocks?: readonly CatalogBlockData[] }[];
};

type LotSubdivisionIndex = {
  subdivisionKey: string;
  subdivisionName: string;
  rule: LotCodeRule | undefined;
  blockKeys: Set<string>;
  firstCode: string;
  /** Mã lô đã chuẩn hoá → lô. */
  lots: Map<string, LotAttributes[]>;
};

export type LotIndex = { subdivisions: LotSubdivisionIndex[] };

const TYPED = ["lotSizeArea", "storiesTotal", "frontageLength", "accessRoadWidth", "livingArea", "bedroomsTotal", "directionFaces"] as const;

/** Dựng chỉ mục tra lô một lần. Lô sai loại hình không lên được — lỗi gọi tên lô và trường. */
export function buildLotIndex(catalog: LotCatalogData, rules: readonly LotCodeRule[] = LOT_CODE_RULES): LotIndex {
  const loi: string[] = [];
  const subdivisions = catalog.subdivisions.map((s) => {
    const lots = new Map<string, LotAttributes[]>();
    const blockKeys = new Set<string>();
    let firstCode = "";
    for (const b of s.blocks ?? []) {
      blockKeys.add(normalizeLotInput(b.blockKey));
      for (const u of b.units) {
        for (const e of unitFieldErrors(u)) loi.push(`${u.upi} — ${e.message}`);
        if (!firstCode) firstCode = u.unitNumber;
        const dung = (PROPERTY_SUBTYPE_FIELDS as Record<string, { fields: readonly string[] }>)[u.propertySubType]?.fields ?? [];
        const typed = Object.fromEntries(TYPED.map((f) => [f, dung.includes(f) ? ((u as Record<string, unknown>)[f] ?? null) : null]));
        const lot = {
          subdivisionKey: s.subdivisionKey,
          subdivisionName: s.subdivisionName,
          blockKey: b.blockKey,
          blockName: b.blockName,
          blockLabel: b.nhanSan ?? null,
          unitNumber: u.unitNumber,
          upi: u.upi,
          propertyType: u.propertyType,
          propertySubType: u.propertySubType,
          ...typed,
        } as LotAttributes;
        const key = normalizeLotInput(u.unitNumber);
        if (!lots.has(key)) lots.set(key, []);
        lots.get(key)!.push(lot);
      }
    }
    return { subdivisionKey: s.subdivisionKey, subdivisionName: s.subdivisionName, rule: rules.find((r) => r.subdivisionKey === s.subdivisionKey), blockKeys, firstCode, lots };
  });
  if (loi.length > 0) throw new Error(`Danh mục có lô sai loại hình: ${loi.join("; ")}`);
  return { subdivisions };
}

/**
 * Tra một chuỗi gõ. Khu có cách đọc: đọc ra mã chuẩn rồi tra. Khu chưa có cách đọc: khớp mã danh mục sau chuẩn hoá, hoặc
 * khớp một mã chuẩn mà cách đọc của khu khác đọc ra từ chữ ấy — để hai khu trùng mã ra «nhiều lô» với mọi kiểu viết.
 */
export function lookupLot(index: LotIndex, input: string, subdivisionKey?: string): LotLookupResult {
  let subs = index.subdivisions;
  if (subdivisionKey !== undefined) {
    subs = subs.filter((s) => s.subdivisionKey === subdivisionKey);
    if (subs.length === 0) return { status: "unknown_subdivision", subdivisionKey };
  }
  const maChuan = new Set<string>();
  for (const s of subs) {
    if (!s.rule) continue;
    const p = readLotCode(s.rule, input);
    if (p) maChuan.add(normalizeLotInput(p.unitNumber));
  }
  const hits: LotAttributes[] = [];
  const read: { subdivisionKey: string; blockKey: string; unitNumber: string; blockKnown: boolean }[] = [];
  for (const s of subs) {
    if (s.rule) {
      const p = readLotCode(s.rule, input);
      if (!p) continue;
      const hit = s.lots.get(normalizeLotInput(p.unitNumber)) ?? [];
      if (hit.length > 0) hits.push(...hit);
      else read.push({ subdivisionKey: s.subdivisionKey, blockKey: p.block, unitNumber: p.unitNumber, blockKnown: s.blockKeys.has(p.block) });
    } else {
      for (const k of new Set([normalizeLotInput(input), ...maChuan])) hits.push(...(s.lots.get(k) ?? []));
    }
  }
  const duy = [...new Map(hits.map((h) => [h.upi, h])).values()];
  if (duy.length === 1) return { status: "found", unit: duy[0]! };
  if (duy.length > 1) {
    return { status: "ambiguous", candidates: duy.sort((a, b) => a.subdivisionKey.localeCompare(b.subdivisionKey) || a.upi.localeCompare(b.upi)) };
  }
  if (read.length > 0) return { status: "not_in_catalog", read };
  return {
    status: "unreadable",
    input,
    examples: subs.map((s) => ({ subdivisionKey: s.subdivisionKey, subdivisionName: s.subdivisionName, example: s.rule?.example ?? s.firstCode })),
  };
}
