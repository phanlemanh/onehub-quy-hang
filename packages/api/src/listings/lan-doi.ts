import type { StandardStatus } from "@quy-hang/core/listing";
import type { LanDoi } from "@quy-hang/core/today";
import type pg from "pg";

/**
 * Dữ kiện hàng đợi của bản xem hàng (hàng 22, AC-5): người giữ căn và lần đổi giá, đổi trạng thái gần nhất. Tính lúc đọc
 * từ bảng gán và bảng sự kiện — không cột mới, bảng `listings` vẫn đúng là bản gấp. Không khoá nào của lớp nguồn.
 */
export type QueueFacts = {
  listAgentKey: string | null;
  priceChangeTimestamp: string | null;
  statusChangeTimestamp: string | null;
  lastPriceChange: LanDoi | null;
  lastStatusChange: LanDoi | null;
};

export const NO_QUEUE_FACTS: QueueFacts = {
  listAgentKey: null,
  priceChangeTimestamp: null,
  statusChangeTimestamp: null,
  lastPriceChange: null,
  lastStatusChange: null,
};

/** Trạng thái lúc tạo hàng — `foldListing` mở đầu ở đây; lần đổi trạng thái đầu tiên đi từ nấc này. */
const TRANG_THAI_DAU: StandardStatus = "Incomplete";

type Row = {
  id: string;
  list_agent_key: string | null;
  pc_at: Date | null;
  pc_by: string | null;
  pc_roles: string[] | null;
  pc_from: number | null;
  pc_to: number | null;
  sc_at: Date | null;
  sc_by: string | null;
  sc_roles: string[] | null;
  sc_from: string | null;
  sc_to: string | null;
};

/**
 * Sự kiện cuối của một loại, kèm giá trị ngay trước nó (sự kiện cùng loại liền trước). Giá chỉ đổi bằng `price_changed`,
 * trạng thái chỉ đổi bằng `status_changed` (luật gấp của lõi), nên giá trị cũ là `to` của sự kiện cùng loại trước đó.
 */
const lanCuoi = (type: string, giaTri: string) => `
  left join lateral (
    select e.occurred_at, e.actor_user_id, e.actor_roles, ${giaTri.replace(/\$p/g, "e.payload")} as to_v,
      (select ${giaTri.replace(/\$p/g, "p.payload")} from listing_events p
        where p.company_id = e.company_id and p.listing_id = e.listing_id and p.type = '${type}' and p.seq < e.seq
        order by p.seq desc limit 1) as from_v
    from listing_events e
    where e.company_id = app.current_company_id() and e.listing_id = l.id and e.type = '${type}'
    order by e.seq desc limit 1
  )`;

const SQL = `
  select l.id,
    (select a.user_id from listing_agent_assignments a
      where a.company_id = app.current_company_id() and a.listing_id = l.id order by a.seq desc limit 1) as list_agent_key,
    pc.occurred_at as pc_at, pc.actor_user_id as pc_by, pc.actor_roles as pc_roles, pc.from_v as pc_from, pc.to_v as pc_to,
    sc.occurred_at as sc_at, sc.actor_user_id as sc_by, sc.actor_roles as sc_roles, sc.from_v as sc_from, sc.to_v as sc_to
  from listings l
  ${lanCuoi("price_changed", "($p ->> 'listPrice')::float8")} pc on true
  ${lanCuoi("status_changed", "($p ->> 'to')")} sc on true
  where l.company_id = app.current_company_id() and ($1::uuid[] is null or l.id = any ($1::uuid[]))`;

const lanDoi = (at: Date | null, by: string | null, roles: string[] | null, from: unknown, to: unknown): LanDoi | null =>
  at && by ? { at: at.toISOString(), byUserId: by, byRoles: roles ?? [], from, to } : null;

/** Dữ kiện hàng đợi theo mã hàng; `ids` vắng là mọi hàng của sàn đang làm. */
export async function readQueueFacts(tx: pg.PoolClient, ids: string[] | null = null): Promise<Map<string, QueueFacts>> {
  const { rows } = await tx.query<Row>(SQL, [ids]);
  return new Map(
    rows.map((r) => {
      const gia = lanDoi(r.pc_at, r.pc_by, r.pc_roles, r.pc_from, r.pc_to);
      const trangThai = lanDoi(r.sc_at, r.sc_by, r.sc_roles, r.sc_from ?? TRANG_THAI_DAU, r.sc_to);
      return [
        r.id,
        {
          listAgentKey: r.list_agent_key,
          priceChangeTimestamp: gia?.at ?? null,
          statusChangeTimestamp: trangThai?.at ?? null,
          lastPriceChange: gia,
          lastStatusChange: trangThai,
        },
      ];
    }),
  );
}
