// Liên hệ khách qua API trên Postgres thật (hàng 86: AC-3..AC-8, migration 021). Người, hàng từ bộ mẫu hàng 5 qua đường ghi
// thật; số là số mẫu `0900 000 0xx`, tên là «[Tên]».
import { CONTACT_VIEW_KEYS, isOwnerContact } from "@quy-hang/core/contacts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { appPool, cleanup } from "./helpers";
import { hangCoChu, lenBang, maMoi, nam, nhap, sanMoi, send, soMoi, type San } from "./san-thu";

after(cleanup);

const MOT = {
  dk1: { vai: ["buyer_agent"] },
  dk2: { vai: ["buyer_agent"] },
  dk3: { vai: ["buyer_agent"] },
  dkc: { vai: ["buyer_agent", "listing_agent"], khu: ["Toà A"] }, // người gửi tự tạo được hàng
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  ts: { vai: ["telesales"] },
};

type NhuCau = { id: string; displayName: string; need: string; contactTypes: string[]; closedAt: string | null };
const ck = (s: San, k: string) => s.nguoi[k]!.cookie;
const taoNhuCau = async (s: San, k: string, so: string, need = "purchase") => {
  const r = await send("POST", "/api/v1/prospects", { displayName: "[Tên]", phone: so, need, criteria: { BedroomsTotalMin: 2 } }, ck(s, k));
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as NhuCau;
};
const nhuCau = async (id: string) =>
  (
    await appPool.query<{ contact_id: string; owner_member_user_id: string; closed_at: Date | null }>(
      "select contact_id, owner_member_user_id, closed_at from prospects where id = $1",
      [id],
    )
  ).rows[0]!;
const lienHe = async (id: string) =>
  (
    await appPool.query<{ contact_types: string[]; owner_member_user_id: string | null; so: number }>(
      "select contact_types, owner_member_user_id, (select count(*)::int from contact_phones p where p.contact_id = c.id) so from contacts c where id = $1",
      [id],
    )
  ).rows[0]!;
const demLienHe = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from contacts where company_id = $1", [s.companyId])).rows[0]!.n;
const demSoCua = async (contactId: string) => (await lienHe(contactId)).so;
const demGui = async (s: San) => (await appPool.query<{ n: number }>("select count(*)::int n from shares where company_id = $1", [s.companyId])).rows[0]!.n;
const suKien = async (prospectId: string) =>
  (
    await appPool.query<{ type: string; actor_user_id: string; actor_roles: string[]; payload: Record<string, unknown> }>(
      "select type, actor_user_id, actor_roles, payload from prospect_events where prospect_id = $1 order by occurred_at, id",
      [prospectId],
    )
  ).rows;
const lienHeChuCua = async (hangId: string) =>
  (await appPool.query<{ contact_id: string }>("select contact_id from listing_owners where listing_id = $1", [hangId])).rows[0]!.contact_id;
const gui = (s: San, k: string, body: unknown) => send("POST", "/api/v1/shares", body, ck(s, k));
/** Máy dò số: bỏ ký tự không phải chữ số, tìm chín chữ số cuối; cộng một cho mỗi khoá cấm có mặt. */
function doSo(than: string, so: string[]): number {
  const chu = than.replace(/\D/g, "");
  let n = so.filter((x) => chu.includes(x.replace(/\D/g, "").slice(-9))).length;
  for (const k of ["contactId", "contact_id", "phone", "phoneHash"]) if (than.includes(`"${k}"`)) n++;
  return n;
}
/** Hàng đã lên bảng của đầu chủ 1. */
const hangLenBang = async (s: San) => {
  const id = await hangCoChu(s, "dc1", maMoi(s), soMoi(s));
  await lenBang(s, "dc1", id);
  return id;
};

