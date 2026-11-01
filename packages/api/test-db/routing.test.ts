// Chia lead và hạn qua API trên Postgres thật (hàng 25: AC-3..AC-12, ADR-0017). Người và lead lấy từ bộ mẫu của hàng 5
// (luật 4 của đợt); cấu hình của sàn đặt qua lối PUT thật; hàng và chủ nhà qua đường ghi thật. Đồng hồ của nhịp do bộ kiểm
// truyền (`runLeadTick(pool, now, sàn)`) — chỉ chạy sàn của ca, không chạm sàn của bộ kiểm khác chạy song song.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { DEFAULT_LEAD_ROUTING, ROUTING_STRATEGIES, type RoutingStrategyKey } from "@quy-hang/core/routing";
import { createApi } from "../src/app";
import { SAMPLE_PACK } from "../src/catalog/sample";
import { runLeadTick } from "../src/jobs/lead-tick";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const KHOA = `khoa-thu-nhip-${RUN}`;
const app = createApi({ appPool, identityPool, auth, jobSecret: KHOA });
const appKhongKhoa = createApi({ appPool, identityPool, auth });
type App = typeof app;
const send = (method: string, path: string, body?: unknown, cookie = "", a: App = app, them: Record<string, string> = {}) =>
  a.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}), ...them },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

