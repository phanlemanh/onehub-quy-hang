import { CATALOG_CONFIDENCE_FIELDS, CATALOG_CONFIDENCE_LEVELS, PROPERTY_SUBTYPE_FIELDS, unitFieldErrors } from "@quy-hang/core";
import { MAU_DOAN_SDT } from "@quy-hang/core/confirmation";
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

/**
 * Mốc đo có múi giờ. Thêm hai giới hạn của `timestamptz`, vì khuôn nhận mà cơ sở dữ liệu từ chối thì bên đẩy nhận lỗi máy chủ
 * thay vì lỗi có đường khoá: độ lệch múi giờ tới ±15:59, năm từ 0001.
 */
const MocDo = z
  .string()
  .datetime({ offset: true })
  .refine((s) => {
    const m = /([+-])(\d{2}):?(\d{2})$/.exec(s);
    const lechHopLe = !m || Number(m[2]) * 60 + Number(m[3]) <= 15 * 60 + 59;
    return lechHopLe && !s.startsWith("0000");
  }, "Mốc đo có múi giờ hoặc năm ngoài khoảng nhận được.");

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

type GoiDanhMuc = { subdivisions: z.infer<typeof CatalogSubdivision>[] };

/** Luật chung của phần danh mục ở mọi phiên bản: khoá khu và UPI không trùng, trường theo loại hình. */
function kiemDanhMuc(feed: GoiDanhMuc, ctx: z.RefinementCtx) {
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
}

export const CatalogFeed = z
  .object({
    schemaVersion: z.literal(CATALOG_FEED_SCHEMA_VERSION),
    provider: z.string().min(1),
    /** Mốc đo của bên cung cấp, như ADR-0014: số cũ phải nhận ra được là cũ. */
    measuredAt: MocDo,
    subdivisions: z.array(CatalogSubdivision),
  })
  .strict()
  .superRefine((feed, ctx) => kiemDanhMuc(feed, ctx));

export type CatalogFeed = z.infer<typeof CatalogFeed>;

export type CatalogFeedError = { path: (string | number)[]; message: string };

// ---- Phiên bản 2: danh mục có độ chắc, số thị trường, tin rao đã khớp căn (hàng 94, ADR-0015 sửa đổi 09/11) ----

export const CATALOG_FEED_V2_SCHEMA_VERSION = 2;
/** Mọi phiên bản cửa nhận còn nhận. Bỏ v1 bằng một hàng riêng khi Invest báo đã chuyển. */
export const CATALOG_FEED_VERSIONS = [CATALOG_FEED_SCHEMA_VERSION, CATALOG_FEED_V2_SCHEMA_VERSION] as const;

const NhanDoChac = z.enum(CATALOG_CONFIDENCE_LEVELS);
const FieldConfidence = z
  .object(Object.fromEntries(CATALOG_CONFIDENCE_FIELDS.map((f) => [f, NhanDoChac.optional()])) as Record<(typeof CATALOG_CONFIDENCE_FIELDS)[number], z.ZodOptional<typeof NhanDoChac>>)
  .strict();

const CatalogUnitV2 = CatalogUnit.extend({ fieldConfidence: FieldConfidence }).strict();
const CatalogBuildingV2 = CatalogBuilding.extend({ units: z.array(CatalogUnitV2) }).strict();
const CatalogSubdivisionV2 = CatalogSubdivision.extend({ buildings: z.array(CatalogBuildingV2) }).strict();

/** Giá đang rao hay giá tin, đồng; tiền tỷ vượt số nguyên 32 bit nên chặn theo số an toàn của JavaScript. */
const GiaDong = z.number().int().safe().positive();
const MarketSegment = z
  .object({
    buildingKey: z.string().min(1),
    propertyType: z.string().min(1),
    propertySubType: z.string().min(1),
    /** `null` khi loại hình không dùng trường này. */
    bedroomsTotal: z.number().int().nonnegative().nullable(),
    listPriceLow: GiaDong,
    listPriceHigh: GiaDong,
    listPriceMedian: GiaDong,
    listingCount: z.number().int().positive(),
  })
  .strict();

const MarketStats = z.object({ subdivisionKey: z.string().min(1), measuredAt: MocDo, segments: z.array(MarketSegment) }).strict();

