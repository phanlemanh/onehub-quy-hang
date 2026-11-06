import type pg from "pg";

/**
 * Dấu định nghĩa bao phí của giá hiện hành (hàng 49, luật 13): dấu mà migration 050 đóng lên sự kiện `price_changed` cuối
 * của căn. Đọc dưới luật theo dòng của sàn và vai (046): ai không đọc được căn thì không có kết quả. `null` khi giá hiện
 * hành không bao phí hay căn chưa có giá.
 */
/** Cùng khuôn `DauPhi` của lõi (`@quy-hang/core/pricing`), mảng thường cho khuôn OpenAPI. */
export type FeeBasis = { includedItems: string[]; rates: Record<string, number>; computedAt: string };
export type KetQuaDauPhi = { kind: "not-found" } | { kind: "dau"; dau: FeeBasis | null };

export async function readFeeBasis(tx: pg.PoolClient, listingId: string): Promise<KetQuaDauPhi> {
  const can = await tx.query("select 1 from listings where id = $1", [listingId]);
  if (can.rowCount === 0) return { kind: "not-found" };
  const { rows } = await tx.query<{ included_items: string[] | null; rates: Record<string, number> | null; computed_at: Date | null }>(
    `select d.included_items, d.rates, d.computed_at
       from (select seq from listing_events
              where company_id = app.current_company_id() and listing_id = $1 and type = 'price_changed'
              order by seq desc limit 1) e
       left join listing_price_fee_basis d
         on d.company_id = app.current_company_id() and d.listing_id = $1 and d.seq = e.seq`,
    [listingId],
  );
  const r = rows[0];
  if (!r || !r.included_items || !r.rates || !r.computed_at) return { kind: "dau", dau: null };
  return { kind: "dau", dau: { includedItems: r.included_items, rates: r.rates, computedAt: r.computed_at.toISOString() } };
}
