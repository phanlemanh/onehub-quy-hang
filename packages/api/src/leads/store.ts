import { randomUUID } from "node:crypto";
import { navigationFor } from "@quy-hang/core";
import { decideOutcome, OPEN_STATUSES, validateLeadInput, type LeadRecord, type Outcome } from "@quy-hang/core/dedupe";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

/**
 * Đường ghi duy nhất của lead (hàng 24, ADR-0012). Một giao dịch: lấy hai dữ kiện kiểm trùng ở cơ sở dữ liệu → lõi quyết
 * kết quả → ghi lead. Số chủ đi vào bảng và vào hàm dữ kiện, không bao giờ ra khỏi đây.
 */

export type Refusal = { error: ApiErrorEntry; details?: { path: string; reason: string }[] };
export const isRefusal = (r: unknown): r is Refusal => !!r && typeof r === "object" && "error" in r;

type LeadRow = {
  id: string;
  building_name: string;
  unit_number: string | null;
  need: LeadRecord["need"];
  list_price: string;
  fee_inclusion: LeadRecord["feeInclusion"];
  desired_listing_time: LeadRecord["desiredListingTime"];
  outcome: Outcome;
  matched_agent_user_id: string | null;
  matched_listing_id: string | null;
  created_at: Date;
  discarded_at: Date | null;
};
/** Cột đọc được của vai API — không có `owner_phone`. */
const COT = `id, building_name, unit_number, need, list_price, fee_inclusion, desired_listing_time, outcome,
  matched_agent_user_id, matched_listing_id, created_at, discarded_at`;

const toRecord = (r: LeadRow): LeadRecord => ({
  id: r.id,
  buildingName: r.building_name,
  ...(r.unit_number !== null && { unitNumber: r.unit_number }),
  need: r.need,
  listPrice: Number(r.list_price),
  feeInclusion: r.fee_inclusion,
  desiredListingTime: r.desired_listing_time,
  outcome: r.outcome,
  matchedAgentUserId: r.matched_agent_user_id,
  matchedListingId: r.matched_listing_id,
  createdAt: r.created_at.toISOString(),
  discardedAt: r.discarded_at ? r.discarded_at.toISOString() : null,
});

/** Vai nhập được lead = vai có nút «+ Lead» ở bảng vai của lõi (hàng 53) — API và vỏ đọc cùng một bảng. */
async function canEnterLead(tx: pg.PoolClient): Promise<boolean> {
  const { rows } = await tx.query<{ roles: string[] }>(
    "select roles from company_members where company_id = app.current_company_id() and user_id = app.current_user_id()",
  );
  return navigationFor(rows[0]?.roles ?? []).actions.includes("new_lead");
}

export async function createLead(tx: pg.PoolClient, payload: unknown): Promise<LeadRecord | Refusal> {
  if (!(await canEnterLead(tx))) return { error: API_ERRORS.leadRoleRequired };
  const kiem = validateLeadInput(payload);
  if (!kiem.ok) return { error: API_ERRORS.invalidPayload, details: kiem.errors };
  const v = kiem.value;
  const { rows } = await tx.query<{ open_listing_id: string | null; open_listing_agent: string | null; owner_agent: string | null }>(
    "select * from app.lead_dedupe_facts($1, $2, $3, $4)",
    [v.ownerPhone, v.buildingName, v.unitNumber ?? null, OPEN_STATUSES],
  );
  const f = rows[0]!;
  const quyet = decideOutcome({
    openListing: f.open_listing_id ? { listingId: f.open_listing_id, agentUserId: f.open_listing_agent } : null,
    ownerAgentUserId: f.owner_agent,
  });
  const ghi = await tx.query<LeadRow>(
    `insert into leads (id, company_id, created_by, building_name, unit_number, need, list_price, fee_inclusion,
                        desired_listing_time, owner_phone, outcome, matched_agent_user_id, matched_listing_id)
     values ($1, app.current_company_id(), app.current_user_id(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     returning ${COT}`,
    [
      randomUUID(),
      v.buildingName,
      v.unitNumber ?? null,
      v.need,
      v.listPrice,
      v.feeInclusion,
      v.desiredListingTime,
      v.ownerPhone,
      quyet.outcome,
      quyet.agentUserId,
      quyet.listingId,
    ],
  );
  return toRecord(ghi.rows[0]!);
}

/** Lead của chính người gọi; lead người khác nhập coi như không có (luật 21). */
export async function readOwnLead(tx: pg.PoolClient, id: string): Promise<LeadRecord | null> {
  const { rows } = await tx.query<LeadRow>(
    `select ${COT} from leads where company_id = app.current_company_id() and id = $1 and created_by = app.current_user_id()`,
    [id],
  );
  return rows[0] ? toRecord(rows[0]) : null;
}

/** «Bỏ lead này» qua hàm của cơ sở dữ liệu; mỗi mã lỗi của hàm ra đúng một mã API. */
export async function discardLead(tx: pg.PoolClient, id: string): Promise<LeadRecord | Refusal> {
  await tx.query("savepoint bo_lead");
  try {
    await tx.query("select app.discard_lead($1)", [id]);
  } catch (e) {
    await tx.query("rollback to savepoint bo_lead");
    const code = (e as { code?: string }).code;
    if (code === "P0002") return { error: API_ERRORS.notFound };
    if (code === "22023") return { error: API_ERRORS.notDuplicateUnit };
    if (code === "23505") return { error: API_ERRORS.alreadyDiscarded };
    throw e;
  }
  return (await readOwnLead(tx, id))!;
}
