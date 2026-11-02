import { randomUUID } from "node:crypto";
import { navigationFor } from "@quy-hang/core";
import { typesForNeed } from "@quy-hang/core/contacts";
import { decideOutcome, OPEN_STATUSES, validateLeadInput, type LeadRecord, type MyLeadRecord, type Outcome } from "@quy-hang/core/dedupe";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { createListing, isRefusal as laTuChoiHang } from "../listings/store";
import { khoaSoChu } from "../owners/khoa";
import { baoLeadVe } from "../push/store";
import { dauVetSo, maHoaSo, nguCanhLead } from "../owners/ma-hoa";

/**
 * Đường ghi duy nhất của lead (hàng 24, ADR-0012). Một giao dịch: lấy hai dữ kiện kiểm trùng ở cơ sở dữ liệu → lõi quyết
 * kết quả → ghi lead. Số chủ đi vào bảng và vào hàm dữ kiện, không bao giờ ra khỏi đây.
 * Hàng 62 (ADR-0013): số chỉ vào cơ sở dữ liệu ở dạng bản mã (ngữ cảnh `leads:<sàn>:<lead>`) và dấu vết theo sàn; hàm dữ
 * kiện so dấu vết, không so số.
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

/**
 * `intoContact` (lối gửi lại): số mới chưa thuộc ai thì thêm vào liên hệ của lead cũ; số đã thuộc liên hệ khác thì lead gắn
 * liên hệ ấy (hàng 85, AC-6).
 */
