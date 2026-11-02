import {
  applyLeadRoutingPatch,
  poolVisibleTo,
  readLeadRoutingSettings,
  type LeadRoutingSettings,
  type RoutingCandidate,
} from "@quy-hang/core/routing";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { baoLeadVe } from "../push/store";

/**
 * Ghi và đọc của hàng 25 trên client do withCompany trao. Hàm cơ sở dữ liệu báo mỗi ca bằng một mã lỗi Postgres; ở đây
 * dịch mã ấy sang lỗi API của từng lối. Lỗi không có trong bảng thì ném tiếp.
 */
export type Refusal = { error: ApiErrorEntry; reason?: string };
export const isRefusal = (x: unknown): x is Refusal => typeof x === "object" && x !== null && "error" in x;

async function goi<T>(fn: () => Promise<T>, bang: Record<string, ApiErrorEntry>): Promise<T | Refusal> {
  try {
    return await fn();
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code && bang[code]) return { error: bang[code] };
    throw e;
  }
}

export async function rolesOf(tx: pg.PoolClient): Promise<string[]> {
  return (await tx.query<{ r: string[] }>("select app.current_user_roles() r")).rows[0]?.r ?? [];
}

export async function readSettings(tx: pg.PoolClient): Promise<LeadRoutingSettings> {
  return readLeadRoutingSettings((await tx.query("select key, value from app.lead_routing_settings_rows()")).rows);
}

