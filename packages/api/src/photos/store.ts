import { kiemTepAnh, loaiTuByteDau, type Compartment, type UnitPhoto } from "@quy-hang/core/photos";
import type pg from "pg";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import type { BienThe, DocAnh, KhoAnh } from "./kho";

/**
 * Lệnh ảnh căn (hàng 18, ADR-0014). Mọi câu chạy trong giao dịch của withCompany (vai quy_hang_app): luật theo dòng của
 * migration 012 quyết ai thấy, ai sửa ngăn nội bộ — ở đây chỉ dịch kết quả thành mã lỗi. Mỗi lệnh ghi đúng một sự kiện.
 */
export type Refusal = { error: ApiErrorEntry };
export const isRefusal = (r: unknown): r is Refusal => !!r && typeof r === "object" && "error" in r && !("anh" in r);
const ve = (error: ApiErrorEntry): Refusal => ({ error });

type Dong = {
  id: string; building_name: string; unit_number: string; compartment: Compartment; display_order: number; is_cover: boolean;
  is_sample: boolean; taken_at: string | null; added_at: Date; content_type: string; width: number; height: number;
};
const COT = "id, building_name, unit_number, compartment, display_order, is_cover, is_sample, to_char(taken_at, 'YYYY-MM-DD') taken_at, added_at, content_type, width, height";
const raAnh = (d: Dong): UnitPhoto => ({
  id: d.id, buildingName: d.building_name, unitNumber: d.unit_number, compartment: d.compartment, displayOrder: d.display_order,
  isCover: d.is_cover, isSample: d.is_sample, takenAt: d.taken_at, addedAt: d.added_at.toISOString(), contentType: d.content_type,
  width: d.width, height: d.height,
});

async function thayNoiBo(tx: pg.PoolClient, toa: string, ma: string): Promise<boolean> {
  return (await tx.query<{ ok: boolean }>("select app.can_see_unit_internal($1, $2) ok", [toa, ma])).rows[0]!.ok;
}
async function suKien(tx: pg.PoolClient, photoId: string, type: string, payload: Record<string, unknown> = {}) {
  await tx.query(
    "insert into unit_photo_events (company_id, photo_id, type, payload, actor_user_id) values (app.current_company_id(), $1, $2, $3, app.current_user_id())",
    [photoId, type, JSON.stringify(payload)],
  );
}
async function docDong(tx: pg.PoolClient, id: string): Promise<Dong | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { rows } = await tx.query<Dong>(`select ${COT} from unit_photos where id = $1 and removed_at is null`, [id]);
  return rows[0] ?? null;
}

export type DanhSach = { anh: UnitPhoto[]; noiBo: "thay" | "an"; suaDuoc: boolean };

/** Ảnh của một căn mà người xem thấy; `noiBo` nói người xem có thấy ngăn nội bộ không — không kèm số đếm khi không. */
export async function listPhotos(tx: pg.PoolClient, toa: string, ma: string): Promise<DanhSach> {
  const { rows } = await tx.query<Dong>(
    `select ${COT} from unit_photos where building_name = $1 and app.unit_key(unit_number) = app.unit_key($2) and removed_at is null
     order by compartment, display_order, added_at`,
    [toa, ma],
  );
  const thay = await thayNoiBo(tx, toa, ma);
  return { anh: rows.map(raAnh), noiBo: thay ? "thay" : "an", suaDuoc: thay };
}

export type TepVao = { toa: string; ma: string; ngan: Compartment; takenAt: string | null; width: number; height: number; original: Buffer; thumb: Buffer };

export async function addPhoto(tx: pg.PoolClient, kho: KhoAnh, companyId: string, t: TepVao): Promise<{ anh: UnitPhoto } | Refusal> {
  const kq = kiemTepAnh(t.original.subarray(0, 64), t.original.length);
  if (!kq.ok) return ve(kq.lyDo === "Ảnh quá 10 MB" ? API_ERRORS.photoTooLarge : API_ERRORS.photoNotImage);
  const loaiNhe = loaiTuByteDau(t.thumb.subarray(0, 64));
  if (!loaiNhe || t.thumb.length > 1024 * 1024) return ve(API_ERRORS.photoNotImage);
  if (!(await thayNoiBo(tx, t.toa, t.ma))) return ve(API_ERRORS.listingAgentRequired);
  const thuTu = (await tx.query<{ n: number }>(
    "select coalesce(max(display_order) + 1, 0)::int n from unit_photos where building_name = $1 and app.unit_key(unit_number) = app.unit_key($2) and compartment = $3",
    [t.toa, t.ma, t.ngan],
  )).rows[0]!.n;
  const { rows } = await tx.query<Dong>(
    `insert into unit_photos (id, company_id, building_name, unit_number, compartment, display_order, taken_at, content_type, byte_size, width, height, added_by)
     values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, app.current_user_id()) returning ${COT}`,
    [companyId, t.toa, t.ma, t.ngan, thuTu, t.takenAt, kq.type, t.original.length, t.width, t.height],
  );
  const d = rows[0]!;
  await kho.ghi(tx, companyId, d.id, "original", t.original, kq.type);
  await kho.ghi(tx, companyId, d.id, "thumb", t.thumb, loaiNhe);
  await suKien(tx, d.id, "added", { compartment: t.ngan });
  return { anh: raAnh(d) };
}

