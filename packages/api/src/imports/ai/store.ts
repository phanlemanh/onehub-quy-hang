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

export type ThoaThuanAi = { id: string; status: "active" | "paused" | "ended"; dataClasses: string[]; validFrom: Date; approvedBy: string };
export type TinhTrangAi = { vai: string[]; thoaThuan: ThoaThuanAi | null; tranUsd: number; daDungUsd: number };

export async function docTinhTrang(tx: pg.PoolClient): Promise<TinhTrangAi> {
  const vai = await rolesOf(tx);
  const t = (
    await tx.query<{ id: string; status: ThoaThuanAi["status"]; data_classes: string[]; valid_from: Date; approved_by: string }>(
      "select id, status, data_classes, valid_from, approved_by from agreements where company_id = app.current_company_id() and kind = 'ai_processing'",
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
    thoaThuan: t ? { id: t.id, status: t.status, dataClasses: t.data_classes, validFrom: t.valid_from, approvedBy: t.approved_by } : null,
    tranUsd,
    daDungUsd,
  };
}

/** Mỗi cột mang giá trị phải được thoả thuận mở cho lớp của nó (ADR-0017: mọi kết nối là một thoả thuận). */
export function giaTriQuaThoaThuan(goi: GoiDeXuat, t: ThoaThuanAi, companyId: string, at = new Date()): boolean {
  const a: Agreement = {
    id: t.id,
    companyId,
    kind: "ai_processing",
    direction: "outbound",
    counterparty: "anthropic",
    dataClasses: t.dataClasses as Agreement["dataClasses"],
    validFrom: t.validFrom,
    validUntil: null,
    status: t.status,
    approvedBy: t.approvedBy,
    specialTerms: false,
  };
  return goi.cot
    .filter((c) => c.giaTri?.length)
    .every((c) => {
      const lop = c.lop === "catalog" || c.lop === "shareable_listing" ? c.lop : isStandardField(c.dich) ? FIELD_CLASS[c.dich] : null;
      return lop !== null && mayFlow(a, lop, { at, kind: "ai_processing", direction: "outbound" }).ok;
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
