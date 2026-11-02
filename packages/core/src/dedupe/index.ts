/**
 * Ô nhận lead và kiểm trùng lúc nhập (Tham chiếu §8 luật 19–21, hàng 24, ADR-0012). Lead là bản ghi riêng, chưa là hàng:
 * telesales thấy kết quả của lead, không thấy hàng. Cơ sở dữ liệu chỉ chở hai dữ kiện (`app.lead_dedupe_facts`); luật
 * quyết kết quả và bản trả cho người nhập nằm ở đây. Nhập qua `@quy-hang/core/dedupe`.
 */
import { normalizePhone } from "../access/owner-input";
import { FEE_INCLUSIONS, type PayloadError } from "../listing/events";
import { kiemMaCan } from "../listing/gan-ma-can";
import { STANDARD_STATUSES, TRANSITIONS, type StandardStatus } from "../listing/status";

/** Nhu cầu của chủ nhà (Hỏi-1). */
export const NEEDS = ["sale", "lease", "sale_or_lease"] as const;
export type Need = (typeof NEEDS)[number];
export const NEED_LABELS: Readonly<Record<Need, string>> = { sale: "Bán", lease: "Cho thuê", sale_or_lease: "Cả hai" };

/** Thời gian chủ muốn ra hàng (Hỏi-2). */
export const LISTING_TIMES = ["now", "within_1_month", "within_3_months", "undecided"] as const;
export type ListingTime = (typeof LISTING_TIMES)[number];
export const LISTING_TIME_LABELS: Readonly<Record<ListingTime, string>> = {
  now: "Ngay",
  within_1_month: "Trong 1 tháng",
  within_3_months: "1–3 tháng",
  undecided: "Chưa định",
};

export type FeeInclusion = (typeof FEE_INCLUSIONS)[number];

/** Năm mục bắt buộc (luật 19). `ownerPhone` thuộc lớp `source`: không bao giờ vào bản trả cho người nhập. */
export type LeadInput = {
  ownerPhone: string;
  buildingName: string;
  unitNumber?: string;
  need: Need;
  listPrice: number;
  feeInclusion: FeeInclusion;
  desiredListingTime: ListingTime;
};
export type LeadInputResult = { ok: true; value: LeadInput } | { ok: false; errors: PayloadError[] };

const KHOA = ["ownerPhone", "buildingName", "unitNumber", "need", "listPrice", "feeInclusion", "desiredListingTime"] as const;
const chu = (v: unknown) => typeof v === "string" && v.trim().length > 0 && v.length <= 200;
const motTrong = (ds: readonly string[], v: unknown) => typeof v === "string" && ds.includes(v);

/** Khuôn chặt của lead: thiếu hay sai mục nào nêu đúng khoá ấy; khoá lạ — kể cả khoá nguồn khác — bị từ chối. */
export function validateLeadInput(payload: unknown): LeadInputResult {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { ok: false, errors: [{ path: "payload", reason: "cần một đối tượng" }] };
  const p = payload as Record<string, unknown>;
  const errors: PayloadError[] = [];
  for (const k of Object.keys(p)) if (!(KHOA as readonly string[]).includes(k)) errors.push({ path: k, reason: "khoá lạ" });
  const thieu = (k: string) => !(k in p) && (errors.push({ path: k, reason: "thiếu" }), true);

  const so = normalizePhone(p.ownerPhone);
  if (!thieu("ownerPhone") && !so) errors.push({ path: "ownerPhone", reason: "cần số điện thoại Việt Nam 10 chữ số" });
  if (!thieu("buildingName") && !chu(p.buildingName)) errors.push({ path: "buildingName", reason: "cần chữ, 1–200 ký tự" });
  if ("unitNumber" in p && p.unitNumber !== undefined) {
    // Mã căn theo đúng luật của lõi hàng (va-ma-can-lead): lead mang mã toàn dấu sẽ không tạo được hàng.
    const loi = !chu(p.unitNumber) ? "cần chữ, 1–200 ký tự" : kiemMaCan(p.unitNumber as string);
    if (loi) errors.push({ path: "unitNumber", reason: loi });
  }
  if (!thieu("need") && !motTrong(NEEDS, p.need)) errors.push({ path: "need", reason: `cần một trong: ${NEEDS.join(", ")}` });
  if (!thieu("listPrice") && !(typeof p.listPrice === "number" && Number.isSafeInteger(p.listPrice) && p.listPrice > 0)) {
    errors.push({ path: "listPrice", reason: "cần số đồng nguyên dương" });
  }
  if (!thieu("feeInclusion") && !motTrong(FEE_INCLUSIONS, p.feeInclusion)) errors.push({ path: "feeInclusion", reason: `cần một trong: ${FEE_INCLUSIONS.join(", ")}` });
  if (!thieu("desiredListingTime") && !motTrong(LISTING_TIMES, p.desiredListingTime)) {
    errors.push({ path: "desiredListingTime", reason: `cần một trong: ${LISTING_TIMES.join(", ")}` });
  }
  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      ownerPhone: so!,
      buildingName: (p.buildingName as string).trim(),
      ...(typeof p.unitNumber === "string" && { unitNumber: p.unitNumber.trim() }),
      need: p.need as Need,
      listPrice: p.listPrice as number,
      feeInclusion: p.feeInclusion as FeeInclusion,
      desiredListingTime: p.desiredListingTime as ListingTime,
    },
  };
}

