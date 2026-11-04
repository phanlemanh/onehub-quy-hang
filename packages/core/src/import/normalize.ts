/**
 * Bộ chuẩn hoá MỘT CỬA (ADR-0011 quyết định 12): mọi cửa đưa chữ vào — lần nhập file, ô nhận lead, sửa trên ô, sửa hàng
 * loạt, API của sàn — gọi cùng hàm này cho cùng trường, nên «4,65 tỷ» hay «dong nam» ra cùng một giá trị ở mọi nơi. Lần
 * nhập là người dùng đầu tiên: `applyPlan` gọi đúng hàm này cho từng ô.
 */
import type { StandardField } from "./fields";
import { FIELD_TRANSFORM, runTransform, type Cell, type ImportContext, type Outcome, type Transform } from "./transforms";

export type NormalizeOptions = ImportContext & {
  /** Phép và tham số của cột khi đi từ kế hoạch nhập; vắng thì dùng phép mặc định của trường. */
  transform?: Transform;
  /** Từ điển giá trị riêng của cột trong kế hoạch: chữ nguyên văn → chữ tra tiếp. */
  valueMap?: Readonly<Record<string, string>>;
};

export function normalizeValue(field: StandardField, raw: Cell, opts: NormalizeOptions): Outcome {
  const t = opts.transform ?? FIELD_TRANSFORM[field];
  if (opts.valueMap && typeof raw === "string") {
    // Tra bằng `Object.hasOwn`: ô «constructor», «toString» không được trả hàm của nguyên mẫu (luật 38, Ngoài-2).
    const khoa = raw.trim();
    const mapped = Object.hasOwn(opts.valueMap, khoa) ? opts.valueMap[khoa] : undefined;
    if (mapped !== undefined) {
      const r = runTransform(t, mapped, opts);
      if (r.mark === "keep") return { ...r, mark: "fixed", reason: `kế hoạch đọc «${raw.trim()}» là «${mapped}»` };
      return r;
    }
  }
  return runTransform(t, raw, opts);
}
