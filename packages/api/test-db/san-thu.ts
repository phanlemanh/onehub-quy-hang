// Sàn thử cho bộ kiểm lead (hàng 27): người theo bộ mẫu hàng 5, khu tạo và giao qua lối người dùng, hàng và chủ nhà qua
// đường ghi thật. Chép tối thiểu nếp của routing.test.ts (hàng 25) — tệp ấy không đổi.
import assert from "node:assert/strict";
import type pg from "pg";
import { createApi } from "../src/app";
import { SAMPLE_PACK } from "../src/catalog/sample";
import { runLeadTick } from "../src/jobs/lead-tick";
import { appPool, BASE_URL, cookieOf, createLoneUser, identityPool, mail, makeAuth, openCompany, RUN } from "./helpers";

const { auth, sent } = makeAuth();
export const app = createApi({ appPool, identityPool, auth });

export const send = (method: string, path: string, body?: unknown, cookie = "") =>
  app.request(`${BASE_URL}${path}`, {
    method,
    headers: { "content-type": "application/json", origin: BASE_URL, ...(cookie ? { cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

export async function login(email: string): Promise<string> {
  const truoc = sent.length;
  await send("POST", "/api/v1/auth/email-otp/send-verification-otp", { email, type: "sign-in" });
  const code = sent.slice(truoc).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await send("POST", "/api/v1/auth/sign-in/email-otp", { email, otp: code.otp });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

export type Nguoi = { userId: string; cookie: string; ten: string };
export type San = { companyId: string; nguoi: Record<string, Nguoi>; khu: Record<string, string>; so: number };
let soSan = 0;

/** Sàn mới: quản trị mở sàn, mỗi người một vai và khu phụ trách. Số mẫu của sàn bắt đầu ở `soDau`. */
export async function sanMoi(vaiCan: Record<string, { vai: string[]; khu?: string[] }>, soDau = 50): Promise<San> {
  const nhan = `bn${soSan++}`;
  const qtEmail = mail(`${nhan}-qt`);
  const s = await openCompany(`[Sàn ${RUN} bốn nấc ${nhan}]`, qtEmail);
  const san: San = {
    companyId: s.companyId,
    nguoi: { qt: { userId: s.userId, cookie: `${await login(qtEmail)}; qh_san=${s.companyId}`, ten: qtEmail } },
    khu: {},
    so: soDau,
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

export async function giaoKhu(san: San, k: string, ten: string[]) {
  for (const t of ten) {
    if (san.khu[t]) continue;
    const r = await send("POST", "/api/v1/company/zones", { name: t }, san.nguoi.qt!.cookie);
    assert.equal(r.status, 201, await r.clone().text());
    san.khu[t] = ((await r.json()) as { id: string }).id;
  }
  const r = await send("PATCH", `/api/v1/company/members/${san.nguoi[k]!.userId}`, { zoneIds: ten.map((t) => san.khu[t]) }, san.nguoi.qt!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
}

type LeadMau = { ma: string; soDienThoai: string; toa: string; maCan: string | null };
const PACK = SAMPLE_PACK as unknown as { lead: LeadMau[]; danhMuc: { subdivisions: { buildings: { buildingKey: string; buildingName: string }[] }[] } };
export const TOA_MAU = Object.fromEntries(PACK.danhMuc.subdivisions.flatMap((p) => p.buildings.map((b) => [b.buildingKey, b.buildingName])));
export const leadMau = (ma: string) => PACK.lead.find((l) => l.ma === ma)!;

export const nam = (so: string, toa: string, can?: string) => ({
  ownerPhone: so,
  buildingName: toa,
  ...(can && { unitNumber: can }),
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
});
/** Số mẫu chưa dùng trong sàn. */
export const soMoi = (san: San) => `0900 000 0${san.so++}`;

export async function nhap(san: San, body: unknown, ai = "ts"): Promise<{ id: string; outcome: string }> {
  const r = await send("POST", "/api/v1/leads", body, san.nguoi[ai]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return (await r.json()) as { id: string; outcome: string };
}
export const nhip = (now: Date, ...san: San[]) => runLeadTick(appPool, now, san.map((s) => s.companyId));
export const sau = (t: Date, phut: number, giay = 0) => new Date(t.getTime() + phut * 60_000 + giay * 1000);
export const dong = async (id: string) =>
  (
    await appPool.query(
      `select matched_agent_user_id, routed_at, accepted_at, first_called_at, created_at, outcome, returned_at, returned_by,
              resubmitted_at, resubmitted_lead_id, building_name, unit_number, need, list_price, fee_inclusion,
              desired_listing_time, owner_phone_hash
       from leads where id = $1`,
      [id],
    )
  ).rows[0];
export const baoCua = async (id: string) =>
  (await appPool.query<{ kind: string }>("select kind from lead_alerts where lead_id = $1 order by raised_at, kind", [id])).rows.map((r) => r.kind);
export const ai = (san: San, userId: string | null) => (userId ? Object.entries(san.nguoi).find(([, n]) => n.userId === userId)?.[0] ?? userId : null);
export const demLead = async (san: San) => (await appPool.query<{ n: number }>("select count(*)::int n from leads where company_id = $1", [san.companyId])).rows[0]!.n;

/** Hàng của đầu chủ qua đường ghi thật, có chủ nhà mang số đã cho (hàng Incomplete — đang mở). */
export async function hangCoChu(san: San, k: string, can: string, so: string, toa = "Toà A") {
  const tao = await send("POST", "/api/v1/listings", { buildingName: toa, unitNumber: can }, san.nguoi[k]!.cookie);
  assert.equal(tao.status, 201, await tao.clone().text());
  const { id } = (await tao.json()) as { id: string };
  const r = await send("PUT", `/api/v1/listings/${id}/owner`, { ownerName: "[Tên]", ownerPhone: so }, san.nguoi[k]!.cookie);
  assert.equal(r.status, 200, await r.clone().text());
  return id;
}

/** Đưa hàng sang Sẵn sàng bán qua lệnh thật; trả mốc của sự kiện status_changed → Active. */
export async function lenBang(san: San, k: string, hangId: string): Promise<Date> {
  const lenh = async (body: object) => {
    const v = (await appPool.query<{ version: number }>("select version from listings where id = $1", [hangId])).rows[0]!.version;
    const r = await send("POST", `/api/v1/listings/${hangId}/events`, { ...body, expectedVersion: v }, san.nguoi[k]!.cookie);
    assert.equal(r.status, 200, await r.clone().text());
  };
  await lenh({ type: "price_changed", payload: { listPrice: 3_200_000_000, feeInclusion: "included" } });
  await lenh({ type: "details_changed", payload: { legalStatus: "pink_book", occupantType: "vacant" } });
  await lenh({ type: "status_changed", payload: { to: "Active" } });
  return (
    await appPool.query<{ occurred_at: Date }>(
      "select occurred_at from listing_events where listing_id = $1 and type = 'status_changed' and payload ->> 'to' = 'Active'",
      [hangId],
    )
  ).rows[0]!.occurred_at;
}

/** Đọc một hàm dữ kiện của sàn bằng kết nối chủ, dưới ngữ cảnh sàn đã cho; không ghi gì. */
export async function docHam<T extends pg.QueryResultRow>(san: San, sql: string, params: unknown[] = []): Promise<T[]> {
  const c = await appPool.connect();
  try {
    await c.query("begin");
    await c.query("select set_config('app.company_id', $1, true)", [san.companyId]);
    return (await c.query<T>(sql, params)).rows;
  } finally {
    await c.query("rollback").catch(() => {});
    c.release();
  }
}

/** Đầu chủ của lead tạo hàng từ lead (hàng 85): hàng mang mã lead. Trả mã hàng. */
export async function hangTuLead(san: San, k: string, leadId: string) {
  const r = await send("POST", `/api/v1/leads/${leadId}/listing`, undefined, san.nguoi[k]!.cookie);
  assert.equal(r.status, 201, await r.clone().text());
  return ((await r.json()) as { id: string }).id;
}
