// Liên hệ qua API trên Postgres thật (hàng 85: AC-3..AC-8, ADR-0021). Người, hàng, lead từ bộ mẫu hàng 5 qua đường ghi
// thật; số chủ là số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "./helpers";
import { ai, dong, hangCoChu, hangTuLead, lenBang, nam, nhap, nhip, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const MOT = { ts: { vai: ["telesales"] }, ts2: { vai: ["telesales"] }, tn: { vai: ["team_lead"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] }, dc2: { vai: ["listing_agent"], khu: ["Toà B"] } };

const lienHeCua = async (leadId: string) => (await appPool.query<{ contact_id: string | null }>("select contact_id from leads where id = $1", [leadId])).rows[0]!.contact_id;
const lienHe = async (id: string) =>
  (
    await appPool.query<{ contact_types: string[]; owner_member_user_id: string | null; full_name: string | null; so: number }>(
      "select contact_types, owner_member_user_id, full_name, (select count(*)::int from contact_phones p where p.contact_id = c.id) so from contacts c where id = $1",
      [id],
    )
  ).rows[0]!;
const demLienHe = async (san: San) => (await appPool.query<{ n: number }>("select count(*)::int n from contacts where company_id = $1", [san.companyId])).rows[0]!.n;
const tra = (san: San, id: string, k: string) => send("POST", `/api/v1/leads/${id}/return`, undefined, san.nguoi[k]!.cookie);
const guiLai = async (san: San, id: string, so: string) => {
  const r = await send("POST", `/api/v1/leads/${id}/resubmit`, { ownerPhone: so }, san.nguoi.ts!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string; outcome: string }).id;
};
const datChu = async (san: San, k: string, hang: string, so: string | undefined, gia?: number) => {
  const r = await send("PUT", `/api/v1/listings/${hang}/owner`, { ownerName: "[Tên]", ...(so && { ownerPhone: so }), ...(gia && { floorPrice: gia }) }, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
};
const taoHang = async (san: San, k: string, can: string) => {
  const r = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: can }, san.nguoi[k]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string }).id;
};
const voiNhuCau = (so: string, need: string) => ({ ...nam(so, "Toà A"), need });
/** Máy dò số chủ: bỏ ký tự không phải chữ số, tìm chín chữ số cuối; khoá cấm. */
function doSo(than: string, so: string[]): number {
  const chu = than.replace(/\D/g, "");
  let n = so.filter((x) => chu.includes(x.replace(/\D/g, "").slice(-9))).length;
  for (const k of ["contactId", "contact_id", "matchedListingId", "ownerPhone"]) if (than.includes(`"${k}"`)) n++;
  return n;
}

// ---- AC-3 ----
test("liên hệ: nhập lead tạo liên hệ theo nhu cầu", async () => {
  const s = await sanMoi(MOT);
  const BANG: [string, string[]][] = [
    ["sale", ["Seller"]],
    ["lease", ["Landlord"]],
    ["sale_or_lease", ["Seller", "Landlord"]],
  ];
  let so = 0;
  for (const [need, loai] of BANG) {
    const l = await nhap(s, voiNhuCau(soMoi(s), need));
    const c = await lienHeCua(l.id);
    assert.ok(c, need);
    const k = await lienHe(c!);
    assert.deepEqual([k.contact_types, k.so], [loai, 1], need);
    so++;
  }
  assert.equal(so, 3);
  assert.equal(await demLienHe(s), 3);
});

test("liên hệ: số đã có thì gắn liên hệ có sẵn", async () => {
  const s = await sanMoi(MOT);
  const so = soMoi(s);
  const a = await nhap(s, nam(so, "Toà A"));
  const truoc = await demLienHe(s);
  const b = await nhap(s, nam(so, "Toà B"), "ts2");
  assert.equal(await demLienHe(s), truoc, `số liên hệ ${await demLienHe(s)} thay vì ${truoc}`);
  assert.ok(await lienHeCua(a.id), "lead không gắn liên hệ");
  assert.equal(await lienHeCua(b.id), await lienHeCua(a.id));
});