export async function createLead(tx: pg.PoolClient, payload: unknown, intoContact: string | null = null): Promise<LeadRecord | Refusal> {
  if (!(await canEnterLead(tx))) return { error: API_ERRORS.leadRoleRequired };
  const kiem = validateLeadInput(payload);
  if (!kiem.ok) return { error: API_ERRORS.invalidPayload, details: kiem.errors };
  const v = kiem.value;
  const khoa = khoaSoChu();
  const id = randomUUID();
  const san = (await tx.query<{ c: string }>("select app.current_company_id() c")).rows[0]!.c;
  const dauVet = dauVetSo(v.ownerPhone, san, khoa);
  const { rows } = await tx.query<{ open_listing_id: string | null; open_listing_agent: string | null; owner_agent: string | null }>(
    "select * from app.lead_dedupe_facts($1, $2, $3, $4)",
    [dauVet, v.buildingName, v.unitNumber ?? null, OPEN_STATUSES],
  );
  const f = rows[0]!;
  const quyet = decideOutcome({
    openListing: f.open_listing_id ? { listingId: f.open_listing_id, agentUserId: f.open_listing_agent } : null,
    ownerAgentUserId: f.owner_agent,
  });
  // Liên hệ của số (hàng 85): tìm theo dấu vết hay tạo; bản mã chép kèm ngữ cảnh của chính lead.
  const banMa = maHoaSo(v.ownerPhone, nguCanhLead(san, id), khoa);
  const { rows: lh } = await tx.query<{ c: string }>("select app.contact_for_phone($1, $2, $3, $4, $5, $6) c", [
    dauVet,
    banMa,
    nguCanhLead(san, id),
    typesForNeed(v.need),
    quyet.agentUserId,
    intoContact,
  ]);
  const ghi = await tx.query<LeadRow>(
    `insert into leads (id, company_id, created_by, building_name, unit_number, need, list_price, fee_inclusion,
                        desired_listing_time, owner_phone_enc, owner_phone_hash, outcome, matched_agent_user_id, matched_listing_id,
                        contact_id)
     values ($1, app.current_company_id(), app.current_user_id(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     returning ${COT}`,
    [
      id,
      v.buildingName,
      v.unitNumber ?? null,
      v.need,
      v.listPrice,
      v.feeInclusion,
      v.desiredListingTime,
      banMa,
      dauVet,
      quyet.outcome,
      quyet.agentUserId,
      quyet.listingId,
      lh[0]!.c,
    ],
  );
  // Lead khớp đầu chủ giữ chủ nhà hay căn: báo đầu chủ ấy (hàng 26) — dòng «cần báo» quay lui cùng việc nhập.
  if (quyet.agentUserId) await baoLeadVe(tx, id, quyet.agentUserId);
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

// ---- Lead bốn nấc (hàng 27, ADR-0020) ----

type MyLeadRow = LeadRow & {
  routed_at: Date | null;
  accepted_at: Date | null;
  first_called_at: Date | null;
  returned_at: Date | null;
  resubmitted_at: Date | null;
  resubmitted_lead_id: string | null;
};
const COT_NAC = `${COT}, routed_at, accepted_at, first_called_at, returned_at, resubmitted_at, resubmitted_lead_id`;
const iso = (d: Date | null) => (d ? d.toISOString() : null);
const toMyRecord = (r: MyLeadRow, boardAt: Date | null): MyLeadRecord => ({
  ...toRecord(r),
  routedAt: iso(r.routed_at),
  acceptedAt: iso(r.accepted_at),
  firstCalledAt: iso(r.first_called_at),
  boardAt: iso(boardAt),
  returnedAt: iso(r.returned_at),
  resubmittedAt: iso(r.resubmitted_at),
  resubmittedLeadId: r.resubmitted_lead_id,
});

/** Lấy khoá đọc bảng chủ nhà trước bảng lead — cùng thứ tự với đường nhập lead và hàm lên bảng; đảo thứ tự là khoá chéo. */
const khoaTheoThuTu = (tx: pg.PoolClient) => tx.query("select 1 from app.lead_board_dates('{}'::uuid[])");

/** Nối mốc lên bảng — hàm của cơ sở dữ liệu chỉ trả mốc cho lead người gọi đã nhập. */
async function voiMocLenBang(tx: pg.PoolClient, rows: MyLeadRow[]): Promise<MyLeadRecord[]> {
  if (!rows.length) return [];
  const { rows: moc } = await tx.query<{ lead_id: string; board_at: Date }>("select * from app.lead_board_dates($1)", [rows.map((r) => r.id)]);
  const theoMa = new Map(moc.map((m) => [m.lead_id, m.board_at]));
  return rows.map((r) => toMyRecord(r, theoMa.get(r.id) ?? null));
}

/** Lead người gọi đã nhập ở sàn đang làm, mới nhất trước. */
export async function listMyLeads(tx: pg.PoolClient): Promise<MyLeadRecord[]> {
  await khoaTheoThuTu(tx);
  const { rows } = await tx.query<MyLeadRow>(
    `select ${COT_NAC} from leads where company_id = app.current_company_id() and created_by = app.current_user_id()
     order by created_at desc, id desc`,
  );
  return voiMocLenBang(tx, rows);
}

/** Một lead người gọi đọc được theo luật đọc của bảng (người nhập, đầu chủ của lead, trưởng nhóm). */
async function readLeadForStage(tx: pg.PoolClient, id: string): Promise<MyLeadRecord | null> {
  const { rows } = await tx.query<MyLeadRow>(`select ${COT_NAC} from leads where company_id = app.current_company_id() and id = $1`, [id]);
  return rows[0] ? (await voiMocLenBang(tx, rows))[0]! : null;
}

/** Đầu chủ trả lại lead vì số không liên lạc được (Hỏi-4: tới khi lên bảng). */
export async function returnLead(tx: pg.PoolClient, id: string): Promise<MyLeadRecord | Refusal> {
  await tx.query("savepoint tra_lead");
  try {
    await tx.query("select app.return_lead($1)", [id]);
  } catch (e) {
    await tx.query("rollback to savepoint tra_lead");
    const code = (e as { code?: string }).code;
    if (code === "P0002") return { error: API_ERRORS.notFound };
    if (code === "23505") return { error: API_ERRORS.alreadyReturned };
    if (code === "22023") return { error: API_ERRORS.alreadyOnBoard };
    throw e;
  }
  return (await readLeadForStage(tx, id))!;
}

/** Lời từ chối sau khi đã ghi lead mới: ném để cả giao dịch huỷ — không để lại lead mới mồ côi. */
export class RefusalAfterWrite extends Error {
  constructor(readonly refusal: Refusal) {
    super(refusal.error.code);
  }
}

/**
 * «Sửa số và gửi lại» (Hỏi-2): lead mới chép năm mục của lead cũ với số mới, đi qua đường ghi của hàng 24 — kiểm trùng, rồi
 * nhịp chia như mọi lead mới; lead cũ mang dấu «đã gửi lại» trỏ lead mới, cùng giao dịch.
 */
export async function resubmitLead(tx: pg.PoolClient, id: string, body: unknown): Promise<MyLeadRecord | Refusal> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: API_ERRORS.invalidPayload, details: [{ path: "payload", reason: "cần một đối tượng" }] };
  }
  const la = Object.keys(body).filter((k) => k !== "ownerPhone");
  if (la.length) return { error: API_ERRORS.invalidPayload, details: la.map((path) => ({ path, reason: "khoá lạ" })) };
  await khoaTheoThuTu(tx);
  const { rows } = await tx.query<MyLeadRow>(
    `select ${COT_NAC} from leads where company_id = app.current_company_id() and id = $1 and created_by = app.current_user_id()`,
    [id],
  );
  const cu = rows[0];
  if (!cu) return { error: API_ERRORS.notFound };
  if (cu.returned_at === null) return { error: API_ERRORS.notReturned };
  if (cu.resubmitted_at !== null) return { error: API_ERRORS.alreadyResubmitted };
  const { rows: lhCu } = await tx.query<{ contact_id: string | null }>("select contact_id from leads where id = $1", [id]);
  const moi = await createLead(tx, {
    ownerPhone: (body as { ownerPhone?: unknown }).ownerPhone,
    buildingName: cu.building_name,
    ...(cu.unit_number !== null && { unitNumber: cu.unit_number }),
    need: cu.need,
    listPrice: Number(cu.list_price),
    feeInclusion: cu.fee_inclusion,
    desiredListingTime: cu.desired_listing_time,
  }, lhCu[0]?.contact_id ?? null);
  if (isRefusal(moi)) return moi;
  try {
    await tx.query("select app.mark_resubmitted($1, $2)", [id, moi.id]);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "23505") throw new RefusalAfterWrite({ error: API_ERRORS.alreadyResubmitted });
    if (code === "22023") throw new RefusalAfterWrite({ error: API_ERRORS.notReturned });
    if (code === "P0002") throw new RefusalAfterWrite({ error: API_ERRORS.notFound });
    throw e;
  }
  return (await readLeadForStage(tx, moi.id))!;
}

