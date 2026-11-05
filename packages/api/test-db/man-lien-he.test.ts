// Màn Liên hệ qua API trên Postgres thật (hàng 103: AC-1..AC-8 — E1..E8). Người, lead, hàng từ sàn thử qua đường ghi thật;
// số mẫu `0900 000 0xx`, tên «[Tên]». Mỗi phép quét âm tính có đối chứng dương trên chính giá trị đã cài.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "./helpers";
import { hangTuLead, lenBang, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const DOI = {
  ts: { vai: ["telesales"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  dc2: { vai: ["listing_agent"], khu: ["Toà B"] },
  mat: { vai: ["listing_agent"], khu: ["Toà C"] }, // người giữ sẽ mất vai Đầu chủ
  dk: { vai: ["buyer_agent"] },
  hai: { vai: ["buyer_agent", "listing_agent"] }, // hai vai, không giữ ai
};
const ck = (s: San, k: string) => s.nguoi[k]?.cookie ?? "";
const json = async <T>(r: Response): Promise<T> => (await r.json()) as T;
const lienHeCua = async (leadId: string) => (await appPool.query<{ contact_id: string }>("select contact_id from leads where id = $1", [leadId])).rows[0]!.contact_id;
const tenCua = async (userId: string) => (await appPool.query<{ name: string }>('select name from identity."user" where id = $1', [userId])).rows[0]!.name;
const ghi = async (s: San, id: string, duoi: string, k: string) => {
  const r = await send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, ck(s, k));
  assert.equal(r.status, 200, `${duoi}: ${await r.clone().text()}`);
};
/** Lead của đầu chủ `k` (theo khu) đã chia; trả mã lead và liên hệ. */
async function leadCua(s: San, so: string, toa: string, can?: string) {
  const l = await nhap(s, nam(so, toa, can));
  await nhip(new Date(), s);
  return { leadId: l.id, contactId: await lienHeCua(l.id) };
}
const doiVai = async (s: San, k: string, roles: string[]) =>
  assert.equal((await send("PATCH", `/api/v1/company/members/${s.nguoi[k]!.userId}`, { roles }, ck(s, "qt"))).status, 200);
/** Máy dò: bỏ ký tự không phải chữ số, tìm chín chữ số cuối của mỗi số; cộng một cho mỗi khoá cấm. */
function doLo(than: string, so: string[], gia: number[] = []): number {
  const chu = than.replace(/\D/g, "");
  let n = so.filter((x) => chu.includes(x.replace(/\D/g, "").slice(-9))).length + gia.filter((g) => chu.includes(String(g))).length;
  for (const k of ["phoneEnc", "floorPrice", "phone_enc", "floor_price"]) if (than.includes(`"${k}"`)) n++;
  return n;
}

// ---- E1 ----
test("liên hệ: danh sách theo quyền", async () => {
  assert.equal(doLo("+84 900 000 011 · 2700000000", ["0900 000 011"], [2_700_000_000]) + doLo('{"floorPrice":1}', []), 3, "đối chứng dương");
  const s = await sanMoi(DOI);
  const so = [soMoi(s), soMoi(s), soMoi(s)];
  const a1 = await leadCua(s, so[0]!, "Toà A");
  const a2 = await leadCua(s, so[1]!, "Toà A", "A-02.01");
  const b1 = await leadCua(s, so[2]!, "Toà B");
  const hang = await hangTuLead(s, "dc1", a1.leadId);
  const r0 = await send("PUT", `/api/v1/listings/${hang}/owner`, { ownerName: "[Tên]", ownerPhone: so[0], floorPrice: 2_700_000_000 }, ck(s, "dc1"));
  assert.equal(r0.status, 200, await r0.clone().text());
  const ds = async (k: string) => {
    const r = await send("GET", "/api/v1/contacts", undefined, ck(s, k));
    assert.equal(r.status, 200, `${k}: ${await r.clone().text()}`);
    return { than: await r.clone().text(), items: (await json<{ items: Record<string, unknown>[] }>(r)).items };
  };
  const tap = (items: Record<string, unknown>[]) => new Set(items.map((i) => i.id));
  assert.deepEqual(tap((await ds("dc1")).items), new Set([a1.contactId, a2.contactId]));
  assert.deepEqual(tap((await ds("dc2")).items), new Set([b1.contactId]));
  const tn = await ds("tn");
  assert.deepEqual(tap(tn.items), new Set([a1.contactId, a2.contactId, b1.contactId]));
  for (const i of tn.items) for (const k of ["name", "contactTypes", "status", "holderName", "phoneCount", "openOpportunities", "listingCount"]) assert.ok(k in i, `thiếu khoá ${k}`);
  assert.equal(doLo(tn.than, so, [2_700_000_000]), 0, "danh sách lộ số hay giá đáy");
  const BANG: [string, number][] = [["ts", 403], ["dk", 403], ["qt", 403], ["", 401]];
  let dem = 0;
  for (const [k, ma] of BANG) {
    assert.equal((await send("GET", "/api/v1/contacts", undefined, ck(s, k))).status, ma, `vai ${k || "không cookie"}`);
    dem++;
  }
  assert.equal(dem, 4);
});

// ---- E2 ----
test("liên hệ: lọc, tìm tên, phân trang", async () => {
  const s = await sanMoi(DOI);
  const ban = await leadCua(s, soMoi(s), "Toà A");
  const thue = await nhap(s, { ...nam(soMoi(s), "Toà A"), need: "lease" });
  await nhip(new Date(), s);
  const thueId = await lienHeCua(thue.id);
  await ghi(s, ban.leadId, "first-call", "dc1");
  await appPool.query("update contacts set full_name = '[Tên] Nguyễn A' where id = $1", [ban.contactId]);
  const tim = async (q: string) =>
    new Set((await json<{ items: { id: string }[] }>(await send("GET", `/api/v1/contacts?${q}`, undefined, ck(s, "dc1")))).items.map((i) => i.id));
  const BANG: [string, string[]][] = [
    ["type=Seller", [ban.contactId]],
    ["type=Landlord", [thueId]],
    ["type=Buyer", []],
    ["status=lead", [thueId]],
    ["status=contact", [ban.contactId]],
    ["q=nguyen", [ban.contactId]],
    ["q=khongco", []],
  ];
  let dem = 0;
  for (const [q, mong] of BANG) {
    assert.deepEqual(await tim(q), new Set(mong), q);
    dem++;
  }
  assert.equal(dem, 7);
  // 120 liên hệ của đầu chủ 1 (chèn bằng vai chủ): duyệt hết trang ra đúng 120 + 2 mã khác nhau, trang đầu 50.
  for (let i = 0; i < 120; i++)
    await appPool.query("insert into contacts (company_id, contact_types, owner_member_user_id, created_by, full_name) values ($1, '{Seller}', $2, 'x', '[Tên]')", [s.companyId, s.nguoi.dc1!.userId]);
  const thay: string[] = [];
  let cursor: string | null = null;
  let trang = 0;
  do {
    const r: { items: { id: string }[]; nextCursor: string | null } = await json(await send("GET", `/api/v1/contacts${cursor ? `?cursor=${cursor}` : ""}`, undefined, ck(s, "dc1")));
    if (trang === 0) assert.equal(r.items.length, 50, "trang đầu");
    thay.push(...r.items.map((i) => i.id));
    cursor = r.nextCursor;
    trang++;
  } while (cursor && trang < 10);
  assert.equal(thay.length, 122, "tổng số qua các trang");
  assert.equal(new Set(thay).size, 122, "trùng giữa các trang");
});

// Bảng vai dùng chung cho ba đường (E3, E5): người → đọc được không. «mat» là người giữ sẽ mất vai Đầu chủ.
const VAI: [string, boolean][] = [
  ["mat", false],
  ["dc2", false],
  ["tn", true],
  ["ts", false],
  ["dk", false],
  ["qt", false],
  ["hai", false],
];

// ---- E3 ----
test("liên hệ: tìm theo số", async () => {
  const s = await sanMoi(DOI);
  const s2 = await sanMoi(DOI, 80); // số mẫu khác dải của sàn đầu
  const soA = soMoi(s);
  const a = await leadCua(s, soA, "Toà A");
  const soB = soMoi(s);
  await leadCua(s, soB, "Toà B");
  const soC = soMoi(s);
  const c = await leadCua(s, soC, "Toà C");
  const soKhac = soMoi(s2);
  await leadCua(s2, soKhac, "Toà A");
  const tim = async (k: string, phone: string) => send("POST", "/api/v1/contacts/lookup-phone", { phone }, ck(s, k));
  const tenDc2 = await tenCua(s.nguoi.dc2!.userId);
  const BANG: [string, string, number, unknown][] = [
    ["dc1", soA, 200, { contactId: a.contactId }],
    ["dc1", `+84 ${soA.slice(1)}`, 200, { contactId: a.contactId }],
    ["dc1", soB, 200, { held: true, holderName: tenDc2 }],
    ["dc1", "0900 000 099", 200, { found: false }],
    ["dc1", soKhac, 200, { found: false }],
    ["dk", soA, 403, { error: "listing-agent-required" }],
  ];
  let dem = 0;
  for (const [k, so, ma, than] of BANG) {
    const r = await tim(k, so);
    assert.equal(r.status, ma, `${k} ${so}`);
    assert.deepEqual(await r.json(), than, `${k} ${so}`);
    dem++;
  }
  assert.equal(dem, 6);
  // Ma trận vai trên số của chủ «mat» giữ, sau khi «mat» mất vai Đầu chủ.
  await doiVai(s, "mat", ["buyer_agent"]);
  for (const [k, duoc] of VAI) {
    const r = await tim(k, soC);
    if (["ts", "dk", "qt", "mat"].includes(k)) assert.equal(r.status, 403, `ma trận ${k}`);
    else assert.deepEqual(await r.json(), duoc ? { contactId: c.contactId } : { held: true, holderName: await tenCua(s.nguoi.mat!.userId) }, `ma trận ${k}`);
  }
});

// ---- E4 ----
test("liên hệ: hồ sơ không có số rõ", async () => {
  const s = await sanMoi(DOI);
  const so1 = "0900 000 021";
  const a = await leadCua(s, so1, "Toà A");
  const hoSo = async (k: string) => send("GET", `/api/v1/contacts/${a.contactId}/profile`, undefined, ck(s, k));
  const r = await hoSo("dc1");
  assert.equal(r.status, 200, await r.clone().text());
  const than = await r.clone().text();
  const h = await json<{ contact: Record<string, unknown>; phones: { phoneId: string; label: string | null; isPrimary: boolean; tail: string }[] }>(r);
  assert.deepEqual(h.phones.map((p) => [p.isPrimary, p.tail]), [[true, "021"]]);
  assert.ok(h.phones[0]!.phoneId);
  for (const k of ["name", "contactTypes", "status", "holderName"]) assert.ok(k in h.contact, `thiếu ${k}`);
  assert.equal(doLo("so 0900000021", [so1]), 1, "đối chứng dương");
  assert.equal(doLo(than, [so1]), 0, "hồ sơ lộ số rõ");
  assert.equal((await hoSo("dc2")).status, 404);
});

// ---- E5 ----
test("liên hệ: mở số ghi sự kiện", async () => {
  const s = await sanMoi(DOI);
  const so = soMoi(s);
  const a = await leadCua(s, so, "Toà C"); // «mat» giữ
  const h = await json<{ phones: { phoneId: string }[] }>(await send("GET", `/api/v1/contacts/${a.contactId}/profile`, undefined, ck(s, "mat")));
  const phoneId = h.phones[0]!.phoneId;
  const mo = (k: string, p = phoneId) => send("POST", `/api/v1/contacts/${a.contactId}/phones/${p}/reveal`, undefined, ck(s, k));
  const dem = async () => (await appPool.query<{ n: number }>("select count(*)::int n from contact_phone_reveals where contact_id = $1", [a.contactId])).rows[0]!.n;
  const r = await mo("mat");
  assert.equal(r.status, 200, await r.clone().text());
  assert.match(r.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(((await r.json()) as { phone: string }).phone.replace(/\D/g, ""), so.replace(/\D/g, ""));
  const ev = (await appPool.query<{ revealed_by: string; phone_id: string }>("select revealed_by, phone_id from contact_phone_reveals where contact_id = $1", [a.contactId])).rows;
  assert.deepEqual(ev, [{ revealed_by: s.nguoi.mat!.userId, phone_id: phoneId }]);
  const khac = await leadCua(s, soMoi(s), "Toà A");
  const pKhac = (await json<{ phones: { phoneId: string }[] }>(await send("GET", `/api/v1/contacts/${khac.contactId}/profile`, undefined, ck(s, "dc1")))).phones[0]!.phoneId;
  const tuChoi = await (await mo("mat", pKhac)).text();
  await doiVai(s, "mat", ["buyer_agent"]);
  let so_dong = 0;
  for (const [k, duoc] of VAI) {
    const truoc = await dem();
    const x = await mo(k);
    assert.equal(x.status, duoc ? 200 : 404, `ma trận ${k}`);
    if (!duoc) assert.equal(await x.text(), tuChoi, `ma trận ${k}: thân từ chối khác nhau`);
    assert.equal(await dem(), truoc + (duoc ? 1 : 0), `ma trận ${k}: số sự kiện`);
    so_dong++;
  }
  assert.equal(so_dong, VAI.length);
});

// ---- E6b ----
test("liên hệ: chủ nhiều căn một hồ sơ", async () => {
  const s = await sanMoi(DOI);
  const so = soMoi(s);
  const l1 = await leadCua(s, so, "Toà A", "A-01.01");
  const l2 = await leadCua(s, so, "Toà A", "A-02.02");
  const l3 = await leadCua(s, so, "Toà A", "A-03.03");
  const l4 = await leadCua(s, so, "Toà A", "A-04.04");
  assert.equal(new Set([l1, l2, l3, l4].map((l) => l.contactId)).size, 1, "một số mà nhiều liên hệ");
  const hang1 = await hangTuLead(s, "dc1", l1.leadId);
  await lenBang(s, "dc1", hang1);
  await ghi(s, l2.leadId, "first-call", "dc1");
  await ghi(s, l4.leadId, "return", "dc1");
  const tao = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: "A-09.09" }, ck(s, "dc1"));
  const hang2 = ((await tao.json()) as { id: string }).id;
  assert.equal((await send("PUT", `/api/v1/listings/${hang2}/owner`, { ownerName: "[Tên]", ownerPhone: so }, ck(s, "dc1"))).status, 200);
  const h = await json<{ opportunities: { side: string; phase: string; listingId?: string | null }[]; listings: { id: string }[] }>(
    await send("GET", `/api/v1/contacts/${l1.contactId}/profile`, undefined, ck(s, "dc1")),
  );
  const pha = h.opportunities.map((o) => o.phase).sort();
  assert.deepEqual(pha, ["active", "appointment", "closed_out", "cultivate"].sort());
  assert.equal(h.opportunities.find((o) => o.phase === "active")!.listingId, hang1);
  assert.deepEqual(new Set(h.listings.map((x) => x.id)), new Set([hang1, hang2]));
  const nO = (await appPool.query<{ n: number }>("select count(*)::int n from listing_owners where contact_id = $1", [l1.contactId])).rows[0]!.n;
  assert.equal(nO, 2);
  const ds = await json<{ items: { id: string; listingCount: number; openOpportunities: number }[] }>(await send("GET", "/api/v1/contacts", undefined, ck(s, "dc1")));
  const dong = ds.items.filter((i) => i.id === l1.contactId);
  assert.equal(dong.length, 1, "một chủ nhiều dòng");
  assert.equal(dong[0]!.listingCount, 2);
  assert.equal(dong[0]!.openOpportunities, h.opportunities.filter((o) => o.phase !== "closed_out").length);
  assert.equal(dong[0]!.openOpportunities, 3);
});

// ---- E7 ----
test("liên hệ: cơ hội phía khách chỉ trưởng nhóm", async () => {
  const s = await sanMoi(DOI);
  const so = soMoi(s);
  const a = await leadCua(s, so, "Toà A", "A-05.05");
  const nc = await send("POST", "/api/v1/prospects", { displayName: "[Tên]", phone: so, need: "purchase" }, ck(s, "dk"));
  assert.equal(nc.status, 201, await nc.clone().text());
  const prospectId = ((await nc.json()) as { id: string }).id;
  const hang = await hangTuLead(s, "dc1", a.leadId);
  await lenBang(s, "dc1", hang);
  for (let i = 0; i < 2; i++)
    assert.equal((await send("POST", "/api/v1/shares", { audience: "client", prospectId, listingIds: [hang] }, ck(s, "dk"))).status, 201);
  const hoSo = async (k: string) =>
    json<{ opportunities: Record<string, unknown>[] }>(await send("GET", `/api/v1/contacts/${a.contactId}/profile`, undefined, ck(s, k)));
  const tn = (await hoSo("tn")).opportunities.filter((o) => o.side === "buyer");
  assert.deepEqual(tn.map((o) => [o.need, o.agentName, o.phase, o.shareCount]), [["purchase", await tenCua(s.nguoi.dk!.userId), "cultivate", 2]]);
  const dc = (await hoSo("dc1")).opportunities;
  assert.equal(dc.filter((o) => o.side === "buyer").length, 0, "đầu chủ thấy phía khách");
  assert.ok(!JSON.stringify(dc).includes("agentName"));
  const dem = async (k: string) =>
    (await json<{ items: { id: string; openOpportunities: number }[] }>(await send("GET", "/api/v1/contacts", undefined, ck(s, k)))).items.find((i) => i.id === a.contactId)!.openOpportunities;
  assert.equal(await dem("dc1"), 1);
  assert.equal(await dem("tn"), 2);
});

// ---- E8 ----
test("liên hệ: dòng thời gian", async () => {
  const s = await sanMoi(DOI);
  const so = soMoi(s);
  const a = await leadCua(s, so, "Toà A", "A-06.06");
  await ghi(s, a.leadId, "accept", "dc1");
  await ghi(s, a.leadId, "first-call", "dc1");
  const hang = await hangTuLead(s, "dc1", a.leadId);
  const gd = 2_500_000_000;
  assert.equal((await send("PUT", `/api/v1/listings/${hang}/owner`, { ownerName: "[Tên]", ownerPhone: so, floorPrice: gd }, ck(s, "dc1"))).status, 200);
  await lenBang(s, "dc1", hang);
  const p = (await json<{ phones: { phoneId: string }[] }>(await send("GET", `/api/v1/contacts/${a.contactId}/profile`, undefined, ck(s, "dc1")))).phones[0]!.phoneId;
  assert.equal((await send("POST", `/api/v1/contacts/${a.contactId}/phones/${p}/reveal`, undefined, ck(s, "dc1"))).status, 200);
  assert.equal((await send("POST", "/api/v1/prospects", { displayName: "[Tên]", phone: so, need: "purchase" }, ck(s, "dk"))).status, 201);
  const tl = async (k: string) => {
    const r = await send("GET", `/api/v1/contacts/${a.contactId}/profile`, undefined, ck(s, k));
    const than = await r.clone().text();
    return { than, tl: (await json<{ timeline: { kind: string; at: string }[] }>(r)).timeline };
  };
  const tn = await tl("tn");
  const kinds = new Set(tn.tl.map((e) => e.kind));
  for (const k of ["lead_created", "lead_accepted", "lead_called", "listing_created", "listing_price_changed", "listing_status_changed", "phone_revealed", "prospect_inquiry_received"])
    assert.ok(kinds.has(k), `thiếu ${k}`);
  const at = tn.tl.map((e) => e.at);
  assert.deepEqual(at, [...at].sort().reverse(), "không xếp mới trước");
  assert.ok(![...kinds].some((k) => k.includes("floor")), "có sự kiện giá đáy");
  assert.equal(doLo(`${gd}`, [], [gd]), 1, "đối chứng dương");
  assert.equal(doLo(JSON.stringify(tn.tl), [so], [gd]), 0, "dòng thời gian lộ số hay giá đáy");
  const dc = await tl("dc1");
  assert.ok(!dc.tl.some((e) => e.kind.startsWith("prospect_")), "đầu chủ thấy sự kiện nhu cầu khách");
  assert.ok(tn.tl.length <= 50);
});
