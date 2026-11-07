import { contactStatus, laMo, phaLead, phaNhuCau, type ContactType, type Pha } from "@quy-hang/core/contacts";
import { leadStage, type LeadState, type Outcome } from "@quy-hang/core/dedupe";
import type pg from "pg";
import { dauVetSo, giaiMaSo, type KhoaSoChu } from "../../owners/ma-hoa";

// Đường đọc của màn Liên hệ (hàng 103). Danh sách, hồ sơ đọc qua luật theo dòng của vai API (`contacts_read`: người giữ còn
// vai Đầu chủ hay trưởng nhóm); số đi qua ba hàm của migration 036. Không thân trả nào mang số rõ hay giá đáy — trừ đường mở
// số. Cơ hội theo ba lớp (ADR-0021 sửa đổi 05/11): phía chủ là lead, phía khách là nhu cầu khách (chỉ trưởng nhóm thấy).

export const TRANG = 50;
const DONG_THOI_GIAN = 50;
// Bỏ dấu tiếng Việt trong SQL (không dùng extension unaccent): hai chuỗi cùng độ dài, chữ có dấu → chữ không dấu.
const CO_DAU = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
const KHONG_DAU = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
const boDau = (s: string) => s.normalize("NFC").toLowerCase().split("").map((ch) => {
  const i = CO_DAU.indexOf(ch);
  return i < 0 ? ch : KHONG_DAU[i]!;
}).join("");
const sqlBoDau = (cot: string) => `translate(lower(${cot}), '${CO_DAU}', '${KHONG_DAU}')`;

// Con trỏ trang theo micro-giây của mốc tạo (toISOString chỉ giữ mili-giây, làm sót dòng cùng mili-giây).
const US = "(extract(epoch from c.created_at) * 1000000)::bigint";

export type BoLoc = { type?: ContactType; status?: "lead" | "contact"; q?: string; cursor?: string };
type Nguoi = { userId: string; laTruongNhom: boolean };

type DongLead = {
  id: string;
  contact_id: string;
  building_name: string;
  unit_number: string | null;
  need: string;
  outcome: Outcome;
  matched_agent_user_id: string | null;
  created_at: Date;
  discarded_at: Date | null;
  routed_at: Date | null;
  accepted_at: Date | null;
  first_called_at: Date | null;
  returned_at: Date | null;
  resubmitted_at: Date | null;
  listing_id: string | null;
  listing_status: string | null;
  board_at: Date | null;
};

const iso = (d: Date | null) => (d ? d.toISOString() : null);

/** Lead của các liên hệ (theo luật đọc lead của người xem) kèm mốc lên bảng và trạng thái hàng tạo từ lead. */
async function leadCua(tx: pg.PoolClient, ids: string[]): Promise<(DongLead & { pha: Pha; nac: LeadState })[]> {
  if (!ids.length) return [];
  const { rows } = await tx.query<DongLead>(
    `select l.id, l.contact_id, l.building_name, l.unit_number, l.need, l.outcome, l.matched_agent_user_id, l.created_at,
            l.discarded_at, l.routed_at, l.accepted_at, l.first_called_at, l.returned_at, l.resubmitted_at,
            ll.listing_id, h.standard_status listing_status,
            (select min(e.occurred_at) from listing_events e
             where e.company_id = l.company_id and e.listing_id = ll.listing_id and e.type = 'status_changed'
               and e.payload ->> 'to' = 'Active') board_at
     from leads l
     left join lead_listings ll on ll.company_id = l.company_id and ll.lead_id = l.id
     left join listings h on h.company_id = ll.company_id and h.id = ll.listing_id
     where l.company_id = app.current_company_id() and l.contact_id = any($1::uuid[])
     order by l.created_at desc`,
    [ids],
  );
  return rows
    .filter((r) => r.resubmitted_at === null) // chuỗi gửi lại đi theo bản ghi cuối (ADR-0020 qđ 4)
    .map((r) => {
      const nac = leadStage({
        outcome: r.outcome,
        matchedAgentUserId: r.matched_agent_user_id,
        routedAt: iso(r.routed_at),
        acceptedAt: iso(r.accepted_at),
        firstCalledAt: iso(r.first_called_at),
        boardAt: iso(r.board_at), // «Lên bảng» là dữ kiện: hàng mang mã lead lần đầu sang Đang bán (ADR-0021 qđ 6)
        returnedAt: iso(r.returned_at),
        resubmittedAt: iso(r.resubmitted_at),
        discardedAt: iso(r.discarded_at),
      });
      return { ...r, nac, pha: phaLead(nac, (r.listing_status as never) ?? null) };
    });
}

type DongNhuCau = { id: string; contact_id: string; need: string; owner_member_user_id: string; closed_at: Date | null; share_count: number };
async function nhuCauCua(tx: pg.PoolClient, ids: string[], ai: Nguoi): Promise<DongNhuCau[]> {
  if (!ai.laTruongNhom || !ids.length) return [];
  const { rows } = await tx.query<DongNhuCau>(
    `select p.id, p.contact_id, p.need, p.owner_member_user_id, p.closed_at,
            (select count(*)::int from shares s where s.company_id = p.company_id and s.prospect_id = p.id) share_count
     from prospects p where p.company_id = app.current_company_id() and p.contact_id = any($1::uuid[]) order by p.created_at desc`,
    [ids],
  );
  return rows;
}

