/**
 * Áp kế hoạch lên MỌI dòng (ADR-0011 quyết định 1: «mã áp kế hoạch lên mọi dòng, kiểm, rồi mới cho xem trước»). Mỗi ô ra
 * đúng một dấu — giữ nguyên · máy sửa · cần người · chặn — qua bộ chuẩn hoá một cửa `normalizeValue`, rồi ba luật cấp
 * dòng: điều kiện phí tách từ ô giá, đối chiếu danh mục theo mã căn (quyết định 12), trùng mã căn trong file. Không đồng
 * hồ, không ngẫu nhiên: cùng đầu vào ra cùng kết quả từng byte.
 */
import { buildCatalogIndex, lookupUnit, type CatalogIndex, type UnitAttributes } from "../catalog/lookup";
import type { CatalogData } from "../catalog/types";
import { fold } from "./dictionaries";
import { CATALOG_FIELDS, isStandardField, type StandardField } from "./fields";
import type { Table } from "./grid";
import { normalizeValue } from "./normalize";
import type { ImportPlan, PlanTarget } from "./plan";
import type { Cell, ImportContext, Mark, Value } from "./transforms";

/** Ai quyết dấu của ô: bộ chuẩn hoá, hay một luật cấp dòng (để người đọc — và bài kiểm — biết ô nào đi đường nào). */
export type DecidedBy = "normalize" | "fee_from_price" | "catalog" | "duplicate";

export type AppliedCell = {
  column: string;
  target: PlanTarget;
  raw: Cell;
  mark: Mark;
  value?: Value;
  reason?: string;
  by: DecidedBy;
};
export type AppliedRow = {
  source: number;
  cells: AppliedCell[];
  /** Giá trị suy cho trường không có cột riêng (vd điều kiện phí tách từ ô giá khi file không có cột phí). */
  extra: Partial<Record<StandardField, Value>>;
};
export type ApplyResult = { rows: AppliedRow[] };

const chiMuc = new WeakMap<CatalogData, CatalogIndex>();
function chiMucCua(c: CatalogData) {
  let i = chiMuc.get(c);
  if (!i) chiMuc.set(c, (i = buildCatalogIndex(c)));
  return i;
}

function giaTriDanhMuc(field: StandardField, u: UnitAttributes): Value {
  switch (field) {
    case "buildingName":
      return u.buildingName;
    case "subdivisionName":
      return u.subdivisionName;
    case "floor":
      return u.floor;
    case "livingArea":
      return u.livingArea;
    case "bedroomsTotal":
      return u.bedroomsTotal;
    case "directionFaces":
      return u.directionFaces;
    default:
      return null;
  }
}

function khopDanhMuc(field: StandardField, file: Value, dm: Value): boolean {
  if (file === null || dm === null) return file === dm;
  if (typeof file === "number" && typeof dm === "number") return field === "livingArea" ? Math.abs(file - dm) < 0.05 : file === dm;
  const [a, b] = [fold(String(file)), fold(String(dm))];
  // «A» khớp «Toà A»: file ghi khoá toà, danh mục ghi tên toà.
  return a === b || (field === "buildingName" && b.endsWith(` ${a}`));
}

export function applyPlan(table: Table, plan: ImportPlan, ctx: ImportContext): ApplyResult {
  const rows: AppliedRow[] = table.rows.map((row) => {
    const extra: AppliedRow["extra"] = {};
    const cells: AppliedCell[] = plan.columns.map((col, i) => {
      const raw = row.cells[i] ?? null;
      if (!isStandardField(col.target)) {
        const v = raw === null ? null : String(raw).normalize("NFC").trim() || null;
        return { column: col.column, target: col.target, raw, mark: "keep", value: col.target === "ignore_with_reason" ? null : v, by: "normalize" };
      }
      const o = normalizeValue(col.target, raw, { ...ctx, transform: col.transform, valueMap: col.valueMap });
      if (o.mark === "keep" || o.mark === "fixed") {
        for (const [k, v] of Object.entries(o.also ?? {})) extra[k as StandardField] = v as Value;
        return o.mark === "keep"
          ? { column: col.column, target: col.target, raw, mark: "keep", value: o.value, by: "normalize" }
          : { column: col.column, target: col.target, raw, mark: "fixed", value: o.value, reason: o.reason, by: "normalize" };
      }
      return { column: col.column, target: col.target, raw, mark: o.mark, reason: o.reason, by: "normalize" };
    });

    // Điều kiện phí tách từ ô giá: có cột phí thì đối chiếu, không thì giữ ở `extra`.
    const phiTuGia = extra.feeInclusion;
    const oPhi = cells.find((c) => c.target === "feeInclusion");
    if (phiTuGia !== undefined && oPhi) {
      delete extra.feeInclusion;
      if (oPhi.mark === "keep" && oPhi.value === null) Object.assign(oPhi, { mark: "fixed", value: phiTuGia, reason: "lấy điều kiện phí ghi trong ô giá", by: "fee_from_price" });
      else if ((oPhi.mark === "keep" || oPhi.mark === "fixed") && oPhi.value !== phiTuGia) {
        Object.assign(oPhi, { mark: "needs_person", reason: `ô giá ghi điều kiện phí «${phiTuGia}», ô phí ghi «${String(oPhi.value)}»`, by: "fee_from_price" });
        delete oPhi.value;
      }
    }

    // Đối chiếu danh mục theo mã căn: trường danh mục lấy từ danh mục, ô của file chỉ để đối chiếu.
    const oMa = cells.find((c) => c.target === "unitNumber");
    if (ctx.catalog && oMa && (oMa.mark === "keep" || oMa.mark === "fixed") && typeof oMa.value === "string") {
      const r = lookupUnit(chiMucCua(ctx.catalog), oMa.value);
      if (r.status === "found") {
        for (const c of cells) {
          if (!isStandardField(c.target) || !CATALOG_FIELDS.includes(c.target)) continue;
          if (c.mark !== "keep" && c.mark !== "fixed") continue;
          if (c.value === null || c.value === undefined) continue;
          const dm = giaTriDanhMuc(c.target, r.unit);
          if (!khopDanhMuc(c.target, c.value, dm)) {
            Object.assign(c, { mark: "needs_person", reason: `file ghi «${String(c.value)}», danh mục ghi «${String(dm)}» cho ${r.unit.unitNumber}`, by: "catalog" });
            delete c.value;
          } else if (c.value !== dm) Object.assign(c, { mark: "fixed", value: dm, reason: `lấy theo danh mục: «${String(dm)}»`, by: "catalog" });
        }
      }
    }
    return { source: row.source, cells, extra };
  });

  // Trùng mã căn chuẩn trong file: cả hai dòng cần người.
  const theoMa = new Map<string, number[]>();
  rows.forEach((r, i) => {
    const c = r.cells.find((x) => x.target === "unitNumber");
    if (c && (c.mark === "keep" || c.mark === "fixed") && typeof c.value === "string") theoMa.set(c.value, [...(theoMa.get(c.value) ?? []), i]);
  });
  for (const [ma, ds] of theoMa) {
    if (ds.length < 2) continue;
    for (const i of ds) {
      const c = rows[i]!.cells.find((x) => x.target === "unitNumber")!;
      const khac = ds.filter((j) => j !== i).map((j) => rows[j]!.source + 1);
      Object.assign(c, { mark: "needs_person", reason: `trùng mã căn ${ma} với dòng ${khac.join(", ")} của file`, by: "duplicate" });
      delete c.value;
    }
  }
  return { rows };
}
