/**
 * Chia lead và hạn (Tham chiếu §8 luật 20, hàng 25, ADR-0017). Cơ sở dữ liệu chở dữ kiện (hàng chờ chia, ứng viên, mốc
 * hạn); luật chọn người và xét hạn nằm ở đây. Mặc định của sàn — chỉnh ở Cài đặt sàn (P1). Nhập qua
 * `@quy-hang/core/routing`.
 */
import type { Role } from "../navigation";

/** Hạn mặc định của luật 20: 15 phút nhận, 30 phút gọi lần đầu. */
export const DEFAULT_LEAD_DEADLINES = { acceptMinutes: 15, firstCallMinutes: 30 } as const;
export type LeadDeadlines = { acceptMinutes: number; firstCallMinutes: number };

/** Ba loại lời báo cho trưởng nhóm. */
export const ALERT_KINDS = ["unrouted", "accept_overdue", "first_call_overdue"] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

/** Tên khu và tên toà so sau khi chuẩn hoá Unicode, bỏ khoảng trắng thừa, không phân hoa thường. */
const tenKhu = (s: string) => s.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
export function sameBuilding(zoneName: string, buildingName: string): boolean {
  return tenKhu(zoneName) === tenKhu(buildingName);
}

/** Một thành viên của sàn như hàm ứng viên trả: vai, khu phụ trách, nghỉ, ngày vào sàn, lần chia gần nhất. */
export type RoutingCandidate = {
  userId: string;
  roles: readonly string[];
  zoneNames: readonly string[];
  onLeave: boolean;
  joinedAt: string;
  /** `routed_seq` lớn nhất của lead đã chia cho người này; chưa nhận lần nào thì null. */
  lastRoutedSeq: number | null;
};

export type RoutingLead = { buildingName: string; priorAgentUserId: string | null };

export type RoutingChoice =
  | { userId: string; reason: "same_owner" | "building" }
  | { userId: null; reason: "no_agent_for_building" };

const DAU_CHU: Role = "listing_agent";
const dangLam = (c: RoutingCandidate) => c.roles.includes(DAU_CHU) && !c.onLeave;

/**
 * Người nhận theo luật mặc định: (a) đầu chủ của lead trước cùng số nếu còn vai đầu chủ và không nghỉ; (b) đầu chủ phụ
 * trách toà, không nghỉ, lâu chưa được chia nhất — chưa nhận lần nào đứng đầu, hoà thì người vào sàn trước, rồi mã người.
 */
export function chooseAgent(lead: RoutingLead, candidates: readonly RoutingCandidate[]): RoutingChoice {
  if (lead.priorAgentUserId) {
    const cu = candidates.find((c) => c.userId === lead.priorAgentUserId);
    if (cu && dangLam(cu)) return { userId: cu.userId, reason: "same_owner" };
  }
  const hop = candidates
    .filter((c) => dangLam(c) && c.zoneNames.some((z) => sameBuilding(z, lead.buildingName)))
    .sort(
      (a, b) =>
        (a.lastRoutedSeq ?? -1) - (b.lastRoutedSeq ?? -1) ||
        Date.parse(a.joinedAt) - Date.parse(b.joinedAt) ||
        (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0),
    );
  const nguoi = hop[0];
  return nguoi ? { userId: nguoi.userId, reason: "building" } : { userId: null, reason: "no_agent_for_building" };
}

/** Dữ kiện hạn của một lead đã về người: mốc hạn, mốc nhận, mốc gọi, loại đã báo cho mốc hạn ấy. */
export type DeadlineFact = {
  leadId: string;
  deadlineFrom: string;
  acceptedAt: string | null;
  firstCalledAt: string | null;
  raised: readonly AlertKind[];
};

const PHUT = 60_000;

/** Loại báo đến hạn lúc `now`: đủ hạn (lớn hơn hoặc bằng) mà chưa nhận / chưa gọi, và chưa báo cho mốc hạn ấy. */
export function dueAlerts(fact: DeadlineFact, now: Date, deadlines: LeadDeadlines = DEFAULT_LEAD_DEADLINES): AlertKind[] {
  const tu = Date.parse(fact.deadlineFrom);
  const den: AlertKind[] = [];
  if (fact.acceptedAt === null && now.getTime() >= tu + deadlines.acceptMinutes * PHUT) den.push("accept_overdue");
  if (fact.firstCalledAt === null && now.getTime() >= tu + deadlines.firstCallMinutes * PHUT) den.push("first_call_overdue");
  return den.filter((k) => !fact.raised.includes(k));
}
