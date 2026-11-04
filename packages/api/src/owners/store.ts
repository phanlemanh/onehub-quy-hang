import { canSeeSource, ownerView, validateOwnerInput, type OwnerView, type Viewer } from "@quy-hang/core/access";
import type { PayloadError } from "@quy-hang/core/listing";
import { canRead } from "@quy-hang/core/visibility";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { factsOf, loadEvents } from "../listings/store";
import { dauVetSo, giaiMaSo, maHoaSo, nguCanhChuNha, type KhoaSoChu } from "./ma-hoa";

/**
 * Chủ nhà của hàng (hàng 11, ADR-0010). Mọi câu chạy trong giao dịch của `withCompany` bằng vai `quy_hang_app`: luật theo
 * dòng của migration 006 chặn lần nữa sau luật của lõi. Số chủ không bao giờ đọc ở đây — chỉ qua `app.reveal_owner_phone`.
 * Số chủ chỉ vào cơ sở dữ liệu ở dạng bản mã và dấu vết (hàng 62, migration 008): mã hoá trước khi ghi, giải sau khi mở.
 */

export type Refusal = { error: ApiErrorEntry; details?: PayloadError[] };
export const isRefusal = (r: unknown): r is Refusal => !!r && typeof r === "object" && "error" in r;

const ve = (error: ApiErrorEntry, details?: PayloadError[]): Refusal => ({ error, ...(details && { details }) });

/** Khoá hàng theo sàn đang làm; hàng không có (hay của sàn khác) → `false`. Lệnh thứ hai trên cùng hàng đứng chờ. */
async function khoaHang(tx: pg.PoolClient, listingId: string): Promise<boolean> {
  const r = await tx.query("select 1 from listings where company_id = app.current_company_id() and id = $1 for update", [listingId]);
  return (r.rowCount ?? 0) > 0;
}

async function sanDangLam(tx: pg.PoolClient): Promise<string> {
  const { rows } = await tx.query<{ c: string }>("select app.current_company_id() c");
  return rows[0]!.c;
}

async function nguoiXem(tx: pg.PoolClient): Promise<Viewer> {
  const { rows } = await tx.query<{ u: string; r: string[] }>("select app.current_user_id() u, app.current_user_roles() r");
  return { userId: rows[0]!.u, roles: rows[0]!.r };
}

/**
 * Khoá hàng rồi xét trục ai thấy hàng (hàng 12) bằng `canRead` của lõi: hàng không có, của sàn khác hay «Chỉ tôi» của
 * người khác đều thành `null` — cùng một câu 404, xét trước khuôn và vai để mã lỗi không lộ hàng có thật. Nguồn chỉ thấy
 * được trên hàng mình đọc được.
 */
async function moHang(tx: pg.PoolClient, listingId: string): Promise<Viewer | null> {
  if (!(await khoaHang(tx, listingId))) return null;
  const viewer = await nguoiXem(tx);
  return canRead(viewer, await factsOf(tx, listingId, await loadEvents(tx, listingId))) ? viewer : null;
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
  const { rows } = await tx.query<{ owner_name: string | null; floor_price: number | null; has_phone: boolean }>(
    "select owner_name, floor_price::float8 as floor_price, has_phone from listing_owners where listing_id = $1",
    [listingId],
  );
  const r = rows[0];
  // Hàng tạo từ lead mang dòng chủ nhà chưa tên (chỉ gắn liên hệ của lead): chưa có chủ nhà tới khi đầu chủ ghi tên.
  if (!r || r.owner_name === null) return ve(API_ERRORS.ownerNotSet);
  return ownerView({ listingAgentUserId: agent, ownerName: r.owner_name, floorPrice: r.floor_price, hasPhone: r.has_phone }, viewer);
}

export async function getOwner(tx: pg.PoolClient, listingId: string): Promise<OwnerView | Refusal> {
  const viewer = await moHang(tx, listingId);
  if (!viewer) return ve(API_ERRORS.notFound);
  const agent = await dauChuGiu(tx, listingId);
  if (!canSeeSource(viewer, agent)) return { visible: false, listingAgentUserId: agent };
  return docChuNha(tx, listingId, viewer, agent);
}

