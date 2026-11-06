import { bangNhan, boTuVung, doiNhan, dungDongNhan, laKhoaNhan, type BangNhan, type DongNhan } from "@quy-hang/core/labels";
import type pg from "pg";
import { rolesOf } from "../routing/store";
import { readStatuses, type BangTrangThai } from "../statuses/store";

/**
 * Cách gọi riêng của sàn (hàng 45): đọc và đổi bộ nhãn trong `company_settings` (khoá `labels.field.*`, `labels.value.*`,
 * migration 039). Kiểm ở lõi (`@quy-hang/core/labels`); nhật ký do trigger của migration 026 ghi — mỗi khoá đổi một sự
 * kiện. Trả về mặc định ghi giá trị `null`, không xoá dòng, để nhật ký có vết; khoá giữ nguyên không ghi lại.
 */

export type LabelsRefusal = { refusal: "invalid"; reason: string } | { refusal: "forbidden" };

/** Dòng nhãn đang lưu của sàn hiện hành (luật theo dòng lọc sàn). */
export async function dongNhanCuaSan(tx: pg.PoolClient): Promise<DongNhan[]> {
  return (
    await tx.query<DongNhan>(
      "select key, value from company_settings where company_id = app.current_company_id() and key like 'labels.%' order by key",
    )
  ).rows.filter((r) => laKhoaNhan(r.key));
}

/** Bộ cách gọi của sàn, kèm bộ trạng thái riêng (hàng 46) để màn đọc từ vựng một lần — cùng thân `GET /company/statuses`. */
export type BangTuVung = BangNhan & BangTrangThai;

export async function readLabels(tx: pg.PoolClient): Promise<BangTuVung> {
  return { ...bangNhan(boTuVung(await dongNhanCuaSan(tx)).tuVung), ...(await readStatuses(tx)) };
}

/** Ghi nguyên khối: một ô sai thì không ô nào được ghi. Chỉ quản trị sàn. */
export async function writeLabels(tx: pg.PoolClient, input: unknown): Promise<BangTuVung | LabelsRefusal> {
  if (!(await rolesOf(tx)).includes("company_admin")) return { refusal: "forbidden" };
  const bo = dungDongNhan(input);
  if (!bo.ok) return { refusal: "invalid", reason: bo.loi };
  // Hai lượt lưu cùng lúc của một sàn không trộn nhau: tính khoá đổi trên bản đã khoá.
  await tx.query("select pg_advisory_xact_lock(hashtextextended('cach-goi:' || app.current_company_id()::text, 0))");
  const ghi = doiNhan(await dongNhanCuaSan(tx), bo.dong);
  for (const r of ghi) {
    await tx.query(
      `insert into company_settings (company_id, key, value, updated_by, data_class)
       values (app.current_company_id(), $1, $2::jsonb, app.current_user_id(), 'company_internal')
       on conflict (company_id, key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
      [r.key, JSON.stringify(r.value)],
    );
  }
  return readLabels(tx);
}
