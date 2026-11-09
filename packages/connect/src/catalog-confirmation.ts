import {
  CATALOG_CONFIRMATION_SCHEMA_VERSION,
  DO_DAI_MA_CAN,
  HUONG_RESO,
  MAU_DANG_SDT,
  MAU_DOAN_SDT,
  MAU_MA_CAN,
  MAU_MA_TOA,
  MAU_MA_TRUC,
  MAU_NGAY,
  MAU_UPI,
  TRUONG_BAO_SAI,
} from "@quy-hang/core/confirmation";
import { z } from "zod";

/**
 * Khuôn của loại kết nối «xác nhận danh mục» (catalog_confirmation), chiều ra — phiên bản 1 (hàng 95, ADR-0027;
 * ADR-0017 §6 sửa đổi 03/11 của Invest). Máy thu Invest kiểm sự kiện kéo về bằng chính khuôn này.
 *
 * Ba loại sự kiện: khung toà, thuộc tính căn, báo sai. Chỉ lớp danh mục, kèm mã sàn và mã người mờ; không bao giờ chủ
 * nhà, số điện thoại, giá đáy, ảnh sổ, giá chốt, trạng thái hàng. Mọi object `.strict()` — khoá lạ bị từ chối; mọi chuỗi
 * có mẫu hoặc là tập đóng — không chữ tự do. Sự kiện chỉ dựng được bằng hàm của lõi (`@quy-hang/core/confirmation`);
 * hằng khuôn nhập từ đó, không chép.
 */
export { CATALOG_CONFIRMATION_SCHEMA_VERSION };

/** Regex phủ định dựng từ chính hằng của lõi — khuôn và hàm dựng không thể lệch nhau. */
const khongKhop = (m: RegExp) => new RegExp(`^(?!.*(?:${m.source}))`);

const MaMo = z.string().regex(/^[A-Za-z0-9_-]{43}$/, "Mã mờ phải là 43 ký tự base64url.");
const Ngay = z.string().regex(MAU_NGAY, "observedOn là ngày YYYY-MM-DD, không giờ.");
const MaToa = z.string().regex(MAU_MA_TOA, "Khoá toà sai dạng.").regex(khongKhop(MAU_DOAN_SDT), "Khoá toà có đoạn dáng số điện thoại.");
const Upi = z.string().regex(MAU_UPI, "UPI phải có dạng urn:onehub:upi:…").regex(khongKhop(MAU_DOAN_SDT), "UPI có đoạn dáng số điện thoại.");
const MaCan = z
  .string()
  .max(DO_DAI_MA_CAN)
  .regex(MAU_MA_CAN, "Mã căn ngoài dạng đóng.")
  .regex(/^(?!.*\d{8})/, "Mã căn không được là dãy số dài.")
  .regex(khongKhop(MAU_DANG_SDT), "Mã căn không được có dáng số điện thoại.");
const MaTruc = z.string().regex(MAU_MA_TRUC, "Mã trục ngoài dạng đóng.");
const Huong = z.enum(HUONG_RESO);

const vo = {
  schemaVersion: z.literal(CATALOG_CONFIRMATION_SCHEMA_VERSION),
  officeKey: MaMo,
  memberKey: MaMo,
  observedOn: Ngay,
  buildingKey: MaToa,
};

export const BuildingFrameEvent = z
  .object({
    ...vo,
    eventType: z.literal("building_frame"),
    storiesTotal: z.number().int().min(1).max(120),
    skippedFloors: z.array(z.number().int().min(1)),
    stacks: z.array(MaTruc).min(1).max(60),
  })
  .strict();

export const UnitAttributesEvent = z
  .object({
    ...vo,
    eventType: z.literal("unit_attributes"),
    upi: Upi.nullable(),
    unitNumber: MaCan,
    livingArea: z.number().positive().optional(),
    bedroomsTotal: z.number().int().nonnegative().optional(),
    directionFaces: Huong.optional(),
    floor: z.number().int().optional(),
    stack: MaTruc.optional(),
  })
  .strict();

export const CorrectionEvent = z
  .object({
    ...vo,
    eventType: z.literal("correction"),
    upi: Upi,
    field: z.enum(TRUONG_BAO_SAI),
    correctValue: z.union([z.number(), MaCan, MaTruc, Huong]),
  })
  .strict();

/** Kiểu của `correctValue` theo `field`. */
const KIEU_BAO_SAI: Readonly<Record<(typeof TRUONG_BAO_SAI)[number], z.ZodTypeAny>> = {
  unitNumber: MaCan,
  livingArea: z.number().positive(),
  bedroomsTotal: z.number().int().nonnegative(),
  directionFaces: Huong,
  floor: z.number().int(),
  stack: MaTruc,
};

export const CatalogConfirmation = z
  .discriminatedUnion("eventType", [BuildingFrameEvent, UnitAttributesEvent, CorrectionEvent])
  .superRefine((e, ctx) => {
    if (e.eventType === "building_frame") {
      e.skippedFloors.forEach((t, i) => {
        if (t > e.storiesTotal || (i > 0 && t <= (e.skippedFloors[i - 1] ?? 0))) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["skippedFloors", i], message: "Tầng bị bỏ phải tăng dần, trong số tầng." });
        }
      });
      if (new Set(e.stacks).size !== e.stacks.length) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["stacks"], message: "Mã trục trùng." });
      }
    } else if (e.eventType === "unit_attributes") {
      const co = ["livingArea", "bedroomsTotal", "directionFaces", "floor", "stack"].some((k) => k in e);
      if (!co) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [], message: "Cần ít nhất một giá trị sàn khai." });
    } else if (!KIEU_BAO_SAI[e.field].safeParse(e.correctValue).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["correctValue"], message: `Giá trị đúng sai kiểu của «${e.field}».` });
    }
  });

export type CatalogConfirmation = z.infer<typeof CatalogConfirmation>;
export type CatalogConfirmationError = { path: (string | number)[]; message: string };

/** Đọc một sự kiện xác nhận; sai khuôn thì trả mọi lỗi kèm đường khoá, không ném. */
export function parseCatalogConfirmation(
  raw: unknown,
): { ok: true; event: CatalogConfirmation } | { ok: false; errors: CatalogConfirmationError[] } {
  const r = CatalogConfirmation.safeParse(raw);
  if (r.success) return { ok: true, event: r.data };
  return { ok: false, errors: r.error.issues.map((issue) => ({ path: [...issue.path], message: issue.message })) };
}
