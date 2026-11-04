// Thiết bị của thao tác và lượt mất mạng qua API trên Postgres thật (hàng ghi-thiet-bi-va-mat-mang: E3, E4). Đọc lại cột
// bằng kết nối chủ để thấy đúng điều cơ sở dữ liệu giữ, không qua bộ đọc của API.
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { API_ERRORS } from "../src/errors";
import { createApi } from "../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

after(cleanup);

const { auth, sent } = makeAuth();
const app = createApi({ appPool, identityPool, auth });
const KH = "tbmm";

const goi = (method: string, path: string, body?: unknown, cookie = "", dau: Record<string, string> = {}) =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { origin: BASE_URL, ...(cookie ? { cookie } : {}), ...(body === undefined ? {} : { "content-type": "application/json" }), ...dau },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

async function login(email: string): Promise<string> {
  const before = sent.length;
  await goi("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  return cookieOf(await goi("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp }));
}

async function san(ten: string) {
  const s = await openCompany(`[Sàn ${RUN} ${KH}${ten}]`, mail(`${KH}-${ten}-qt`));
  const email = mail(`${KH}-${ten}-a`);
  const userId = await createLoneUser(email);
  await appPool.query("insert into company_members (company_id, user_id, roles) values ($1, $2, $3)", [s.companyId, userId, ["listing_agent"]]);
  return { companyId: s.companyId, userId, cookie: `${await login(email)}; qh_san=${s.companyId}` };
}

/** Bốn giá trị của đầu thiết bị — viết trước — và cột `device` mong đợi. */
const MA_TRAN: [string | undefined, "desktop" | "mobile" | null][] = [
  ["mobile", "mobile"],
  ["desktop", "desktop"],
  [undefined, null],
  ["tablet", null],
];
const dauCua = (v: string | undefined): Record<string, string> => (v === undefined ? {} : { "x-quy-hang-device": v });
const cotCua = async (id: string) =>
  (await appPool.query<{ seq: number; device: string | null; made_offline: boolean }>("select seq, device, made_offline from listing_events where listing_id = $1 order by seq", [id])).rows;

test("thiết bị: đầu yêu cầu ghi vào sự kiện", async () => {
  const s = await san("tb");
  let soAssert = 0;
  for (const [dau, mong] of MA_TRAN) {
    const r = await goi("POST", "/api/v1/listings", { buildingName: `[Toà ${RUN} tb]` }, s.cookie, dauCua(dau));
    assert.equal(r.status, 201, await r.clone().text());
    const id = ((await r.json()) as { id: string }).id;
    const l = await goi("POST", `/api/v1/listings/${id}/events`, { type: "price_changed", payload: { listPrice: 3_000_000_000, feeInclusion: "included" }, expectedVersion: 1 }, s.cookie, dauCua(dau));
    assert.equal(l.status, 200, await l.clone().text());
    const cot = await cotCua(id);
    assert.equal(cot[0]!.device, mong, `POST /listings với đầu ${dau ?? "vắng"}: cột device ${cot[0]!.device}, mong ${mong}`);
    assert.equal(cot[1]!.device, mong, `POST /listings/:id/events với đầu ${dau ?? "vắng"}: cột device ${cot[1]!.device}, mong ${mong}`);
    soAssert += 2;
    const doc = await goi("GET", `/api/v1/listings/${id}`, undefined, s.cookie);
    const ev = ((await doc.json()) as { events: { device: string | null }[] }).events;
    assert.deepEqual(
      ev.map((e) => e.device),
      [mong, mong],
      "GET trả device trên từng sự kiện",
    );
  }
  assert.equal(soAssert, 8, "ma trận bốn giá trị × hai đường");
});

