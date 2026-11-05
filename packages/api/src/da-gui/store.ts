// Đã gửi (hàng 36): đọc Lần gửi của người xem và tắt link. Chạy trong phiên người xem (`withCompany`) — luật đọc của `shares`
// (người gửi, trưởng nhóm) áp ở cơ sở dữ liệu; đầu khách còn lọc thêm theo chính mình. Không đọc bảng chủ nhà, không số khách.
import { giaLucGui, goiYCanThay, vuaDoi, type CanSoSanh, type SuKienDoi, type VuaDoi } from "@quy-hang/core/sharing";
import type { StandardStatus } from "@quy-hang/core/listing";
import type pg from "pg";

export type LanGuiTom = {
  id: string;
  audience: "client" | "agents";
  recipient: string;
  listingCount: number;
  covers: string[];
  createdAt: string;
  disabledAt: string | null;
  opens: number;
  interests: number;
  lastOpenedAt: string | null;
  mine: boolean;
};
export type CanTrongLink = { id: string; name: string; listPrice: number | null; standardStatus: StandardStatus; interest: number; changed: VuaDoi; suggestions: { id: string; name: string; listPrice: number | null }[] };
export type LanGuiChiTiet = LanGuiTom & { listings: CanTrongLink[] };

const NHOM = "Nhóm môi giới";
const iso = (d: Date | null) => (d ? d.toISOString() : null);

type Dong = { id: string; audience: "client" | "agents"; display_name: string | null; created_at: Date; disabled_at: Date | null; sender_user_id: string; listing_count: number; opens: number; interests: number; last_opened_at: Date | null; covers: string[] | null };

const SQL_TOM = `
  select s.id, s.audience, p.display_name, s.created_at, s.disabled_at, s.sender_user_id,
    (select count(*)::int from share_listings sl where sl.company_id = s.company_id and sl.share_id = s.id) as listing_count,
    (select count(*)::int from share_events e where e.company_id = s.company_id and e.share_id = s.id and e.type = 'link_opened') as opens,
    (select count(*)::int from share_events e where e.company_id = s.company_id and e.share_id = s.id and e.type = 'interest') as interests,
    (select max(e.created_at) from share_events e where e.company_id = s.company_id and e.share_id = s.id and e.type = 'link_opened') as last_opened_at,
    (select array_agg(b.id order by b.position) from (
       select sl.position, (select up.id from unit_photos up
                             where up.company_id = l.company_id and up.building_name = l.building_name
                               and app.unit_key(up.unit_number) = app.unit_key(l.unit_number)
                               and up.compartment = 'shareable' and up.removed_at is null
                             order by up.is_cover desc, up.display_order, up.added_at limit 1) as id
         from share_listings sl join listings l on l.company_id = sl.company_id and l.id = sl.listing_id
        where sl.company_id = s.company_id and sl.share_id = s.id and not l.voided order by sl.position limit 4) b where b.id is not null) as covers
  from shares s left join prospects p on p.company_id = s.company_id and p.id = s.prospect_id
  where s.company_id = app.current_company_id() and ($1::text is null or s.sender_user_id = $1)`;

const tom = (r: Dong, me: string): LanGuiTom => ({
  id: r.id,
  audience: r.audience,
  recipient: r.audience === "agents" ? NHOM : (r.display_name ?? "Khách riêng"),
  listingCount: r.listing_count,
  covers: r.covers ?? [],
  createdAt: r.created_at.toISOString(),
  disabledAt: iso(r.disabled_at),
  opens: r.opens,
  interests: r.interests,
  lastOpenedAt: iso(r.last_opened_at),
  mine: r.sender_user_id === me,
});

/** Lần gửi người xem thấy, mới trước: đầu khách thấy của mình; trưởng nhóm thấy của cả sàn. */
export async function listShares(tx: pg.PoolClient, me: string, laTruongNhom: boolean): Promise<LanGuiTom[]> {
  const { rows } = await tx.query<Dong>(`${SQL_TOM} order by s.created_at desc, s.id`, [laTruongNhom ? null : me]);
  return rows.map((r) => tom(r, me));
}

type DongCan = { id: string; building_name: string; unit_number: string | null; list_price: string | null; standard_status: StandardStatus; bedrooms_total: number | null; interest: number };
const ten = (b: string, u: string | null) => (u ? `${b} · ${u}` : b);