// ---- AC-3 ----
test("liên hệ khách: số mới tạo liên hệ khách", async () => {
  const s = await sanMoi(MOT);
  const BANG: [string, string[]][] = [
    ["purchase", ["Buyer"]],
    ["lease", ["Tenant"]],
    ["purchase_or_lease", ["Buyer", "Tenant"]],
  ];
  let so = 0;
  for (const [need, loai] of BANG) {
    const p = await taoNhuCau(s, "dk1", soMoi(s), need);
    const { contact_id } = await nhuCau(p.id);
    const k = await lienHe(contact_id);
    assert.deepEqual([k.contact_types, k.owner_member_user_id, k.so], [loai, null, 1], need);
    const ctx = (await appPool.query<{ enc_context: string }>("select enc_context from contact_phones where contact_id = $1", [contact_id])).rows[0]!.enc_context;
    assert.equal(ctx, `prospects:${s.companyId}:${p.id}`, need);
    so++;
  }
  assert.equal(so, 3);
  assert.equal(await demLienHe(s), 3);
});

test("liên hệ khách: số của chủ nhà gắn liên hệ có sẵn", async () => {
  const s = await sanMoi(MOT);
  const soA = soMoi(s);
  const hang = await hangCoChu(s, "dc1", maMoi(s), soA);
  const chu = await lienHeChuCua(hang);
  const truoc = await demLienHe(s);
  const p = await taoNhuCau(s, "dk1", soA);
  assert.equal(await demLienHe(s), truoc, `số liên hệ ${await demLienHe(s)} thay vì ${truoc}`);
  assert.equal((await nhuCau(p.id)).contact_id, chu);
  assert.equal((await lienHe(chu)).owner_member_user_id, s.nguoi.dc1!.userId, "người giữ liên hệ chủ đổi");
  const moi = await taoNhuCau(s, "dk1", soMoi(s));
  assert.deepEqual(Object.keys(p), Object.keys(moi), "thân trả khác nhau giữa số của chủ và số mới");
});

test("liên hệ khách: khách hỏi ghi một sự kiện", async () => {
  assert.equal(doSo(JSON.stringify({ ghi: "0900 000 012" }), ["0900 000 012"]), 1, "đối chứng dương máy dò");
  const s = await sanMoi(MOT);
  const so = [soMoi(s), soMoi(s)];
  let n = 0;
  for (const x of so) {
    const p = await taoNhuCau(s, "dk1", x);
    const ds = await suKien(p.id);
    assert.equal(ds.length, 1);
    assert.equal(ds[0]!.type, "inquiry_received");
    assert.equal(ds[0]!.actor_user_id, s.nguoi.dk1!.userId);
    assert.ok(ds[0]!.actor_roles.includes("buyer_agent"));
    assert.equal(doSo(JSON.stringify(ds[0]!.payload), so), 0, "sự kiện mang số");
    n++;
  }
  assert.equal(n, 2);
  const dem = async () => (await appPool.query<{ n: number }>("select count(*)::int n from prospect_events where company_id = $1", [s.companyId])).rows[0]!.n;
  const truoc = await dem();
  const r = await send("POST", "/api/v1/prospects", { displayName: "[Tên]", phone: soMoi(s), need: "purchase" }, ck(s, "dc1"));
  assert.equal(r.status, 403);
  assert.equal(await dem(), truoc, "lần bị 403 vẫn ghi sự kiện");
});

test("liên hệ khách: ai tạo được nhu cầu", async () => {
  assert.equal(doSo(JSON.stringify({ contactId: "x" }), []), 1, "đối chứng dương khoá cấm");
  const s = await sanMoi(MOT);
  const dung = () => ({ displayName: "[Tên]", phone: soMoi(s), need: "purchase" });
  // [dòng, người (null = không cookie), thân, mã]
  const BANG: [string, string | null, unknown, number][] = [
    ["đầu khách", "dk1", dung(), 201],
    ["đầu chủ", "dc1", dung(), 403],
    ["telesales", "ts", dung(), 403],
    ["trưởng nhóm không vai Đầu khách", "tn", dung(), 403],
    ["không cookie", null, dung(), 401],
    ["khoá lạ", "dk1", { ...dung(), ownerName: "x" }, 400],
    ["số sai khuôn", "dk1", { ...dung(), phone: "12345" }, 400],
  ];
  let so = 0;
  for (const [ten, k, than, ma] of BANG) {
    const r = await send("POST", "/api/v1/prospects", than, k ? ck(s, k) : "");
    const chu = await r.text();
    assert.equal(r.status, ma, `dòng «${ten}»: ${chu}`);
    if (ma === 201) assert.equal(doSo(chu, [(than as { phone: string }).phone]), 0, "thân 201 mang số hay khoá cấm");
    so++;
  }
  assert.equal(so, BANG.length);
});

