// Đổi đầu chủ hàng loạt qua API trên Postgres thật (hàng 89: E1c, E2, E3, E4, E5, E6, E7). Dữ liệu dựng bằng kết nối chủ;
// kết quả đọc lại bằng kết nối chủ để thấy đúng điều cơ sở dữ liệu giữ. Mỗi ma trận viết trước kèm chiều đỏ trên một
// bản sao hỏng của bộ so.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { API_ERRORS } from "../../src/errors";
import { createApi } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const KH = "ddc";
const BASE = "/api/v1/listings/agent-reassignments";

const goi = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { origin: BASE_URL, ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await goi("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  return cookieOf(await goi("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp }));
}

type Nguoi = { userId: string; cookie: string };
type San = { companyId: string; nguoi: (ten: string, roles: string[]) => Promise<Nguoi> };

let dem = 0;
async function sanMoi(): Promise<San> {
  const s = await openCompany(`[Sàn ${RUN} ${KH}${++dem}]`, mail(`${KH}-${dem}-qt`));
  return {
    companyId: s.companyId,
    async nguoi(ten, roles) {
      const email = mail(`${KH}-${dem}-${ten}`);
      const userId = await createLoneUser(email);
      await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, roles]);
      return { userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
    },
  };
}

/** Một chủ nhà (liên hệ) với n căn, mọi căn do `dauChu` giữ (null = chưa có đầu chủ). Trả mã liên hệ và mã căn. */
async function chuNha(companyId: string, ten: string, n: number, dauChu: string | null, nguoiGiu: string | null) {
  const { rows } = await appPool.query<{ id: string }>(
    "insert into contacts (company_id, contact_types, owner_member_user_id, full_name, created_by) values ($1, '{Seller}', $2, $3, 'x') returning id",
    [companyId, nguoiGiu, ten],
  );
  const contactId = rows[0]!.id;
  const can: string[] = [];
  for (let i = 0; i < n; i++) {
    const l = (await appPool.query<{ id: string }>(
      "insert into listings (id, company_id, building_name, standard_status, version) values (gen_random_uuid(), $1, '[Toà]', 'Incomplete', 1) returning id",
      [companyId],
    )).rows[0]!.id;
    // Hàng đã lên bán (nấc Cả sàn) để trưởng nhóm đọc được theo trục ai thấy hàng (hàng 12).
    await appPool.query(
      `insert into listing_events (company_id, listing_id, seq, type, payload, actor_user_id, actor_roles, confirmed_with_owner)
       values ($1, $2, 1, 'created', '{}', $3, '{listing_agent}', false), ($1, $2, 2, 'status_changed', '{"to":"Active"}', $3, '{listing_agent}', false)`,
      [companyId, l, dauChu ?? "x"],
    );
    await appPool.query("insert into listing_owners (company_id, listing_id, owner_name, updated_by, contact_id) values ($1, $2, $3, 'x', $4)", [companyId, l, ten, contactId]);
    if (dauChu) await appPool.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 1, $3, 'x')", [companyId, l, dauChu]);
    can.push(l);
  }
  return { contactId, can };
}

const dauChuCua = async (companyId: string, l: string) =>
  (await appPool.query<{ user_id: string }>("select user_id from listing_agent_assignments where company_id = $1 and listing_id = $2 order by seq desc limit 1", [companyId, l])).rows[0]?.user_id ?? null;
const nguoiGiu = async (companyId: string, k: string) =>
  (await appPool.query<{ u: string | null }>("select owner_member_user_id u from contacts where company_id = $1 and id = $2", [companyId, k])).rows[0]!.u;
const demGan = async (companyId: string) =>
  Number((await appPool.query<{ n: string }>("select count(*) n from listing_agent_assignments where company_id = $1", [companyId])).rows[0]!.n);

// ---- E1c: ma trận 6 tổ hợp vai × 3 lệnh ----
const TO_HOP: [string, string[]][] = [
  ["trưởng nhóm", ["team_lead"]],
  ["đầu chủ", ["listing_agent"]],
  ["đầu khách", ["buyer_agent"]],
  ["telesales", ["telesales"]],
  ["quản trị", ["company_admin"]],
  ["trưởng nhóm + đầu chủ", ["team_lead", "listing_agent"]],
];
const LENH = ["xem trước", "đổi", "hoàn tác"] as const;
type O = { vai: string; lenh: (typeof LENH)[number]; status: number };

