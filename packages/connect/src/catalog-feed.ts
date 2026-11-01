import { unitFieldErrors } from "@quy-hang/core";
import { z } from "zod";

/**
 * Khuôn của loại kết nối «nguồn danh mục» (catalog_source), chiều vào.
 *
 * Bên cung cấp đầu tiên là OneHub Invest (ADR-0017 §5): khu → toà → trục → căn từ danh bạ vật thể. Tên trường theo
 * RESO DD 2.1 như ADR-0013/ADR-0016 của Invest: toà = BuildingName, phân khu = ComplexName, trục = extension Stack,
 * định danh căn = UPI kiểu `urn:onehub:upi`. Hình khớp `CatalogData` của lõi cộng phần đầu gói (`schemaVersion`,
 * `provider`, `measuredAt`).
 *
 * Mọi object đều `.strict()`: khoá lạ bị từ chối. Đây là lưới ở cửa nhận — không phải cách duy nhất chặn tên nguồn,
 * đường dẫn bài gốc hay giá trị chỉ có từ S08 (bộ soát ở cửa ra của Invest làm việc đó), nhưng thứ gì không có trong
 * khuôn thì không vào được.
 *
 * Phiên bản 1 (ADR-0015): luật loại hình của lõi nằm trong khuôn — cặp `propertyType/propertySubType` phải có trong
 * bảng loại hình, trường không thuộc loại hình phải vắng hoặc `null`. UPI trùng trong gói và khoá khu trùng bị từ chối
 * cả gói. Bản 0 (nháp) bỏ.
 */
export const CATALOG_FEED_SCHEMA_VERSION = 1;

const Upi = z.string().regex(/^urn:onehub:upi:/, "UPI phải có dạng urn:onehub:upi:…");

/** Số đo dương hoặc `null`; vắng = loại hình không dùng trường này. */
const OptionalMeasure = z.number().positive().nullable().optional();

export const CatalogUnit = z
  .object({
    upi: Upi,
    unitNumber: z.string().min(1),
    stack: z.string().min(1).nullable(),
    floor: z.number().int().nullable(),
    livingArea: z.number().positive().nullable(),
    bedroomsTotal: z.number().int().nonnegative().nullable(),
    directionFaces: z.string().min(1).nullable(),
    // Loại hình RESO nguyên văn (hàng 72, ADR-0016 quyết định 1); cặp hợp lệ do bảng loại hình của lõi kiểm.
    propertyType: z.string().min(1),
    propertySubType: z.string().min(1),
    // Trường của loại hình thấp tầng, đất (ADR-0016 quyết định 2); căn hộ không có.
    lotSizeArea: OptionalMeasure,
    storiesTotal: z.number().int().positive().nullable().optional(),
    frontageLength: OptionalMeasure,
    /** Lộ giới — đặc trưng Việt Nam, RESO không có. */
    accessRoadWidth: OptionalMeasure,
  })
  .strict();

export const CatalogBuilding = z
  .object({
    buildingKey: z.string().min(1),
    buildingName: z.string().min(1),
    units: z.array(CatalogUnit),
  })
  .strict();

export const CatalogSubdivision = z
  .object({
    subdivisionKey: z.string().min(1),
    subdivisionName: z.string().min(1),
    complexName: z.string().min(1).nullable(),
    buildings: z.array(CatalogBuilding),
  })
  .strict();

export const CatalogFeed = z
  .object({
    schemaVersion: z.literal(CATALOG_FEED_SCHEMA_VERSION),
    provider: z.string().min(1),
    /** Mốc đo của bên cung cấp, như ADR-0014: số cũ phải nhận ra được là cũ. */
    measuredAt: z.string().datetime({ offset: true }),
    subdivisions: z.array(CatalogSubdivision),
  })
  .strict()
  .superRefine((feed, ctx) => {
    // Khoá khu trùng: upsert lần hai sẽ đè lần một — từ chối cả gói (Review Focus 2).
    const subdivisionKeys = new Set<string>();
    // UPI là định danh căn toàn cục: hai căn cùng UPI trong một gói thì không biết căn nào đúng.
    const upis = new Set<string>();
    feed.subdivisions.forEach((s, i) => {
      if (subdivisionKeys.has(s.subdivisionKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["subdivisions", i, "subdivisionKey"],
          message: `Khoá khu «${s.subdivisionKey}» trùng trong gói.`,
        });
      }
      subdivisionKeys.add(s.subdivisionKey);
      s.buildings.forEach((b, j) => {
        b.units.forEach((u, k) => {
          const unitPath = ["subdivisions", i, "buildings", j, "units", k];
          if (upis.has(u.upi)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...unitPath, "upi"], message: `UPI «${u.upi}» trùng trong gói.` });
          }
          upis.add(u.upi);
          for (const e of unitFieldErrors(u)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...unitPath, e.field], message: e.message });
          }
        });
      });
    });
  });

export type CatalogFeed = z.infer<typeof CatalogFeed>;

export type CatalogFeedError = { path: (string | number)[]; message: string };

/** Đọc một gói danh mục; sai khuôn thì trả mọi lỗi kèm đường khoá, không ném. */
export function parseCatalogFeed(raw: unknown): { ok: true; feed: CatalogFeed } | { ok: false; errors: CatalogFeedError[] } {
  const r = CatalogFeed.safeParse(raw);
  if (r.success) return { ok: true, feed: r.data };
  return { ok: false, errors: r.error.issues.map((issue) => ({ path: [...issue.path], message: issue.message })) };
}