// ---- AC-4 ----
test("liên hệ khách: một khách hai số", async () => {
  const s = await sanMoi(MOT);
  const [soA, soB, soC, soD] = [soMoi(s), soMoi(s), soMoi(s), soMoi(s)];
  const p1 = await taoNhuCau(s, "dk1", soA);
  const c1 = (await nhuCau(p1.id)).contact_id;
  const them = (k: string, so: string, p = p1.id) => send("POST", `/api/v1/prospects/${p}/phones`, { phone: so }, ck(s, k));
  const r = await them("dk1", soB);
  assert.equal(r.status, 201, await r.clone().text());
  assert.equal(await demSoCua(c1), 2);
  const truoc = await demLienHe(s);
  const p2 = await taoNhuCau(s, "dk2", soB);
  assert.equal((await nhuCau(p2.id)).contact_id, c1, "hai nhu cầu khác liên hệ");
  assert.equal(await demLienHe(s), truoc);
  // Liên hệ khác: một khách khác (số C), một chủ nhà (số D).
  const cKhac = (await nhuCau((await taoNhuCau(s, "dk2", soC)).id)).contact_id;
  const cChu = await lienHeChuCua(await hangCoChu(s, "dc1", maMoi(s), soD));
  const soKhac = [await demSoCua(cKhac), await demSoCua(cChu)];
  // [dòng, người, số, mã, số đếm của liên hệ sau]
  const BANG: [string, string, string, number, number][] = [
    ["thêm lại số B", "dk1", soB, 200, 2],
    ["số C của liên hệ khách khác", "dk1", soC, 409, 2],
    ["số D của liên hệ chủ nhà", "dk1", soD, 409, 2],
    ["đầu khách 2 thêm vào nhu cầu của đầu khách 1", "dk2", soMoi(s), 404, 2],
  ];
  const than409: unknown[] = [];
  let so = 0;
  for (const [ten, k, x, ma, dem] of BANG) {
    const res = await them(k, x);
    const chu = await res.text();
    assert.deepEqual([res.status, await demSoCua(c1)], [ma, dem], `dòng «${ten}»: ${chu}`);
    if (ma === 409) {
      assert.ok(!chu.includes("contactId"), `dòng «${ten}» nêu liên hệ`);
      than409.push(JSON.parse(chu));
    }
    so++;
  }
  assert.equal(so, 4);
  assert.deepEqual(than409[0], than409[1], "hai lời 409 khác nhau — dò được số chủ");
  assert.deepEqual([await demSoCua(cKhac), await demSoCua(cChu)], soKhac, "liên hệ khác bị đổi");
});

