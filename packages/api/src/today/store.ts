import { leadStage, understoodPrice, type FeeInclusion, type LeadState, type Need, type Outcome } from "@quy-hang/core/dedupe";
import { docBoNhom, kiemBoNhom, nhomCuaLead, QUEUE_GROUPS_KEY, type BoNhom, type BoNhomDangAp } from "@quy-hang/core/today";
import type pg from "pg";
import { readSettings } from "../routing/store";

/**
 * Hôm nay của đầu chủ (hàng 22): đọc, ghi bộ nhóm của sàn và lead giao cho tôi — trên client do withCompany trao. Bộ kiểm,
 * bộ mặc định và luật nhóm ở lõi (`@quy-hang/core/today`); ở đây chỉ chở dòng `company_settings` và dữ kiện lead.
 */

/** Dòng cấu hình hàng đợi của sàn (`queue.*`): bộ nhóm và hai khoá ngưỡng cũ — luật đọc của bảng cho cả sàn đọc. */
async function dongHangDoi(tx: pg.PoolClient): Promise<{ key: string; value: unknown }[]> {
  return (
    await tx.query<{ key: string; value: unknown }>(
      "select key, value from company_settings where company_id = app.current_company_id() and key like 'queue.%' order by key",
    )
  ).rows;
}

export type QueueSettingsView = { groups: BoNhom; source: "default" | "company"; errors: string[] };
const banXem = (b: BoNhomDangAp): QueueSettingsView => ({ groups: b.bo, source: b.nguon === "san" ? "company" : "default", errors: b.loi });

export async function readQueue(tx: pg.PoolClient): Promise<BoNhomDangAp> {
  return docBoNhom(await dongHangDoi(tx));
}

export const readQueueSettings = async (tx: pg.PoolClient) => banXem(await readQueue(tx));

/** Quản trị sàn ghi bộ nhóm: lõi kiểm chặt trước, sai thì không ghi gì và trả lỗi gọi tên chỗ sai. */
export async function writeQueueSettings(tx: pg.PoolClient, groups: unknown): Promise<QueueSettingsView | { errors: string[] }> {
  const loi = kiemBoNhom(groups);
  if (loi.length) return { errors: loi };
  await tx.query(
    `insert into company_settings (company_id, key, value, updated_by)
     values (app.current_company_id(), $1, $2::jsonb, app.current_user_id())
     on conflict (company_id, key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
    [QUEUE_GROUPS_KEY, JSON.stringify(groups)],
  );
  return readQueueSettings(tx);
}

type DongLead = {
  id: string;
  building_name: string;
  unit_number: string | null;
  need: Need;
  list_price: string;
  fee_inclusion: FeeInclusion;
  outcome: Outcome;
  matched_agent_user_id: string | null;
  created_at: Date;
  routed_at: Date | null;
  accepted_at: Date | null;
  first_called_at: Date | null;
  returned_at: Date | null;
  resubmitted_at: Date | null;
  discarded_at: Date | null;
  accept_minutes: number | null;
  first_call_minutes: number | null;
  board_at: Date | null;
};

export type AssignedLeadView = {
  id: string;
  buildingName: string;
  unitNumber: string | null;
  need: Need;
  priceText: string;
  createdAt: string;
  stage: LeadState;
  acceptedAt: string | null;
  acceptDueAt: string;
  callDueAt: string;
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const PHUT = 60_000;

/**
 * Lead về chính người gọi (`matched_agent_user_id`), lọc bằng nhóm lead của bộ đang áp. Không đọc cột số (vai API không có
 * quyền); mốc lên bảng gom từ bảng nối lead–hàng và sự kiện → Active, như `app.lead_board_at_all` (lead đã bỏ, đã trả lại
 * không lên bảng). Hạn nhận, hạn gọi tính từ mốc về người như lời báo (`dueAlerts`): hai hạn đã đóng dấu lên lead, lead
 * chưa đóng dấu thì lấy cấu hình hiện tại của sàn.
 */
export async function readAssignedLeads(tx: pg.PoolClient): Promise<AssignedLeadView[]> {
  const { bo } = await readQueue(tx);
  const cauHinh = await readSettings(tx);
  const { rows } = await tx.query<DongLead>(
    `select l.id, l.building_name, l.unit_number, l.need, l.list_price, l.fee_inclusion, l.outcome, l.matched_agent_user_id,
            l.created_at, l.routed_at, l.accepted_at, l.first_called_at, l.returned_at, l.resubmitted_at, l.discarded_at,
            l.accept_minutes, l.first_call_minutes,
            (select min(e.occurred_at) from lead_listings x
               join listing_events e on e.company_id = x.company_id and e.listing_id = x.listing_id
              where x.company_id = l.company_id and x.lead_id = l.id
                and e.type = 'status_changed' and e.payload ->> 'to' = 'Active'
                and l.discarded_at is null and l.returned_at is null) as board_at
     from leads l
     where l.company_id = app.current_company_id() and l.matched_agent_user_id = app.current_user_id()
     order by coalesce(l.routed_at, l.created_at), l.id`,
  );
  return rows.flatMap((r) => {
    const stage = leadStage({
      outcome: r.outcome,
      matchedAgentUserId: r.matched_agent_user_id,
      routedAt: iso(r.routed_at),
      acceptedAt: iso(r.accepted_at),
      firstCalledAt: iso(r.first_called_at),
      boardAt: iso(r.board_at),
      returnedAt: iso(r.returned_at),
      resubmittedAt: iso(r.resubmitted_at),
      discardedAt: iso(r.discarded_at),
    });
    if (!nhomCuaLead(bo, { stage })) return [];
    const tu = (r.routed_at ?? r.created_at).getTime();
    // Dựng từng khoá tường minh: không khoá nào của dòng tự lọt ra (bất biến 2).
    return [
      {
        id: r.id,
        buildingName: r.building_name,
        unitNumber: r.unit_number,
        need: r.need,
        priceText: understoodPrice(Number(r.list_price), r.fee_inclusion),
        createdAt: r.created_at.toISOString(),
        stage,
        acceptedAt: iso(r.accepted_at),
        acceptDueAt: new Date(tu + (r.accept_minutes ?? cauHinh.acceptMinutes) * PHUT).toISOString(),
        callDueAt: new Date(tu + (r.first_call_minutes ?? cauHinh.firstCallMinutes) * PHUT).toISOString(),
      },
    ];
  });
}