test("liên hệ: telesales không đọc liên hệ", async () => {
  assert.equal(doSo("+84 900 000 012", ["0900 000 012"]) + doSo(JSON.stringify({ contactId: "x" }), []), 2, "đối chứng dương");
  const s = await sanMoi(MOT);
  const so = soMoi(s);
  const r = await send("POST", "/api/v1/leads", nam(so, "Toà A"), s.nguoi.ts!.cookie);
  const than = await r.text();
  const id = (JSON.parse(than) as { id: string }).id;
  const c = (await lienHeCua(id))!;
  assert.equal((await send("GET", `/api/v1/contacts/${c}`, undefined, s.nguoi.ts!.cookie)).status, 404);
  const ds = await (await send("GET", "/api/v1/leads", undefined, s.nguoi.ts!.cookie)).text();
  for (const [ten, t] of [["nhập", than], ["danh sách", ds]] as const) assert.equal(doSo(t, [so]), 0, ten);
});

test("liên hệ: hai telesales cùng nhập một số mới", async () => {
  const s = await sanMoi(MOT);
  const so = soMoi(s);
  const [a, b] = await Promise.all([nhap(s, nam(so, "Toà A")), nhap(s, nam(so, "Toà B"), "ts2")]);
  assert.equal(await demLienHe(s), 1);
  assert.equal(await lienHeCua(a.id), await lienHeCua(b.id));
});

// ---- AC-4 ----
test("liên hệ: chủ hai số ra cùng đầu chủ", async () => {
  const s = await sanMoi(MOT);
  const [soA, soB, soC, soD] = [soMoi(s), soMoi(s), soMoi(s), soMoi(s)];
  // Số A trên chủ nhà của một hàng do đầu chủ 1 giữ.
  await datChu(s, "dc1", await taoHang(s, "dc1", "A-01.01"), soA);
  // Lead số A ở Toà B về đầu chủ 1 (chủ trùng), trả lại, gửi lại số B → B vào cùng liên hệ (còn hàng nên vẫn có người giữ).
  // Lead gửi lại (Toà B) được nhịp chia về đầu chủ 2: chỉ kiểm trùng qua liên hệ mới cho số B ra đầu chủ 1.
  const la = await nhap(s, nam(soA, "Toà B"));
  assert.equal(la.outcome, "owner_has_agent");
  assert.equal((await tra(s, la.id, "dc1")).status, 200);
  await guiLai(s, la.id, soB);
  // Số C của liên hệ do đầu chủ 2 giữ; số D của liên hệ đã thôi người giữ (lead trả lại, không còn liên kết).
  await datChu(s, "dc2", await taoHang(s, "dc2", "A-02.02"), soC);
  const ld = await nhap(s, nam(soD, "Toà A"));
  await nhip(new Date(), s);
  assert.equal((await tra(s, ld.id, "dc1")).status, 200);
  const K = (await lienHeCua(la.id))!;
  // [dòng, số, outcome, người nhận, cùng liên hệ K]
  const BANG: [string, string, string, string | null, boolean][] = [
    ["số B", soB, "owner_has_agent", "dc1", true],
    ["số A", soA, "owner_has_agent", "dc1", true],
    ["số của liên hệ đầu chủ 2 giữ", soC, "owner_has_agent", "dc2", false],
    ["số chưa thuộc ai", soMoi(s), "new", null, false],
    ["số của liên hệ đã thôi người giữ", soD, "new", null, false],
  ];
  let so = 0;
  for (const [ten, sdt, outcome, nguoi, cung] of BANG) {
    const l = await nhap(s, nam(sdt, "Toà B"), "ts2");
    const d = await dong(l.id);
    assert.deepEqual([l.outcome, ai(s, d.matched_agent_user_id), (await lienHeCua(l.id)) === K], [outcome, nguoi, cung], `dòng «${ten}»`);
    so++;
  }
  assert.equal(so, 5);
});