// ---- Sàn thử: người theo bộ mẫu, khu tạo và giao qua lối người dùng ----
type Nguoi = { userId: string; cookie: string; ten: string };
type San = { companyId: string; nguoi: Record<string, Nguoi>; khu: Record<string, string>; so: number };
let soSan = 0;
async function sanMoi(vaiCan: Record<string, { vai: string[]; khu?: string[] }>): Promise<San> {
  const nhan = `cl${soSan++}`;
  const qtEmail = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} chia ${nhan}]`, qtEmail);
  const san: San = {
    companyId: s.companyId,
    nguoi: { qt: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}`, ten: qtEmail } },
    khu: {},
    so: 50,
  };
  for (const [k, { vai }] of Object.entries(vaiCan)) {
    const email = mail(`${nhan}-${k}`);
    const userId = await createLoneUser(email);
    await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, vai]);
    san.nguoi[k] = { userId, cookie: `${await login(email)}; qh_san=${s.companyId}`, ten: email };
  }
  for (const [k, { khu }] of Object.entries(vaiCan)) if (khu?.length) await giaoKhu(san, k, khu);
  return san;
}
async function giaoKhu(san: San, k: string, ten: string[]) {
  for (const t of ten) {
    if (san.khu[t]) continue;
    const r = await send("POST", "/api/v1/company/zones", { name: t }, san.nguoi.qt!.cookie);
    assert.equal(r.status, 201, await r.clone().text());
    san.khu[t] = ((await r.json()) as { id: string }).id;
  }
  const r = await send("PATCH", `/api/v1/company/members/${san.nguoi[k]!.userId}`, { zoneIds: ten.map((t) => san.khu[t]) }, san.nguoi.qt!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
}
const DC3 = {
  ts: { vai: ["telesales"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  dc2: { vai: ["listing_agent"], khu: ["Toà A", "Toà B"] },
  dc3: { vai: ["listing_agent"], khu: ["Toà B"] },
};
const DC2 = {
  ts: { vai: ["telesales"] },
  tn: { vai: ["team_lead"] },
  dc1: { vai: ["listing_agent"], khu: ["Toà A"] },
  dc2: { vai: ["listing_agent"], khu: ["Toà B"] },
};

// ---- Bộ mẫu hàng 5 ----
type LeadMau = { ma: string; soDienThoai: string; toa: string; maCan: string | null };
const PACK = SAMPLE_PACK as unknown as { lead: LeadMau[]; danhMuc: { subdivisions: { buildings: { buildingKey: string; buildingName: string }[] }[] } };
const TOA = Object.fromEntries(PACK.danhMuc.subdivisions.flatMap((p) => p.buildings.map((b) => [b.buildingKey, b.buildingName])));
const leadMau = (ma: string) => PACK.lead.find((l) => l.ma === ma)!;

const nam = (so: string, toa: string, can?: string) => ({
  ownerPhone: so,
  buildingName: toa,
  ...(can && { unitNumber: can }),
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
});
/** Số mẫu chưa dùng trong sàn (0900 000 050 trở đi). */
const soMoi = (san: San) => `0900 000 0${san.so++}`;
async function nhap(san: San, body: unknown, ai = "ts"): Promise<{ id: string; outcome: string }> {
  const r = await send("POST", "/api/v1/leads", body, san.nguoi[ai]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as { id: string; outcome: string };
}
const nhip = (now: Date, ...san: San[]) => runLeadTick(appPool, now, san.map((s) => s.companyId));
const sau = (t: Date, phut: number, giay = 0) => new Date(t.getTime() + phut * 60_000 + giay * 1000);
const dong = async (id: string) =>
  (
    await appPool.query(
      `select matched_agent_user_id, routed_at, routed_seq, accepted_at, first_called_at, reassign_count, routing_strategy,
              accept_minutes, created_at, outcome
       from leads where id = $1`,
      [id],
    )
  ).rows[0];
const baoCua = async (id: string) =>
  (await appPool.query<{ kind: string; deadline_from: Date }>("select kind, deadline_from from lead_alerts where lead_id = $1 order by raised_at, kind", [id]))
    .rows;
const ai = (san: San, userId: string | null) => (userId ? Object.entries(san.nguoi).find(([, n]) => n.userId === userId)?.[0] ?? userId : null);
async function datCauHinh(san: San, body: unknown) {
  const r = await send("PUT", "/api/v1/company/settings/lead-routing", body, san.nguoi.qt!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
}
async function nghi(san: San, k: string, onLeave: boolean, nguoiGoi = k) {
  const r = await send("PUT", `/api/v1/company/members/${san.nguoi[k]!.userId}/leave`, { onLeave }, san.nguoi[nguoiGoi]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
}
async function giao(san: San, leadId: string, k: string) {
  const r = await send("POST", `/api/v1/leads/${leadId}/assign`, { agentUserId: san.nguoi[k]!.userId }, san.nguoi.tn!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return (await r.json()) as { deadlineFrom: string };
}
/** Hàng của đầu chủ qua đường ghi thật, có chủ nhà mang số đã cho (hàng Incomplete — đang mở). */
async function hangCoChu(san: San, k: string, can: string, so: string) {
  const tao = await send("POST", "/api/v1/listings", { buildingName: "Toà A", unitNumber: can }, san.nguoi[k]!.cookie);
  assert.equal(tao.status, 201, await tao.clone().text());
  const { id } = (await tao.json()) as { id: string };
  const r = await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên]", ownerPhone: so }, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return id;
}

// ---- AC-3: mười lead của bộ mẫu ----
let e3: San;
test("chia: mười lead của bộ mẫu về đúng người, bỏ người nghỉ", async () => {
  e3 = await sanMoi(DC2);
  await giaoKhu(e3, "dc2", ["Toà B", "Toà A"]); // quản trị thêm Toà A cho đầu chủ 2 qua lối người dùng
  const id: Record<string, string> = {};
  const nhapMa = async (ma: string) => {
    const l = leadMau(ma);
    const k = await nhap(e3, nam(l.soDienThoai, TOA[l.toa]!, l.maCan ?? undefined));
    assert.equal(k.outcome, "new", ma);
    id[ma] = k.id;
  };
  for (const ma of ["L-03", "L-04", "L-05", "L-06", "L-07", "L-08", "L-09"]) await nhapMa(ma);
  const t1 = new Date();
  await nhip(t1, e3);
  await nghi(e3, "dc1", true);
  for (const ma of ["L-10", "L-11", "L-12"]) await nhapMa(ma);
  const t2 = new Date();
  await nhip(t2, e3);
  const ra: Record<string, string | null> = {};
  for (const [ma, lid] of Object.entries(id)) {
    const d = await dong(lid);
    ra[ma] = ai(e3, d.matched_agent_user_id);
    assert.equal(d.routing_strategy, "zone_round_robin", ma);
    assert.equal((d.routed_at as Date).getTime(), (["L-10", "L-11", "L-12"].includes(ma) ? t2 : t1).getTime(), `${ma}: không chia ở nhịp ngay sau lúc nhập`);
  }
  assert.deepEqual(ra, {
    "L-03": "dc1", "L-04": "dc2", "L-05": "dc2", "L-06": "dc1", "L-07": "dc2", "L-08": "dc1", "L-09": "dc2",
    "L-10": "dc2", "L-11": "dc2", "L-12": "dc2",
  });
});

test("chia: đi làm lại thì nhận tiếp", async () => {
  await nghi(e3, "dc1", false);
  const k = await nhap(e3, nam(soMoi(e3), "Toà A"));
  await nhip(new Date(), e3);
  assert.equal(ai(e3, (await dong(k.id)).matched_agent_user_id), "dc1");
});

// ---- AC-4: không ai nhận được ----
let e4: San;
let e4Lead: string;
test("chưa chia được: lead chờ và trưởng nhóm được báo một lần", async () => {
  e4 = await sanMoi(DC2);
  await nghi(e4, "dc2", true, "tn");
  e4Lead = (await nhap(e4, nam(soMoi(e4), "Toà B"))).id;
  const t = new Date();
  for (const i of [0, 1, 2]) await nhip(sau(t, i), e4);
  assert.equal((await dong(e4Lead)).matched_agent_user_id, null);
  assert.deepEqual((await baoCua(e4Lead)).map((b) => b.kind), ["unrouted"]);
  const ds = (await (await send("GET", "/api/v1/lead-alerts", undefined, e4.nguoi.tn!.cookie)).json()) as { leadId: string; kind: string; agentName: string | null }[];
  const dongBao = ds.find((d) => d.leadId === e4Lead);
  assert.deepEqual(dongBao && { kind: dongBao.kind, agentName: dongBao.agentName }, { kind: "unrouted", agentName: null });
});

test("chưa chia được: toà không ai phụ trách", async () => {
  const s = await sanMoi({ ts: { vai: ["telesales"] }, dc1: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const l = (await nhap(s, nam(soMoi(s), "Toà B"))).id;
  await nhip(new Date(), s);
  await nhip(sau(new Date(), 1), s);
  assert.deepEqual((await baoCua(l)).map((b) => b.kind), ["unrouted"]);
});

test("chưa chia được: người về thì nhịp kế chia", async () => {
  await nghi(e4, "dc2", false);
  await nhip(sau(new Date(), 3), e4);
  assert.equal(ai(e4, (await dong(e4Lead)).matched_agent_user_id), "dc2");
});

test("chưa chia được: sàn chia tay", async () => {
  const s = await sanMoi(DC2);
  await datCauHinh(s, { strategy: "manual" });
  const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t = new Date();
  await nhip(t, s);
  assert.equal((await dong(l)).matched_agent_user_id, null, "sàn chia tay mà máy vẫn chia");
  assert.deepEqual((await baoCua(l)).map((b) => b.kind), ["unrouted"]);
  for (const i of [1, 2, 3]) await nhip(sau(t, i), s);
  assert.equal((await baoCua(l)).length, 1);
});

test("chưa chia được: kho chung báo khi đủ hạn nhận", async () => {
  const s = await sanMoi(DC2);
  await datCauHinh(s, { strategy: "open_pool" });
  const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const c = (await dong(l)).created_at as Date;
  await nhip(sau(c, 14, 59), s);
  assert.deepEqual(await baoCua(l), [], "kho chung báo trước hạn nhận");
  await nhip(sau(c, 15), s);
  await nhip(sau(c, 15, 30), s);
  assert.deepEqual((await baoCua(l)).map((b) => b.kind), ["unrouted"]);
});

// ---- AC-5: hạn ----
const kinds = async (id: string) => (await baoCua(id)).map((b) => b.kind).sort();
test("hạn: báo đúng nhịp và một lần", async () => {
  const s = await sanMoi(DC2);
  const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t = new Date();
  await nhip(t, s);
  await nhip(sau(t, 14, 59), s);
  assert.deepEqual(await kinds(l), []);
  await nhip(sau(t, 15), s);
  assert.deepEqual(await kinds(l), ["accept_overdue"]);
  await nhip(sau(t, 29, 59), s);
  assert.deepEqual(await kinds(l), ["accept_overdue"]);
  await nhip(sau(t, 30), s);
  await nhip(sau(t, 30), s);
  assert.deepEqual(await kinds(l), ["accept_overdue", "first_call_overdue"]);
  for (const b of await baoCua(l)) assert.equal(b.deadline_from.getTime(), t.getTime());
});

test("hạn: đã nhận, đã gọi thì không báo", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const x = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const y = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t = new Date();
  await nhip(t, s);
  const nguoiX = ai(s, (await dong(x)).matched_agent_user_id)!;
  const nguoiY = ai(s, (await dong(y)).matched_agent_user_id)!;
  assert.equal((await send("POST", `/api/v1/leads/${x}/accept`, undefined, s.nguoi[nguoiX]!.cookie)).status, 200);
  assert.equal((await send("POST", `/api/v1/leads/${y}/first-call`, undefined, s.nguoi[nguoiY]!.cookie)).status, 200);
  await nhip(sau(t, 15), s);
  assert.deepEqual(await kinds(x), []);
  await nhip(sau(t, 30), s);
  assert.deepEqual(await kinds(x), ["first_call_overdue"]);
  assert.deepEqual(await kinds(y), []);
});

test("hạn: lead chủ trùng tính từ lúc nhập", async () => {
  const s = await sanMoi(DC2);
  const so = soMoi(s);
  await hangCoChu(s, "dc1", "A-02.03", so);
  const k = await nhap(s, nam(so, "Toà A"));
  assert.equal(k.outcome, "owner_has_agent");
  const d = await dong(k.id);
  assert.equal(ai(s, d.matched_agent_user_id), "dc1");
  const c = d.created_at as Date;
  await nhip(sau(c, 14, 59), s);
  assert.deepEqual(await kinds(k.id), []);
  await nhip(sau(c, 15), s);
  assert.deepEqual(await kinds(k.id), ["accept_overdue"]);
  assert.equal((await baoCua(k.id))[0]!.deadline_from.getTime(), c.getTime());
  assert.equal((await dong(k.id)).routed_at, null, "lead chủ trùng bị chia lại");
});

test("hạn: lead căn trùng không tính", async () => {
  const s = await sanMoi(DC2);
  await hangCoChu(s, "dc1", "A-03.04", soMoi(s));
  const u1 = await nhap(s, nam(soMoi(s), "Toà A", "A-03.04"));
  const u2 = await nhap(s, nam(soMoi(s), "Toà A", "A-03.04"));
  assert.deepEqual([u1.outcome, u2.outcome], ["unit_has_open_listing", "unit_has_open_listing"]);
  assert.equal((await send("POST", `/api/v1/leads/${u2.id}/discard`, undefined, s.nguoi.ts!.cookie)).status, 200);
  const doiChung = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t = new Date();
  await nhip(t, s);
  await nhip(sau(t, 15), s);
  await nhip(sau(t, 30), s);
  assert.deepEqual(await kinds(u1.id), []);
  assert.deepEqual(await kinds(u2.id), []);
  assert.deepEqual(await kinds(doiChung), ["accept_overdue", "first_call_overdue"], "đối chứng không có lời báo");
});

test("báo: người đọc theo cấu hình", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"] } });
  await nhap(s, nam(soMoi(s), "Toà B"));
  await nhip(new Date(), s);
  const doc = (k: string) => send("GET", "/api/v1/lead-alerts", undefined, s.nguoi[k]!.cookie);
  const r403 = await doc("qt");
  assert.equal(r403.status, 403);
  assert.equal(((await r403.json()) as { error: string }).error, "alert-reader-required");
  await datCauHinh(s, { alertTo: "team_lead_and_admin" });
  const qt = await doc("qt");
  assert.equal(qt.status, 200);
  const tn = await (await doc("tn")).json();
  const dsQt = (await qt.json()) as unknown[];
  assert.ok(dsQt.length > 0);
  assert.deepEqual(dsQt, tn);
  for (const k of ["dc1", "ts"]) assert.equal((await doc(k)).status, 403, k);
});

// ---- AC-6: nhận, gọi, kho chung, nghỉ ----
test("nhận và gọi: chỉ đầu chủ của lead", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const l1 = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const l2 = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  await nhip(new Date(), s);
  assert.deepEqual([ai(s, (await dong(l1)).matched_agent_user_id), ai(s, (await dong(l2)).matched_agent_user_id)], ["dc1", "dc2"]);
  const goi = (id: string, duoi: string, k?: string) => send("POST", `/api/v1/leads/${id}/${duoi}`, undefined, k ? s.nguoi[k]!.cookie : "");
  const bang: [string, string, string | undefined, number][] = [
    [l1, "accept", "dc2", 404],
    [l1, "accept", "tn", 404],
    [l1, "accept", "ts", 404],
    [l1, "accept", undefined, 401],
    [l1, "accept", "dc1", 200],
    [l1, "accept", "dc1", 409],
    [l2, "first-call", "dc1", 404],
    [l2, "first-call", "dc2", 200],
    [l2, "first-call", "dc2", 409],
  ];
  let so = 0;
  for (const [id, duoi, k, ma] of bang) {
    assert.equal((await goi(id, duoi, k)).status, ma, `${duoi} ${k ?? "không cookie"}`);
    so++;
  }
  assert.equal(so, bang.length);
  const d2 = await dong(l2);
  assert.ok(d2.accepted_at && d2.first_called_at, "ghi gọi khi chưa nhận mà không ghi mốc nhận");
});

test("kho chung: đầu chủ tự nhận", async () => {
  const s = await sanMoi(DC3);
  const lz = (await nhap(s, nam(soMoi(s), "Toà A"))).id; // lead đóng dấu theo khu trước khi đổi
  await nhip(new Date(), s);
  await datCauHinh(s, { strategy: "open_pool" });
  const la = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const lb = (await nhap(s, nam(soMoi(s), "Toà B"))).id;
  await nhip(new Date(), s);
  const kho = async (k: string) => send("GET", "/api/v1/lead-pool", undefined, s.nguoi[k]!.cookie);
  const ids = async (k: string) => ((await (await kho(k)).json()) as { id: string }[]).map((x) => x.id);
  assert.deepEqual(await ids("dc1"), [la]);
  assert.deepEqual(await ids("dc3"), [lb]);
  assert.deepEqual(await ids("dc2"), [la, lb]);
  const mot = ((await (await kho("dc2")).json()) as Record<string, unknown>[])[0]!;
  assert.deepEqual(Object.keys(mot).sort(), ["buildingName", "createdAt", "id", "need", "unitNumber"]);
  assert.equal((await kho("ts")).status, 403);
  const nhan = (id: string, k: string) => send("POST", `/api/v1/leads/${id}/claim`, undefined, s.nguoi[k]!.cookie);
  assert.equal((await nhan(la, "dc3")).status, 404, "đầu chủ toà khác nhận được lead kho chung");
  assert.equal((await nhan(lb, "dc2")).status, 200);
  const d = await dong(lb);
  assert.equal(ai(s, d.matched_agent_user_id), "dc2");
  assert.ok(d.routed_at && d.accepted_at);
  assert.deepEqual(await ids("dc3"), []);
  assert.equal((await nhan(lb, "dc3")).status, 409);
  await nghi(s, "dc1", true);
  assert.equal((await nhan(la, "dc1")).status, 403, "người nghỉ nhận được");
  assert.equal((await nhan(la, "ts")).status, 403);
  assert.equal((await nhan(lz, "dc2")).status, 404, "lead của cách chia theo khu nhận được như kho chung");
  await nhip(sau(d.routed_at as Date, 30), s);
  assert.deepEqual(await kinds(lb), ["first_call_overdue"]);
});

test("nghỉ: ai đánh dấu được", async () => {
  const s = await sanMoi({ ...DC2 });
  const ngoai = await createLoneUser(mail("cl-ngoai"));
  const bang: [string | undefined, string, number][] = [
    ["dc1", s.nguoi.dc1!.userId, 200],
    ["tn", s.nguoi.dc1!.userId, 200],
    ["qt", s.nguoi.dc1!.userId, 200],
    ["dc2", s.nguoi.dc1!.userId, 403],
    ["ts", s.nguoi.dc1!.userId, 403],
    ["tn", ngoai, 404],
    [undefined, s.nguoi.dc1!.userId, 401],
  ];
  let so = 0;
  for (const [k, dich, ma] of bang) {
    const r = await send("PUT", `/api/v1/company/members/${dich}/leave`, { onLeave: so % 2 === 0 }, k ? s.nguoi[k]!.cookie : "");
    assert.equal(r.status, ma, `${k ?? "không cookie"}`);
    if (ma === 200) {
      const d = (await appPool.query("select on_leave, changed_by from member_availability where company_id = $1 and user_id = $2", [s.companyId, dich])).rows[0];
      assert.deepEqual(d, { on_leave: so % 2 === 0, changed_by: s.nguoi[k!]!.userId });
    }
    so++;
  }
  assert.equal(so, bang.length);
});

// ---- AC-7: trưởng nhóm ----
test("trưởng nhóm: danh sách báo", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"] } });
  const l1 = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t = new Date();
  await nhip(t, s);
  const l2 = (await nhap(s, nam(soMoi(s), "Toà B"))).id;
  await nhip(sau(t, 1), s);
  await nhip(sau(t, 15), s);
  const r = await send("GET", "/api/v1/lead-alerts", undefined, s.nguoi.tn!.cookie);
  assert.equal(r.status, 200);
  const ds = (await r.json()) as Record<string, unknown>[];
  assert.deepEqual(
    ds.map((d) => [d.leadId, d.kind, d.buildingName, d.agentName]),
    [
      [l1, "accept_overdue", "Toà A", s.nguoi.dc1!.ten],
      [l2, "unrouted", "Toà B", null],
    ],
  );
  for (const d of ds) for (const k of ["unitNumber", "raisedAt", "deadlineFrom"]) assert.ok(k in d, k);
  for (const k of ["dc1", "ts"]) assert.equal((await send("GET", "/api/v1/lead-alerts", undefined, s.nguoi[k]!.cookie)).status, 403, k);
});

test("trưởng nhóm: giao lại đặt hạn mới", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t = new Date();
  await nhip(t, s);
  assert.equal(ai(s, (await dong(l)).matched_agent_user_id), "dc1");
  await nhip(sau(t, 15), s);
  // Đầu chủ cũ nhận muộn rồi lead bị giao lại: mốc nhận của người cũ phải xoá để người mới có hạn nhận riêng.
  assert.equal((await send("POST", `/api/v1/leads/${l}/accept`, undefined, s.nguoi.dc1!.cookie)).status, 200);
  await giao(s, l, "dc2");
  const d = await dong(l);
  assert.equal(ai(s, d.matched_agent_user_id), "dc2");
  assert.notEqual((d.routed_at as Date).getTime(), t.getTime());
  assert.deepEqual([d.accepted_at, d.first_called_at, d.reassign_count], [null, null, 1]);
  await nhip(sau(d.routed_at as Date, 15), s);
  const moi = (await baoCua(l)).filter((b) => b.kind === "accept_overdue").map((b) => b.deadline_from.getTime());
  assert.deepEqual(moi, [t.getTime(), (d.routed_at as Date).getTime()]);
  await giao(s, l, "dc1");
  assert.equal((await dong(l)).reassign_count, 2);
});

test("trưởng nhóm: chia tay lead chờ chia", async () => {
  const s = await sanMoi(DC2);
  await nghi(s, "dc2", true);
  const l = (await nhap(s, nam(soMoi(s), "Toà B"))).id;
  await nhip(new Date(), s);
  assert.equal((await dong(l)).matched_agent_user_id, null);
  await giao(s, l, "dc1");
  const d = await dong(l);
  assert.equal(ai(s, d.matched_agent_user_id), "dc1");
  assert.ok(d.routed_at && d.routed_seq !== null);
  assert.equal(d.reassign_count, 0);
  await nhip(sau(d.routed_at as Date, 15), s);
  assert.ok((await kinds(l)).includes("accept_overdue"));
});

test("trưởng nhóm: chia tay lead của sàn chia tay và kho chung", async () => {
  const s = await sanMoi(DC2);
  let so = 0;
  for (const strategy of ["manual", "open_pool"]) {
    await datCauHinh(s, { strategy });
    const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
    await nhip(new Date(), s);
    assert.equal((await dong(l)).matched_agent_user_id, null, strategy);
    await giao(s, l, "dc1");
    const d = await dong(l);
    assert.deepEqual([ai(s, d.matched_agent_user_id), d.routing_strategy, d.reassign_count], ["dc1", strategy, 0]);
    so++;
  }
  assert.equal(so, 2);
});

test("trưởng nhóm: giao lại lead chủ trùng", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const so = soMoi(s);
  await hangCoChu(s, "dc1", "A-04.05", so);
  await nghi(s, "dc1", true);
  const k = await nhap(s, nam(so, "Toà A"));
  assert.deepEqual([k.outcome, ai(s, (await dong(k.id)).matched_agent_user_id)], ["owner_has_agent", "dc1"]);
  const { deadlineFrom } = await giao(s, k.id, "dc2");
  const d = await dong(k.id);
  assert.deepEqual([ai(s, d.matched_agent_user_id), d.reassign_count], ["dc2", 1]);
  await nhip(sau(new Date(deadlineFrom), 15), s);
  assert.deepEqual((await baoCua(k.id)).map((b) => [b.kind, b.deadline_from.toISOString()]), [["accept_overdue", deadlineFrom]]);
  const ts = await send("POST", `/api/v1/leads/${k.id}/assign`, { agentUserId: s.nguoi.ts!.userId }, s.nguoi.tn!.cookie);
  assert.deepEqual([ts.status, ((await ts.json()) as { error: string }).error], [400, "not-a-listing-agent"]);
  await hangCoChu(s, "dc2", "A-04.06", soMoi(s));
  const can = await nhap(s, nam(soMoi(s), "Toà A", "A-04.06"));
  assert.equal(can.outcome, "unit_has_open_listing");
  const r = await send("POST", `/api/v1/leads/${can.id}/assign`, { agentUserId: s.nguoi.dc2!.userId }, s.nguoi.tn!.cookie);
  assert.deepEqual([r.status, ((await r.json()) as { error: string }).error], [400, "lead-not-assignable"]);
  const dc = await send("POST", `/api/v1/leads/${k.id}/assign`, { agentUserId: s.nguoi.dc1!.userId }, s.nguoi.dc2!.cookie);
  assert.equal(dc.status, 403);
});

// ---- AC-8: lối việc nền ----
test("nhịp: khoá của lối việc nền", async () => {
  const goi = (a: App, them: Record<string, string>) => send("POST", "/api/v1/jobs/lead-tick", undefined, "", a, them);
  assert.equal((await goi(app, {})).status, 401);
  assert.equal((await goi(app, { authorization: "Bearer sai" })).status, 401);
  assert.equal((await goi(appKhongKhoa, { authorization: `Bearer ${KHOA}` })).status, 503);
  const r = await goi(app, { authorization: `Bearer ${KHOA}` });
  assert.equal(r.status, 200);
  const b = (await r.json()) as Record<string, unknown>;
  for (const k of ["routed", "alerts"]) assert.equal(typeof b[k], "number", k);
});

test("nhịp: hai nhịp cùng lúc không chia hai lần", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"], khu: ["Toà A"] } });
  const ids: string[] = [];
  for (let i = 0; i < 5; i++) ids.push((await nhap(s, nam(soMoi(s), "Toà A"))).id);
  const t = new Date();
  const [a, b] = await Promise.all([nhip(t, s), nhip(t, s)]);
  for (const id of ids) assert.notEqual((await dong(id)).matched_agent_user_id, null, id);
  assert.equal(a.routed + b.routed, 5);
  // Lời gọi chia muộn trên lead đã có người (như nhịp thứ hai đọc hàng chờ trước khi nhịp đầu ghi): không đổi người nhận.
  const daCo = await dong(ids[0]!);
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', '', true), set_config('app.company_id', $1, true)", [s.companyId]);
    const khac = [s.nguoi.dc1!.userId, s.nguoi.dc2!.userId].find((u) => u !== daCo.matched_agent_user_id);
    assert.equal((await c.query("select app.route_lead($1, $2, now()) v", [ids[0], khac])).rows[0].v, false, "lead đã có người bị chia lần hai");
    await c.query("commit");
  } finally {
    c.release();
  }
  assert.equal((await dong(ids[0]!)).matched_agent_user_id, daCo.matched_agent_user_id);
  await Promise.all([nhip(sau(t, 30), s), nhip(sau(t, 30), s)]);
  const trung = await appPool.query(
    "select lead_id, kind, deadline_from, count(*) from lead_alerts where company_id = $1 group by 1, 2, 3 having count(*) > 1",
    [s.companyId],
  );
  assert.equal(trung.rowCount, 0);
  assert.equal((await appPool.query("select 1 from lead_alerts where company_id = $1", [s.companyId])).rowCount, 10);
});

