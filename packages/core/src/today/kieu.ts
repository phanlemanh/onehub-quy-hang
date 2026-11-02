/**
 * Kiểu của bộ máy hàng đợi (hàng 22): một nhóm là dữ liệu — điều kiện từ bộ từ vựng đóng, hành động từ thực đơn đóng.
 */
import type { LeadState } from "../dedupe/lead-stage";
import type { StandardStatus } from "../listing/status";

export type Anchor = "price" | "confirmed" | "active_since" | "price_or_confirmed";

export type Condition =
  | { kind: "status_in"; in: StandardStatus[] }
  | { kind: "days_since"; anchor: Anchor; days: number }
  | { kind: "missing_info" }
  | { kind: "changed_by_other"; since: "yesterday" | "today" }
  | { kind: "property_sub_type_in"; in: string[] }
  | { kind: "lead_stage_in"; in: LeadState[] };

export const LISTING_ACTIONS = ["owner_confirmed", "open_record"] as const;
export const LEAD_ACTIONS = ["accept", "first_call", "return"] as const;
export type ListingAction = (typeof LISTING_ACTIONS)[number];
export type LeadAction = (typeof LEAD_ACTIONS)[number];
export type Action = ListingAction | LeadAction;

export type Nhom = {
  code: string;
  label: string;
  subject: "listing" | "lead";
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
};
export type BoNhom = Nhom[];

/** Một lần đổi giá hay trạng thái gần nhất, như bản xem hàng trả (`lastPriceChange`, `lastStatusChange`). */
export type LanDoi = { at: string; byUserId: string; byRoles: string[]; from: unknown; to: unknown };

/** Dữ kiện của một căn cho hàng đợi — lấy từ bản xem hàng, cộng loại hình từ danh mục. */
export type DuKienCan = {
  standardStatus: StandardStatus;
  listAgentKey: string | null;
  lastConfirmedAt: string | null;
  priceChangeTimestamp: string | null;
  lastPriceChange: LanDoi | null;
  lastStatusChange: LanDoi | null;
  missing: readonly string[];
  /** RESO `PropertySubType` từ danh mục; căn ngoài danh mục là `null`. */
  propertySubType: string | null;
};

export type DuKienLead = { stage: LeadState };