/** Đổi một phần cấu hình: khoá cấu hình của sàn trong giao dịch, kiểm trên cấu hình đã lưu ghép phần đổi, ghi từng khoá. */
export async function writeSettings(tx: pg.PoolClient, input: unknown): Promise<LeadRoutingSettings | Refusal> {
  await tx.query("select pg_advisory_xact_lock(hashtext('lead_routing:' || app.current_company_id()::text))");
  const kq = applyLeadRoutingPatch(await readSettings(tx), input);
  if (!kq.ok) return { error: API_ERRORS.invalidSettings, reason: kq.error };
  for (const r of kq.rows) {
    await tx.query(
      `insert into company_settings (company_id, key, value, updated_by)
       values (app.current_company_id(), $1, $2::jsonb, app.current_user_id())
       on conflict (company_id, key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
      [r.key, JSON.stringify(r.value)],
    );
  }
  return kq.settings;
}

export async function setLeave(tx: pg.PoolClient, userId: string, onLeave: boolean): Promise<true | Refusal> {
  const thanhVien = await tx.query("select 1 from company_members where company_id = app.current_company_id() and user_id = $1", [userId]);
  if (thanhVien.rowCount === 0) return { error: API_ERRORS.notFound };
  const toi = (await tx.query<{ u: string }>("select app.current_user_id() u")).rows[0]?.u;
  const vai = await rolesOf(tx);
  if (userId !== toi && !vai.some((v) => v === "team_lead" || v === "company_admin")) return { error: API_ERRORS.leaveForbidden };
  await tx.query(
    `insert into member_availability (company_id, user_id, on_leave, changed_by)
     values (app.current_company_id(), $1, $2, app.current_user_id())
     on conflict (company_id, user_id) do update set on_leave = excluded.on_leave, changed_by = excluded.changed_by, changed_at = now()`,
    [userId, onLeave],
  );
  return true;
}

type Moc = { id: string; acceptedAt: string | null; firstCalledAt: string | null };
async function moc(tx: pg.PoolClient, id: string): Promise<Moc> {
  const r = (await tx.query<{ accepted_at: Date | null; first_called_at: Date | null }>(
    "select accepted_at, first_called_at from leads where id = $1",
    [id],
  )).rows[0];
  return { id, acceptedAt: r?.accepted_at?.toISOString() ?? null, firstCalledAt: r?.first_called_at?.toISOString() ?? null };
}

export const acceptLead = (tx: pg.PoolClient, id: string) =>
  goi(async () => (await tx.query("select app.accept_lead($1)", [id]), moc(tx, id)), {
    P0002: API_ERRORS.notFound,
    "23505": API_ERRORS.alreadyAccepted,
  });

export const markFirstCall = (tx: pg.PoolClient, id: string) =>
  goi(async () => (await tx.query("select app.mark_first_call($1)", [id]), moc(tx, id)), {
    P0002: API_ERRORS.notFound,
    "23505": API_ERRORS.alreadyCalled,
  });

export const reassignLead = (tx: pg.PoolClient, id: string, agentUserId: string) =>
  goi(
    async () => {
      const r = await tx.query<{ moc: Date }>("select app.reassign_lead($1, $2) moc", [id, agentUserId]);
      // Báo đầu chủ vừa được giao (hàng 26) — cùng giao dịch, quay lui cùng việc giao.
      await baoLeadVe(tx, id, agentUserId);
      return { id, agentUserId, deadlineFrom: r.rows[0]!.moc.toISOString() };
    },
    {
      "42501": API_ERRORS.teamLeadRequired,
      P0002: API_ERRORS.notFound,
      "22023": API_ERRORS.leadNotAssignable,
      "23503": API_ERRORS.notAListingAgent,
    },
  );

type DongKho = { lead_id: string; building_name: string; unit_number: string | null; need: string; created_at: Date };

/** Ứng viên của chính người gọi (đầu chủ của sàn), để xét kho chung bằng luật của lõi. */
async function toiLaUngVien(tx: pg.PoolClient): Promise<RoutingCandidate | null> {
  const toi = (await tx.query<{ u: string }>("select app.current_user_id() u")).rows[0]?.u;
  const u = (await tx.query("select * from app.lead_routing_candidates() where user_id = $1", [toi])).rows[0];
  if (!u) return null;
  return {
    userId: u.user_id,
    roles: u.roles,
    zoneNames: u.zone_names,
    onLeave: u.on_leave,
    joinedAt: (u.joined_at as Date).toISOString(),
    lastRoutedSeq: u.last_routed_seq === null ? null : Number(u.last_routed_seq),
    openLeads: u.open_leads,
  };
}

export async function readPool(tx: pg.PoolClient) {
  const toi = await toiLaUngVien(tx);
  if (!toi) return [];
  return (await tx.query<DongKho>("select * from app.lead_pool()")).rows
    .filter((l) => poolVisibleTo({ buildingName: l.building_name }, toi))
    .map((l) => ({ id: l.lead_id, buildingName: l.building_name, unitNumber: l.unit_number, need: l.need, createdAt: l.created_at.toISOString() }));
}

const BANG_NHAN = { P0002: API_ERRORS.notFound, "23505": API_ERRORS.alreadyClaimed, "42501": API_ERRORS.onLeave };

/**
 * Đầu chủ tự nhận lead kho chung. Lead còn trong kho thì chỉ người phụ trách toà của nó nhận được (luật của lõi); lead đã
 * rời kho thì hàm cơ sở dữ liệu nói vì sao — đã có người (409) hay không phải lead kho chung (404).
 */
export async function claimLead(tx: pg.PoolClient, id: string): Promise<Moc | Refusal> {
  const toi = await toiLaUngVien(tx);
  if (!toi) return { error: API_ERRORS.listingAgentRequired };
  if (toi.onLeave) return { error: API_ERRORS.onLeave };
  const l = (await tx.query<DongKho>("select * from app.lead_pool() where lead_id = $1", [id])).rows[0];
  if (l && !poolVisibleTo({ buildingName: l.building_name }, toi)) return { error: API_ERRORS.notFound };
  return goi(async () => (await tx.query("select app.claim_lead($1)", [id]), moc(tx, id)), BANG_NHAN);
}

type DongBao = {
  id: string;
  kind: string;
  lead_id: string;
  building_name: string;
  unit_number: string | null;
  agent_user_id: string | null;
  deadline_from: Date;
  raised_at: Date;
};

/** Người đọc báo: trưởng nhóm, và quản trị khi sàn chọn «trưởng nhóm và quản trị». */
export async function canReadAlerts(tx: pg.PoolClient): Promise<boolean> {
  const vai = await rolesOf(tx);
  if (vai.includes("team_lead")) return true;
  return vai.includes("company_admin") && (await tx.query<{ v: boolean }>("select app.lead_alerts_to_admin() v")).rows[0]!.v;
}

export async function readAlerts(tx: pg.PoolClient) {
  return (await tx.query<DongBao>("select * from app.lead_alert_list()")).rows;
}
export type AlertRow = DongBao;