// ---- AC-9: cách ly và giữ số ----
test("cách ly: người của B không chạm lead của A", async () => {
  const A = await sanMoi(DC2);
  const B = await sanMoi(DC2);
  const l = (await nhap(A, nam(soMoi(A), "Toà A"))).id;
  await nhip(new Date(), A);
  const truoc = await dong(l);
  // Mỗi lối do người của B có đúng vai của lối ấy gọi, để 404 là vì không thấy lead của A chứ không vì thiếu vai.
  const bang: [string, string, unknown, string[]][] = [
    ["POST", `/api/v1/leads/${l}/accept`, undefined, ["dc1", "tn"]],
    ["POST", `/api/v1/leads/${l}/first-call`, undefined, ["dc1", "tn"]],
    ["POST", `/api/v1/leads/${l}/claim`, undefined, ["dc1"]],
    ["POST", `/api/v1/leads/${l}/assign`, { agentUserId: B.nguoi.dc1!.userId }, ["tn"]],
    ["PUT", `/api/v1/company/members/${A.nguoi.dc1!.userId}/leave`, { onLeave: true }, ["dc1", "tn", "qt"]],
  ];
  let so = 0;
  for (const [m, p, body, nguoiGoi] of bang) {
    for (const k of nguoiGoi) assert.equal((await send(m, p, body, B.nguoi[k]!.cookie)).status, 404, `${p} bởi ${k} của B`);
    so++;
  }
  assert.equal(so, bang.length);
  assert.deepEqual(await dong(l), truoc);
  assert.equal((await appPool.query("select 1 from member_availability where company_id = $1", [A.companyId])).rowCount, 0);
});

