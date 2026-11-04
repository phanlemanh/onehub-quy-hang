/**
 * Chia lead và hạn (Tham chiếu §8 luật 20, hàng 25, ADR-0017). Cơ sở dữ liệu chở dữ kiện (hàng chờ chia, ứng viên, mốc
 * hạn, cấu hình của sàn); luật chọn người, thực đơn cách chia và xét hạn nằm ở đây. Nhập qua `@quy-hang/core/routing`.
 */
import { khoangCua, macDinhSo, CAU_HINH_SAN_MAC_DINH } from "../config/giai";
import type { Role } from "../navigation";

/** Thực đơn cách chia — sàn chọn một; không kịch bản tự viết. */
export const ROUTING_STRATEGIES = [
  "zone_round_robin",
  "company_round_robin",
  "zone_least_open",
  "open_pool",
  "manual",
] as const;
export type RoutingStrategyKey = (typeof ROUTING_STRATEGIES)[number];

/** Ai đọc lời báo của sàn. */
export const ALERT_AUDIENCES = ["team_lead", "team_lead_and_admin"] as const;
export type AlertAudience = (typeof ALERT_AUDIENCES)[number];

export type LeadRoutingSettings = {
  strategy: RoutingStrategyKey;
  acceptMinutes: number;
  firstCallMinutes: number;
  alertTo: AlertAudience;
};

/**
 * Mặc định của sàn — cấu hình chia lead khi sàn chưa đặt gì: chia theo khu phụ trách lần lượt, 15 phút nhận, 30 phút gọi
 * lần đầu (luật 20), lời báo cho trưởng nhóm. Chỗ khai duy nhất; SQL và lối API không chép lại con số.
 */
export const DEFAULT_LEAD_ROUTING: LeadRoutingSettings = {
  strategy: CAU_HINH_SAN_MAC_DINH["lead_routing.strategy"] as RoutingStrategyKey,
  acceptMinutes: macDinhSo("lead_routing.accept_minutes"),
  firstCallMinutes: macDinhSo("lead_routing.first_call_minutes"),
  alertTo: CAU_HINH_SAN_MAC_DINH["lead_routing.alert_to"] as AlertAudience,
};

/** Khoảng phút sàn được đặt cho mỗi hạn: từ 1 phút tới một ngày — khoảng của sổ (#1; #2 cùng khoảng). */
export const DEADLINE_MINUTES = khoangCua("lead_routing.accept_minutes");

/** Khoá trong bảng cấu hình theo sàn (`company_settings`): «<nhóm>.<khoá>», giá trị JSON. */
export const LEAD_ROUTING_KEYS = {
  strategy: "lead_routing.strategy",
  acceptMinutes: "lead_routing.accept_minutes",
  firstCallMinutes: "lead_routing.first_call_minutes",
  alertTo: "lead_routing.alert_to",
} as const satisfies Record<keyof LeadRoutingSettings, string>;

type Truong = keyof LeadRoutingSettings;
const TRUONG = Object.keys(LEAD_ROUTING_KEYS) as Truong[];

/** Lỗi của một giá trị cấu hình, hoặc null khi hợp lệ. */
function loiTruong(t: Truong, v: unknown): string | null {
  const khoa = LEAD_ROUTING_KEYS[t];
  if (t === "strategy") return ROUTING_STRATEGIES.includes(v as RoutingStrategyKey) ? null : `${khoa}: ngoài thực đơn`;
  if (t === "alertTo") return ALERT_AUDIENCES.includes(v as AlertAudience) ? null : `${khoa}: ngoài thực đơn`;
  const { min, max } = khoangCua(khoa);
  return Number.isInteger(v) && (v as number) >= min && (v as number) <= max ? null : `${khoa}: phải là số phút nguyên từ ${min} tới ${max}`;
}

/** Cấu hình của sàn từ các dòng `company_settings`: khoá vắng lấy mặc định, khoá nhóm khác bỏ qua, giá trị hỏng thì ném. */
export function readLeadRoutingSettings(rows: readonly { key: string; value: unknown }[]): LeadRoutingSettings {
  const ra: LeadRoutingSettings = { ...DEFAULT_LEAD_ROUTING };
  for (const t of TRUONG) {
    const dong = rows.find((r) => r.key === LEAD_ROUTING_KEYS[t]);
    if (!dong) continue;
    const loi = loiTruong(t, dong.value);
    if (loi) throw new Error(`cấu hình hỏng — ${loi}`);
    (ra as Record<Truong, unknown>)[t] = dong.value;
  }
  // Cặp hạn trái luật (một nửa đặt riêng) không áp: hai hạn về mặc định, lead vẫn chia; lỗi hiện ở bộ đọc cấu hình chung
  // của sàn (hàng 82, Hỏi-1 = a — luật đợt 46).
  if (ra.firstCallMinutes < ra.acceptMinutes) {
    ra.acceptMinutes = DEFAULT_LEAD_ROUTING.acceptMinutes;
    ra.firstCallMinutes = DEFAULT_LEAD_ROUTING.firstCallMinutes;
  }
  return ra;
}

