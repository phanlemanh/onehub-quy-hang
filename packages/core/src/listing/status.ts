/**
 * Sáu trạng thái chuẩn của hàng (Tham chiếu §5, RESO `StandardStatus`) và luật chuyển (hàng 8, ADR-0008).
 * Sàn thêm nhãn, không thêm nghĩa: không có trạng thái thứ bảy.
 */
export const STANDARD_STATUSES = ["Incomplete", "Active", "Pending", "Closed", "Hold", "Withdrawn"] as const;
export type StandardStatus = (typeof STANDARD_STATUSES)[number];

/** Ba lý do «Ngừng hẳn» của Tham chiếu §5: chủ đã bán nơi khác · chủ đổi ý · không liên lạc được. */
export const WITHDRAWN_REASONS = ["sold_elsewhere", "owner_changed_mind", "unreachable"] as const;
export type WithdrawnReason = (typeof WITHDRAWN_REASONS)[number];

/**
 * Bảng chuyển đã duyệt ở Cổng Phạm vi (Hỏi-3): 12 lối. Đã bán và Ngừng hẳn là nấc cuối — mở lại là hàng mới; không lùi
 * về Chưa đủ để rao; Đang giao dịch về Đang bán khi khách bỏ cọc.
 */
export const TRANSITIONS: Readonly<Record<StandardStatus, readonly StandardStatus[]>> = {
  Incomplete: ["Active", "Hold", "Withdrawn"],
  Active: ["Pending", "Closed", "Hold", "Withdrawn"],
  Pending: ["Active", "Closed", "Withdrawn"],
  Closed: [],
  Hold: ["Active", "Withdrawn"],
  Withdrawn: [],
};

/** Đổi sang hai trạng thái này thắng ngay dù phiên bản cũ (luật 10: «Đã bán» và «Đã cọc» thắng ngay). */
export const WINS_IMMEDIATELY: readonly StandardStatus[] = ["Pending", "Closed"];

export function isStandardStatus(value: unknown): value is StandardStatus {
  return typeof value === "string" && (STANDARD_STATUSES as readonly string[]).includes(value);
}

/** Điều thiếu khi vào một trạng thái — tên trùng khoá dữ liệu để màn chỉ đúng ô cần điền. */
export type Requirement = "closePrice" | "withdrawnReason" | "listPrice" | "feeInclusion" | "realPhoto" | "legalStatus" | "occupantType";

/** Nhãn mặc định của từng điều thiếu (chữ thường, ghép sau «thiếu») — một chỗ cho Bảng hàng, bộ đồng bộ, hồ sơ căn. */
export const NHAN_DIEU_KIEN: Readonly<Record<Requirement, string>> = {
  listPrice: "giá",
  feeInclusion: "điều kiện phí",
  realPhoto: "ảnh thật",
  legalStatus: "pháp lý",
  occupantType: "tình trạng sử dụng",
  closePrice: "giá chốt",
  withdrawnReason: "lý do ngừng",
};

/** Nhãn một điều thiếu — điều lạ (máy chủ mới hơn bản trên máy) giữ nguyên tên. */
export const nhanDieuKien = (k: string): string => (NHAN_DIEU_KIEN as Record<string, string>)[k] ?? k;

/** Những gì hàng đang có, cộng giá trị kèm theo lệnh đổi trạng thái. */
export type TransitionContext = {
  listPrice?: number | null;
  feeInclusion?: string | null;
  legalStatus?: string | null;
  occupantType?: string | null;
  closePrice?: number | null;
  withdrawnReason?: string | null;
  /**
   * Số ảnh thật của căn (ngăn Gửi được, không ảnh mẫu, chưa xoá — hàng 23). API luôn đưa khi đổi sang Đang bán; máy của
   * đầu chủ không giữ ảnh nên Bảng hàng để trống và điều ảnh do máy chủ xét (Hỏi-2).
   */
  realPhotoCount?: number;
  /** Số ảnh thật tối thiểu của sàn (`listing.ready_min_real_photos`); vắng là mặc định của lõi. */
  minRealPhotos?: number;
};

export type TransitionCheck =
  | { ok: true }
  | { ok: false; kind: "invalid-transition"; reason: string }
  | { ok: false; kind: "missing-requirement"; missing: Requirement[] };

const co = (v: unknown) => v !== undefined && v !== null && v !== "";

/** Số ảnh thật tối thiểu để vào Đang bán khi sàn chưa đặt (hàng 23, điều khoá K7 của Sổ điểm biến thiên). */
export const MAC_DINH_ANH_THAT_TOI_THIEU = 1;

/**
 * Điều kiện vào từng trạng thái. Vào Đang bán: giá kèm điều kiện phí (thay cho giá về tay tới hàng 28), ảnh thật, pháp lý,
 * tình trạng sử dụng (luật 17, ADR-0008 Hỏi-1, hàng 23).
 */
export function missingFor(to: StandardStatus, ctx: TransitionContext): Requirement[] {
  if (to === "Closed") return typeof ctx.closePrice === "number" && ctx.closePrice > 0 ? [] : ["closePrice"];
  if (to === "Withdrawn") {
    return (WITHDRAWN_REASONS as readonly unknown[]).includes(ctx.withdrawnReason) ? [] : ["withdrawnReason"];
  }
  if (to === "Active") {
    const thieu: Requirement[] = [];
    if (!(typeof ctx.listPrice === "number" && ctx.listPrice > 0)) thieu.push("listPrice");
    if (!co(ctx.feeInclusion)) thieu.push("feeInclusion");
    if (ctx.realPhotoCount !== undefined && ctx.realPhotoCount < (ctx.minRealPhotos ?? MAC_DINH_ANH_THAT_TOI_THIEU)) thieu.push("realPhoto");
    if (!co(ctx.legalStatus)) thieu.push("legalStatus");
    if (!co(ctx.occupantType)) thieu.push("occupantType");
    return thieu;
  }
  return [];
}

export function checkTransition(from: StandardStatus, to: unknown, ctx: TransitionContext = {}): TransitionCheck {
  if (!isStandardStatus(to)) return { ok: false, kind: "invalid-transition", reason: `«${String(to)}» không phải trạng thái chuẩn` };
  if (!TRANSITIONS[from].includes(to)) return { ok: false, kind: "invalid-transition", reason: `${from} không chuyển sang ${to}` };
  const missing = missingFor(to, ctx);
  return missing.length ? { ok: false, kind: "missing-requirement", missing } : { ok: true };
}