/** So ma trận đo được với luật: hai tổ hợp có team_lead đi qua (2xx), còn lại 403. */
function lechVai(oDo: O[]): string[] {
  return oDo.flatMap((o) => {
    const qua = TO_HOP.find(([t]) => t === o.vai)![1].includes("team_lead");
    const dung = qua ? o.status >= 200 && o.status < 300 : o.status === 403;
    return dung ? [] : [`${o.vai} · ${o.lenh}: ${o.status}`];
  });
}

test("E1c ma trận 6 vai × 3 lệnh: đúng hai tổ hợp có trưởng nhóm đi qua, còn lại 403 (18 ô)", async () => {
  const s = await sanMoi();
  const d1 = await s.nguoi("d1", ["listing_agent"]);
  const d2 = await s.nguoi("d2", ["listing_agent"]);
  const oDo: O[] = [];
  for (const [vai, roles] of TO_HOP) {
    const n = await s.nguoi(`v${oDo.length}`, roles);
    const { can } = await chuNha(s.companyId, "[Tên] e1c", 1, d1.userId, d1.userId);
    const p = await goi("POST", `${BASE}/preview`, { listingIds: can }, n.cookie);
    oDo.push({ vai, lenh: "xem trước", status: p.status });
    const d = await goi("POST", BASE, { listingIds: can, userId: d2.userId }, n.cookie);
    oDo.push({ vai, lenh: "đổi", status: d.status });
    // Hoàn tác thử trên một lần đổi do trưởng nhóm thật ghi, để ô 403 không phải vì mã lạ.
    const tn = await s.nguoi(`tn${oDo.length}`, ["team_lead"]);
    const goc = await goi("POST", BASE, { listingIds: can, userId: d1.userId }, tn.cookie);
    const { id } = (await goc.json()) as { id: string };
    const u = await goi("POST", `${BASE}/${id}/undo`, undefined, n.cookie);
    oDo.push({ vai, lenh: "hoàn tác", status: u.status });
  }
  assert.equal(oDo.length, 18);
  assert.deepEqual(lechVai(oDo), []);
});

test("E1c đối chứng đỏ: bản ghi giả cho quản trị qua → bộ so nêu vai và lệnh", () => {
  const gia: O[] = TO_HOP.flatMap(([vai, roles]) => LENH.map((lenh) => ({ vai, lenh, status: roles.includes("team_lead") || vai === "quản trị" ? 200 : 403 })));
  assert.deepEqual(lechVai(gia), ["quản trị · xem trước: 200", "quản trị · đổi: 200", "quản trị · hoàn tác: 200"]);
});

// ---- E2: người nhận ----
test("E2 người nhận không mang vai Đầu chủ hay khác sàn → 400 nêu userId; khoá lạ → 400; hợp lệ → 201", async () => {
  const s = await sanMoi();
  const tn = await s.nguoi("tn", ["team_lead"]);
  const d1 = await s.nguoi("d1", ["listing_agent"]);
  const dk = await s.nguoi("dk", ["buyer_agent"]);
  const khac = await (await sanMoi()).nguoi("dkhac", ["listing_agent"]);
  const { can } = await chuNha(s.companyId, "[Tên] e2", 1, null, null);
  for (const [ten, userId] of [["sai vai", dk.userId], ["khác sàn", khac.userId]] as const) {
    const r = await goi("POST", BASE, { listingIds: can, userId }, tn.cookie);
    assert.equal(r.status, 400, ten);
    const b = (await r.json()) as { error: string; details: { path: string }[] };
    assert.equal(b.error, API_ERRORS.invalidPayload.code, ten);
    assert.ok(b.details.some((x) => x.path === "userId"), `${ten}: lỗi không nêu userId`);
  }
  assert.equal((await goi("POST", BASE, { listingIds: can, userId: d1.userId, ghiChu: "x" }, tn.cookie)).status, 400, "khoá lạ phải bị từ chối");
  assert.equal((await goi("POST", BASE, { listingIds: can, userId: d1.userId }, tn.cookie)).status, 201, "đối chứng: người nhận hợp lệ");
});

// ---- E3: xem trước kéo căn cùng chủ, không lộ chủ nhà ----
const MOC_CHU = ["[Tên] C1-mau", "[Tên] C2-mau", "0900000011", "0900 000 011", "0900000012", "0900 000 012"];
const quetLo = (than: string) => MOC_CHU.filter((m) => than.includes(m));

