import { timDiem } from "@quy-hang/core/config";
import { docMauBai, docMauBang, KHOA_MAU_BAI, KHOA_MAU_BANG, kiemMauBai, kiemMauBang, type MauBai, type MauBang } from "@quy-hang/core/export";
import type pg from "pg";
import { rolesOf } from "../routing/store";

/**
 * Mẫu của sàn (hàng mau-bang-hang-va-bai): mẫu bảng hàng (#26 `export.templates`) và mẫu bài theo kênh (#27
 * `share.post_templates`) lưu ở `company_settings` — cách ly theo dòng và nhật ký đổi đã có ở migration 026, như bộ nhãn
 * hàng 45. Đọc: mọi vai của sàn, khoan dung (dòng hỏng bị lọc, lỗi vào `errors`). Ghi: nguyên khối, chỉ vai có trong `aiDoi`
 * của điểm; một mẫu sai thì không ghi gì.
 */
export type MauBangView = { templates: MauBang[]; errors: string[] };
export type MauBaiView = { templates: MauBai; errors: string[] };
export type TemplatesRefusal = { refusal: "invalid"; reason: string } | { refusal: "forbidden" };

async function docKhoa(tx: pg.PoolClient, khoa: string): Promise<unknown> {
  const r = await tx.query<{ value: unknown }>("select value from company_settings where company_id = app.current_company_id() and key = $1", [khoa]);
  return r.rows[0]?.value ?? null;
}

async function duocGhi(tx: pg.PoolClient, khoa: string): Promise<boolean> {
  const vai = await rolesOf(tx);
  return timDiem(khoa)?.aiDoi.some((r) => vai.includes(r)) ?? false;
}

async function ghiKhoa(tx: pg.PoolClient, khoa: string, value: unknown): Promise<void> {
  // Hai lượt lưu cùng lúc của một sàn không trộn nhau: lượt sau chờ lượt trước, bản lưu sau thắng nguyên khối.
  await tx.query("select pg_advisory_xact_lock(hashtextextended($1 || ':' || app.current_company_id()::text, 0))", [khoa]);
  await tx.query(
    `insert into company_settings (company_id, key, value, updated_by, data_class)
     values (app.current_company_id(), $1, $2::jsonb, app.current_user_id(), 'company_internal')
     on conflict (company_id, key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
    [khoa, JSON.stringify(value)],
  );
}

const thanCua = (input: unknown): unknown =>
  input !== null && typeof input === "object" && !Array.isArray(input) && "templates" in input ? (input as { templates: unknown }).templates : undefined;

export async function readExportTemplates(tx: pg.PoolClient): Promise<MauBangView> {
  const { ds, loi } = docMauBang(await docKhoa(tx, KHOA_MAU_BANG));
  return { templates: ds, errors: loi };
}

export async function writeExportTemplates(tx: pg.PoolClient, input: unknown): Promise<MauBangView | TemplatesRefusal> {
  if (!(await duocGhi(tx, KHOA_MAU_BANG))) return { refusal: "forbidden" };
  const v = thanCua(input);
  if (v === undefined) return { refusal: "invalid", reason: `${KHOA_MAU_BANG}: thân phải là { templates: [...] }` };
  const kq = kiemMauBang(v);
  if (!kq.ok) return { refusal: "invalid", reason: kq.lyDo };
  await ghiKhoa(tx, KHOA_MAU_BANG, kq.giaTri);
  return readExportTemplates(tx);
}

export async function readPostTemplates(tx: pg.PoolClient): Promise<MauBaiView> {
  const { mau, loi } = docMauBai(await docKhoa(tx, KHOA_MAU_BAI));
  return { templates: mau, errors: loi };
}

export async function writePostTemplates(tx: pg.PoolClient, input: unknown): Promise<MauBaiView | TemplatesRefusal> {
  if (!(await duocGhi(tx, KHOA_MAU_BAI))) return { refusal: "forbidden" };
  const v = thanCua(input);
  if (v === undefined) return { refusal: "invalid", reason: `${KHOA_MAU_BAI}: thân phải là { templates: { zalo?, facebook? } }` };
  const kq = kiemMauBai(v);
  if (!kq.ok) return { refusal: "invalid", reason: kq.lyDo };
  await ghiKhoa(tx, KHOA_MAU_BAI, kq.giaTri);
  return readPostTemplates(tx);
}