test("cách ly: cấu hình của B không đổi cách chia của A", async () => {
  const A = await sanMoi(DC2);
  const B = await sanMoi(DC2);
  await datCauHinh(B, { strategy: "manual" });
  const la = (await nhap(A, nam(soMoi(A), "Toà A"))).id;
  const lb = (await nhap(B, nam(soMoi(B), "Toà A"))).id;
  await nhip(new Date(), A, B);
  assert.equal(ai(A, (await dong(la)).matched_agent_user_id), "dc1");
  assert.equal((await dong(lb)).matched_agent_user_id, null);
  assert.equal((await dong(la)).routing_strategy, DEFAULT_LEAD_ROUTING.strategy);
});

test("rò: không số chủ", async () => {
  const R = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"] } });
  const P = await sanMoi(DC2);
  await datCauHinh(P, { strategy: "open_pool" });
  const so = [soMoi(R), soMoi(R), soMoi(P)];
  await nhap(R, nam(so[0]!, "Toà A"));
  await nhap(R, nam(so[1]!, "Toà B"));
  await nhap(P, nam(so[2]!, "Toà A"));
  const kq = await nhip(new Date(), R, P);
  assert.ok(kq.routed > 0, "đối chứng: nhịp không chia lead nào");
  const bao = await (await send("GET", "/api/v1/lead-alerts", undefined, R.nguoi.tn!.cookie)).text();
  const kho = await (await send("GET", "/api/v1/lead-pool", undefined, P.nguoi.dc1!.cookie)).text();
  assert.ok((JSON.parse(bao) as unknown[]).length > 0, "đối chứng: không có lời báo");
  assert.ok((JSON.parse(kho) as unknown[]).length > 0, "đối chứng: kho chung rỗng");
  for (const than of [bao, kho, JSON.stringify(kq)]) {
    const chuSo = than.replace(/\D/g, "");
    for (const s of so) assert.ok(!chuSo.includes(s.replace(/\D/g, "")), `lộ số ${s}`);
  }
});