const NgayCoThat = z
  .string()
  .refine((s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s, "onMarketDate phải là ngày YYYY-MM-DD có thật.");

const PublicListing = z
  .object({
    listingKey: z
      .string()
      .regex(/^[A-Za-z0-9_-]{8,64}$/, "listingKey phải là mã mờ 8–64 ký tự.")
      .regex(new RegExp(`^(?!.*(?:${MAU_DOAN_SDT.source}))`), "listingKey có đoạn dáng số điện thoại."),
    upi: Upi,
    listPrice: GiaDong,
    /** `null` khi tin không nói; cùng tập với `listings.fee_inclusion`. */
    feeInclusion: z.enum(["included", "excluded"]).nullable(),
    onMarketDate: NgayCoThat,
  })
  .strict();

const PublicListings = z.object({ subdivisionKey: z.string().min(1), measuredAt: MocDo, listings: z.array(PublicListing) }).strict();

/** Khoá không phải chữ của bên đẩy: tập đóng, ngày giờ, số phiên bản, mã tin (đã có mẫu riêng). Mọi lá chuỗi khác đi qua lưới giá trị cấm. */
const KHOA_KHONG_SOAT = new Set(["schemaVersion", "measuredAt", "onMarketDate", "feeInclusion", "propertyType", "propertySubType", "listingKey"]);
const DANG_CAM: { ten: string; mau: RegExp }[] = [
  { ten: "đường dẫn", mau: /https?:\/\//i },
  { ten: "đường dẫn", mau: /\bwww\./i },
  { ten: "tên miền", mau: /\b[a-z0-9-]+\.(?:com|net|org|vn|io|info|biz|asia|co)(?:\.[a-z]{2})?\b/i },
  { ten: "số điện thoại", mau: /(?<![A-Za-z0-9])\+?\d(?:[\s.\-_/:]*\d){8,10}(?![A-Za-z0-9])/ },
  { ten: "số điện thoại", mau: MAU_DOAN_SDT },
];
/** Khoá do máy cấp được phép có dãy số dính chữ (như ULID, ADR-0027); chữ do người gõ thì không. */
const KHOA_MA_MAY = new Set(["subdivisionKey", "buildingKey", "upi"]);
const SO_TRONG_CHU_TU_DO = /\d(?:[\s().\-_/:]*\d){8,10}/;

/** Duyệt đệ quy mọi lá chuỗi: khuôn đóng chặn khoá lạ, lưới này chặn đường dẫn hay số lọt qua trường chữ. */
function soatChuoi(gt: unknown, path: (string | number)[], ctx: z.RefinementCtx, khoa?: string) {
  if (typeof gt === "string") {
    const trung = DANG_CAM.find((d) => d.mau.test(gt)) ?? (khoa && !KHOA_MA_MAY.has(khoa) && SO_TRONG_CHU_TU_DO.test(gt) ? { ten: "số điện thoại" } : undefined);
    if (trung) ctx.addIssue({ code: z.ZodIssueCode.custom, path, message: `Giá trị có dáng ${trung.ten}, không được vào gói.` });
    return;
  }
  if (Array.isArray(gt)) {
    gt.forEach((x, i) => soatChuoi(x, [...path, i], ctx, khoa));
    return;
  }
  if (gt && typeof gt === "object") {
    for (const [k, v] of Object.entries(gt)) {
      if (!KHOA_KHONG_SOAT.has(k) && k !== "fieldConfidence") soatChuoi(v, [...path, k], ctx, k);
    }
  }
}

type GoiV2 = {
  subdivisions: z.infer<typeof CatalogSubdivisionV2>[];
  marketStats: z.infer<typeof MarketStats>[];
  publicListings: z.infer<typeof PublicListings>[];
};

function kiemDoChac(feed: GoiV2, ctx: z.RefinementCtx) {
  feed.subdivisions.forEach((s, i) =>
    s.buildings.forEach((b, j) =>
      b.units.forEach((u, k) => {
        for (const f of CATALOG_CONFIDENCE_FIELDS) {
          const coGiaTri = u[f] !== null && u[f] !== undefined;
          const coNhan = u.fieldConfidence[f] !== undefined;
          if (coGiaTri === coNhan) continue;
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["subdivisions", i, "buildings", j, "units", k, "fieldConfidence", f],
            message: coGiaTri ? `Giá trị «${f}» thiếu nhãn độ chắc.` : `Trường «${f}» không có giá trị mà có nhãn độ chắc.`,
          });
        }
      }),
    ),
  );
}

