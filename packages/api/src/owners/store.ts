import { canSeeSource, ownerView, validateOwnerInput, type OwnerView, type Viewer } from "@quy-hang/core/access";
import type { PayloadError } from "@quy-hang/core/listing";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

/**
 * Chủ nhà của hàng (hàng 11, ADR-0010). Mọi câu chạy trong giao dịch của `withCompany` bằng vai `quy_hang_app`: luật theo
 * dòng của migration 006 chặn lần nữa sau luật của lõi. Số chủ không bao giờ đọc ở đây — chỉ qua `app.reveal_owner_phone`.
 */

export type Refusal = { error: ApiErrorEntry; details?: PayloadError[] };
export const isRefusal = (r: unknown): r is Refusal => !!r && typeof r === "object" && "error" in r;

const ve = (error: ApiErrorEntry, details?: PayloadError[]): Refusal => ({ error, ...(details && { details }) });

/** Khoá hàng theo sàn đang làm; hàng không có (hay của sàn khác) → `false`. Lệnh thứ hai trên cùng hàng đứng chờ. */
async function khoaHang(tx: pg.PoolClient, listingId: string): Promise<boolean> {
  const r = await tx.query("select 1 from listings where company_id = app.current_company_id() and id = $1 for update", [listingId]);
  return (r.rowCount ?? 0) > 0;
}

async function nguoiXem(tx: pg.PoolClient): Promise<Viewer> {
  const { rows } = await tx.query<{ u: string; r: string[] }>("select app.current_user_id() u, app.current_user_roles() r");
  return { userId: rows[0]!.u, roles: rows[0]!.r };
}

/** Đầu chủ giữ căn: dòng gán mới nhất; chưa ai giữ → `null`. */
async function dauChuGiu(tx: pg.PoolClient, listingId: string): Promise<string | null> {
  const { rows } = await tx.query<{ user_id: string }>(
    "select user_id from listing_agent_assignments where listing_id = $1 order by seq desc limit 1",
    [listingId],
  );
  return rows[0]?.user_id ?? null;
}

async function docChuNha(tx: pg.PoolClient, listingId: string, viewer: Viewer, agent: string | null): Promise<OwnerView | Refusal> {
  const { rows } = await tx.query<{ owner_name: string; floor_price: number | null; has_phone: boolean }>(
    "select owner_name, floor_price::float8 as floor_price, has_phone from listing_owners where listing_id = $1",
    [listingId],
  );
  const r = rows[0];
  if (!r) return ve(API_ERRORS.ownerNotSet);
  return ownerView({ listingAgentUserId: agent, ownerName: r.owner_name, floorPrice: r.floor_price, hasPhone: r.has_phone }, viewer);
}

export async function getOwner(tx: pg.PoolClient, listingId: string): Promise<OwnerView | Refusal> {
  if (!(await khoaHang(tx, listingId))) return ve(API_ERRORS.notFound);
  const viewer = await nguoiXem(tx);
  const agent = await dauChuGiu(tx, listingId);
  if (!canSeeSource(viewer, agent)) return { visible: false, listingAgentUserId: agent };
  return docChuNha(tx, listingId, viewer, agent);
}

/** Ghi lại trọn chủ nhà. Hàng chưa ai giữ: người có vai Đầu chủ thành đầu chủ giữ căn (Hỏi-3). */
export async function putOwner(tx: pg.PoolClient, listingId: string, payload: unknown): Promise<OwnerView | Refusal> {
  if (!(await khoaHang(tx, listingId))) return ve(API_ERRORS.notFound);
  const v = validateOwnerInput(payload);
  if (!v.ok) return ve(API_ERRORS.invalidPayload, v.errors);
  const viewer = await nguoiXem(tx);
  let agent = await dauChuGiu(tx, listingId);
  if (agent === null) {
    if (!viewer.roles.includes("listing_agent")) return ve(API_ERRORS.listingAgentRequired);
    await tx.query(
      "insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values (app.current_company_id(), $1, 1, $2, $2)",
      [listingId, viewer.userId],
    );
    agent = viewer.userId;
  } else if (!canSeeSource(viewer, agent)) {
    return ve(API_ERRORS.listingAgentRequired);
  }
  const giaTri = [listingId, v.value.ownerName, v.value.ownerPhone ?? null, v.value.floorPrice ?? null];
  const sua = await tx.query(
    `update listing_owners set owner_name = $2, owner_phone = $3, floor_price = $4, updated_by = app.current_user_id(), updated_at = now()
     where listing_id = $1`,
    giaTri,
  );
  if (!sua.rowCount) {
    await tx.query(
      `insert into listing_owners (company_id, listing_id, owner_name, owner_phone, floor_price, updated_by)
       values (app.current_company_id(), $1, $2, $3, $4, app.current_user_id())`,
      giaTri,
    );
  }
  return docChuNha(tx, listingId, viewer, agent);
}

/** Mở số chủ qua cửa duy nhất của cơ sở dữ liệu — hàm ghi một sự kiện rồi mới trả số. */
export async function revealPhone(tx: pg.PoolClient, listingId: string): Promise<{ ownerPhone: string } | Refusal> {
  if (!(await khoaHang(tx, listingId))) return ve(API_ERRORS.notFound);
  await tx.query("savepoint mo_so");
  try {
    const { rows } = await tx.query<{ so: string }>("select app.reveal_owner_phone($1) as so", [listingId]);
    return { ownerPhone: rows[0]!.so };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code !== "42501" && code !== "P0002") throw e;
    await tx.query("rollback to savepoint mo_so");
    return ve(code === "42501" ? API_ERRORS.listingAgentRequired : API_ERRORS.ownerNotSet);
  }
}

/** Trưởng nhóm gán, gán lại đầu chủ giữ căn: thêm một dòng gán, dòng cũ giữ nguyên. */
export async function assignAgent(tx: pg.PoolClient, listingId: string, payload: unknown): Promise<{ listingAgentUserId: string } | Refusal> {
  if (!(await khoaHang(tx, listingId))) return ve(API_ERRORS.notFound);
  const p = payload as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || Array.isArray(p) || Object.keys(p).some((k) => k !== "userId") || typeof p.userId !== "string") {
    return ve(API_ERRORS.invalidPayload, [{ path: "userId", reason: "cần mã thành viên" }]);
  }
  const viewer = await nguoiXem(tx);
  if (!viewer.roles.includes("team_lead")) return ve(API_ERRORS.listingAgentRequired);
  const { rows } = await tx.query<{ ok: boolean }>("select app.member_has_role($1, 'listing_agent') as ok", [p.userId]);
  if (!rows[0]?.ok) return ve(API_ERRORS.invalidPayload, [{ path: "userId", reason: "không phải đầu chủ của sàn" }]);
  await tx.query(
    `insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by)
     values (app.current_company_id(), $1,
             (select coalesce(max(seq), 0) + 1 from listing_agent_assignments where listing_id = $1), $2, app.current_user_id())`,
    [listingId, p.userId],
  );
  return { listingAgentUserId: p.userId };
}
