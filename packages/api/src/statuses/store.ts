import {
  bangTrangThai,
  doiNhanTrangThai,
  khoaNhan,
  kiemNhanTrangThai,
  KHOA_TRANG_THAI,
  type DongBangTrangThai,
  type NhanGui,
} from "@quy-hang/core/statuses";
import type pg from "pg";
import { khoaBoTrangThai, nhanCuaSan, thayNhanCan } from "../listings/store";
import { rolesOf } from "../routing/store";

/**
 * Trạng thái riêng của sàn (hàng 46): đọc và đổi bộ nhãn trạng thái trong `company_settings` (khoá `labels.status.<mã>`,
 * migration 047). Luật ở lõi (`@quy-hang/core/statuses`); nhật ký do trigger của migration 026 ghi — mỗi khoá đổi một sự
 * kiện, khoá giữ nguyên không ghi lại, gỡ nhãn ghi `null`. Gỡ nhãn còn căn mang cần nhãn thay: mỗi căn còn mang mã ở lúc
 * ghi nhận một sự kiện `status_changed` qua đường ghi của lệnh hàng — không sửa thẳng bảng hàng.
 */

export type BangTrangThai = { statuses: DongBangTrangThai[] };
export type StatusesRefusal =
  | { refusal: "forbidden" }
  | { refusal: "invalid"; reason: string }
  | { refusal: "in-use"; code: string; count: number; reason: string };

/** Số căn (chưa gỡ khỏi Quỹ hàng) đang mang từng mã nhãn, trong sàn đang làm. */
async function demCanMang(tx: pg.PoolClient): Promise<Record<string, number>> {
  const { rows } = await tx.query<{ ma: string; n: number }>(
    `select status_label ma, count(*)::int n from listings
     where company_id = app.current_company_id() and status_label is not null and not voided group by status_label`,
  );
  return Object.fromEntries(rows.map((r) => [r.ma, r.n]));
}

export async function readStatuses(tx: pg.PoolClient): Promise<BangTrangThai> {
  return bangTrangThai(await nhanCuaSan(tx), await demCanMang(tx));
}

type ThanPut = { labels: NhanGui[]; replace: Record<string, unknown> };
function docThan(input: unknown): ThanPut | string {
  if (!input || typeof input !== "object" || Array.isArray(input)) return `${KHOA_TRANG_THAI}*: cần {labels, replace?}`;
  const t = input as { labels?: unknown; replace?: unknown };
  if (!Array.isArray(t.labels)) return `${KHOA_TRANG_THAI}*: cần danh sách nhãn`;
  if (t.replace !== undefined && (t.replace === null || typeof t.replace !== "object" || Array.isArray(t.replace)))
    return `${KHOA_TRANG_THAI}*: replace cần dạng {mã gỡ: mã thay | null}`;
  return { labels: t.labels as NhanGui[], replace: (t.replace ?? {}) as Record<string, unknown> };
}

/** Ghi cả bộ nhãn nguyên khối, chỉ quản trị sàn: sai một nhãn thì không ghi gì; người gọi huỷ giao dịch khi bị từ chối. */
export async function writeStatuses(tx: pg.PoolClient, input: unknown): Promise<BangTrangThai | StatusesRefusal> {
  if (!(await rolesOf(tx)).includes("company_admin")) return { refusal: "forbidden" };
  const than = docThan(input);
  if (typeof than === "string") return { refusal: "invalid", reason: than };
  // Hai lượt lưu cùng lúc không trộn nhau, và lệnh mang nhãn (khoá chung) không đặt được mã đang bị gỡ.
  await khoaBoTrangThai(tx, false);
  const daCo = await nhanCuaSan(tx);
  const kq = kiemNhanTrangThai(than.labels, daCo);
  if (!kq.ok) return { refusal: "invalid", reason: kq.loi };

  // Mã bị gỡ: còn căn mang thì phải có nhãn thay cùng neo (hay `null` = nhãn mặc định của neo).
  const conLai = new Map(kq.nhan.map((n) => [n.ma, n]));
  const go = daCo.filter((n) => !conLai.has(n.ma));
  const dem = await demCanMang(tx);
  const thay = new Map<string, string | null>();
  for (const n of go) {
    const khoa = khoaNhan(n.ma);
    if (Object.hasOwn(than.replace, n.ma)) {
      const v = than.replace[n.ma];
      if (v !== null) {
        const dich = typeof v === "string" ? conLai.get(v) : undefined;
        if (!dich) return { refusal: "invalid", reason: `${khoa}: nhãn thay «${String(v)}» không có trong bộ nhãn mới` };
        if (dich.anchor !== n.anchor) return { refusal: "invalid", reason: `${khoa}: nhãn thay «${dich.ma}» neo vào ${dich.anchor}, không phải ${n.anchor}` };
      }
      thay.set(n.ma, v as string | null);
    } else if ((dem[n.ma] ?? 0) > 0) {
      const count = dem[n.ma]!;
      return { refusal: "in-use", code: n.ma, count, reason: `${khoa}: ${count} căn đang mang nhãn «${n.label}» — cần nhãn thay` };
    }
  }

  const { rows: daLuu } = await tx.query<{ key: string; value: unknown }>(
    "select key, value from company_settings where company_id = app.current_company_id() and key like 'labels.status.%' order by key",
  );
  for (const r of doiNhanTrangThai(daLuu, kq.nhan)) {
    await tx.query(
      `insert into company_settings (company_id, key, value, updated_by, data_class)
       values (app.current_company_id(), $1, $2::jsonb, app.current_user_id(), 'company_internal')
       on conflict (company_id, key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
      [r.key, JSON.stringify(r.value)],
    );
  }
  // Căn còn mang mã gỡ — đọc trong giao dịch đã khoá; `thayNhanCan` đọc lại từng căn sau khoá theo hàng.
  for (const [ma, dich] of thay) {
    const { rows } = await tx.query<{ id: string }>(
      "select id from listings where company_id = app.current_company_id() and status_label = $1 and not voided order by id",
      [ma],
    );
    for (const r of rows) await thayNhanCan(tx, r.id, ma, dich);
  }
  return readStatuses(tx);
}