test("mất mạng: khoá madeOffline của lệnh", async () => {
  const s = await san("mm");
  const r = await goi("POST", "/api/v1/listings", { buildingName: `[Toà ${RUN} mm]` }, s.cookie, dauCua("mobile"));
  const id = ((await r.json()) as { id: string }).id;
  const lenh = (v: number, them: Record<string, unknown>) =>
    goi("POST", `/api/v1/listings/${id}/events`, { type: "price_changed", payload: { listPrice: 3_000_000_000 + v, feeInclusion: "included" }, expectedVersion: v, ...them }, s.cookie, dauCua("mobile"));
  assert.equal((await lenh(1, { madeOffline: true })).status, 200);
  assert.equal((await lenh(2, { madeOffline: false })).status, 200);
  assert.equal((await lenh(3, {})).status, 200);
  const cot = await cotCua(id);
  assert.deepEqual(
    cot.slice(1).map((c) => c.made_offline),
    [true, false, false],
    "madeOffline true → true; false và vắng → false",
  );
  const la = await lenh(4, { offline: true });
  assert.equal(la.status, 400, "khoá lạ «offline» vẫn bị từ chối");
  assert.equal((await cotCua(id)).length, 4, "lệnh bị từ chối không ghi sự kiện");
});

const LUOT = { startedAt: "2026-11-03T08:00:00.000Z", endedAt: "2026-11-03T08:12:00.000Z", device: "mobile", queuedOps: 2 };
const demLuot = async (companyId: string) =>
  (await appPool.query<{ n: number }>("select count(*)::int n from offline_sessions where company_id = $1", [companyId])).rows[0]!.n;

test("lượt mất mạng: ghi một lần, gửi lại không trùng", async () => {
  const s = await san("lg");
  const dau = await goi("POST", "/api/v1/sync/offline-sessions", LUOT, s.cookie);
  assert.equal(dau.status, 201, await dau.clone().text());
  const { rows } = await appPool.query<{ user_id: string; company_id: string; device: string; queued_ops: number }>(
    "select user_id, company_id, device, queued_ops from offline_sessions where company_id = $1",
    [s.companyId],
  );
  assert.deepEqual(rows, [{ user_id: s.userId, company_id: s.companyId, device: "mobile", queued_ops: 2 }]);
  const lai = await goi("POST", "/api/v1/sync/offline-sessions", LUOT, s.cookie);
  assert.equal(lai.status, 200, "gửi lại trả 200");
  assert.equal(await demLuot(s.companyId), 1, "gửi lại không thêm dòng");
});

test("lượt mất mạng: khuôn sai và chưa đăng nhập", async () => {
  const s = await san("ks");
  const sai: [string, Record<string, unknown>][] = [
    ["endedAt trước startedAt", { ...LUOT, endedAt: "2026-11-03T07:59:00.000Z" }],
    ["thiết bị lạ", { ...LUOT, device: "tablet" }],
    ["khoá lạ", { ...LUOT, ownerPhone: "0900 000 001" }],
  ];
  for (const [ten, than] of sai) {
    const r = await goi("POST", "/api/v1/sync/offline-sessions", than, s.cookie);
    assert.equal(r.status, 400, `${ten}: mong 400`);
    assert.equal(((await r.json()) as { error: string }).error, API_ERRORS.invalidPayload.code, `${ten}: mã lỗi`);
  }
  assert.equal(await demLuot(s.companyId), 0, "ba ca sai khuôn không ghi gì");
  assert.equal((await goi("POST", "/api/v1/sync/offline-sessions", LUOT)).status, 401, "không cookie → 401");
  const email = mail(`${KH}-le`);
  const leId = await createLoneUser(email);
  const le = await goi("POST", "/api/v1/sync/offline-sessions", LUOT, await login(email));
  assert.equal(le.status, 403, "chưa gắn sàn → 403");
  assert.equal(
    (await appPool.query<{ n: number }>("select count(*)::int n from offline_sessions where user_id = $1", [leId])).rows[0]!.n,
    0,
    "người chưa gắn sàn không ghi được dòng nào",
  );
});
