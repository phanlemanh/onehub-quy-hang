import { mayFlow, type Agreement } from "@quy-hang/core";
import { giaiCauHinh } from "@quy-hang/core/config";
import { FIELD_CLASS, isStandardField, type GoiDeXuat } from "@quy-hang/core/import";
import type pg from "pg";
import { rolesOf } from "../../routing/store";
import type { DungLuong } from "./claude";

/**
 * Dữ liệu của «Xử lý bằng AI» (hàng 68, migration 035): thoả thuận `ai_processing` của sàn, trần tháng, sổ `ai_usage`.
 * Mọi câu chạy trong `withCompany` (vai `quy_hang_app`, luật theo dòng).
 */
export const VAI_GOI = ["listing_agent", "team_lead"];
export const KHOA_TRAN = "ai.monthly_budget_usd";

/** Thoả thuận `ai_processing` đọc nguyên hàng từ cơ sở dữ liệu — không dựng lại trường nào bằng hằng (như danh mục ở catalog/feeds). */
export type ThoaThuanAi = Agreement;
export type TinhTrangAi = { vai: string[]; thoaThuan: ThoaThuanAi | null; tranUsd: number; daDungUsd: number; at: Date };

type DongThoaThuan = {
  id: string;
  company_id: string;
  kind: Agreement["kind"];
  direction: Agreement["direction"];
  counterparty: string;
  data_classes: Agreement["dataClasses"];
  valid_from: Date;
  valid_until: Date | null;
  status: Agreement["status"];
  approved_by: string;
  special_terms: boolean;
};

export async function docTinhTrang(tx: pg.PoolClient): Promise<TinhTrangAi> {
  const vai = await rolesOf(tx);
  const at = (await tx.query<{ now: Date }>("select now() as now")).rows[0]!.now;
  const t = (
    await tx.query<DongThoaThuan>(
      `select id, company_id, kind, direction, counterparty, data_classes, valid_from, valid_until, status, approved_by, special_terms
       from agreements where company_id = app.current_company_id() and kind = 'ai_processing'`,
    )
  ).rows[0];
  const dong = (await tx.query<{ key: string; value: unknown }>("select key, value from company_settings where company_id = app.current_company_id() and key = $1", [KHOA_TRAN])).rows;
  const tranUsd = Number(giaiCauHinh(dong).cauHinh[KHOA_TRAN] ?? 10);
  // Tháng theo giờ Việt Nam: dòng 30/10 23:30 giờ VN thuộc tháng 10 dù UTC đã là 31/10.
  const daDungUsd = Number(
    (
      await tx.query<{ tong: string }>(
        `select coalesce(sum(cost_usd), 0)::text tong from ai_usage
         where company_id = app.current_company_id()
           and created_at >= (date_trunc('month', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh')`,
      )
    ).rows[0]!.tong,
  );
  return {
    vai,
    thoaThuan: t
      ? {
          id: t.id,
          companyId: t.company_id,
          kind: t.kind,
          direction: t.direction,
          counterparty: t.counterparty,
          dataClasses: t.data_classes,
          validFrom: t.valid_from,
          validUntil: t.valid_until,
          status: t.status,
          approvedBy: t.approved_by,
          specialTerms: t.special_terms,
        }
      : null,
    tranUsd,
    daDungUsd,
    at,
  };
}

const LUONG = { kind: "ai_processing", direction: "outbound" } as const;

/**
 * Thoả thuận mở được luồng ra Anthropic lúc `at`: đúng loại, đúng chiều, đang hiệu lực, trong cửa sổ ngày — qua `mayFlow`
 * như mọi kết nối. Tiêu đề và hình dạng cột (gửi cho mọi cột) tính là lớp danh mục, nên gói không mang giá trị nào vẫn
 * phải qua cửa này.
 */
export function thoaThuanMo(t: ThoaThuanAi, at: Date): boolean {
  return mayFlow(t, "catalog", { at, ...LUONG }).ok;
}

/** Mỗi cột mang giá trị phải được thoả thuận mở cho lớp của nó (ADR-0017: mọi kết nối là một thoả thuận). */
export function giaTriQuaThoaThuan(goi: GoiDeXuat, t: ThoaThuanAi, at: Date): boolean {
  return goi.cot
    .filter((c) => c.giaTri?.length)
    .every((c) => {
      const lop = c.lop === "catalog" || c.lop === "shareable_listing" ? c.lop : isStandardField(c.dich) ? FIELD_CLASS[c.dich] : null;
      return lop !== null && mayFlow(t, lop, { at, ...LUONG }).ok;
    });
}

export type DongAi = {
  userId: string;
  model: string;
  usage?: DungLuong;
  costUsd: number;
  durationMs: number;
  result: "ok" | "blocked_pii" | "provider_error" | "timeout" | "invalid_output";
  blockedKinds?: string[];
};

export async function ghiDongAi(tx: pg.PoolClient, d: DongAi): Promise<void> {
  await tx.query(
    `insert into ai_usage (company_id, user_id, model, input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, cost_usd, duration_ms, result, blocked_kinds)
     values (app.current_company_id(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      d.userId,
      d.model,
      d.usage?.input_tokens ?? 0,
      d.usage?.output_tokens ?? 0,
      d.usage?.cache_read_input_tokens ?? 0,
      d.usage?.cache_creation_input_tokens ?? 0,
      d.costUsd,
      Math.max(0, Math.round(d.durationMs)),
      d.result,
      d.blockedKinds ?? [],
    ],
  );
}

/** Bật / tắt: bật tạo thoả thuận (hay đổi hàng cũ về đang hiệu lực), tắt chuyển sang tạm ngừng. Luật dòng 035 chặn vai khác. */
export async function batTat(tx: pg.PoolClient, userId: string, bat: boolean): Promise<void> {
  const daCo = (await tx.query<{ id: string }>("select id from agreements where company_id = app.current_company_id() and kind = 'ai_processing'")).rows[0];
  if (daCo) {
    await tx.query("update agreements set status = $2 where id = $1", [daCo.id, bat ? "active" : "paused"]);
    return;
  }
  if (!bat) return;
  await tx.query(
    `insert into agreements (company_id, kind, direction, counterparty, data_classes, valid_from, approved_by)
     values (app.current_company_id(), 'ai_processing', 'outbound', 'anthropic', '{catalog,shareable_listing}', now(), $1)`,
    [userId],
  );
}