/** Danh sách liên hệ người xem đọc được; không số, không giá đáy. */
export async function listContacts(tx: pg.PoolClient, loc: BoLoc, ai: Nguoi) {
  const dk: string[] = ["c.company_id = app.current_company_id()"];
  const ts: unknown[] = [];
  const them = (v: unknown) => `$${ts.push(v)}`;
  if (loc.type) dk.push(`${them(loc.type)} = any (c.contact_types)`);
  const daNoi = `(exists (select 1 from listing_owners o where o.company_id = c.company_id and o.contact_id = c.id)
                or exists (select 1 from leads l where l.company_id = c.company_id and l.contact_id = c.id and l.first_called_at is not null))`;
  if (loc.status === "contact") dk.push(daNoi);
  if (loc.status === "lead") dk.push(`not ${daNoi}`);
  if (loc.q && loc.q.trim()) dk.push(`${sqlBoDau("coalesce(c.full_name, '')")} like ${them(`%${boDau(loc.q.trim())}%`)}`);
  if (loc.cursor) {
    const [us, id] = Buffer.from(loc.cursor, "base64url").toString().split("|");
    dk.push(`(${US}, c.id) < (${them(us)}::bigint, ${them(id)}::uuid)`);
  }
  const { rows } = await tx.query<{
    id: string;
    full_name: string | null;
    contact_types: ContactType[];
    owner_member_user_id: string | null;
    created_at: Date;
    us: string;
    phone_count: number;
    listing_count: number;
    da_noi: boolean;
  }>(
    `select c.id, c.full_name, c.contact_types, c.owner_member_user_id, c.created_at, ${US}::text us,
            (select count(*)::int from contact_phones p where p.company_id = c.company_id and p.contact_id = c.id) phone_count,
            (select count(*)::int from listing_owners o where o.company_id = c.company_id and o.contact_id = c.id) listing_count,
            ${daNoi} da_noi
     from contacts c where ${dk.join(" and ")}
     order by ${US} desc, c.id desc limit ${TRANG + 1}`,
    ts,
  );
  const trang = rows.slice(0, TRANG);
  const ids = trang.map((r) => r.id);
  const [leads, nhuCau] = await Promise.all([leadCua(tx, ids), nhuCauCua(tx, ids, ai)]);
  const mo = new Map<string, number>();
  for (const l of leads) if (laMo(l.pha)) mo.set(l.contact_id, (mo.get(l.contact_id) ?? 0) + 1);
  for (const p of nhuCau) if (laMo(phaNhuCau(p.closed_at !== null))) mo.set(p.contact_id, (mo.get(p.contact_id) ?? 0) + 1);
  const cuoi = trang.at(-1);
  return {
    items: trang.map((r) => ({
      id: r.id,
      name: r.full_name,
      contactTypes: r.contact_types,
      status: r.da_noi ? "contact" : "lead",
      holderUserId: r.owner_member_user_id,
      phoneCount: r.phone_count,
      openOpportunities: mo.get(r.id) ?? 0,
      listingCount: r.listing_count,
    })),
    nextCursor: rows.length > TRANG && cuoi ? Buffer.from(`${cuoi.us}|${cuoi.id}`).toString("base64url") : null,
  };
}

/** Tìm theo số: liên hệ đọc được, hay «đã có — người giữ», hay không có. */
export async function lookupPhone(tx: pg.PoolClient, so: string, companyId: string, khoa: KhoaSoChu) {
  const { rows } = await tx.query<{ contact_id: string; readable: boolean; holder_user_id: string | null }>(
    "select * from app.contact_lookup_by_phone_hash($1)",
    [dauVetSo(so, companyId, khoa)],
  );
  const r = rows[0];
  if (!r) return { found: false as const };
  if (r.readable) return { contactId: r.contact_id };
  return { held: true as const, holderUserId: r.holder_user_id };
}