// ---- AC-5 ----
test("liên hệ khách: hai Lần gửi một người", async () => {
  const s = await sanMoi(MOT);
  const [soA, soB] = [soMoi(s), soMoi(s)];
  const pA = await taoNhuCau(s, "dk1", soA);
  assert.equal((await send("POST", `/api/v1/prospects/${pA.id}/phones`, { phone: soB }, ck(s, "dk1"))).status, 201);
  const pB = await taoNhuCau(s, "dk1", soB);
  const [l1, l2] = [await hangLenBang(s), await hangLenBang(s)];
  const g = async (body: unknown) => {
    const r = await gui(s, "dk1", body);
    assert.equal(r.status, 201, await r.clone().text());
    return (await r.json()) as { id: string; code: string; senderUserId: string };
  };
  const s1 = await g({ audience: "client", prospectId: pA.id, listingIds: [l1] });
  const s2 = await g({ audience: "client", prospectId: pB.id, listingIds: [l2, l1] });
  const nguoi = (
    await appPool.query<{ contact_id: string; sender_user_id: string }>(
      "select p.contact_id, s.sender_user_id from shares s join prospects p on p.id = s.prospect_id where s.id = any ($1) order by s.created_at",
      [[s1.id, s2.id]],
    )
  ).rows;
  assert.equal(nguoi.length, 2);
  assert.equal(nguoi[0]!.contact_id, nguoi[1]!.contact_id, "hai Lần gửi về hai người");
  assert.deepEqual(nguoi.map((r) => r.sender_user_id), [s.nguoi.dk1!.userId, s.nguoi.dk1!.userId]);
  for (const x of [s1, s2]) assert.match(x.code, /^[A-Za-z0-9_-]{12}$/);
  assert.notEqual(s1.code, s2.code);
  const s3 = await g({ audience: "client", prospectId: pA.id, listingIds: [l2] });
  const ds = (await (await send("GET", `/api/v1/prospects/${pA.id}/shares`, undefined, ck(s, "dk1"))).json()) as { code: string; listingIds: string[] }[];
  assert.deepEqual(ds.map((x) => x.code), [s3.code, s1.code], "thứ tự mới trước");
  const ag = await g({ audience: "agents", listingIds: [l1, l2] });
  assert.ok(ag.code);
});

test("liên hệ khách: Lần gửi bị từ chối", async () => {
  const s = await sanMoi(MOT);
  const s2 = await sanMoi(MOT);
  const l = await hangLenBang(s);
  const lKhac = await hangLenBang(s2);
  const pMinh = await taoNhuCau(s, "dk1", soMoi(s));
  const pDong = await taoNhuCau(s, "dk1", soMoi(s));
  assert.equal((await send("POST", `/api/v1/prospects/${pDong.id}/close`, undefined, ck(s, "dk1"))).status, 200);
  const pNguoiKhac = await taoNhuCau(s, "dk2", soMoi(s));
  const chiToiDauChu = await hangCoChu(s, "dc1", maMoi(s), soMoi(s));
  const chiToiMinh = await hangCoChu(s, "dkc", maMoi(s), soMoi(s));
  const KHONG_CO = "00000000-0000-4000-8000-0000000099ff";
  const nhieu = Array.from({ length: 31 }, (_, i) => `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`);
  const truoc = await demGui(s);
  // [dòng, người, thân, mã]
  const BANG: [string, string, unknown, number][] = [
    ["nhu cầu của đầu khách khác", "dk1", { audience: "client", prospectId: pNguoiKhac.id, listingIds: [l] }, 404],
    ["nhu cầu đã đóng", "dk1", { audience: "client", prospectId: pDong.id, listingIds: [l] }, 404],
    ["căn «Chỉ tôi» của đầu chủ", "dk1", { audience: "client", prospectId: pMinh.id, listingIds: [chiToiDauChu] }, 400],
    ["căn «Chỉ tôi» do chính người gửi tạo", "dkc", { audience: "agents", listingIds: [chiToiMinh] }, 400],
    ["căn của sàn khác", "dk1", { audience: "client", prospectId: pMinh.id, listingIds: [lKhac] }, 400],
    ["mã căn không có", "dk1", { audience: "client", prospectId: pMinh.id, listingIds: [KHONG_CO] }, 400],
    ["căn trùng", "dk1", { audience: "client", prospectId: pMinh.id, listingIds: [l, l] }, 400],
    ["31 căn", "dk1", { audience: "agents", listingIds: nhieu }, 400],
    ["khán giả lạ", "dk1", { audience: "group", listingIds: [l] }, 400],
    ["client thiếu nhu cầu", "dk1", { audience: "client", listingIds: [l] }, 400],
  ];
  let so = 0;
  for (const [ten, k, than, ma] of BANG) {
    const r = await gui(s, k, than);
    assert.equal(r.status, ma, `dòng «${ten}»: ${await r.text()}`);
    so++;
  }
  assert.equal(so, BANG.length);
  assert.equal(await demGui(s), truoc, "Lần gửi bị từ chối vẫn ghi");
  // Đối chứng dương: cùng căn, cùng nhu cầu, thân đúng thì được.
  assert.equal((await gui(s, "dk1", { audience: "client", prospectId: pMinh.id, listingIds: [l] })).status, 201);
});