// ---- AC-5 ----
test("liên hệ: chủ nhà của hàng gắn liên hệ", async () => {
  const s = await sanMoi(MOT);
  const so = soMoi(s);
  const h1 = await taoHang(s, "dc1", "A-03.01");
  const h2 = await taoHang(s, "dc1", "A-03.02");
  await datChu(s, "dc1", h1, so, 2_000_000_000);
  await datChu(s, "dc1", h2, so, 2_500_000_000);
  const o = (await appPool.query<{ listing_id: string; contact_id: string; floor_price: string }>("select listing_id, contact_id, floor_price from listing_owners where listing_id = any($1) order by floor_price", [[h1, h2]])).rows;
  assert.equal(o[0]!.contact_id, o[1]!.contact_id);
  assert.deepEqual(o.map((x) => Number(x.floor_price)), [2_000_000_000, 2_500_000_000]);
  const k = await lienHe(o[0]!.contact_id);
  assert.deepEqual([k.contact_types, ai(s, k.owner_member_user_id), k.full_name], [["Seller"], "dc1", "[Tên]"]);
  const demMo = async () => (await appPool.query<{ n: number }>("select count(*)::int n from owner_phone_reveals where listing_id = any($1)", [[h1, h2]])).rows[0]!.n;
  const truoc = await demMo();
  for (const h of [h1, h2]) {
    const r = await send("POST", `/api/v1/listings/${h}/owner/phone-reveal`, undefined, s.nguoi.dc1!.cookie);
    assert.equal(((await r.json()) as { ownerPhone: string }).ownerPhone, so.replace(/\s/g, ""));
  }
  assert.equal(await demMo(), truoc + 2);
});

test("liên hệ: người giữ chỉ đặt khi chưa có", async () => {
  const s = await sanMoi(MOT);
  const so = soMoi(s);
  const h = await taoHang(s, "dc1", "A-04.01");
  await datChu(s, "dc1", h, so);
  await lenBang(s, "dc1", h); // hàng lên «Toàn sàn» thì trưởng nhóm mới thấy (hàng 12)
  const giao = await send("PUT", `/api/v1/listings/${h}/listing-agent`, { userId: s.nguoi.dc2!.userId }, s.nguoi.tn!.cookie);
  assert.equal(giao.status, 200, await giao.clone().text());
  await datChu(s, "dc2", h, so);
  const c = (await appPool.query<{ contact_id: string }>("select contact_id from listing_owners where listing_id = $1", [h])).rows[0]!.contact_id;
  assert.equal(ai(s, (await lienHe(c)).owner_member_user_id), "dc1", "người giữ liên hệ đổi theo lần giao lại hàng");
  // Lead mới của chủ ấy về người giữ liên hệ (Hỏi-3).
  const l = await nhap(s, nam(so, "Toà B"));
  assert.equal(ai(s, (await dong(l.id)).matched_agent_user_id), "dc1");
});

// ---- AC-6 ----
test("liên hệ: gửi lại thêm số vào cùng người", async () => {
  const s = await sanMoi(MOT);
  const l = await nhap(s, nam(soMoi(s), "Toà A"));
  await nhip(new Date(), s);
  assert.equal((await tra(s, l.id, "dc1")).status, 200);
  const moi = await guiLai(s, l.id, soMoi(s));
  const K = (await lienHeCua(l.id))!;
  assert.equal(await lienHeCua(moi), K);
  assert.equal((await lienHe(K)).so, 2, "liên hệ không có hai số");
});

test("liên hệ: gửi lại số của người khác", async () => {
  const s = await sanMoi(MOT);
  const soC = soMoi(s);
  await datChu(s, "dc2", await taoHang(s, "dc2", "A-05.01"), soC);
  const l = await nhap(s, nam(soMoi(s), "Toà A"));
  await nhip(new Date(), s);
  assert.equal((await tra(s, l.id, "dc1")).status, 200);
  const truoc = await demLienHe(s);
  const moi = await guiLai(s, l.id, soC);
  const kC = (await appPool.query<{ contact_id: string }>("select p.contact_id from contact_phones p join contacts c on c.id = p.contact_id where c.company_id = $1 and p.contact_id <> $2", [s.companyId, await lienHeCua(l.id)])).rows[0]!.contact_id;
  assert.equal(await lienHeCua(moi), kC);
  assert.equal(await demLienHe(s), truoc);
  assert.equal((await lienHe((await lienHeCua(l.id))!)).so, 1);
});