// ---- AC-10: cùng số ----
test("cùng số: sau nhịp thành chủ trùng", async () => {
  const s = await sanMoi(DC2);
  const l = leadMau("L-04");
  const a = await nhap(s, nam(l.soDienThoai, "Toà A"));
  await nhip(new Date(), s);
  assert.equal(ai(s, (await dong(a.id)).matched_agent_user_id), "dc1");
  const b = await nhap(s, nam(l.soDienThoai, "Toà B"));
  assert.deepEqual([b.outcome, ai(s, (await dong(b.id)).matched_agent_user_id)], ["owner_has_agent", "dc1"]);
});

test("cùng số: cùng nhịp về cùng người dưới mọi cách chia", async () => {
  let so = 0;
  for (const strategy of ROUTING_STRATEGIES) {
    const s = await sanMoi(DC2);
    await datCauHinh(s, { strategy });
    const p = soMoi(s);
    const l0 = (await nhap(s, nam(p, "Toà A"))).id;
    const la = await nhap(s, nam(p, "Toà A"));
    const lb = await nhap(s, nam(p, "Toà B"));
    assert.deepEqual([la.outcome, lb.outcome], ["new", "new"], strategy);
    await giao(s, l0, "dc1");
    await nhip(new Date(), s);
    assert.deepEqual([ai(s, (await dong(la.id)).matched_agent_user_id), ai(s, (await dong(lb.id)).matched_agent_user_id)], ["dc1", "dc1"], strategy);
    so++;
  }
  assert.equal(so, ROUTING_STRATEGIES.length);
});