/** Một Lần gửi: các căn theo thứ tự gửi, lượt quan tâm từng căn, «vừa đổi» sau lúc gửi, «Gợi ý căn thay» cho căn vừa đổi. */
export async function readShare(tx: pg.PoolClient, me: string, laTruongNhom: boolean, id: string): Promise<LanGuiChiTiet | null> {
  const { rows } = await tx.query<Dong>(`${SQL_TOM} and s.id = $2`, [laTruongNhom ? null : me, id]);
  const r = rows[0];
  if (!r) return null;
  const can = (
    await tx.query<DongCan>(
      `select l.id, l.building_name, l.unit_number, l.list_price::text, l.standard_status, cu.bedrooms_total,
              (select count(*)::int from share_events e where e.company_id = sl.company_id and e.share_id = sl.share_id and e.type = 'interest' and e.listing_id = l.id) as interest
         from share_listings sl join listings l on l.company_id = sl.company_id and l.id = sl.listing_id
         left join lateral (select c1.upi, c1.stack, c1.floor, c1.living_area, c1.bedrooms_total, c1.direction_faces, c1.property_type, c1.property_sub_type from catalog_units c1 where c1.building_name = l.building_name and app.unit_key(c1.unit_number) = app.unit_key(l.unit_number) order by c1.measured_at desc limit 1) cu on true
        where sl.company_id = app.current_company_id() and sl.share_id = $1 and not l.voided order by sl.position`,
      [id],
    )
  ).rows;
  const trongLink = new Set(can.map((c) => c.id));
  let ungVien: (CanSoSanh & { name: string })[] | null = null;
  const listings: CanTrongLink[] = [];
  for (const c of can) {
    const su = (
      await tx.query<{ type: string; payload: Record<string, unknown>; truoc: boolean }>(
        `select type, payload, occurred_at <= $2 as truoc from listing_events
          where company_id = app.current_company_id() and listing_id = $1 and type in ('price_changed', 'status_changed') order by seq`,
        [c.id, r.created_at],
      )
    ).rows;
    const sau: SuKienDoi[] = su.filter((e) => !e.truoc);
    const gia = giaLucGui(su.filter((e) => e.truoc));
    const changed = vuaDoi(gia, sau);
    let suggestions: CanTrongLink["suggestions"] = [];
    if (changed) {
      ungVien ??= (
        await tx.query<DongCan>(
          `select l.id, l.building_name, l.unit_number, l.list_price::text, l.standard_status, cu.bedrooms_total, 0 as interest
             from listings l left join lateral (select c1.upi, c1.stack, c1.floor, c1.living_area, c1.bedrooms_total, c1.direction_faces, c1.property_type, c1.property_sub_type from catalog_units c1 where c1.building_name = l.building_name and app.unit_key(c1.unit_number) = app.unit_key(l.unit_number) order by c1.measured_at desc limit 1) cu on true
            where l.company_id = app.current_company_id() and l.standard_status = 'Active' and not l.voided`,
        )
      ).rows.map((u) => ({ id: u.id, buildingName: u.building_name, bedroomsTotal: u.bedrooms_total, listPrice: u.list_price == null ? null : Number(u.list_price), standardStatus: u.standard_status, name: ten(u.building_name, u.unit_number) }));
      const goc: CanSoSanh = { id: c.id, buildingName: c.building_name, bedroomsTotal: c.bedrooms_total, listPrice: gia, standardStatus: c.standard_status };
      const theoId = new Map(ungVien.map((u) => [u.id, u]));
      suggestions = goiYCanThay(goc, ungVien, trongLink).map((sid) => ({ id: sid, name: theoId.get(sid)!.name, listPrice: theoId.get(sid)!.listPrice }));
    }
    listings.push({ id: c.id, name: ten(c.building_name, c.unit_number), listPrice: c.list_price == null ? null : Number(c.list_price), standardStatus: c.standard_status, interest: c.interest, changed, suggestions });
  }
  return { ...tom(r, me), listings };
}

export type KetQuaTat = "ok" | "khong-co" | "khong-duoc" | "da-tat";

/** Tắt link qua `app.disable_share` (migration 032): người gửi, hay trưởng nhóm của sàn (Hỏi-2). */
export async function disableShare(tx: pg.PoolClient, id: string): Promise<KetQuaTat> {
  await tx.query("savepoint tat");
  try {
    await tx.query("select app.disable_share($1)", [id]);
    return "ok";
  } catch (e) {
    await tx.query("rollback to savepoint tat");
    const ma = (e as { code?: string }).code;
    if (ma === "P0002") return "khong-co";
    if (ma === "42501") return "khong-duoc";
    if (ma === "55000") return "da-tat";
    throw e;
  }
}