/**
 * Hàng mở = hàng còn lối chuyển: Đã bán và Ngừng hẳn là nấc cuối, mở lại là hàng mới (Tham chiếu §5). Hàm dữ kiện của
 * cơ sở dữ liệu nhận đúng danh sách này làm tham số, nên luật chỉ nằm ở đây.
 */
export const OPEN_STATUSES: readonly StandardStatus[] = STANDARD_STATUSES.filter((s) => TRANSITIONS[s].length > 0);

export const OUTCOMES = ["new", "owner_has_agent", "unit_has_open_listing"] as const;
export type Outcome = (typeof OUTCOMES)[number];

/** Hai dữ kiện `app.lead_dedupe_facts` trả về — chỉ mã và người, không số, không trường nào của hàng. */
export type DedupeFacts = {
  openListing: { listingId: string; agentUserId: string | null } | null;
  ownerAgentUserId: string | null;
};
export type Decision = { outcome: Outcome; agentUserId: string | null; listingId: string | null };

/**
 * Luật 20. Căn trùng thắng chủ trùng: lead thường trên căn đã có hàng mở sẽ thành hàng mở thứ hai trên một căn — trái
 * «mỗi sàn tối đa một hàng đang mở trên một căn» (Tham chiếu §4).
 */
export function decideOutcome(facts: DedupeFacts): Decision {
  if (facts.openListing) return { outcome: "unit_has_open_listing", agentUserId: facts.openListing.agentUserId, listingId: facts.openListing.listingId };
  if (facts.ownerAgentUserId) return { outcome: "owner_has_agent", agentUserId: facts.ownerAgentUserId, listingId: null };
  return { outcome: "new", agentUserId: null, listingId: null };
}

/** Lead như cơ sở dữ liệu giữ — bản trả cho người nhập dựng từ đây bằng `leadResultView`. */
export type LeadRecord = Omit<LeadInput, "ownerPhone"> & {
  id: string;
  outcome: Outcome;
  matchedAgentUserId: string | null;
  matchedListingId: string | null;
  createdAt: string;
  discardedAt: string | null;
  ownerPhone?: string;
};

/** Bản của telesales (luật 21): kết quả, tên đầu chủ nhận (Hỏi-3), năm mục trừ số chủ — không hàng, không số. */
export type LeadResultView = {
  id: string;
  outcome: Outcome;
  agentName: string | null;
  buildingName: string;
  unitNumber: string | null;
  need: Need;
  listPrice: number;
  feeInclusion: FeeInclusion;
  desiredListingTime: ListingTime;
  createdAt: string;
  discarded: boolean;
};

export function leadResultView(lead: LeadRecord, agentName: string | null): LeadResultView {
  return {
    id: lead.id,
    outcome: lead.outcome,
    agentName: lead.matchedAgentUserId ? agentName : null,
    buildingName: lead.buildingName,
    unitNumber: lead.unitNumber ?? null,
    need: lead.need,
    listPrice: lead.listPrice,
    feeInclusion: lead.feeInclusion,
    desiredListingTime: lead.desiredListingTime,
    createdAt: lead.createdAt,
    discarded: lead.discardedAt !== null,
  };
}

/** «Bỏ lead này» chỉ ở lead căn trùng, chưa bỏ (Tham chiếu §13, L3). */
export function canDiscard(lead: Pick<LeadRecord, "outcome" | "discardedAt">): { ok: true } | { ok: false; reason: "not-duplicate-unit" | "already-discarded" } {
  if (lead.outcome !== "unit_has_open_listing") return { ok: false, reason: "not-duplicate-unit" };
  if (lead.discardedAt !== null) return { ok: false, reason: "already-discarded" };
  return { ok: true };
}

const so1 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
/** Máy nói lại giá (luật 7): «3,2 tỷ, đã bao phí». */
export function understoodPrice(listPrice: number, fee: FeeInclusion): string {
  const tien = listPrice >= 1_000_000_000 ? `${so1.format(listPrice / 1_000_000_000)} tỷ` : `${so1.format(listPrice / 1_000_000)} triệu`;
  return `${tien}, ${fee === "included" ? "đã bao phí" : "chưa bao phí"}`;
}

export * from "./lead-stage";