test("cùng số: hai lead mới cùng nhịp về cùng người", async () => {
  const s = await sanMoi(DC2);
  const p = soMoi(s);
  const a = (await nhap(s, nam(p, "Toà A"))).id;
  const b = (await nhap(s, nam(p, "Toà B"))).id;
  await nhip(new Date(), s);
  assert.deepEqual([ai(s, (await dong(a)).matched_agent_user_id), ai(s, (await dong(b)).matched_agent_user_id)], ["dc1", "dc1"]);
});

test("cùng số: người cũ nghỉ thì đi theo cách chia", async () => {
  const s = await sanMoi(DC2);
  const p = soMoi(s);
  const l0 = (await nhap(s, nam(p, "Toà A"))).id;
  const lx = (await nhap(s, nam(p, "Toà B"))).id;
  await giao(s, l0, "dc1");
  await nghi(s, "dc1", true);
  await nhip(new Date(), s);
  assert.equal(ai(s, (await dong(lx)).matched_agent_user_id), "dc2");
});

test("cùng số: nhập sau nhịp khi người cũ nghỉ", async () => {
  const s = await sanMoi(DC2);
  const p = soMoi(s);
  const l0 = (await nhap(s, nam(p, "Toà A"))).id;
  await nhip(new Date(), s);
  assert.equal(ai(s, (await dong(l0)).matched_agent_user_id), "dc1");
  await nghi(s, "dc1", true);
  const k = await nhap(s, nam(p, "Toà B"));
  assert.deepEqual([k.outcome, ai(s, (await dong(k.id)).matched_agent_user_id)], ["owner_has_agent", "dc1"]);
  await giao(s, k.id, "dc2");
  assert.equal(ai(s, (await dong(k.id)).matched_agent_user_id), "dc2");
});