/** Ghi lại trọn chủ nhà. Hàng chưa ai giữ: người có vai Đầu chủ thành đầu chủ giữ căn (Hỏi-3). Số ghi ở dạng bản mã. */
export async function putOwner(tx: pg.PoolClient, listingId: string, payload: unknown, khoa: KhoaSoChu): Promise<OwnerView | Refusal> {
  const viewer = await moHang(tx, listingId);
  if (!viewer) return ve(API_ERRORS.notFound);
  const v = validateOwnerInput(payload);
  if (!v.ok) return ve(API_ERRORS.invalidPayload, v.errors);
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
  const so = v.value.ownerPhone;
  const san = await sanDangLam(tx);
  const banMa = so === undefined ? null : maHoaSo(so, nguCanhChuNha(san, listingId), khoa);
  const dauVet = so === undefined ? null : dauVetSo(so, san, khoa);
  // Liên hệ của chủ nhà (hàng 85): số → liên hệ, chưa có số thì giữ liên hệ cũ của dòng hay tạo mới; liên hệ chưa có người
  // giữ thì nhận đầu chủ giữ căn.
  const { rows: cu } = await tx.query<{ contact_id: string | null }>("select contact_id from listing_owners where listing_id = $1", [listingId]);
  const lienHe = (
    await tx.query<{ c: string }>("select app.contact_for_owner($1, $2, $3, $4, $5, $6) c", [
      dauVet,
      banMa,
      nguCanhChuNha(san, listingId),
      v.value.ownerName,
      agent,
      cu[0]?.contact_id ?? null,
    ])
  ).rows[0]!.c;
  const giaTri = [listingId, v.value.ownerName, banMa, dauVet, v.value.floorPrice ?? null, lienHe];
  const sua = await tx.query(
    `update listing_owners set owner_name = $2, owner_phone = null, owner_phone_enc = $3, owner_phone_hash = $4, floor_price = $5,
       contact_id = $6, updated_by = app.current_user_id(), updated_at = now()
     where listing_id = $1`,
    giaTri,
  );
  if (!sua.rowCount) {
    await tx.query(
      `insert into listing_owners (company_id, listing_id, owner_name, owner_phone_enc, owner_phone_hash, floor_price, contact_id, updated_by)
       values (app.current_company_id(), $1, $2, $3, $4, $5, $6, app.current_user_id())`,
      giaTri,
    );
  }
  return docChuNha(tx, listingId, viewer, agent);
}

/**
 * Mở số chủ qua cửa duy nhất của cơ sở dữ liệu — hàm ghi một sự kiện rồi trả bản mã; API giải bằng khoá. Bản mã không
 * giải được (chép từ dòng khác, bị sửa, khoá khác) thì ném: giao dịch huỷ, không còn sự kiện mở số, không số nào ra.
 */
export async function revealPhone(tx: pg.PoolClient, listingId: string, khoa: KhoaSoChu): Promise<{ ownerPhone: string } | Refusal> {
  if (!(await moHang(tx, listingId))) return ve(API_ERRORS.notFound);
  await tx.query("savepoint mo_so");
  let banMa: Buffer;
  try {
    const { rows } = await tx.query<{ ban_ma: Buffer }>("select app.reveal_owner_phone($1) as ban_ma", [listingId]);
    banMa = rows[0]!.ban_ma;
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code !== "42501" && code !== "P0002") throw e;
    await tx.query("rollback to savepoint mo_so");
    return ve(code === "42501" ? API_ERRORS.listingAgentRequired : API_ERRORS.ownerNotSet);
  }
  return { ownerPhone: giaiMaSo(banMa, nguCanhChuNha(await sanDangLam(tx), listingId), khoa) };
}

/** Trưởng nhóm gán, gán lại đầu chủ giữ căn: thêm một dòng gán, dòng cũ giữ nguyên. */
export async function assignAgent(tx: pg.PoolClient, listingId: string, payload: unknown): Promise<{ listingAgentUserId: string } | Refusal> {
  const viewer = await moHang(tx, listingId);
  if (!viewer) return ve(API_ERRORS.notFound);
  const p = payload as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || Array.isArray(p) || Object.keys(p).some((k) => k !== "userId") || typeof p.userId !== "string") {
    return ve(API_ERRORS.invalidPayload, [{ path: "userId", reason: "cần mã thành viên" }]);
  }
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
