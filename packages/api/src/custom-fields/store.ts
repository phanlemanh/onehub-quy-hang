import { boTuVung } from "@quy-hang/core/labels";
import { kiemTruongRieng, type TruongGui, type TruongRieng, type TrungNghia } from "@quy-hang/core/custom-fields";
import type pg from "pg";
import { dongNhanCuaSan } from "../labels/store";
import { rolesOf } from "../routing/store";

/**
 * Trường riêng của sàn (hàng 47): đọc và ghi bảng định nghĩa `custom_fields` (migration 043). Luật ở lõi
 * (`@quy-hang/core/custom-fields`); nhật ký do trigger của 043 ghi — mỗi dòng đổi một sự kiện, dòng giữ nguyên không ghi lại.
 * Bỏ trường đặt `archived_at`, không xoá dòng; mã không dùng lại.
 */

export type BoTruong = { fields: TruongRieng[] };
export type FieldsRefusal =
  | { refusal: "forbidden" }
  | { refusal: "invalid"; reason: string }
  | { refusal: "trung-nghia"; reason: string; trungNghia: TrungNghia & { label: string } };

type Dong = {
  code: string;
  target: TruongRieng["target"];
  contact_types: TruongRieng["contactTypes"];
  kind: TruongRieng["kind"];
  label: string;
  options: TruongRieng["options"];
  data_class: TruongRieng["dataClass"];
  archived: boolean;
};
const veTruong = (r: Dong): TruongRieng => ({
  code: r.code,
  target: r.target,
  contactTypes: r.contact_types,
  kind: r.kind,
  label: r.label,
  options: r.options,
  dataClass: r.data_class,
  archived: r.archived,
});

/** Bộ trường của sàn đang làm (luật theo dòng lọc sàn): còn sống trước theo vị trí, rồi trường đã bỏ. */
export async function docBoTruong(tx: pg.PoolClient): Promise<TruongRieng[]> {
  const { rows } = await tx.query<Dong>(
    `select code, target, contact_types, kind, label, options, data_class, archived_at is not null archived
     from custom_fields where company_id = app.current_company_id() order by archived_at is not null, position, code`,
  );
  return rows.map(veTruong);
}

export async function readFields(tx: pg.PoolClient): Promise<BoTruong> {
  return { fields: await docBoTruong(tx) };
}

/** Ghi cả bộ nguyên khối, chỉ quản trị sàn: sai một trường thì không ghi gì; người gọi huỷ giao dịch khi bị từ chối. */
export async function writeFields(tx: pg.PoolClient, input: unknown): Promise<BoTruong | FieldsRefusal> {
  if (!(await rolesOf(tx)).includes("company_admin")) return { refusal: "forbidden" };
  const gui = (input as { fields?: unknown } | null)?.fields;
  if (!Array.isArray(gui)) return { refusal: "invalid", reason: "fields: cần {fields: [...]}" };
  await tx.query("select pg_advisory_xact_lock(hashtext('truong-rieng:' || app.current_company_id()::text))");
  const daCo = await docBoTruong(tx);
  const tuVung = boTuVung(await dongNhanCuaSan(tx)).tuVung;
  const kq = kiemTruongRieng(gui as TruongGui[], daCo, { tuVung });
  if (!kq.ok) return kq.trungNghia ? { refusal: "trung-nghia", reason: kq.loi, trungNghia: kq.trungNghia } : { refusal: "invalid", reason: kq.loi };

  const cu = new Map(daCo.map((t) => [t.code, t]));
  const { rows: vt } = await tx.query<{ code: string; position: number }>("select code, position from custom_fields where company_id = app.current_company_id()");
  const viTriCu = new Map(vt.map((r) => [r.code, r.position]));
  let i = 0;
  for (const t of kq.bo) {
    const truoc = cu.get(t.code);
    const pos = t.archived ? (viTriCu.get(t.code) ?? 0) : i++;
    // Dòng giữ nguyên (chữ, lựa chọn, bỏ, vị trí) không ghi lại — nhật ký không phình.
    if (truoc && truoc.label === t.label && JSON.stringify(truoc.options) === JSON.stringify(t.options) && truoc.archived === t.archived && viTriCu.get(t.code) === pos) continue;
    await tx.query(
      `insert into custom_fields (company_id, code, target, contact_types, kind, label, options, data_class, position, archived_at, updated_by)
       values (app.current_company_id(), $1, $2, $3, $4, $5, $6::jsonb, $7, $8, case when $9 then now() end, app.current_user_id())
       on conflict (company_id, code) do update set label = excluded.label, options = excluded.options, position = excluded.position,
         archived_at = coalesce(custom_fields.archived_at, excluded.archived_at), updated_by = excluded.updated_by, updated_at = now()`,
      [t.code, t.target, t.contactTypes, t.kind, t.label, JSON.stringify(t.options), t.dataClass, pos, t.archived],
    );
  }
  return readFields(tx);
}
