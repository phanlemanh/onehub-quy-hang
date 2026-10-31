import { z } from "zod";

/**
 * Khuôn của loại kết nối «nguồn danh mục» (catalog_source), chiều vào.
 *
 * Bên cung cấp đầu tiên là OneHub Invest (ADR-0017 §5): khu → toà → trục → căn từ danh bạ vật thể. Tên trường theo
 * RESO DD 2.1 như ADR-0013/ADR-0016 của Invest: toà = BuildingName, phân khu = ComplexName, trục = extension Stack,
 * định danh căn = UPI kiểu `urn:onehub:upi`.
 *
 * Mọi object đều `.strict()`: khoá lạ bị từ chối. Đây là lưới ở cửa nhận — không phải cách duy nhất chặn tên nguồn,
 * đường dẫn bài gốc hay giá trị chỉ có từ S08 (bộ soát ở cửa ra của Invest làm việc đó), nhưng thứ gì không có trong
 * khuôn thì không vào được.
 *
 * Phiên bản 0 = nháp, chưa phát hành: Invest chưa ghim. Lên 1 khi có số thị trường và tin rao đã khớp căn.
 */
export const CATALOG_FEED_SCHEMA_VERSION = 0;

const Upi = z.string().regex(/^urn:onehub:upi:/, "UPI phải có dạng urn:onehub:upi:…");

export const CatalogUnit = z
  .object({
    upi: Upi,
    unitNumber: z.string().min(1),
    stack: z.string().min(1).nullable(),
    floor: z.number().int().nullable(),
    livingArea: z.number().positive().nullable(),
    bedroomsTotal: z.number().int().nonnegative().nullable(),
    directionFaces: z.string().min(1).nullable(),
    // Loại hình RESO nguyên văn (hàng 72, ADR-0016 quyết định 1); cặp hợp lệ do lõi kiểm.
    propertyType: z.string().min(1),
    propertySubType: z.string().min(1),
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
  .strict();

export type CatalogFeed = z.infer<typeof CatalogFeed>;