function kiemThiTruong(feed: GoiV2, ctx: z.RefinementCtx) {
  const toaTheoKhu = new Map(feed.subdivisions.map((s) => [s.subdivisionKey, new Set(s.buildings.map((b) => b.buildingKey))]));
  const khuDaGap = new Set<string>();
  feed.marketStats.forEach((m, i) => {
    const goc = ["marketStats", i];
    if (khuDaGap.has(m.subdivisionKey)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...goc, "subdivisionKey"], message: `Khu «${m.subdivisionKey}» lặp trong số thị trường.` });
    }
    khuDaGap.add(m.subdivisionKey);
    const toa = toaTheoKhu.get(m.subdivisionKey);
    if (!toa) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...goc, "subdivisionKey"], message: `Khu «${m.subdivisionKey}» không có trong gói.` });
      return;
    }
    const khoaDoan = new Set<string>();
    m.segments.forEach((d, j) => {
      const p = [...goc, "segments", j];
      const them = (o: string | null, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: o ? [...p, o] : p, message });
      if (!toa.has(d.buildingKey)) them("buildingKey", `Toà «${d.buildingKey}» không thuộc khu «${m.subdivisionKey}».`);
      const dong = (PROPERTY_SUBTYPE_FIELDS as Record<string, { propertyType: string; fields: readonly string[] }>)[d.propertySubType];
      if (!dong || dong.propertyType !== d.propertyType) {
        them("propertySubType", `Loại hình «${d.propertyType}/${d.propertySubType}» không có trong bảng loại hình.`);
      } else if (dong.fields.includes("bedroomsTotal") !== (d.bedroomsTotal !== null)) {
        them("bedroomsTotal", d.bedroomsTotal === null ? `Loại hình «${d.propertySubType}» phải có số phòng ngủ.` : `Loại hình «${d.propertySubType}» không dùng số phòng ngủ.`);
      }
      if (d.listPriceLow > d.listPriceMedian) them("listPriceLow", "Giá thấp nhất lớn hơn trung vị.");
      if (d.listPriceMedian > d.listPriceHigh) them("listPriceHigh", "Trung vị lớn hơn giá cao nhất.");
      const khoa = JSON.stringify([d.buildingKey, d.propertyType, d.propertySubType, d.bedroomsTotal]);
      if (khoaDoan.has(khoa)) them(null, "Đoạn số thị trường trùng khoá trong khu.");
      khoaDoan.add(khoa);
    });
  });
}

function kiemTinRao(feed: GoiV2, ctx: z.RefinementCtx) {
  const canTheoKhu = new Map(feed.subdivisions.map((s) => [s.subdivisionKey, new Set(s.buildings.flatMap((b) => b.units.map((u) => u.upi)))]));
  const khuDaGap = new Set<string>();
  feed.publicListings.forEach((m, i) => {
    const goc = ["publicListings", i];
    if (khuDaGap.has(m.subdivisionKey)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...goc, "subdivisionKey"], message: `Khu «${m.subdivisionKey}» lặp trong tin rao.` });
    }
    khuDaGap.add(m.subdivisionKey);
    const can = canTheoKhu.get(m.subdivisionKey);
    if (!can) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...goc, "subdivisionKey"], message: `Khu «${m.subdivisionKey}» không có trong gói.` });
      return;
    }
    const maTin = new Set<string>();
    m.listings.forEach((t, j) => {
      const p = [...goc, "listings", j];
      if (!can.has(t.upi)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...p, "upi"], message: `UPI «${t.upi}» không có trong khu «${m.subdivisionKey}» của gói.` });
      if (maTin.has(t.listingKey)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...p, "listingKey"], message: `Mã tin «${t.listingKey}» trùng trong khu.` });
      maTin.add(t.listingKey);
    });
  });
}

export const CatalogFeedV2 = z
  .object({
    schemaVersion: z.literal(CATALOG_FEED_V2_SCHEMA_VERSION),
    provider: z.string().min(1),
    measuredAt: MocDo,
    subdivisions: z.array(CatalogSubdivisionV2),
    marketStats: z.array(MarketStats),
    publicListings: z.array(PublicListings),
  })
  .strict()
  .superRefine((feed, ctx) => {
    kiemDanhMuc(feed, ctx);
    kiemDoChac(feed, ctx);
    kiemThiTruong(feed, ctx);
    kiemTinRao(feed, ctx);
    soatChuoi(feed, [], ctx);
  });

export type CatalogFeedV2 = z.infer<typeof CatalogFeedV2>;
export type AnyCatalogFeed = CatalogFeed | CatalogFeedV2;

/** Đọc một gói danh mục theo số phiên bản nó khai; sai khuôn thì trả mọi lỗi kèm đường khoá, không ném. */
export function parseCatalogFeed(raw: unknown): { ok: true; feed: AnyCatalogFeed } | { ok: false; errors: CatalogFeedError[] } {
  const v = (raw as { schemaVersion?: unknown } | null | undefined)?.schemaVersion;
  if (v !== CATALOG_FEED_SCHEMA_VERSION && v !== CATALOG_FEED_V2_SCHEMA_VERSION) {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, errors: [{ path: [], message: "Thân gói phải là một đối tượng." }] };
    return { ok: false, errors: [{ path: ["schemaVersion"], message: `schemaVersion phải là ${CATALOG_FEED_VERSIONS.join(" hoặc ")}.` }] };
  }
  const r = v === CATALOG_FEED_V2_SCHEMA_VERSION ? CatalogFeedV2.safeParse(raw) : CatalogFeed.safeParse(raw);
  if (r.success) return { ok: true, feed: r.data };
  return { ok: false, errors: r.error.issues.map((issue) => ({ path: [...issue.path], message: issue.message })) };
}
