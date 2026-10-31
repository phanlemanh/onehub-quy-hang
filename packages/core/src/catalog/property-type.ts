import type { CatalogData } from "./types";

/**
 * Loại hình theo RESO DD 2.1 và trường dùng được của từng loại (hàng 72, ADR-0016 quyết định 1 và 2). Giá trị RESO
 * nguyên văn; nhãn riêng của sàn («Shophouse», «Liền kề») neo vào đây, không thêm giá trị vào lõi. Bảng là dữ liệu:
 * thêm loại hình là thêm một dòng. Trường bắt buộc khi Sẵn sàng bán và mục của mức đủ thêm vào cùng dòng ở hàng 76.
 */
export const PROPERTY_SUBTYPE_FIELDS = {
  Condominium: {
    propertyType: "Residential",
    fields: ["buildingName", "floor", "stack", "livingArea", "bedroomsTotal", "directionFaces"],
  },
  Townhouse: {
    propertyType: "Residential",
    fields: ["lotSizeArea", "livingArea", "storiesTotal", "frontageLength", "bedroomsTotal", "directionFaces", "accessRoadWidth"],
  },
  "Single Family Residence": {
    propertyType: "Residential",
    fields: ["lotSizeArea", "livingArea", "storiesTotal", "frontageLength", "bedroomsTotal", "directionFaces", "accessRoadWidth"],
  },
  "Unimproved Land": {
    propertyType: "Land",
    fields: ["lotSizeArea", "frontageLength", "accessRoadWidth"],
  },
} as const satisfies Record<string, { propertyType: string; fields: readonly string[] }>;

export type PropertySubType = keyof typeof PROPERTY_SUBTYPE_FIELDS;
export type PropertyType = (typeof PROPERTY_SUBTYPE_FIELDS)[PropertySubType]["propertyType"];

/** Mọi trường mà ít nhất một loại hình dùng — trường ngoài tập này không phải việc của bảng loại hình. */
export const TYPED_UNIT_FIELDS: readonly string[] = [...new Set(Object.values(PROPERTY_SUBTYPE_FIELDS).flatMap((t) => t.fields))];

export type UnitFieldError = { field: string; subType: string; message: string };

/**
 * Lỗi loại hình của một căn: cặp `propertyType/propertySubType` không có trong bảng, hoặc một trường có giá trị (khác
 * `null`) mà loại hình không dùng. Trường không dùng của loại hình là không có, không phải ô trống (ADR-0016).
 */
export function unitFieldErrors(unit: { propertyType: string; propertySubType: string } & Record<string, unknown>): UnitFieldError[] {
  const subType = unit.propertySubType;
  const dong = (PROPERTY_SUBTYPE_FIELDS as Record<string, { propertyType: string; fields: readonly string[] }>)[subType];
  if (!dong || dong.propertyType !== unit.propertyType) {
    return [{ field: "propertySubType", subType, message: `Loại hình «${unit.propertyType} / ${subType}» không có trong bảng loại hình.` }];
  }
  const out: UnitFieldError[] = [];
  for (const field of TYPED_UNIT_FIELDS) {
    const v = unit[field];
    if (v !== undefined && v !== null && !dong.fields.includes(field)) {
      out.push({ field, subType, message: `Trường «${field}» không thuộc loại hình «${subType}».` });
    }
  }
  return out;
}

/** Lỗi loại hình của cả danh mục, mỗi lỗi kèm UPI căn. */
export function catalogFieldErrors(catalog: CatalogData): (UnitFieldError & { upi: string })[] {
  return catalog.subdivisions.flatMap((s) => s.buildings.flatMap((b) => b.units.flatMap((u) => unitFieldErrors(u).map((e) => ({ ...e, upi: u.upi })))));
}
