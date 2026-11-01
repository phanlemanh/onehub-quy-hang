/**
 * Bốn nấc của lead đã nhập (hàng 27, ADR-0020): Đã gửi → Đã nhận → Đã gọi → Lên bảng, cộng bốn trạng thái phụ. Nấc suy
 * từ dữ kiện cơ sở dữ liệu giữ — không cột nấc nào được ghi. Bản trả cho telesales dựng ở đây, không ở màn (bất biến 4):
 * không số chủ, không mã hàng (luật 21).
 */
import type { FeeInclusion, LeadRecord, ListingTime, Need, Outcome } from "./index";

export const LEAD_STAGES = ["sent", "accepted", "called", "on_board"] as const;
export const LEAD_SIDE_STATES = ["returned", "resubmitted", "supplement", "discarded"] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];
export type LeadSideState = (typeof LEAD_SIDE_STATES)[number];
export type LeadState = LeadStage | LeadSideState;

export const LEAD_STAGE_LABELS: Readonly<Record<LeadState, string>> = {
  sent: "Đã gửi",
  accepted: "Đã nhận",
  called: "Đã gọi",
  on_board: "Lên bảng",
  returned: "Trả lại",
  resubmitted: "Đã gửi lại",
  supplement: "Tin bổ sung",
  discarded: "Đã bỏ",
};
/** Lead đã gửi mà nhịp chia chưa giao cho ai. */
export const AWAITING_ROUTING_LABEL = "Chờ chia";
/** Lý do trả lại duy nhất (Tham chiếu §13). */
export const RETURN_REASON_LABEL = "Số không liên lạc được";

/** Dữ kiện của một lead, đọc từ cột của lead và từ `app.lead_board_dates`. Mốc là chuỗi ISO, vắng là `null`. */
export type LeadStageFacts = {
  outcome: Outcome;
  matchedAgentUserId: string | null;
  routedAt: string | null;
  acceptedAt: string | null;
  firstCalledAt: string | null;
  boardAt: string | null;
  returnedAt: string | null;
  resubmittedAt: string | null;
  discardedAt: string | null;
};

/**
 * Thứ tự quyết: gửi lại → bỏ → căn trùng (tin bổ sung) → trả lại → lên bảng → gọi → nhận → gửi. Trả lại đứng trên lên bảng:
 * lead đã trả lại không lên bảng nữa, kể cả khi sau đó đầu chủ có hàng cùng số (Hỏi-4).
 */
export function leadStage(f: LeadStageFacts): LeadState {
  if (f.resubmittedAt !== null) return "resubmitted";
  if (f.discardedAt !== null) return "discarded";
  if (f.outcome === "unit_has_open_listing") return "supplement";
  if (f.returnedAt !== null) return "returned";
  if (f.boardAt !== null) return "on_board";
  if (f.firstCalledAt !== null) return "called";
  if (f.acceptedAt !== null) return "accepted";
  return "sent";
}

export type MyLeadRecord = LeadRecord &
  Omit<LeadStageFacts, "outcome" | "matchedAgentUserId" | "discardedAt"> & { resubmittedLeadId: string | null };

/** Khoá của bản telesales — đủ và chỉ những khoá này. */
export const MY_LEAD_VIEW_KEYS = [
  "id",
  "outcome",
  "agentName",
  "buildingName",
  "unitNumber",
  "need",
  "listPrice",
  "feeInclusion",
  "desiredListingTime",
  "createdAt",
  "discarded",
  "stage",
  "awaitingRouting",
  "routedAt",
  "acceptedAt",
  "firstCalledAt",
  "boardAt",
  "returnedAt",
  "returnReason",
  "resubmittedAt",
  "resubmittedLeadId",
] as const;

export type MyLeadView = {
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
  stage: LeadState;
  awaitingRouting: boolean;
  routedAt: string | null;
  acceptedAt: string | null;
  firstCalledAt: string | null;
  boardAt: string | null;
  returnedAt: string | null;
  returnReason: string | null;
  resubmittedAt: string | null;
  resubmittedLeadId: string | null;
};

/** Dựng từng khoá tường minh: bản ghi có thể mang số chủ hay mã hàng, không khoá nào của nó tự lọt sang. */
export function myLeadView(r: MyLeadRecord, agentName: string | null): MyLeadView {
  const stage = leadStage(r);
  return {
    id: r.id,
    outcome: r.outcome,
    agentName: r.matchedAgentUserId ? agentName : null,
    buildingName: r.buildingName,
    unitNumber: r.unitNumber ?? null,
    need: r.need,
    listPrice: r.listPrice,
    feeInclusion: r.feeInclusion,
    desiredListingTime: r.desiredListingTime,
    createdAt: r.createdAt,
    discarded: r.discardedAt !== null,
    stage,
    awaitingRouting: stage === "sent" && r.matchedAgentUserId === null,
    routedAt: r.routedAt,
    acceptedAt: r.acceptedAt,
    firstCalledAt: r.firstCalledAt,
    boardAt: r.boardAt,
    returnedAt: r.returnedAt,
    returnReason: r.returnedAt !== null ? RETURN_REASON_LABEL : null,
    resubmittedAt: r.resubmittedAt,
    resubmittedLeadId: r.resubmittedLeadId,
  };
}