test("liên hệ: trả lại bỏ người giữ khi hết liên kết", async () => {
  const s = await sanMoi(MOT);
  const so = soMoi(s);
  await datChu(s, "dc1", await taoHang(s, "dc1", "A-06.01"), so);
  const coHang = await nhap(s, nam(so, "Toà A"));
  const chiLead = await nhap(s, nam(soMoi(s), "Toà A"));
  await nhip(new Date(), s);
  // [dòng, lead, người giữ mong sau khi trả]
  const BANG: [string, string, string | null][] = [
    ["liên hệ chỉ có lead trả lại", chiLead.id, null],
    ["liên hệ còn một hàng", coHang.id, "dc1"],
  ];
  let n = 0;
  for (const [ten, id, mong] of BANG) {
    assert.equal((await tra(s, id, "dc1")).status, 200, ten);
    assert.equal(ai(s, (await lienHe((await lienHeCua(id))!)).owner_member_user_id), mong, `dòng «${ten}»`);
    n++;
  }
  assert.equal(n, 2);
});


// ---- AC-7 ----
const taoTuLead = (san: San, id: string, k: string) => send("POST", `/api/v1/leads/${id}/listing`, undefined, san.nguoi[k]?.cookie ?? "");

test("liên hệ: tạo hàng từ lead", async () => {
  const s = await sanMoi(MOT);
  const leadVe = async (can?: string) => {
    const l = await nhap(s, nam(soMoi(s), "Toà A", can));
    await nhip(new Date(), s);
    return l.id;
  };
  const tot = await leadVe("A-08.01");
  const khac = await leadVe();
  const daTra = await leadVe();
  assert.equal((await tra(s, daTra, "dc1")).status, 200);
  await hangCoChu(s, "dc1", "A-08.02", soMoi(s));
  const canTrung = (await nhap(s, nam(soMoi(s), "Toà A", "A-08.02"))).id;
  // [dòng, lead, người gọi, mã HTTP, mã lỗi]
  const BANG: [string, string, string, number, string | null][] = [
    ["đầu chủ của lead", tot, "dc1", 201, null],
    ["lần hai", tot, "dc1", 409, "lead-has-listing"],
    ["đầu chủ khác", khac, "dc2", 404, "not-found"],
    ["trưởng nhóm", khac, "tn", 404, "not-found"],
    ["telesales người nhập", khac, "ts", 404, "not-found"],
    ["lead trả lại", daTra, "dc1", 409, "lead-not-listable"],
    ["lead căn trùng", canTrung, "dc1", 409, "lead-not-listable"],
    ["không cookie", khac, "khach", 401, "unauthenticated"],
  ];
  let so = 0;
  for (const [ten, id, k, ma, loi] of BANG) {
    const r = await taoTuLead(s, id, k);
    const than = (await r.json()) as { error?: string; id?: string };
    assert.deepEqual([r.status, than.error ?? null], [ma, loi], `dòng «${ten}»`);
    if (ma === 201) {
      const h = than.id!;
      const d = await dong(tot);
      const hang = (await appPool.query("select building_name, unit_number from listings where id = $1", [h])).rows[0];
      assert.deepEqual(hang, { building_name: d.building_name, unit_number: d.unit_number });
      assert.equal((await appPool.query("select lead_id from lead_listings where listing_id = $1", [h])).rows[0]?.lead_id, tot, "hàng không mang mã lead");
      assert.equal((await appPool.query("select contact_id from listing_owners where listing_id = $1", [h])).rows[0]?.contact_id, await lienHeCua(tot));
      const giu = (await appPool.query("select user_id from listing_agent_assignments where listing_id = $1 order by seq desc limit 1", [h])).rows[0]?.user_id;
      assert.equal(ai(s, giu), "dc1");
      // Hàng tạo từ lead chưa có số trên chủ nhà của hàng: «Mở số» báo chưa có số, không lỗi.
      const mo = await send("POST", `/api/v1/listings/${h}/owner/phone-reveal`, undefined, s.nguoi.dc1!.cookie);
      assert.deepEqual([mo.status, ((await mo.json()) as { error: string }).error], [404, "owner-not-set"]);
    }
    so++;
  }
  assert.equal(so, BANG.length);
});