export type LeadRoutingPatch =
  | { ok: true; settings: LeadRoutingSettings; rows: { key: string; value: unknown }[] }
  | { ok: false; error: string };

/** Kiểm một lần đổi cấu hình: chỉ bốn khoá, mỗi khoá trong thực đơn hay khoảng phút, hạn gọi không ngắn hơn hạn nhận. */
export function applyLeadRoutingPatch(current: LeadRoutingSettings, input: unknown): LeadRoutingPatch {
  if (input === null || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "thân phải là đối tượng" };
  const vao = input as Record<string, unknown>;
  const la = Object.keys(vao).filter((k) => !TRUONG.includes(k as Truong));
  if (la.length) return { ok: false, error: `khoá lạ: ${la.join(", ")}` };
  if (Object.keys(vao).length === 0) return { ok: false, error: "không có khoá nào để đổi" };
  for (const t of TRUONG) {
    if (!(t in vao)) continue;
    const loi = loiTruong(t, vao[t]);
    if (loi) return { ok: false, error: loi };
  }
  const settings = { ...current, ...vao } as LeadRoutingSettings;
  if (settings.firstCallMinutes < settings.acceptMinutes)
    return { ok: false, error: `${LEAD_ROUTING_KEYS.firstCallMinutes}: hạn gọi ngắn hơn hạn nhận` };
  return { ok: true, settings, rows: TRUONG.filter((t) => t in vao).map((t) => ({ key: LEAD_ROUTING_KEYS[t], value: vao[t] })) };
}

/** Ba loại lời báo. */
export const ALERT_KINDS = ["unrouted", "accept_overdue", "first_call_overdue"] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

/** Tên khu và tên toà so sau khi chuẩn hoá Unicode, bỏ khoảng trắng thừa, không phân hoa thường. */
const tenKhu = (s: string) => s.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("vi");
export function sameBuilding(zoneName: string, buildingName: string): boolean {
  return tenKhu(zoneName) === tenKhu(buildingName);
}

/** Một thành viên của sàn như hàm ứng viên trả: vai, khu phụ trách, nghỉ, ngày vào sàn, lần chia gần nhất, lead đang mở. */
export type RoutingCandidate = {
  userId: string;
  roles: readonly string[];
  zoneNames: readonly string[];
  onLeave: boolean;
  joinedAt: string;
  /** `routed_seq` lớn nhất của lead đã về người này; chưa nhận lần nào thì null. */
  lastRoutedSeq: number | null;
  /** Lead đã về người này, chưa bỏ, chưa ghi gọi lần đầu. */
  openLeads: number;
};

export type RoutingLead = { buildingName: string; priorAgentUserId: string | null };

export type RoutingChoice =
  | { userId: string; reason: "same_owner" | "building" | "company" | "least_open" }
  | { userId: null; reason: "no_agent_for_building" | "no_agent" | "pool" | "manual" };

/** Một cách chia trong thực đơn: chọn người khi lead không về người cũ, và lúc báo lead chưa có người. */
export type RoutingStrategy = {
  pick(lead: RoutingLead, candidates: readonly RoutingCandidate[]): RoutingChoice;
  /** «now»: báo «chưa chia được» ở nhịp đầu không chia được; «after_accept»: báo khi lead chưa ai nhận đã đủ hạn nhận. */
  unroutedAlert: "now" | "after_accept";
};

const DAU_CHU: Role = "listing_agent";
const dangLam = (c: RoutingCandidate) => c.roles.includes(DAU_CHU) && !c.onLeave;
const phuTrach = (lead: RoutingLead) => (c: RoutingCandidate) => c.zoneNames.some((z) => sameBuilding(z, lead.buildingName));
/** Lâu chưa được chia nhất đứng trước (chưa nhận lần nào đầu tiên), hoà thì người vào sàn trước, rồi mã người. */
const theoVong = (a: RoutingCandidate, b: RoutingCandidate) =>
  (a.lastRoutedSeq ?? -1) - (b.lastRoutedSeq ?? -1) ||
  Date.parse(a.joinedAt) - Date.parse(b.joinedAt) ||
  (a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0);