// ---- AC-11: cấu hình của sàn ----
const docCauHinh = (s: San, k = "qt") => send("GET", "/api/v1/company/settings/lead-routing", undefined, s.nguoi[k]!.cookie);
const dongCauHinh = async (s: San) =>
  (await appPool.query("select key, value, updated_by from company_settings where company_id = $1 order by key", [s.companyId])).rows;

test("cấu hình: mặc định khi sàn chưa đặt", async () => {
  const s = await sanMoi(DC2);
  const r = await docCauHinh(s);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), DEFAULT_LEAD_ROUTING);
  assert.deepEqual(await dongCauHinh(s), []);
});

test("cấu hình: quản trị đổi, vai khác chỉ đọc", async () => {
  const s = await sanMoi(DC2);
  await datCauHinh(s, { strategy: "zone_least_open", acceptMinutes: 5, firstCallMinutes: 10 });
  const moi = { ...DEFAULT_LEAD_ROUTING, strategy: "zone_least_open", acceptMinutes: 5, firstCallMinutes: 10 };
  assert.deepEqual(await (await docCauHinh(s)).json(), moi);
  const luu = await dongCauHinh(s);
  assert.deepEqual(luu, [
    { key: "lead_routing.accept_minutes", value: 5, updated_by: s.nguoi.qt!.userId },
    { key: "lead_routing.first_call_minutes", value: 10, updated_by: s.nguoi.qt!.userId },
    { key: "lead_routing.strategy", value: "zone_least_open", updated_by: s.nguoi.qt!.userId },
  ]);
  for (const k of ["tn", "dc1", "ts"]) {
    assert.deepEqual(await (await docCauHinh(s, k)).json(), moi, k);
    assert.equal((await send("PUT", "/api/v1/company/settings/lead-routing", { strategy: "manual" }, s.nguoi[k]!.cookie)).status, 403, k);
  }
  const sai: [unknown, RegExp][] = [
    [{ strategy: "manual", rule: 1 }, /khoá lạ/],
    [{ strategy: "script" }, /thực đơn/],
    [{ acceptMinutes: 0 }, /số phút nguyên/],
    [{ acceptMinutes: 20 }, /hạn gọi ngắn hơn hạn nhận/],
    [{ firstCallMinutes: 4 }, /hạn gọi ngắn hơn hạn nhận/],
  ];
  let so = 0;
  for (const [body, ly] of sai) {
    const r = await send("PUT", "/api/v1/company/settings/lead-routing", body, s.nguoi.qt!.cookie);
    const b = (await r.json()) as { error: string; reason: string };
    assert.deepEqual([r.status, b.error], [400, "invalid-settings"], JSON.stringify(body));
    assert.match(b.reason, ly, JSON.stringify(body));
    so++;
  }
  assert.equal(so, sai.length);
  assert.deepEqual(await dongCauHinh(s), luu, "cấu hình đổi sau lần ghi sai");
  assert.equal((await send("PUT", "/api/v1/company/settings/lead-routing", { strategy: "manual" })).status, 401);
});

test("cấu hình: đổi chỉ áp cho lead mới", async () => {
  const s = await sanMoi(DC2);
  const a = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t1 = new Date();
  await nhip(t1, s);
  await datCauHinh(s, { acceptMinutes: 5 });
  const b = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const t2 = new Date();
  await nhip(t2, s);
  assert.deepEqual([(await dong(a)).accept_minutes, (await dong(b)).accept_minutes], [15, 5]);
  await nhip(sau(t2, 5), s);
  assert.deepEqual(await kinds(b), ["accept_overdue"]);
  assert.deepEqual(await kinds(a), [], "lead đóng dấu trước bị báo theo hạn mới");
  await nhip(sau(t1, 15), s);
  assert.deepEqual(await kinds(a), ["accept_overdue"]);
  await nghi(s, "dc2", true, "tn");
  const c = (await nhap(s, nam(soMoi(s), "Toà B"))).id;
  await nhip(new Date(), s);
  assert.equal((await dong(c)).routing_strategy, "zone_round_robin");
  await datCauHinh(s, { strategy: "manual" });
  await nghi(s, "dc2", false);
  await nhip(sau(new Date(), 1), s);
  assert.equal(ai(s, (await dong(c)).matched_agent_user_id), "dc2", "lead đóng dấu trước theo cách chia mới");
});