// ---- AC-6 ----
test("liên hệ khách: ai thấy nhu cầu và Lần gửi qua API", async () => {
  const s = await sanMoi(MOT);
  const khac = await sanMoi({ dk: { vai: ["buyer_agent", "team_lead"] } });
  const p = await taoNhuCau(s, "dk1", soMoi(s));
  const l = await hangLenBang(s);
  assert.equal((await gui(s, "dk1", { audience: "client", prospectId: p.id, listingIds: [l] })).status, 201);
  // Đầu khách 1 gửi rồi trưởng nhóm chuyển khách sang đầu khách 2: đầu khách 1 thành người gửi không giữ nhu cầu.
  assert.equal((await send("PATCH", `/api/v1/prospects/${p.id}`, { ownerMemberUserId: s.nguoi.dk2!.userId }, ck(s, "tn"))).status, 200);
  // [dòng, cookie, mã GET nhu cầu, số Lần gửi]
  const BANG: [string, string, number, number][] = [
    ["đầu khách giữ", ck(s, "dk2"), 200, 1],
    ["trưởng nhóm", ck(s, "tn"), 200, 1],
    ["người gửi không giữ nhu cầu", ck(s, "dk1"), 404, 1],
    ["đầu khách khác", ck(s, "dk3"), 404, 0],
    ["đầu chủ", ck(s, "dc1"), 404, 0],
    ["telesales", ck(s, "ts"), 404, 0],
    ["quản trị", ck(s, "qt"), 404, 0],
    ["người sàn khác", khac.nguoi.dk!.cookie, 404, 0],
  ];
  let so = 0;
  for (const [ten, cookie, ma, n] of BANG) {
    const g = await send("GET", `/api/v1/prospects/${p.id}`, undefined, cookie);
    const ds = await send("GET", `/api/v1/prospects/${p.id}/shares`, undefined, cookie);
    assert.equal(ds.status, 200, `dòng «${ten}»`);
    assert.deepEqual([g.status, ((await ds.json()) as unknown[]).length], [ma, n], `dòng «${ten}»`);
    so++;
  }
  assert.equal(so, 8);
});

test("liên hệ khách: đầu khách không đọc liên hệ", async () => {
  const s = await sanMoi(MOT);
  const cKhach = (await nhuCau((await taoNhuCau(s, "dk1", soMoi(s))).id)).contact_id;
  const soChu = soMoi(s);
  const cChu = await lienHeChuCua(await hangCoChu(s, "dc1", maMoi(s), soChu));
  await taoNhuCau(s, "dk1", soChu);
  for (const c of [cKhach, cChu]) {
    assert.equal((await send("GET", `/api/v1/contacts/${c}`, undefined, ck(s, "dk1"))).status, 404, `đầu khách đọc được liên hệ ${c === cChu ? "vừa khách vừa chủ" : "chỉ khách"}`);
    assert.equal((await send("GET", `/api/v1/contacts/${c}`, undefined, ck(s, "tn"))).status, 200, "đối chứng: trưởng nhóm");
  }
});

