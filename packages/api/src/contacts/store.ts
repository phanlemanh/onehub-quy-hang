import { contactView, validateContactPatch, type ContactRecord, type ContactType, type ContactView } from "@quy-hang/core/contacts";
import type pg from "pg";
import { API_ERRORS } from "../errors";
import type { Refusal } from "../leads/store";

/**
 * Liên hệ (hàng 85, ADR-0021). Đọc theo luật dòng của migration 016: chỉ trưởng nhóm và người giữ còn vai Đầu chủ thấy liên
 * hệ chủ nhà — không thấy thì như không có (404). Không câu nào đọc cột số; sửa loại qua `app.set_contact_types`.
 */
export async function readContact(tx: pg.PoolClient, id: string): Promise<ContactView | null> {
  const { rows } = await tx.query<{
    id: string;
    full_name: string | null;
    contact_types: ContactType[];
    owner_member_user_id: string | null;
    created_at: Date;
    phone_count: number;
    has_listing: boolean;
    any_first_call: boolean;
  }>(
    `select c.id, c.full_name, c.contact_types, c.owner_member_user_id, c.created_at,
            (select count(*)::int from contact_phones p where p.company_id = c.company_id and p.contact_id = c.id) phone_count,
            exists (select 1 from listing_owners o where o.company_id = c.company_id and o.contact_id = c.id) has_listing,
            exists (select 1 from leads l where l.company_id = c.company_id and l.contact_id = c.id and l.first_called_at is not null) any_first_call
     from contacts c where c.company_id = app.current_company_id() and c.id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) return null;
  const rec: ContactRecord = {
    id: r.id,
    fullName: r.full_name,
    contactTypes: r.contact_types,
    ownerMemberUserId: r.owner_member_user_id,
    phoneCount: r.phone_count,
    hasListing: r.has_listing,
    anyFirstCall: r.any_first_call,
    createdAt: r.created_at.toISOString(),
  };
  return contactView(rec, true) as ContactView;
}

export async function patchContact(tx: pg.PoolClient, id: string, payload: unknown): Promise<ContactView | Refusal> {
  const v = validateContactPatch(payload);
  if (!v.ok) return { error: API_ERRORS.invalidPayload, details: v.errors };
  // Luật đọc theo dòng là cửa thứ nhất: không thấy liên hệ thì không sửa được.
  if (!(await readContact(tx, id))) return { error: API_ERRORS.notFound };
  await tx.query("savepoint sua_lien_he");
  try {
    await tx.query("select app.set_contact_types($1, $2)", [id, v.value.contactTypes]);
  } catch (e) {
    await tx.query("rollback to savepoint sua_lien_he");
    const code = (e as { code?: string }).code;
    if (code === "P0002") return { error: API_ERRORS.notFound };
    if (code === "22023") return { error: API_ERRORS.ownerTypeRequired };
    // Hàng 86: còn nhu cầu khách đang mở cần Người mua / Người thuê.
    if (code === "23514") return { error: API_ERRORS.buyerTypeRequired };
    throw e;
  }
  return (await readContact(tx, id))!;
}

/**
 * Ghi giá trị trường riêng của một liên hệ (hàng 47) qua `app.set_contact_custom` (migration 043): người đọc được liên hệ
 * (luật đọc lớp nguồn của 036), mã là trường liên hệ còn sống áp cho loại của người ấy. Trả custom mới.
 */
export async function patchContactCustom(tx: pg.PoolClient, id: string, payload: unknown): Promise<{ custom: Record<string, unknown> } | Refusal> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return { error: API_ERRORS.invalidPayload, details: [{ path: "custom", reason: "cần một object" }] };
  await tx.query("savepoint ghi_truong_rieng");
  try {
    const { rows } = await tx.query<{ v: Record<string, unknown> }>("select app.set_contact_custom($1, $2::jsonb) v", [id, JSON.stringify(payload)]);
    return { custom: rows[0]!.v };
  } catch (e) {
    await tx.query("rollback to savepoint ghi_truong_rieng");
    const code = (e as { code?: string }).code;
    if (code === "42501") return { error: API_ERRORS.notFound };
    if (code === "22023") return { error: API_ERRORS.invalidPayload, details: [{ path: "custom", reason: (e as Error).message }] };
    throw e;
  }
}