function dauTien<R extends RoutingChoice["reason"]>(
  ds: RoutingCandidate[],
  so: (a: RoutingCandidate, b: RoutingCandidate) => number,
  co: R,
  khong: "no_agent_for_building" | "no_agent",
): RoutingChoice {
  const nguoi = ds.sort(so)[0];
  return nguoi ? ({ userId: nguoi.userId, reason: co } as RoutingChoice) : { userId: null, reason: khong };
}

export const STRATEGIES: Record<RoutingStrategyKey, RoutingStrategy> = {
  zone_round_robin: {
    pick: (lead, cs) => dauTien(cs.filter((c) => dangLam(c) && phuTrach(lead)(c)), theoVong, "building", "no_agent_for_building"),
    unroutedAlert: "now",
  },
  company_round_robin: {
    pick: (_lead, cs) => dauTien(cs.filter(dangLam), theoVong, "company", "no_agent"),
    unroutedAlert: "now",
  },
  zone_least_open: {
    pick: (lead, cs) =>
      dauTien(
        cs.filter((c) => dangLam(c) && phuTrach(lead)(c)),
        (a, b) => a.openLeads - b.openLeads || theoVong(a, b),
        "least_open",
        "no_agent_for_building",
      ),
    unroutedAlert: "now",
  },
  open_pool: { pick: () => ({ userId: null, reason: "pool" }), unroutedAlert: "after_accept" },
  manual: { pick: () => ({ userId: null, reason: "manual" }), unroutedAlert: "now" },
};

/**
 * Người nhận của một lead: luật 20 đứng trước mọi cách chia — đầu chủ của lead trước cùng số nếu còn vai đầu chủ và không
 * nghỉ; không thì theo cách chia của sàn.
 */
export function chooseAgent(
  lead: RoutingLead,
  candidates: readonly RoutingCandidate[],
  strategy: RoutingStrategyKey = DEFAULT_LEAD_ROUTING.strategy,
): RoutingChoice {
  if (lead.priorAgentUserId) {
    const cu = candidates.find((c) => c.userId === lead.priorAgentUserId);
    if (cu && dangLam(cu)) return { userId: cu.userId, reason: "same_owner" };
  }
  return STRATEGIES[strategy].pick(lead, candidates);
}

/** Lead kho chung hiện cho (và nhận được bởi) đầu chủ không nghỉ phụ trách toà của lead (Hỏi-7). */
export function poolVisibleTo(lead: { buildingName: string }, c: RoutingCandidate): boolean {
  return dangLam(c) && c.zoneNames.some((z) => sameBuilding(z, lead.buildingName));
}

const PHUT = 60_000;

/** Lead chưa có người đã tới lúc báo «chưa chia được» chưa (đã báo rồi thì bộ gọi không gọi lại). */
export function unroutedDue(
  lead: { strategy: RoutingStrategyKey; createdAt: string; acceptMinutes: number },
  now: Date,
): boolean {
  if (STRATEGIES[lead.strategy].unroutedAlert === "now") return true;
  return now.getTime() >= Date.parse(lead.createdAt) + lead.acceptMinutes * PHUT;
}

/** Dữ kiện hạn của một lead đã về người: mốc hạn, hai hạn đã đóng dấu lúc lead vào nhịp, mốc nhận, mốc gọi, loại đã báo. */
export type DeadlineFact = {
  leadId: string;
  deadlineFrom: string;
  acceptMinutes: number;
  firstCallMinutes: number;
  acceptedAt: string | null;
  firstCalledAt: string | null;
  raised: readonly AlertKind[];
};

/** Loại báo đến hạn lúc `now`: đủ hạn (lớn hơn hoặc bằng) mà chưa nhận / chưa gọi, và chưa báo cho mốc hạn ấy. */
export function dueAlerts(fact: DeadlineFact, now: Date): AlertKind[] {
  const tu = Date.parse(fact.deadlineFrom);
  const den: AlertKind[] = [];
  if (fact.acceptedAt === null && now.getTime() >= tu + fact.acceptMinutes * PHUT) den.push("accept_overdue");
  if (fact.firstCalledAt === null && now.getTime() >= tu + fact.firstCallMinutes * PHUT) den.push("first_call_overdue");
  return den.filter((k) => !fact.raised.includes(k));
}