// ---- AC-7 ----
test("liên hệ khách: đóng nhu cầu", async () => {
  const s = await sanMoi(MOT);
  const p = await taoNhuCau(s, "dk1", soMoi(s));
  const p2 = await taoNhuCau(s, "dk1", soMoi(s));
  const l = await hangLenBang(s);
  assert.equal((await gui(s, "dk1", { audience: "client", prospectId: p.id, listingIds: [l] })).status, 201);
  const dong = (k: string, id: string) => send("POST", `/api/v1/prospects/${id}/close`, undefined, ck(s, k));
  // [dòng, người, nhu cầu, mã]
  const BANG: [string, string, string, number][] = [
    ["đầu khách giữ đóng", "dk1", p.id, 200],
    ["đóng lại", "dk1", p.id, 409],
    ["đầu khách khác đóng", "dk2", p2.id, 404],
    ["đầu chủ đóng", "dc1", p2.id, 404],
    ["trưởng nhóm đóng nhu cầu khác", "tn", p2.id, 200],
  ];
  let so = 0;
  for (const [ten, k, id, ma] of BANG) {
    const r = await dong(k, id);
    assert.equal(r.status, ma, `dòng «${ten}»: ${await r.text()}`);
    so++;
  }
  assert.equal(so, BANG.length);
  assert.ok((await nhuCau(p.id)).closed_at, "chưa có mốc đóng");
  assert.deepEqual((await suKien(p.id)).map((e) => e.type), ["inquiry_received", "closed"]);
  const g = await send("GET", `/api/v1/prospects/${p.id}`, undefined, ck(s, "dk1"));
  assert.equal(g.status, 200);
  assert.ok(((await g.json()) as NhuCau).closedAt);
  assert.equal(((await (await send("GET", `/api/v1/prospects/${p.id}/shares`, undefined, ck(s, "dk1"))).json()) as unknown[]).length, 1, "Lần gửi cũ mất khi đóng");
});

test("liên hệ khách: đổi đầu khách giữ lịch sử", async () => {
  const s = await sanMoi(MOT);
  const p = await taoNhuCau(s, "dk1", soMoi(s));
  const l = await hangLenBang(s);
  const ma: string[] = [];
  for (let i = 0; i < 2; i++) {
    const r = await gui(s, "dk1", { audience: "client", prospectId: p.id, listingIds: [l] });
    ma.unshift(((await r.json()) as { code: string }).code);
  }
  const r = await send("PATCH", `/api/v1/prospects/${p.id}`, { ownerMemberUserId: s.nguoi.dk2!.userId }, ck(s, "tn"));
  assert.equal(r.status, 200, await r.clone().text());
  assert.equal((await send("GET", `/api/v1/prospects/${p.id}`, undefined, ck(s, "dk2"))).status, 200);
  const ds = (await (await send("GET", `/api/v1/prospects/${p.id}/shares`, undefined, ck(s, "dk2"))).json()) as { code: string; senderUserId: string }[];
  assert.deepEqual(ds.map((x) => x.code), ma, "đầu khách mới không thấy Lần gửi cũ");
  assert.deepEqual(ds.map((x) => x.senderUserId), [s.nguoi.dk1!.userId, s.nguoi.dk1!.userId], "người gửi bị đổi");
  const ev = (await suKien(p.id)).filter((e) => e.type === "reassigned");
  assert.equal(ev.length, 1);
  assert.deepEqual(ev[0]!.payload, { from: s.nguoi.dk1!.userId, to: s.nguoi.dk2!.userId });
  assert.equal((await send("GET", `/api/v1/prospects/${p.id}`, undefined, ck(s, "dk1"))).status, 404, "đầu khách cũ vẫn thấy nhu cầu");
  const cu = (await (await send("GET", `/api/v1/prospects/${p.id}/shares`, undefined, ck(s, "dk1"))).json()) as unknown[];
  assert.equal(cu.length, 2, "người gửi mất Lần gửi của mình");
  // [dòng, người, thân, mã]
  const BANG: [string, string, unknown, number][] = [
    ["đích là đầu chủ không vai Đầu khách", "tn", { ownerMemberUserId: s.nguoi.dc1!.userId }, 400],
    ["đầu khách tự đổi", "dk2", { ownerMemberUserId: s.nguoi.dk3!.userId }, 404],
    ["khoá lạ", "tn", { ownerMemberUserId: s.nguoi.dk3!.userId, note: "x" }, 400],
  ];
  let so = 0;
  for (const [ten, k, than, m] of BANG) {
    const res = await send("PATCH", `/api/v1/prospects/${p.id}`, than, ck(s, k));
    assert.equal(res.status, m, `dòng «${ten}»: ${await res.text()}`);
    so++;
  }
  assert.equal(so, 3);
  assert.equal((await nhuCau(p.id)).owner_member_user_id, s.nguoi.dk2!.userId);
});