test("liên hệ: lên bảng là dữ kiện", async () => {
  const s = await sanMoi(MOT);
  const boardAt = async (id: string) =>
    ((await (await send("GET", "/api/v1/leads", undefined, s.nguoi.ts!.cookie)).json()) as { id: string; boardAt: string | null }[]).find((v) => v.id === id)!.boardAt;
  // (1) hàng mang mã lead sang Active → lên bảng đúng mốc.
  const a = await nhap(s, nam(soMoi(s), "Toà A"));
  await nhip(new Date(), s);
  const mA = await lenBang(s, "dc1", await hangTuLead(s, "dc1", a.id));
  // (2) hàng cùng số của chính đầu chủ, không mang mã lead, sang Active → không lên bảng.
  const soB = soMoi(s);
  const b = await nhap(s, nam(soB, "Toà A"));
  await nhip(new Date(), s);
  await lenBang(s, "dc1", await hangCoChu(s, "dc1", "A-09.01", soB));
  // (3) chuỗi Z trả lại → Z' gửi lại → hàng mang mã Z' Active → Z' lên bảng, số đo tính từ lúc nhập Z.
  const tu = new Date();
  const z = await nhap(s, nam(soMoi(s), "Toà A"));
  await nhip(new Date(), s);
  assert.equal((await tra(s, z.id, "dc1")).status, 200);
  const z2 = await guiLai(s, z.id, soMoi(s));
  await nhip(new Date(), s);
  const mZ2 = await lenBang(s, "dc1", await hangTuLead(s, "dc1", z2));
  const BANG: [string, string, string | null][] = [
    ["hàng mang mã lead", a.id, mA.toISOString()],
    ["hàng cùng số không mang mã", b.id, null],
    ["chuỗi gửi lại", z2, mZ2.toISOString()],
  ];
  let so = 0;
  for (const [ten, id, mong] of BANG) {
    assert.equal(await boardAt(id), mong, `dòng «${ten}»`);
    so++;
  }
  assert.equal(so, 3);
  const ra = (await appPool.query("select lead_id, first_created_at from app.lead_board_metric($1, $2, now() + interval '1 minute')", [s.companyId, tu])).rows;
  const dauZ = (await dong(z.id)).created_at as Date;
  assert.deepEqual(ra.filter((r) => r.lead_id === z2).map((r) => (r.first_created_at as Date).toISOString()), [dauZ.toISOString()]);
});

// ---- AC-8 ----
const xem = (san: San, id: string, k: string) => send("GET", `/api/v1/contacts/${id}`, undefined, san.nguoi[k]?.cookie ?? "");
const sua = (san: San, id: string, k: string, than: unknown) => send("PATCH", `/api/v1/contacts/${id}`, than, san.nguoi[k]?.cookie ?? "");
const lienHeCuaHang = async (h: string) => (await appPool.query<{ contact_id: string }>("select contact_id from listing_owners where listing_id = $1", [h])).rows[0]!.contact_id;

test("liên hệ: một người nhiều loại", async () => {
  const s = await sanMoi(MOT);
  const h = await taoHang(s, "dc1", "A-10.01");
  await datChu(s, "dc1", h, soMoi(s));
  const K = await lienHeCuaHang(h);
  const truoc = [await demLienHe(s), (await lienHe(K)).so];
  const r = await sua(s, K, "dc1", { contactTypes: ["Buyer", "Seller", "Seller"] });
  assert.equal(r.status, 200, await r.clone().text());
  assert.deepEqual([await demLienHe(s), (await lienHe(K)).so], truoc);
  assert.deepEqual((await lienHe(K)).contact_types, ["Seller", "Buyer"]);
  const v = (await (await xem(s, K, "dc1")).json()) as Record<string, unknown>;
  assert.deepEqual(Object.keys(v), ["id", "fullName", "contactTypes", "ownerMemberUserId", "phoneCount", "status", "createdAt"]);
  assert.deepEqual([v.contactTypes, v.phoneCount, v.status], [["Seller", "Buyer"], 1, "contact"]);
});