// ---- Tạo hàng từ lead (hàng 85, ADR-0021) ----

/**
 * Đầu chủ của lead tạo hàng: toà, căn từ lead; đầu chủ giữ căn; chủ nhà của hàng là liên hệ của lead (chưa tên, chưa số —
 * «Mở số» báo chưa có số tới khi đầu chủ ghi chủ nhà); bảng nối `lead_listings` mang mã lead, «Lên bảng» đọc từ đó.
 */
export async function createListingFromLead(tx: pg.PoolClient, id: string): Promise<{ id: string } | Refusal> {
  await tx.query("savepoint hang_tu_lead");
  let lead: { building_name: string; unit_number: string | null; contact_id: string | null };
  try {
    lead = (await tx.query("select * from app.lead_for_listing($1)", [id])).rows[0];
  } catch (e) {
    await tx.query("rollback to savepoint hang_tu_lead");
    const code = (e as { code?: string }).code;
    if (code === "P0002") return { error: API_ERRORS.notFound };
    if (code === "22023") return { error: API_ERRORS.leadNotListable };
    if (code === "23505") return { error: API_ERRORS.leadHasListing };
    throw e;
  }
  const tao = await createListing(tx, { buildingName: lead.building_name, ...(lead.unit_number !== null && { unitNumber: lead.unit_number }) });
  if (laTuChoiHang(tao)) throw new RefusalAfterWrite({ error: tao.error, ...(tao.details && { details: tao.details }) });
  const hang = tao.listingId;
  await tx.query(
    "insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values (app.current_company_id(), $1, 1, app.current_user_id(), app.current_user_id())",
    [hang],
  );
  await tx.query(
    "insert into listing_owners (company_id, listing_id, contact_id, updated_by) values (app.current_company_id(), $1, $2, app.current_user_id())",
    [hang, lead.contact_id],
  );
  try {
    await tx.query("insert into lead_listings (company_id, lead_id, listing_id, created_by) values (app.current_company_id(), $1, $2, app.current_user_id())", [id, hang]);
  } catch (e) {
    if ((e as { code?: string }).code === "23505") throw new RefusalAfterWrite({ error: API_ERRORS.leadHasListing });
    throw e;
  }
  return { id: hang };
}
