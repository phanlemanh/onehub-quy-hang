import { lamViecVoiHang } from "@quy-hang/core/access";
import { foldListing } from "@quy-hang/core/listing";
import { canRead } from "@quy-hang/core/visibility";
import type pg from "pg";
import { factsOf, loadEvents, viewerOf } from "../listings/store";

/**
 * Dấu định nghĩa bao phí của giá hiện hành (hàng 49, luật 13): dấu mà migration 050 đóng lên sự kiện `price_changed` cuối
 * của căn. Ai không đọc được hàng thì như hàng không có — cùng bộ kiểm với `GET /listings/{listingId}`: luật theo dòng của
 * sàn và vai (046), người có Bảng hàng, hàng đã gỡ, trục «Chỉ tôi» (`canRead`, chặn ở API — K5). `null` khi giá hiện hành
 * không bao phí hay căn chưa có giá.
 */
/** Cùng khuôn `DauPhi` của lõi (`@quy-hang/core/pricing`), mảng thường cho khuôn OpenAPI. */
export type FeeBasis = { includedItems: string[]; rates: Record<string, number>; computedAt: string };
export type KetQuaDauPhi = { kind: "not-found" } | { kind: "dau"; dau: FeeBasis | null };

export async function readFeeBasis(tx: pg.PoolClient, userId: string, listingId: string): Promise<KetQuaDauPhi> {
  const nguoiXem = await viewerOf(tx, userId);
  if (!lamViecVoiHang(nguoiXem)) return { kind: "not-found" };
  const events = await loadEvents(tx, listingId);
  if (!events.length || foldListing(events).voided) return { kind: "not-found" };
  if (!canRead(nguoiXem, await factsOf(tx, listingId, events))) return { kind: "not-found" };
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