/** Hồ sơ một liên hệ; null khi người xem không đọc được. */
export async function readProfile(tx: pg.PoolClient, id: string, ai: Nguoi, khoa: KhoaSoChu) {
  // Hồ sơ là đường DUY NHẤT trả giá trị trường riêng (hàng 47) — luật đọc liên hệ đã lọc người xem (lớp nguồn với liên hệ chủ nhà).
  const { rows } = await tx.query<{ id: string; full_name: string | null; contact_types: ContactType[]; owner_member_user_id: string | null; custom: Record<string, unknown> }>(
    "select id, full_name, contact_types, owner_member_user_id, custom from contacts where company_id = app.current_company_id() and id = $1",
    [id],
  );
  const c = rows[0];
  if (!c) return null;
  const { rows: so } = await tx.query<{ phone_id: string; label: string | null; is_primary: boolean; phone_enc: Buffer; enc_context: string }>(
    "select * from app.contact_phones_for_mask($1)",
    [id],
  );
  // Bản mã không giải được (khoá của môi trường khác khoá đã ghi) thì số vẫn hiện, chỉ không có ba số cuối — hồ sơ không đổ.
  const duoi = (p: { phone_enc: Buffer; enc_context: string }) => {
    try {
      return giaiMaSo(p.phone_enc, p.enc_context, khoa).replace(/\D/g, "").slice(-3);
    } catch {
      return "";
    }
  };
  const phones = so.map((p) => ({ phoneId: p.phone_id, label: p.label, isPrimary: p.is_primary, tail: duoi(p) }));
  const [leads, nhuCau] = await Promise.all([leadCua(tx, [id]), nhuCauCua(tx, [id], ai)]);
  const { rows: hang } = await tx.query<{ id: string; building_name: string; unit_number: string | null; standard_status: string; list_price: string | null }>(
    `select h.id, h.building_name, h.unit_number, h.standard_status, h.list_price from listing_owners o
     join listings h on h.company_id = o.company_id and h.id = o.listing_id
     where o.company_id = app.current_company_id() and o.contact_id = $1 order by h.building_name, h.unit_number`,
    [id],
  );
  const opportunities = [
    ...leads.map((l) => ({
      side: "seller" as const,
      leadId: l.id,
      need: l.need,
      unit: { buildingName: l.building_name, unitNumber: l.unit_number },
      phase: l.pha,
      listingId: l.listing_id,
    })),
    ...nhuCau.map((p) => ({ side: "buyer" as const, prospectId: p.id, need: p.need, agentUserId: p.owner_member_user_id, phase: phaNhuCau(p.closed_at !== null), shareCount: p.share_count })),
  ];
  // Dòng thời gian: mốc của lead, sự kiện hàng (không có giá đáy — ràng buộc 006), lần mở số, sự kiện nhu cầu khách (trưởng nhóm).
  const tl: { kind: string; at: string; ref?: string }[] = [];
  for (const l of leads) {
    tl.push({ kind: "lead_created", at: l.created_at.toISOString(), ref: l.id });
    if (l.accepted_at) tl.push({ kind: "lead_accepted", at: l.accepted_at.toISOString(), ref: l.id });
    if (l.first_called_at) tl.push({ kind: "lead_called", at: l.first_called_at.toISOString(), ref: l.id });
    if (l.returned_at) tl.push({ kind: "lead_returned", at: l.returned_at.toISOString(), ref: l.id });
  }
  const { rows: sk } = await tx.query<{ listing_id: string; type: string; occurred_at: Date }>(
    `select e.listing_id, e.type, e.occurred_at from listing_events e
     where e.company_id = app.current_company_id() and e.type in ('created', 'status_changed', 'price_changed')
       and e.listing_id = any($1::uuid[]) order by e.occurred_at desc limit ${DONG_THOI_GIAN}`,
    [hang.map((h) => h.id)],
  );
  for (const e of sk) tl.push({ kind: `listing_${e.type}`, at: e.occurred_at.toISOString(), ref: e.listing_id });
  const { rows: mo } = await tx.query<{ revealed_at: Date; phone_id: string }>(
    "select revealed_at, phone_id from contact_phone_reveals where company_id = app.current_company_id() and contact_id = $1 order by revealed_at desc limit 50",
    [id],
  );
  for (const m of mo) tl.push({ kind: "phone_revealed", at: m.revealed_at.toISOString(), ref: m.phone_id });
  if (nhuCau.length) {
    const { rows: pe } = await tx.query<{ prospect_id: string; type: string; occurred_at: Date }>(
      "select prospect_id, type, occurred_at from prospect_events where company_id = app.current_company_id() and prospect_id = any($1::uuid[])",
      [nhuCau.map((p) => p.id)],
    );
    for (const e of pe) tl.push({ kind: `prospect_${e.type}`, at: e.occurred_at.toISOString(), ref: e.prospect_id });
  }
  tl.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return {
    contact: { id: c.id, name: c.full_name, contactTypes: c.contact_types, status: contactStatus({ hasListing: hang.length > 0, anyFirstCall: leads.some((l) => l.first_called_at !== null) }), holderUserId: c.owner_member_user_id, custom: c.custom },
    phones,
    opportunities,
    listings: hang.map((h) => ({ id: h.id, buildingName: h.building_name, unitNumber: h.unit_number, status: h.standard_status, listPrice: h.list_price === null ? null : Number(h.list_price) })),
    timeline: tl.slice(0, DONG_THOI_GIAN),
  };
}

/** Mở một số: số rõ khi người xem đọc được và số thuộc liên hệ; hàm 036 ghi sự kiện. */
export async function revealPhone(tx: pg.PoolClient, contactId: string, phoneId: string, khoa: KhoaSoChu): Promise<string | null> {
  const { rows } = await tx.query<{ phone_enc: Buffer; enc_context: string }>("select * from app.contact_phone_for_reveal($1, $2)", [contactId, phoneId]);
  const r = rows[0];
  if (!r) return null;
  try {
    return giaiMaSo(r.phone_enc, r.enc_context, khoa);
  } catch {
    return null; // bản mã của khoá khác: báo «chưa mở được», không đổ
  }
}
