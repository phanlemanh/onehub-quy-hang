import { randomUUID } from "node:crypto";
import {
  prospectView,
  validateProspectInput,
  validateProspectPatch,
  validateProspectPhone,
  type ProspectCriteria,
  type ProspectNeed,
  type ProspectView,
} from "@quy-hang/core/contacts";
import { newShareCode, validateShareInput, type ShareAudience } from "@quy-hang/core/sharing";
import type pg from "pg";
import { API_ERRORS } from "../errors";
import { isRefusal, type Refusal } from "../leads/store";
import { khoaSoChu } from "../owners/khoa";
import { dauVetSo, maHoaSo } from "../owners/ma-hoa";
import { rolesOf } from "../routing/store";

/**
 * Nhu cầu khách và Lần gửi (hàng 86, migration 021). Đọc theo luật dòng: không thấy thì như không có (404). Ghi chỉ qua
 * hàm của cơ sở dữ liệu. Số khách vào `contact_phones` bằng dấu vết theo sàn và bản mã ngữ cảnh `prospects:<sàn>:<nhu cầu>`
 * (ADR-0013); không câu nào ở đây đọc số, không thân trả nào mang số hay mã liên hệ.
 */

type ProspectRow = {
  id: string;
  display_name: string;
  need: ProspectNeed;
  criteria: ProspectCriteria;
  owner_member_user_id: string;
  closed_at: Date | null;
  created_at: Date;
};

const nguCanhNhuCau = (companyId: string, prospectId: string) => `prospects:${companyId}:${prospectId}`;

/** Lỗi có mã SQLSTATE của hàm cơ sở dữ liệu → từ chối; mã lạ ném tiếp. Chạy trong savepoint để giao dịch còn dùng được. */
async function goiHam<T = unknown>(tx: pg.PoolClient, sql: string, params: unknown[], ma: Record<string, Refusal>): Promise<{ row: T } | Refusal> {
  await tx.query("savepoint goi_ham");
  try {
    const r = await tx.query(sql, params);
    await tx.query("release savepoint goi_ham");
    return { row: r.rows[0] as T };
  } catch (e) {
    await tx.query("rollback to savepoint goi_ham");
    const tuChoi = ma[(e as { code?: string }).code ?? ""];
    if (tuChoi) return tuChoi;
    throw e;
  }
}

