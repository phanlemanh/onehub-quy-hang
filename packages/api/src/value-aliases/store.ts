import { cachGoDaDuyet, kiemCachGo, sucKhoeTuDien, type CompanyAlias, type DongCachGo, type SucKhoe, type TruongTuDien } from "@quy-hang/core/import";
import type pg from "pg";

/**
 * Từ điển của sàn (hàng 70, migration 051): đọc mọi dòng của sàn hiện hành, đề xuất qua `app.de_xuat_cach_go` (người
 * nhập file được), quyết qua `app.quyet_cach_go` (quản trị sàn). Luật theo dòng lọc sàn; kiểm chữ ở lõi (`kiemCachGo`).
 */
export type DongTuDien = DongCachGo & { id: string; proposedAt: string; decidedAt: string | null };
export type BangTuDien = { rows: DongTuDien[]; health: Record<TruongTuDien, SucKhoe> };

export async function dongTuDien(tx: pg.PoolClient): Promise<DongTuDien[]> {
  const { rows } = await tx.query<{ id: string; field: TruongTuDien; raw: string; value: string; status: DongCachGo["status"]; pick_count: number; proposed_at: Date; decided_at: Date | null }>(
    `select id, field, raw, value, status, pick_count, proposed_at, decided_at from company_value_aliases
      where company_id = app.current_company_id() order by field, proposed_at, id`,
  );
  return rows.map((r) => ({
    id: r.id, field: r.field, raw: r.raw, value: r.value, status: r.status, pickCount: r.pick_count,
    proposedAt: r.proposed_at.toISOString(), decidedAt: r.decided_at ? r.decided_at.toISOString() : null,
  }));
}

export async function readValueAliases(tx: pg.PoolClient): Promise<BangTuDien> {
  const rows = await dongTuDien(tx);
  return { rows, health: sucKhoeTuDien(rows) };
}

/** Cách gõ đã duyệt của sàn hiện hành — ngữ cảnh `companyAliases` cho chuẩn hoá (bước xem trước và đường ghi lần nhập). */
export async function companyAliasesCuaSan(tx: pg.PoolClient): Promise<CompanyAlias[]> {
  return cachGoDaDuyet(await dongTuDien(tx));
}

export type TuDienRefusal = { refusal: "invalid"; reason: string } | { refusal: "role" } | { refusal: "forbidden" } | { refusal: "not-found" };

export async function proposeValueAlias(tx: pg.PoolClient, input: unknown): Promise<DongTuDien | TuDienRefusal> {
  const b = (input ?? {}) as Record<string, unknown>;
  const kq = kiemCachGo(b.field, b.raw, b.value);
  if (!kq.ok) return { refusal: "invalid", reason: kq.loi };
  const { field, raw, rawFold, value } = kq.cachGo;
  try {
    const id = (await tx.query<{ id: string }>("select app.de_xuat_cach_go($1, $2, $3, $4) id", [field, raw, rawFold, value])).rows[0]!.id;
    return (await dongTuDien(tx)).find((r) => r.id === id)!;
  } catch (e) {
    if ((e as { code?: string }).code === "42501") return { refusal: "role" };
    throw e;
  }
}

export async function decideValueAlias(tx: pg.PoolClient, id: string, input: unknown): Promise<DongTuDien | TuDienRefusal> {
  const d = ((input ?? {}) as Record<string, unknown>).decision;
  if (d !== "approve" && d !== "reject") return { refusal: "invalid", reason: "decision: cần approve hay reject" };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { refusal: "not-found" };
  try {
    await tx.query("select app.quyet_cach_go($1, $2)", [id, d === "approve" ? "approved" : "rejected"]);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "42501") return { refusal: "forbidden" };
    if (code === "P0002") return { refusal: "not-found" };
    throw e;
  }
  return (await dongTuDien(tx)).find((r) => r.id === id)!;
}