// ---- AC-12: luồng lead mẫu dưới năm cách chia ----
const LUONG = ["Toà A", "Toà A", "Toà B", "Toà A", "Toà B", "Toà A"];
const LUONG_RA: Record<RoutingStrategyKey, (string | null)[]> = {
  zone_round_robin: ["dc2", "dc1", "dc3", "dc2", "dc3", "dc1"],
  company_round_robin: ["dc3", "dc2", "dc1", "dc3", "dc2", "dc1"],
  zone_least_open: ["dc1", "dc2", "dc3", "dc1", "dc3", "dc2"],
  open_pool: [null, null, null, null, null, null],
  manual: [null, null, null, null, null, null],
};
test("chia: luồng lead mẫu dưới năm cách chia", async () => {
  let so = 0;
  for (const strategy of ROUTING_STRATEGIES) {
    const s = await sanMoi(DC3);
    // Trước luồng: đầu chủ 2 có một lead Toà B chưa gọi (lần chia 1), đầu chủ 1 đã gọi xong một lead Toà A (lần chia 2).
    const p1 = (await nhap(s, nam(soMoi(s), "Toà B"))).id;
    await nhip(new Date(), s);
    const p2 = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
    await nhip(new Date(), s);
    assert.deepEqual([ai(s, (await dong(p1)).matched_agent_user_id), ai(s, (await dong(p2)).matched_agent_user_id)], ["dc2", "dc1"]);
    assert.equal((await send("POST", `/api/v1/leads/${p2}/first-call`, undefined, s.nguoi.dc1!.cookie)).status, 200);
    await datCauHinh(s, { strategy });
    const ids: string[] = [];
    for (const toa of LUONG) ids.push((await nhap(s, nam(soMoi(s), toa))).id);
    await nhip(new Date(), s);
    const ra: (string | null)[] = [];
    for (const id of ids) ra.push(ai(s, (await dong(id)).matched_agent_user_id));
    assert.deepEqual(ra, LUONG_RA[strategy], strategy);
    so++;
  }
  assert.equal(so, ROUTING_STRATEGIES.length);
});

// ---- Review Focus ----
test("nhịp: cấu hình hỏng của một sàn không chặn sàn khác", async () => {
  const H = await sanMoi(DC2);
  const G = await sanMoi(DC2);
  await appPool.query(
    "insert into company_settings (company_id, key, value, updated_by) values ($1, 'lead_routing.strategy', '\"script\"', $2)",
    [H.companyId, H.nguoi.qt!.userId],
  );
  const lh = (await nhap(H, nam(soMoi(H), "Toà A"))).id;
  const lg = (await nhap(G, nam(soMoi(G), "Toà A"))).id;
  const kq = await nhip(new Date(), H, G);
  assert.equal(kq.failed, 1);
  assert.equal(ai(G, (await dong(lg)).matched_agent_user_id), "dc1");
  assert.deepEqual([(await dong(lh)).matched_agent_user_id, (await dong(lh)).routing_strategy], [null, null]);
});

test("nhịp: không sàn nào có việc", async () => {
  const s = await sanMoi(DC2);
  assert.deepEqual(await nhip(new Date(), s), { companies: 0, routed: 0, alerts: 0, failed: 0 });
});

test("nhịp: lead nhập giữa nhịp chờ nhịp sau", async () => {
  // Lead chưa đóng dấu (vào sau bước đóng dấu của nhịp đang chạy) không chia được; nhịp sau đóng dấu rồi chia.
  const s = await sanMoi(DC2);
  const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("set local role quy_hang_app");
    await c.query("select set_config('app.user_id', '', true), set_config('app.company_id', $1, true)", [s.companyId]);
    const v = (await c.query("select app.route_lead($1, $2, now()) v", [l, s.nguoi.dc1!.userId])).rows[0].v;
    await c.query("commit");
    assert.equal(v, false, "lead chưa đóng dấu bị chia");
  } finally {
    c.release();
  }
  await nhip(new Date(), s);
  const d = await dong(l);
  assert.deepEqual([ai(s, d.matched_agent_user_id), d.routing_strategy], ["dc1", "zone_round_robin"]);
});

test("kho chung: hai người nhận cùng lúc", async () => {
  const s = await sanMoi({ ...DC2, dc2: { vai: ["listing_agent"], khu: ["Toà A"] } });
  await datCauHinh(s, { strategy: "open_pool" });
  const l = (await nhap(s, nam(soMoi(s), "Toà A"))).id;
  await nhip(new Date(), s);
  const [a, b] = await Promise.all(["dc1", "dc2"].map((k) => send("POST", `/api/v1/leads/${l}/claim`, undefined, s.nguoi[k]!.cookie)));
  assert.deepEqual([a!.status, b!.status].sort(), [200, 409]);
  assert.ok(["dc1", "dc2"].includes(ai(s, (await dong(l)).matched_agent_user_id)!));
});

test("cấu hình: hai lần đổi một phần cùng lúc", async () => {
  const s = await sanMoi(DC2);
  await datCauHinh(s, { acceptMinutes: 10, firstCallMinutes: 20 });
  const [a, b] = await Promise.all([
    send("PUT", "/api/v1/company/settings/lead-routing", { acceptMinutes: 18 }, s.nguoi.qt!.cookie),
    send("PUT", "/api/v1/company/settings/lead-routing", { firstCallMinutes: 12 }, s.nguoi.qt!.cookie),
  ]);
  assert.deepEqual([a.status, b.status].sort(), [200, 400]);
  const cuoi = (await (await docCauHinh(s)).json()) as { acceptMinutes: number; firstCallMinutes: number };
  assert.ok(cuoi.firstCallMinutes >= cuoi.acceptMinutes, JSON.stringify(cuoi));
});