export async function readProspect(tx: pg.PoolClient, id: string): Promise<ProspectView | null> {
  const { rows } = await tx.query<ProspectRow>(
    `select id, display_name, need, criteria, owner_member_user_id, closed_at, created_at
     from prospects where company_id = app.current_company_id() and id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  return prospectView({
    id: r.id,
    displayName: r.display_name,
    need: r.need,
    criteria: r.criteria,
    ownerMemberUserId: r.owner_member_user_id,
    closedAt: r.closed_at?.toISOString() ?? null,
    createdAt: r.created_at.toISOString(),
  });
}

async function sanDangLam(tx: pg.PoolClient): Promise<string> {
  return (await tx.query<{ c: string }>("select app.current_company_id() c")).rows[0]!.c;
}

/** Đầu khách mở nhu cầu khách. Số đã thuộc liên hệ nào thì gắn liên hệ ấy — thân trả giống hệt trường hợp số mới. */
export async function createProspect(tx: pg.PoolClient, payload: unknown): Promise<ProspectView | Refusal> {
  if (!(await rolesOf(tx)).includes("buyer_agent")) return { error: API_ERRORS.buyerAgentRequired };
  const v = validateProspectInput(payload);
  if (!v.ok) return { error: API_ERRORS.invalidPayload, details: v.errors };
  const khoa = khoaSoChu();
  const san = await sanDangLam(tx);
  const id = randomUUID();
  const kq = await goiHam(tx, "select app.open_prospect($1, $2, $3, $4, $5, $6)", [
    id,
    dauVetSo(v.value.phone, san, khoa),
    maHoaSo(v.value.phone, nguCanhNhuCau(san, id), khoa),
    v.value.displayName,
    v.value.need,
    v.value.criteria,
  ], { "42501": { error: API_ERRORS.buyerAgentRequired } });
  if (isRefusal(kq)) return kq;
  return (await readProspect(tx, id))!;
}

/** Thêm số vào khách của nhu cầu: `added` (201), `same` (200, không đổi gì), số của liên hệ khác → 409 không nêu ai. */
export async function addProspectPhone(tx: pg.PoolClient, id: string, payload: unknown): Promise<{ ket: "added" | "same"; view: ProspectView } | Refusal> {
  const v = validateProspectPhone(payload);
  if (!v.ok) return { error: API_ERRORS.invalidPayload, details: v.errors };
  const khoa = khoaSoChu();
  const san = await sanDangLam(tx);
  const kq = await goiHam<{ k: "added" | "same" }>(
    tx,
    "select app.add_prospect_phone($1, $2, $3) k",
    [id, dauVetSo(v.value.phone, san, khoa), maHoaSo(v.value.phone, nguCanhNhuCau(san, id), khoa)],
    { P0002: { error: API_ERRORS.notFound }, "23505": { error: API_ERRORS.phoneOwnedElsewhere } },
  );
  if (isRefusal(kq)) return kq;
  return { ket: kq.row.k, view: (await readProspect(tx, id))! };
}

export async function closeProspect(tx: pg.PoolClient, id: string): Promise<ProspectView | Refusal> {
  const kq = await goiHam(tx, "select app.close_prospect($1)", [id], {
    P0002: { error: API_ERRORS.notFound },
    "23505": { error: API_ERRORS.prospectClosed },
  });
  if (isRefusal(kq)) return kq;
  return (await readProspect(tx, id))!;
}

/** Trưởng nhóm đổi đầu khách giữ; Lần gửi cũ đi theo nhu cầu, người gửi giữ nguyên. */
export async function reassignProspect(tx: pg.PoolClient, id: string, payload: unknown): Promise<ProspectView | Refusal> {
  const v = validateProspectPatch(payload);
  if (!v.ok) return { error: API_ERRORS.invalidPayload, details: v.errors };
  const kq = await goiHam(tx, "select app.reassign_prospect($1, $2)", [id, v.value.ownerMemberUserId], {
    P0002: { error: API_ERRORS.notFound },
    "22023": { error: API_ERRORS.notABuyerAgent },
  });
  if (isRefusal(kq)) return kq;
  return (await readProspect(tx, id))!;
}

export type ShareView = {
  id: string;
  code: string;
  audience: ShareAudience;
  prospectId: string | null;
  senderUserId: string;
  listingIds: string[];
  createdAt: string;
  disabledAt: string | null;
};

const COT_GUI = `s.id, s.code, s.audience, s.prospect_id, s.sender_user_id, s.created_at, s.disabled_at,
  coalesce((select array_agg(l.listing_id order by l.position) from share_listings l
            where l.company_id = s.company_id and l.share_id = s.id), '{}') listing_ids`;
type ShareRow = {
  id: string;
  code: string;
  audience: ShareAudience;
  prospect_id: string | null;
  sender_user_id: string;
  created_at: Date;
  disabled_at: Date | null;
  listing_ids: string[];
};
const banGui = (r: ShareRow): ShareView => ({
  id: r.id,
  code: r.code,
  audience: r.audience,
  prospectId: r.prospect_id,
  senderUserId: r.sender_user_id,
  listingIds: r.listing_ids,
  createdAt: r.created_at.toISOString(),
  disabledAt: r.disabled_at?.toISOString() ?? null,
});

/**
 * Lần gửi của một nhu cầu khách, mới trước — đúng phần luật dòng cho người gọi thấy: đầu khách giữ và trưởng nhóm thấy hết,
 * người gửi thấy Lần gửi của mình kể cả sau khi nhu cầu sang người khác, người khác ra danh sách rỗng.
 */
export async function listProspectShares(tx: pg.PoolClient, id: string): Promise<ShareView[]> {
  const { rows } = await tx.query<ShareRow>(
    `select ${COT_GUI} from shares s where s.company_id = app.current_company_id() and s.prospect_id = $1 order by s.created_at desc, s.id desc`,
    [id],
  );
  return rows.map(banGui);
}

/** Tạo một Lần gửi: người gửi là người gọi; căn phải đã lên bảng; mã link ngẫu nhiên, trùng thì sinh lại một lần. */
export async function createShare(tx: pg.PoolClient, payload: unknown): Promise<ShareView | Refusal> {
  const vai = await rolesOf(tx);
  if (!vai.includes("buyer_agent") && !vai.includes("team_lead")) return { error: API_ERRORS.buyerAgentRequired };
  const v = validateShareInput(payload);
  if (!v.ok) return { error: API_ERRORS.invalidPayload, details: v.errors };
  const id = randomUUID();
  const loi: Record<string, Refusal> = {
    "42501": { error: API_ERRORS.buyerAgentRequired },
    P0002: { error: API_ERRORS.notFound },
    "22023": { error: API_ERRORS.listingNotShareable },
    "23503": { error: API_ERRORS.listingNotShareable },
  };
  for (let lan = 0; lan < 2; lan++) {
    const kq = await goiHam(tx, "select app.create_share($1, $2, $3, $4, $5)", [id, newShareCode(), v.value.audience, v.value.prospectId, v.value.listingIds], {
      ...loi,
      ...(lan === 0 && { "23505": { error: API_ERRORS.versionConflict } }),
    });
    if (isRefusal(kq)) {
      if (kq.error === API_ERRORS.versionConflict) continue;
      return kq;
    }
    const { rows } = await tx.query<ShareRow>(`select ${COT_GUI} from shares s where s.company_id = app.current_company_id() and s.id = $1`, [id]);
    return banGui(rows[0]!);
  }
  throw new Error("mã link trùng hai lần liền");
}