// ---- AC-8 ----
test("liên hệ khách: chủ thành khách vẫn một người", async () => {
  const s = await sanMoi(MOT);
  const [soA, soB] = [soMoi(s), soMoi(s)];
  const c = await lienHeChuCua(await hangCoChu(s, "dc1", maMoi(s), soA));
  const doc = async () => {
    const r = await send("GET", `/api/v1/contacts/${c}`, undefined, ck(s, "dc1"));
    assert.equal(r.status, 200);
    return (await r.json()) as Record<string, unknown> & { contactTypes: string[]; ownerMemberUserId: string; phoneCount: number };
  };
  const truoc = await doc();
  assert.deepEqual(truoc.contactTypes, ["Seller"]);
  const p = await taoNhuCau(s, "dk1", soA);
  const sau = await doc();
  assert.deepEqual(sau.contactTypes, ["Seller", "Buyer"]);
  assert.equal(sau.ownerMemberUserId, s.nguoi.dc1!.userId);
  assert.equal(sau.phoneCount, truoc.phoneCount, "cùng số mà số lượng đổi");
  assert.deepEqual(Object.keys(sau).sort(), [...CONTACT_VIEW_KEYS].sort(), "bản xem của đầu chủ có khoá lạ");
  assert.ok(isOwnerContact(sau.contactTypes as never), "liên hệ thôi là lớp nguồn");
  assert.equal((await send("POST", `/api/v1/prospects/${p.id}/phones`, { phone: soB }, ck(s, "dk1"))).status, 201);
  const sau2 = await doc();
  assert.equal(sau2.phoneCount, truoc.phoneCount + 1);
  assert.deepEqual(Object.keys(sau2).sort(), [...CONTACT_VIEW_KEYS].sort());
});

test("liên hệ khách: khách thành chủ qua lead", async () => {
  const s = await sanMoi(MOT);
  const soK = soMoi(s);
  const p = await taoNhuCau(s, "dk1", soK);
  const c = (await nhuCau(p.id)).contact_id;
  const nc = async () => (await appPool.query("select contact_id, owner_member_user_id, display_name, need, criteria, closed_at from prospects where id = $1", [p.id])).rows[0];
  const truoc = [await demLienHe(s), await nc()] as const;
  const l = await nhap(s, nam(soK, "Toà A"));
  assert.equal(l.outcome, "new", "khách bị coi là chủ đã có đầu chủ");
  assert.equal(await demLienHe(s), truoc[0]);
  assert.deepEqual((await lienHe(c)).contact_types, ["Seller", "Buyer"]);
  assert.deepEqual(await nc(), truoc[1], "nhu cầu khách bị đổi");
});

test("liên hệ khách: giữ loại khách khi còn nhu cầu", async () => {
  const s = await sanMoi(MOT);
  const soA = soMoi(s);
  const c = await lienHeChuCua(await hangCoChu(s, "dc1", maMoi(s), soA));
  const p = await taoNhuCau(s, "dk1", soA);
  const bo = () => send("PATCH", `/api/v1/contacts/${c}`, { contactTypes: ["Seller"] }, ck(s, "tn"));
  // [dòng, bước trước, mã]
  const BANG: [string, () => Promise<unknown>, number][] = [
    ["bỏ Người mua khi nhu cầu Mua còn mở", async () => undefined, 400],
    ["đóng nhu cầu qua API rồi bỏ", async () => assert.equal((await send("POST", `/api/v1/prospects/${p.id}/close`, undefined, ck(s, "dk1"))).status, 200), 200],
  ];
  let so = 0;
  for (const [ten, truoc, ma] of BANG) {
    await truoc();
    const r = await bo();
    assert.equal(r.status, ma, `dòng «${ten}»: ${await r.text()}`);
    so++;
  }
  assert.equal(so, 2);
  assert.deepEqual((await lienHe(c)).contact_types, ["Seller"]);
});
