// Hôm nay của đầu khách (hàng 37): đọc sự kiện các link CHÍNH người xem gửi rồi để lõi dựng tin (`dungTin`). Chạy trong phiên
// người xem (`withCompany`) — luật đọc của `shares` áp ở cơ sở dữ liệu; API lọc thêm người gửi = người xem, kể cả trưởng nhóm.
// Không đọc bảng chủ nhà, không số khách, không trường lớp `source` (bất biến 2).
import { giaLucGui, type SuKienDoi } from "@quy-hang/core/sharing";
import { CUA_SO_NGAY, type CanTrongBo, type VaoDungTin } from "@quy-hang/core/today";
import type pg from "pg";

const ten = (b: string, u: string | null) => (u ? `${b} · ${u}` : b);
const nguoiNhan = (audience: string, displayName: string | null) => (audience === "agents" ? "Nhóm môi giới" : (displayName ?? "Khách riêng"));

const DONG_CAN = `left join lateral (select c1.bedrooms_total from catalog_units c1
   where c1.building_name = l.building_name and app.unit_key(c1.unit_number) = app.unit_key(l.unit_number)
   order by c1.measured_at desc limit 1) cu on true`;

export async function docVaoDungTin(tx: pg.PoolClient, me: string, bay: Date): Promise<VaoDungTin> {
  const tu = new Date(bay.getTime() - CUA_SO_NGAY * 86_400_000);
  const shares = (
    await tx.query<{ id: string; audience: string; display_name: string | null; created_at: Date; disabled_at: Date | null }>(
      `select s.id, s.audience, p.display_name, s.created_at, s.disabled_at
         from shares s left join prospects p on p.company_id = s.company_id and p.id = s.prospect_id
        where s.company_id = app.current_company_id() and s.sender_user_id = $1 order by s.created_at`,
      [me],
    )
  ).rows;
  if (!shares.length) return { shares: [], events: [], activeSau: [] };
  const ids = shares.map((s) => s.id);

  const dong = (
    await tx.query<{ share_id: string; id: string; building_name: string; unit_number: string | null; bedrooms_total: number | null; type: string | null; payload: Record<string, unknown> | null; occurred_at: Date | null; truoc: boolean | null }>(
      `select sl.share_id, l.id, l.building_name, l.unit_number, cu.bedrooms_total, e.type, e.payload, e.occurred_at, e.occurred_at <= s.created_at as truoc
         from share_listings sl
         join shares s on s.company_id = sl.company_id and s.id = sl.share_id
         join listings l on l.company_id = sl.company_id and l.id = sl.listing_id
         ${DONG_CAN}
         left join listing_events e on e.company_id = l.company_id and e.listing_id = l.id and e.type in ('price_changed', 'status_changed')
        where sl.company_id = app.current_company_id() and sl.share_id = any($1::uuid[])
        order by sl.share_id, sl.position, e.seq`,
      [ids],
    )
  ).rows;
  const theoLan = new Map<string, Map<string, { c: Omit<CanTrongBo, "giaLucGui">; truoc: SuKienDoi[] }>>();
  for (const r of dong) {
    const lan = theoLan.get(r.share_id) ?? new Map();
    theoLan.set(r.share_id, lan);
    const x = lan.get(r.id) ?? { c: { id: r.id, name: ten(r.building_name, r.unit_number), buildingName: r.building_name, bedroomsTotal: r.bedrooms_total, suSau: [], suSauAt: null }, truoc: [] };
    lan.set(r.id, x);
    if (!r.type || !r.occurred_at) continue;
    const e: SuKienDoi = { type: r.type, payload: r.payload ?? {} };
    if (r.truoc) x.truoc.push(e);
    else {
      x.c.suSau.push(e);
      x.c.suSauAt = r.occurred_at.toISOString();
    }
  }

  const events = (
    await tx.query<{ share_id: string; type: "link_opened" | "interest"; listing_id: string | null; created_at: Date }>(
      `select share_id, type, listing_id, created_at from share_events
        where company_id = app.current_company_id() and share_id = any($1::uuid[]) and created_at >= $2 order by created_at`,
      [ids, tu],
    )
  ).rows.map((e) => ({ shareId: e.share_id, type: e.type, listingId: e.listing_id, createdAt: e.created_at.toISOString() }));

  // Căn lên Đang bán trong cửa sổ và nay vẫn Đang bán; mốc là lần lên Đang bán gần nhất (căn trở lại sau Pending tính là mới).
  const activeSau = (
    await tx.query<{ id: string; building_name: string; unit_number: string | null; list_price: string | null; bedrooms_total: number | null; active_at: Date }>(
      `select l.id, l.building_name, l.unit_number, l.list_price::text, cu.bedrooms_total, a.active_at
         from listings l
         join lateral (select max(e.occurred_at) as active_at from listing_events e
                        where e.company_id = l.company_id and e.listing_id = l.id and e.type = 'status_changed' and e.payload ->> 'to' = 'Active') a on true
         ${DONG_CAN}
        where l.company_id = app.current_company_id() and l.standard_status = 'Active' and not l.voided and a.active_at >= $1`,
      [tu],
    )
  ).rows.map((r) => ({ id: r.id, name: ten(r.building_name, r.unit_number), buildingName: r.building_name, bedroomsTotal: r.bedrooms_total, listPrice: r.list_price == null ? null : Number(r.list_price), activeAt: r.active_at.toISOString() }));

  return {
    shares: shares.map((s) => ({
      id: s.id,
      recipient: nguoiNhan(s.audience, s.display_name),
      createdAt: s.created_at.toISOString(),
      disabledAt: s.disabled_at ? s.disabled_at.toISOString() : null,
      listings: [...(theoLan.get(s.id)?.values() ?? [])].map(({ c, truoc }) => ({ ...c, giaLucGui: giaLucGui(truoc) })),
    })),
    events,
    activeSau,
  };
}
