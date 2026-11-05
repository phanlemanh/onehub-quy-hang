// Đổi đầu chủ hàng loạt (hàng 89): xem trước, đổi, hoàn tác — mọi ghi đi qua ba hàm của migration 027, chỉ trưởng nhóm
// gọi được. Thân trả về chỉ mang mã căn, mã người, mã liên hệ — không tên, không số chủ nhà (lớp nguồn, bất biến 2).
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

export type Refusal = { error: ApiErrorEntry; details?: { path: string; reason: string }[] };
export const isRefusal = (r: unknown): r is Refusal => !!r && typeof r === "object" && "error" in r;
const ve = (error: ApiErrorEntry, details?: Refusal["details"]): Refusal => ({ error, ...(details && { details }) });

/** Trần căn một lần đổi, sau khi kéo căn cùng chủ nhà — khớp `app.preview_listing_agent_reassignment`. */
export const TRAN_DOI_DAU_CHU = 200;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MucXemTruoc = { listingId: string; selected: boolean; fromUserId: string | null; contactId: string | null };
export type XemTruoc = { listings: MucXemTruoc[]; contacts: number };

/** Thân strict: chỉ các khoá cho phép, mã căn là uuid, không trùng rỗng. */
function docThan(payload: unknown, khoa: readonly string[]): Record<string, unknown> | Refusal {
  const p = payload as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || Array.isArray(p)) return ve(API_ERRORS.invalidPayload, [{ path: "", reason: "cần object" }]);
  const la = Object.keys(p).filter((k) => !khoa.includes(k));
  if (la.length) return ve(API_ERRORS.invalidPayload, la.map((k) => ({ path: k, reason: "khoá lạ" })));
  const ds = p.listingIds;
  if (!Array.isArray(ds) || ds.length === 0 || !ds.every((x) => typeof x === "string" && UUID.test(x))) {
    return ve(API_ERRORS.invalidPayload, [{ path: "listingIds", reason: "cần danh sách mã căn" }]);
  }
  return p;
}

/** Lỗi của ba hàm SQL → mã API. */
function dichLoi(e: unknown): Refusal {
  const err = e as { code?: string; message?: string };
  if (err.code === "P0002") {
    return /quyền/.test(err.message ?? "") ? ve(API_ERRORS.teamLeadRequired) : ve(API_ERRORS.notFound);
  }
  if (err.code === "22023" && err.message === "tran") return ve(API_ERRORS.reassignmentTooLarge, [{ path: "listingIds", reason: `Tối đa ${TRAN_DOI_DAU_CHU} căn một lần` }]);
  if (err.code === "22023" && err.message === "nguoi-nhan") return ve(API_ERRORS.invalidPayload, [{ path: "userId", reason: "không phải đầu chủ của sàn" }]);
  if (err.code === "55000") return ve(API_ERRORS.reassignmentUndone);
  throw e;
}

async function goiHam<T>(tx: pg.PoolClient, fn: () => Promise<T>): Promise<T | Refusal> {
  await tx.query("savepoint doi_dau_chu");
  try {
    const r = await fn();
    await tx.query("release savepoint doi_dau_chu");
    return r;
  } catch (e) {
    await tx.query("rollback to savepoint doi_dau_chu");
    return dichLoi(e);
  }
}

async function laTruongNhom(tx: pg.PoolClient): Promise<boolean> {
  const { rows } = await tx.query<{ ok: boolean }>("select 'team_lead' = any (app.current_user_roles()) as ok");
  return rows[0]?.ok === true;
}

export async function xemTruoc(tx: pg.PoolClient, payload: unknown): Promise<XemTruoc | Refusal> {
  if (!(await laTruongNhom(tx))) return ve(API_ERRORS.teamLeadRequired);
  const p = docThan(payload, ["listingIds"]);
  if (isRefusal(p)) return p;
  const r = await goiHam(tx, async () =>
    (await tx.query<{ listing_id: string; selected: boolean; from_user_id: string | null; contact_id: string | null }>(
      "select listing_id, selected, from_user_id, contact_id from app.preview_listing_agent_reassignment($1::uuid[])",
      [p.listingIds],
    )).rows,
  );
  if (isRefusal(r)) return r;
  return {
    listings: r.map((x) => ({ listingId: x.listing_id, selected: x.selected, fromUserId: x.from_user_id, contactId: x.contact_id })),
    contacts: new Set(r.map((x) => x.contact_id).filter((x) => x !== null)).size,
  };
}

export async function doi(tx: pg.PoolClient, payload: unknown): Promise<{ id: string; listings: number; contacts: number } | Refusal> {
  if (!(await laTruongNhom(tx))) return ve(API_ERRORS.teamLeadRequired);
  const p = docThan(payload, ["listingIds", "userId"]);
  if (isRefusal(p)) return p;
  if (typeof p.userId !== "string" || !p.userId) return ve(API_ERRORS.invalidPayload, [{ path: "userId", reason: "cần mã thành viên" }]);
  const id = await goiHam(tx, async () =>
    (await tx.query<{ id: string }>("select app.reassign_listing_agents($1::uuid[], $2) as id", [p.listingIds, p.userId])).rows[0]!.id,
  );
  if (isRefusal(id)) return id;
  const { rows } = await tx.query<{ listings: number; contacts: number }>(
    `select count(listing_id)::int as listings, count(contact_id)::int as contacts
       from listing_agent_reassignment_items where company_id = app.current_company_id() and reassignment_id = $1`,
    [id],
  );
  return { id, listings: rows[0]!.listings, contacts: rows[0]!.contacts };
}

export async function hoanTac(tx: pg.PoolClient, id: string): Promise<{ restored: number; skipped: number; keptNoPriorAgent: number } | Refusal> {
  if (!(await laTruongNhom(tx))) return ve(API_ERRORS.teamLeadRequired);
  if (!UUID.test(id)) return ve(API_ERRORS.notFound);
  const r = await goiHam(tx, async () =>
    (await tx.query<{ restored: number; skipped: number; kept_no_prior_agent: number }>(
      "select restored, skipped, kept_no_prior_agent from app.undo_listing_agent_reassignment($1)",
      [id],
    )).rows[0]!,
  );
  if (isRefusal(r)) return r;
  return { restored: r.restored, skipped: r.skipped, keptNoPriorAgent: r.kept_no_prior_agent };
}