export type SuaVao = { compartment?: Compartment; order?: string[]; isCover?: true; isSample?: boolean };

export async function patchPhoto(tx: pg.PoolClient, id: string, s: SuaVao): Promise<{ anh: UnitPhoto } | Refusal> {
  const d = await docDong(tx, id);
  if (!d) return ve(API_ERRORS.notFound);
  if (!(await thayNoiBo(tx, d.building_name, d.unit_number))) return ve(API_ERRORS.listingAgentRequired);
  const cung = "building_name = $1 and app.unit_key(unit_number) = app.unit_key($2) and removed_at is null";
  if (s.isSample !== undefined) {
    if (d.compartment === "internal") return ve(API_ERRORS.photoInternalNoSample);
    await tx.query("update unit_photos set is_sample = $2 where id = $1", [id, s.isSample]);
    await suKien(tx, id, "sample_set", { isSample: s.isSample });
  }
  if (s.isCover) {
    if (d.compartment === "internal") return ve(API_ERRORS.invalidPayload);
    await tx.query(`update unit_photos set is_cover = false where ${cung} and is_cover`, [d.building_name, d.unit_number]);
    await tx.query("update unit_photos set is_cover = true where id = $1", [id]);
    await suKien(tx, id, "cover_set");
  }
  if (s.order) {
    const { rows } = await tx.query<{ id: string }>(`select id from unit_photos where ${cung} and compartment = $3`, [d.building_name, d.unit_number, d.compartment]);
    const co = new Set(rows.map((r) => r.id));
    if (s.order.length !== co.size || !s.order.every((x) => co.has(x))) return ve(API_ERRORS.invalidPayload);
    for (const [i, x] of s.order.entries()) await tx.query("update unit_photos set display_order = $2 where id = $1", [x, i]);
    await suKien(tx, id, "reordered", { order: s.order });
  }
  if (s.compartment && s.compartment !== d.compartment) {
    const n = (await tx.query<{ n: number }>(`select coalesce(max(display_order) + 1, 0)::int n from unit_photos where ${cung} and compartment = $3`, [d.building_name, d.unit_number, s.compartment])).rows[0]!.n;
    await tx.query(
      "update unit_photos set compartment = $2, display_order = $3, is_cover = case when $2 = 'internal' then false else is_cover end, is_sample = case when $2 = 'internal' then false else is_sample end where id = $1",
      [id, s.compartment, n],
    );
    await suKien(tx, id, "compartment_changed", { from: d.compartment, to: s.compartment });
  }
  return { anh: raAnh((await docDong(tx, id))!) };
}

/** «Xoá khỏi căn»: dòng giữ dấu ai xoá lúc nào, byte xoá hẳn (Hỏi-6). */
export async function removePhoto(tx: pg.PoolClient, kho: KhoAnh, companyId: string, id: string): Promise<{ ok: true } | Refusal> {
  const d = await docDong(tx, id);
  if (!d) return ve(API_ERRORS.notFound);
  if (!(await thayNoiBo(tx, d.building_name, d.unit_number))) return ve(API_ERRORS.listingAgentRequired);
  await suKien(tx, id, "removed");
  await kho.xoa(tx, companyId, id);
  await tx.query("update unit_photos set removed_at = now(), removed_by = app.current_user_id(), is_cover = false where id = $1", [id]);
  return { ok: true };
}

/** Byte hay link của một ảnh — chỉ sau khi dòng ảnh đọc được dưới luật theo dòng. */
export async function readPhoto(tx: pg.PoolClient, kho: KhoAnh, companyId: string, id: string, bien: BienThe): Promise<{ doc: DocAnh; noiBo: boolean; type: string } | Refusal> {
  const d = await docDong(tx, id);
  if (!d) return ve(API_ERRORS.notFound);
  const doc = await kho.doc(tx, companyId, id, bien);
  if (!doc) return ve(API_ERRORS.notFound);
  return { doc, noiBo: d.compartment === "internal", type: bien === "original" ? d.content_type : "image/webp" };
}