test("liên hệ: ai xem, ai sửa", async () => {
  const s = await sanMoi(MOT);
  const b = await sanMoi({ tn: { vai: ["team_lead", "listing_agent"] } });
  const h = await taoHang(s, "dc1", "A-11.01");
  await datChu(s, "dc1", h, soMoi(s));
  const K = await lienHeCuaHang(h);
  const l = await nhap(s, nam(soMoi(s), "Toà A"));
  await nhip(new Date(), s);
  assert.equal((await tra(s, l.id, "dc1")).status, 200);
  const K0 = (await lienHeCua(l.id))!; // liên hệ đã thôi người giữ
  const than = { contactTypes: ["Seller", "Buyer"] };
  // [dòng, sàn, người, liên hệ, mã GET, mã PATCH]
  const BANG: [string, San, string, string, number, number][] = [
    ["người giữ", s, "dc1", K, 200, 200],
    ["trưởng nhóm", s, "tn", K, 200, 200],
    ["đầu chủ khác", s, "dc2", K, 404, 404],
    ["telesales", s, "ts", K, 404, 404],
    ["quản trị", s, "qt", K, 404, 404],
    ["người sàn khác", b, "tn", K, 404, 404],
    ["không cookie", s, "khach", K, 401, 401],
    ["chưa có người giữ × đầu chủ", s, "dc1", K0, 404, 404],
    ["chưa có người giữ × trưởng nhóm", s, "tn", K0, 200, 200],
  ];
  let so = 0;
  for (const [ten, san, k, id, mGet, mPatch] of BANG) {
    // Ô bị từ chối gửi thêm loại «Người thuê»: dữ liệu không được đổi dù lối trả gì.
    const gui = mPatch === 200 ? than : { contactTypes: ["Seller", "Tenant"] };
    assert.deepEqual([(await xem(san, id, k)).status, (await sua(san, id, k, gui)).status], [mGet, mPatch], `ô «${ten}»`);
    assert.ok(!(await lienHe(id)).contact_types.includes("Tenant"), `ô «${ten}»: sửa trái phép đã ghi`);
    so += 2;
  }
  assert.equal(so, 18);
});

test("liên hệ: khuôn sửa loại", async () => {
  const s = await sanMoi(MOT);
  const h0 = await taoHang(s, "dc1", "A-12.01");
  await datChu(s, "dc1", h0, soMoi(s));
  const K = await lienHeCuaHang(h0);
  for (const [ten, than] of [["khoá lạ", { contactTypes: ["Seller"], x: 1 }], ["loại ngoài thực đơn", { contactTypes: ["Lead"] }], ["mảng rỗng", { contactTypes: [] }]] as const) {
    const r = await sua(s, K, "dc1", than);
    assert.deepEqual([r.status, ((await r.json()) as { error: string }).error], [400, "invalid-payload"], ten);
  }
  // Ba kiểu liên hệ mang Seller + Landlord: còn hàng · còn lead mở · không còn liên kết (lead trả lại).
  const dung = async (kieu: string) => {
    const so = soMoi(s);
    if (kieu === "còn hàng") {
      const h = await taoHang(s, "dc1", `A-12.${s.so}`);
      await datChu(s, "dc1", h, so);
      const c = await lienHeCuaHang(h);
      assert.equal((await sua(s, c, "tn", { contactTypes: ["Seller", "Landlord"] })).status, 200);
      return c;
    }
    const l = await nhap(s, { ...nam(so, "Toà A"), need: "sale_or_lease" });
    await nhip(new Date(), s);
    if (kieu === "không còn liên kết") assert.equal((await tra(s, l.id, "dc1")).status, 200);
    return (await lienHeCua(l.id))!;
  };
  // [kiểu, loại sau sửa, mã mong]
  const BANG: [string, string[], number][] = [];
  for (const kieu of ["còn hàng", "còn lead mở", "không còn liên kết"]) {
    BANG.push([kieu, ["Landlord", "Buyer"], 200], [kieu, ["Seller", "Buyer"], 200], [kieu, ["Buyer"], kieu === "không còn liên kết" ? 200 : 400]);
  }
  let so = 0;
  for (const [kieu, loai, ma] of BANG) {
    const c = await dung(kieu);
    const r = await sua(s, c, "tn", { contactTypes: loai });
    const e = ma === 400 ? ((await r.json()) as { error: string }).error : null;
    assert.deepEqual([r.status, e], [ma, ma === 400 ? "owner-type-required" : null], `ô «${kieu} × ${loai.join("+")}»`);
    so++;
  }
  assert.equal(so, 9);
});
