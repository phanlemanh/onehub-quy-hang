import { dueAlerts, unroutedDue, type AlertKind, type RoutingStrategyKey } from "@quy-hang/core/routing";
import type pg from "pg";

/**
 * Đọc của Hôm nay trưởng nhóm (hàng 42) trên client do withCompany trao — vai `quy_hang_app`, luật theo dòng của bảng
 * `leads` (trưởng nhóm thấy cả sàn). Không chọn cột lớp nguồn (số chủ, bản mã, dấu băm): chỉ toà, mã căn, người nhận và
 * các mốc hạn. Luật hạn là của lõi (`unroutedDue`, `dueAlerts`) — như nhịp chia lead, nhưng tính từ trạng thái hiện tại
 * của lead chứ không từ lời báo đã ghi.
 */
export type LeadQueueItem = {
  leadId: string;
  kind: AlertKind;
  buildingName: string;
  unitNumber: string | null;
  agentUserId: string | null;
  dueAt: string;
};

type DongLead = {
  id: string;
  building_name: string;
  unit_number: string | null;
  matched_agent_user_id: string | null;
  created_at: Date;
  routed_at: Date | null;
  accepted_at: Date | null;
  first_called_at: Date | null;
  routing_strategy: RoutingStrategyKey;
  accept_minutes: number;
  first_call_minutes: number;
};

const PHUT = 60_000;

/**
 * Lead đang mở cần trưởng nhóm, quá hạn lâu nhất trước. Lead đang mở: không trùng hay chủ trùng, đã vào nhịp (đóng dấu
 * cách chia và hai hạn), chưa bỏ, chưa trả lại, còn thiếu người, mốc nhận hay mốc gọi. `now` là đồng hồ cơ sở dữ liệu.
 */
export async function readLeadQueue(tx: pg.PoolClient): Promise<LeadQueueItem[]> {
  const now = (await tx.query<{ now: Date }>("select now() as now")).rows[0]!.now;
  const { rows } = await tx.query<DongLead>(
    `select id, building_name, unit_number, matched_agent_user_id, created_at, routed_at, accepted_at, first_called_at,
            routing_strategy, accept_minutes, first_call_minutes
     from leads
     where company_id = app.current_company_id() and routing_strategy is not null
       and outcome in ('new', 'owner_has_agent') and discarded_at is null and returned_at is null
       and (matched_agent_user_id is null or accepted_at is null or first_called_at is null)`,
  );
  const ra: LeadQueueItem[] = [];
  for (const l of rows) {
    const dong = (kind: AlertKind, dueAt: number) =>
      ra.push({
        leadId: l.id,
        kind,
        buildingName: l.building_name,
        unitNumber: l.unit_number,
        agentUserId: l.matched_agent_user_id,
        dueAt: new Date(dueAt).toISOString(),
      });
    if (l.matched_agent_user_id === null) {
      const nhap = l.created_at.toISOString();
      if (!unroutedDue({ strategy: l.routing_strategy, createdAt: nhap, acceptMinutes: l.accept_minutes }, now)) continue;
      // Kho chung báo sau hạn nhận kể từ lúc nhập; các cách chia khác báo ngay lúc nhịp không chia được.
      const tre = l.routing_strategy === "open_pool" ? l.accept_minutes * PHUT : 0;
      dong("unrouted", l.created_at.getTime() + tre);
      continue;
    }
    // Mốc hạn = lần giao gần nhất; lead chủ trùng chưa giao lại thì lúc nhập (như app.lead_deadline_facts).
    const tu = (l.routed_at ?? l.created_at).getTime();
    const den = dueAlerts(
      {
        leadId: l.id,
        deadlineFrom: new Date(tu).toISOString(),
        acceptMinutes: l.accept_minutes,
        firstCallMinutes: l.first_call_minutes,
        acceptedAt: l.accepted_at?.toISOString() ?? null,
        firstCalledAt: l.first_called_at?.toISOString() ?? null,
        raised: [],
      },
      now,
    );
    // Một lead một dòng: chưa nhận thì việc cần làm là nhận (kể cả khi đã quá luôn hạn gọi); đã nhận thì là gọi.
    if (l.accepted_at === null) {
      if (den.includes("accept_overdue")) dong("accept_overdue", tu + l.accept_minutes * PHUT);
    } else if (den.includes("first_call_overdue")) dong("first_call_overdue", tu + l.first_call_minutes * PHUT);
  }
  return ra.sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt) || (a.leadId < b.leadId ? -1 : a.leadId > b.leadId ? 1 : 0));
}

export type ListingAgentRow = { userId: string; onLeave: boolean; openLeads: number };

/**
 * Đầu chủ của sàn để giao: cùng hàm ứng viên nhịp chia dùng (`app.lead_routing_candidates`), nên «đang nghỉ» và «lead
 * đang mở» (đã về, chưa bỏ, chưa trả lại, chưa gọi lần đầu) khớp đúng điều luật chia thấy.
 */
export async function readListingAgents(tx: pg.PoolClient): Promise<ListingAgentRow[]> {
  const { rows } = await tx.query<{ user_id: string; on_leave: boolean; open_leads: number }>(
    "select user_id, on_leave, open_leads from app.lead_routing_candidates()",
  );
  return rows.map((r) => ({ userId: r.user_id, onLeave: r.on_leave, openLeads: r.open_leads }));
}