/** Chủ nhà ghi QUA API (PUT …/owner) như màn thật: tên và số thật sự nằm trong lớp nguồn (số bản mã, liên hệ theo số). */
async function chuNhaQuaApi(companyId: string, cookie: string, ten: string, so: string, n: number, dauChu: string) {
  const { can } = await chuNha(companyId, ten, n, dauChu, dauChu);
  for (const l of can) {
    const r = await goi("PUT", `/api/v1/listings/${l}/owner`, { ownerName: ten, ownerPhone: so }, cookie);
    assert.equal(r.status, 200, `ghi chủ nhà: ${await r.clone().text()}`);
  }
  const { rows } = await appPool.query<{ contact_id: string; has_phone: boolean }>("select contact_id, has_phone from listing_owners where listing_id = $1", [can[0]]);
  assert.ok(rows[0]!.has_phone, "đối chứng: số chủ nhà đã nằm trong dữ liệu");
  return { contactId: rows[0]!.contact_id, can };
}

test("E3 xem trước: 2 căn đã tích kéo đủ 5 căn của 2 chủ, đầu chủ cũ đúng, 2 liên hệ, không lộ tên và số chủ", async () => {
  const s = await sanMoi();
  const tn = await s.nguoi("tn", ["team_lead"]);
  const d1 = await s.nguoi("d1", ["listing_agent"]);
  const c1 = await chuNhaQuaApi(s.companyId, tn.cookie, "[Tên] C1-mau", "0900 000 011", 3, d1.userId);
  const c2 = await chuNhaQuaApi(s.companyId, tn.cookie, "[Tên] C2-mau", "0900 000 012", 2, d1.userId);
  const khacChu = await chuNha(s.companyId, "[Tên] khác", 1, d1.userId, d1.userId);
  const r = await goi("POST", `${BASE}/preview`, { listingIds: [c1.can[0], c2.can[0]] }, tn.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  const than = await r.text();
  const b = JSON.parse(than) as { listings: { listingId: string; selected: boolean; fromUserId: string }[]; contacts: number };
  const tat = [...c1.can, ...c2.can].sort();
  const thieu = tat.filter((l) => !b.listings.some((x) => x.listingId === l));
  assert.deepEqual(thieu, [], `thiếu ${thieu.length} căn cùng chủ nhà`);
  assert.equal(b.listings.length, 5);
  assert.ok(!b.listings.some((x) => x.listingId === khacChu.can[0]), "căn khác chủ không được kéo theo");
  assert.deepEqual(b.listings.filter((x) => x.selected).map((x) => x.listingId).sort(), [c1.can[0], c2.can[0]].sort());
  assert.ok(b.listings.every((x) => x.fromUserId === d1.userId), "đầu chủ cũ sai");
  assert.equal(b.contacts, 2);
  assert.deepEqual(quetLo(than), [], "bản xem trước lộ tên hay số chủ nhà");
});

test("E3 đối chứng dương: chuỗi có chèn tên hay số chủ nhà thì bộ quét bắt và nêu giá trị", () => {
  assert.deepEqual(quetLo('{"a":"[Tên] C2-mau"}'), ["[Tên] C2-mau"]);
  assert.deepEqual(quetLo('{"so":"0900 000 011"}'), ["0900 000 011"]);
});

// ---- E4: đổi trong một giao dịch ----
test("E4 đổi sang D2: 5 căn và 2 liên hệ sang D2, căn đã do D2 giữ không thêm dòng, trả số đúng", async () => {
  const s = await sanMoi();
  const tn = await s.nguoi("tn", ["team_lead"]);
  const d1 = await s.nguoi("d1", ["listing_agent"]);
  const d2 = await s.nguoi("d2", ["listing_agent"]);
  const c1 = await chuNha(s.companyId, "[Tên] e4-1", 3, d1.userId, d1.userId);
  const c2 = await chuNha(s.companyId, "[Tên] e4-2", 2, d1.userId, d1.userId);
  // Một căn của C1 đã do D2 giữ.
  await appPool.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 2, $3, 'x')", [s.companyId, c1.can[2], d2.userId]);
  const truoc = await demGan(s.companyId);
  const r = await goi("POST", BASE, { listingIds: [c1.can[0], c2.can[0]], userId: d2.userId }, tn.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  const kq = (await r.json()) as { listings: number; contacts: number };
  assert.deepEqual({ l: kq.listings, c: kq.contacts }, { l: 5, c: 2 });
  for (const l of [...c1.can, ...c2.can]) assert.equal(await dauChuCua(s.companyId, l), d2.userId, `căn ${l} chưa sang D2`);
  for (const k of [c1.contactId, c2.contactId]) assert.equal(await nguoiGiu(s.companyId, k), d2.userId, `liên hệ ${k} chưa sang D2`);
  assert.equal((await demGan(s.companyId)) - truoc, 4, "căn đã do D2 giữ không được thêm dòng gán");
});

test("E4 lỗi giữa chừng: không dòng nào đổi", async () => {
  const s = await sanMoi();
  const tn = await s.nguoi("tn", ["team_lead"]);
  const d1 = await s.nguoi("d1", ["listing_agent"]);
  const d2 = await s.nguoi("d2", ["listing_agent"]);
  const c1 = await chuNha(s.companyId, "[Tên] e4-loi", 3, d1.userId, d1.userId);
  const ten = `ep_loi_${RUN}`;
  await appPool.query(`create or replace function public.${ten}() returns trigger language plpgsql as $$ begin
    if new.listing_id = '${c1.can[2]}'::uuid then raise exception 'ep loi'; end if; return new; end $$`);
  await appPool.query(`create trigger ${ten} before insert on listing_agent_assignments for each row execute function public.${ten}()`);
  try {
    const truoc = await demGan(s.companyId);
    const r = await goi("POST", BASE, { listingIds: [c1.can[0]], userId: d2.userId }, tn.cookie);
    assert.ok(r.status >= 500, `phải lỗi: ${r.status}`);
    assert.equal(await demGan(s.companyId), truoc, "có dòng gán được ghi dù lần đổi lỗi");
    assert.equal(await nguoiGiu(s.companyId, c1.contactId), d1.userId, "người giữ liên hệ đổi dù lần đổi lỗi");
    assert.equal(Number((await appPool.query<{ n: string }>("select count(*) n from listing_agent_reassignments where company_id = $1", [s.companyId])).rows[0]!.n), 0);
  } finally {
    await appPool.query(`drop trigger ${ten} on listing_agent_assignments`);
    await appPool.query(`drop function public.${ten}()`);
  }
});

// ---- E5: hoàn tác ----
type KetQua = { restored: number; skipped: number; keptNoPriorAgent: number };

test("E5 hoàn tác 6 ô viết trước, hoàn tác lần hai 409", async () => {
  const s = await sanMoi();
  const tn = await s.nguoi("tn", ["team_lead"]);
  const d1 = await s.nguoi("d1", ["listing_agent"]);
  const d2 = await s.nguoi("d2", ["listing_agent"]);
  const d3 = await s.nguoi("d3", ["listing_agent"]);
  const a = await chuNha(s.companyId, "[Tên] e5-a", 1, d1.userId, d1.userId); // (a) căn còn D2 → về D1; (d) liên hệ còn D2 → về D1
  const b = await chuNha(s.companyId, "[Tên] e5-b", 1, d1.userId, d1.userId); // (b) căn đổi tiếp sang D3; (e) liên hệ đổi tiếp sang D3
  const c = await chuNha(s.companyId, "[Tên] e5-c", 1, null, null); //            (c) căn chưa có đầu chủ: căn và liên hệ giữ D2
  const f = await chuNha(s.companyId, "[Tên] e5-f", 1, d1.userId, null); //       (f) liên hệ chưa có người giữ → về null
  const r = await goi("POST", BASE, { listingIds: [a.can[0], b.can[0], c.can[0], f.can[0]], userId: d2.userId }, tn.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  const { id } = (await r.json()) as { id: string };
  await appPool.query("insert into listing_agent_assignments (company_id, listing_id, seq, user_id, assigned_by) values ($1, $2, 99, $3, 'x')", [s.companyId, b.can[0], d3.userId]);
  await appPool.query("update contacts set owner_member_user_id = $1 where id = $2", [d3.userId, b.contactId]);
  const u = await goi("POST", `${BASE}/${id}/undo`, undefined, tn.cookie);
  assert.equal(u.status, 200, await u.clone().text());
  const kq = (await u.json()) as KetQua;
  const O_HOAN_TAC: [string, () => Promise<unknown>, unknown][] = [
    ["(a) căn còn D2 về D1", () => dauChuCua(s.companyId, a.can[0]!), d1.userId],
    ["(b) căn đổi tiếp giữ D3", () => dauChuCua(s.companyId, b.can[0]!), d3.userId],
    ["(c) căn chưa có đầu chủ và liên hệ cùng chủ giữ D2", async () => [await dauChuCua(s.companyId, c.can[0]!), await nguoiGiu(s.companyId, c.contactId)], [d2.userId, d2.userId]],
    ["(d) liên hệ còn D2 về D1", () => nguoiGiu(s.companyId, a.contactId), d1.userId],
    ["(e) liên hệ đổi tiếp giữ D3", () => nguoiGiu(s.companyId, b.contactId), d3.userId],
    ["(f) liên hệ trước chưa có người giữ về null", () => nguoiGiu(s.companyId, f.contactId), null],
  ];
  for (const [ten, doc, mong] of O_HOAN_TAC) assert.deepEqual(await doc(), mong, ten);
  // trả: (a) căn, (f) căn, (d) liên hệ, (f) liên hệ = 4; bỏ qua: (b) căn, (e) liên hệ = 2; giữ vì chưa có đầu chủ: (c) = 1.
  assert.deepEqual(kq, { restored: 4, skipped: 2, keptNoPriorAgent: 1 });
  const lai = await goi("POST", `${BASE}/${id}/undo`, undefined, tn.cookie);
  assert.equal(lai.status, 409);
  assert.equal(((await lai.json()) as { error: string }).error, API_ERRORS.reassignmentUndone.code);
});

// ---- E7: trần 200 căn ----
test("E7 tập sau kéo theo 201 căn → 400 «Tối đa 200 căn một lần», không dòng nào đổi; 200 căn → 201", async () => {
  const s = await sanMoi();
  const tn = await s.nguoi("tn", ["team_lead"]);
  const d1 = await s.nguoi("d1", ["listing_agent"]);
  const d2 = await s.nguoi("d2", ["listing_agent"]);
  const lon = await chuNha(s.companyId, "[Tên] e7-lon", 201, d1.userId, d1.userId);
  const truoc = await demGan(s.companyId);
  for (const [duong, than] of [[`${BASE}/preview`, { listingIds: [lon.can[0]] }], [BASE, { listingIds: [lon.can[0]], userId: d2.userId }]] as const) {
    const r = await goi("POST", duong, than, tn.cookie);
    assert.equal(r.status, 400, duong);
    const b = (await r.json()) as { error: string; details: { reason: string }[] };
    assert.equal(b.error, API_ERRORS.reassignmentTooLarge.code);
    assert.ok(b.details.some((x) => x.reason === "Tối đa 200 căn một lần"), "thiếu lời trần");
  }
  assert.equal(await demGan(s.companyId), truoc, "có dòng gán được ghi dù quá trần");
  const vua = await chuNha(s.companyId, "[Tên] e7-vua", 200, d1.userId, d1.userId);
  assert.equal((await goi("POST", BASE, { listingIds: [vua.can[0]], userId: d2.userId }, tn.cookie)).status, 201, "đối chứng: 200 căn đi qua");
});

test("E6 mã căn và mã lần đổi của sàn khác → 404, không dòng nào của sàn ấy đổi", async () => {
  const a = await sanMoi();
  const tnA = await a.nguoi("tn", ["team_lead"]);
  const d1 = await a.nguoi("d1", ["listing_agent"]);
  const d2 = await a.nguoi("d2", ["listing_agent"]);
  const ca = await chuNha(a.companyId, "[Tên] e6", 1, d1.userId, d1.userId);
  // Lần đổi thật D1 → D2: hoàn tác lọt sang thì căn và liên hệ sẽ về D1 — ca dưới phân biệt được.
  const lanA = ((await (await goi("POST", BASE, { listingIds: ca.can, userId: d2.userId }, tnA.cookie)).json()) as { id: string }).id;
  const b = await sanMoi();
  const tnB = await b.nguoi("tn", ["team_lead"]);
  const dB = await b.nguoi("d", ["listing_agent"]);
  assert.equal((await goi("POST", `${BASE}/preview`, { listingIds: ca.can }, tnB.cookie)).status, 404);
  assert.equal((await goi("POST", BASE, { listingIds: ca.can, userId: dB.userId }, tnB.cookie)).status, 404);
  assert.equal((await goi("POST", `${BASE}/${lanA}/undo`, undefined, tnB.cookie)).status, 404);
  assert.equal(await dauChuCua(a.companyId, ca.can[0]!), d2.userId, "sàn B đổi hay hoàn tác được căn của A");
  assert.equal(await nguoiGiu(a.companyId, ca.contactId), d2.userId, "sàn B đổi hay hoàn tác được liên hệ của A");
  // Đối chứng dương: chính A hoàn tác thì về D1 — phép đọc trên phân biệt được hai trạng thái.
  assert.equal((await goi("POST", `${BASE}/${lanA}/undo`, undefined, tnA.cookie)).status, 200);
  assert.equal(await dauChuCua(a.companyId, ca.can[0]!), d1.userId);
});
