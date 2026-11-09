// Đồ dùng chung của bộ kiểm token máy (hàng 96). Thoả thuận và danh sách tin do chủ bảng chèn thẳng như bộ nhan-goi;
// token luôn lấy từ chính API cấp, không tự dựng chuỗi đúng khuôn.
import assert from "node:assert/strict";
import { createApi, type ApiDeps } from "../../src/app";
import { appPool, BASE_URL, cleanup, cookieOf, identityPool, mail, makeAuth, openCompany, RUN } from "../helpers";

const { auth, sent } = makeAuth();
export const deps: ApiDeps = { appPool, identityPool, auth } as ApiDeps;
export const app = createApi(deps);
export { appPool, BASE_URL, RUN };

const sanDaMo: string[] = [];
/** Dọn theo thứ tự khoá ngoại: nhật ký, token, thoả thuận, rồi helpers xoá sàn. */
export async function donDep() {
  await appPool.query("delete from catalog_units where provider like $1", [`%${RUN}%`]);
  await appPool.query("delete from catalog_subdivisions where provider like $1", [`%${RUN}%`]);
  await appPool.query("delete from machine_token_calls where company_id = any ($1::uuid[])", [sanDaMo]);
  await appPool.query("delete from machine_tokens where company_id = any ($1::uuid[])", [sanDaMo]);
  await appPool.query("delete from catalog_trusted_companies where company_id = any ($1::uuid[])", [sanDaMo]);
  await appPool.query("delete from agreements where company_id = any ($1::uuid[])", [sanDaMo]);
  await cleanup();
}

type Goi = { request: (u: string, i?: RequestInit) => Response | Promise<Response> };
export const FEED = "/api/v1/catalog/feeds";
export const tokensCua = (agreementId: string) => `/api/v1/agreements/${agreementId}/machine-tokens`;

export function goi(method: string, path: string, opts: { cookie?: string; body?: unknown; a?: Goi; bearer?: string; raw?: string; headers?: Record<string, string> } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json", ...(opts.headers ?? {}) };
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.bearer !== undefined) headers.authorization = `Bearer ${opts.bearer}`;
  const body = opts.raw ?? (opts.body === undefined ? undefined : JSON.stringify(opts.body));
  return (opts.a ?? app).request(`${BASE_URL}${path}`, { method, headers, ...(body === undefined ? {} : { body }) });
}

export async function login(email: string): Promise<string> {
  const before = sent.length;
  const hop = { "content-type": "application/json", origin: BASE_URL };
  const gui = await app.request(`${BASE_URL}/api/v1/auth/email-otp/send-verification-otp`, { method: "POST", headers: hop, body: JSON.stringify({ email, type: "sign-in" }) });
  assert.equal(gui.status, 200);
  const code = sent.slice(before).find((m) => m.email === email);
  assert.ok(code, `không có mã cho ${email}`);
  const res = await app.request(`${BASE_URL}/api/v1/auth/sign-in/email-otp`, { method: "POST", headers: hop, body: JSON.stringify({ email, otp: code.otp }) });
  assert.equal(res.status, 200);
  return cookieOf(res);
}

export type San = { cookie: string; companyId: string };
/** Một quản trị đã đăng nhập và chọn sàn mới. */
export async function sanMoi(ten: string): Promise<San> {
  const email = mail(`qt-tm-${ten}`);
  const s = await openCompany(`[Sàn ${RUN} TM ${ten}]`, email);
  sanDaMo.push(s.companyId);
  return { cookie: `${await login(email)}; qh_san=${s.companyId}`, companyId: s.companyId };
}

/** Thành viên không phải quản trị của sàn. */
export async function thanhVien(s: San, ten: string): Promise<string> {
  const email = mail(`tv-tm-${ten}`);
  assert.equal((await goi("POST", "/api/v1/company/members", { cookie: s.cookie, body: { email, roles: ["listing_agent"] }, headers: { origin: BASE_URL } })).status, 201);
  return `${await login(email)}; qh_san=${s.companyId}`;
}

export const NGAY = 24 * 3600 * 1000;
export type ThoaThuan = { kind?: string; direction?: string; classes?: string[]; from?: Date; until?: Date | null; status?: string; benKia?: string };
export async function themThoaThuan(companyId: string, t: ThoaThuan = {}): Promise<string> {
  const { rows } = await appPool.query<{ id: string }>(
    `insert into agreements (company_id, kind, direction, counterparty, counterparty_company_id, data_classes, valid_from, valid_until, status, approved_by)
     values ($1, $2, $3, 'onehub-invest', $4, $5, $6, $7, $8, '[Tên]') returning id`,
    [companyId, t.kind ?? "catalog_source", t.direction ?? "inbound", t.benKia ?? null, t.classes ?? ["catalog"], t.from ?? new Date(Date.now() - NGAY), t.until === undefined ? null : t.until, t.status ?? "active"],
  );
  return rows[0]!.id;
}
export const tin = (companyId: string) => appPool.query("insert into catalog_trusted_companies (company_id) values ($1) on conflict do nothing", [companyId]);
export const boTin = (companyId: string) => appPool.query("delete from catalog_trusted_companies where company_id = $1", [companyId]);
export const doiTrangThai = (id: string, status: string) => appPool.query("update agreements set status = $2 where id = $1", [id, status]);
export const choQuaHan = (id: string) => appPool.query("update agreements set valid_from = now() - interval '10 days', valid_until = now() - interval '1 day' where id = $1", [id]);
export const giaHan = (id: string) => appPool.query("update agreements set valid_until = now() + interval '30 days' where id = $1", [id]);

export type TokenCap = { id: string; token: string; displayPrefix: string; createdAt: string };
/** Cấp token qua API thật. */
export async function capToken(s: San, agreementId: string): Promise<TokenCap> {
  const res = await goi("POST", tokensCua(agreementId), { cookie: s.cookie });
  assert.equal(res.status, 201, JSON.stringify(await res.clone().json()));
  return (await res.json()) as TokenCap;
}
export const thuHoi = (s: San, agreementId: string, tokenId: string) => goi("DELETE", `${tokensCua(agreementId)}/${tokenId}`, { cookie: s.cookie });

/** Sàn được tin, có thoả thuận hợp lệ và một token. */
export async function sanCoToken(ten: string) {
  const s = await sanMoi(ten);
  await tin(s.companyId);
  const agreementId = await themThoaThuan(s.companyId);
  const t = await capToken(s, agreementId);
  return { ...s, agreementId, ...t, tokenId: t.id };
}

export async function demCan(provider: string): Promise<number> {
  const { rows } = await appPool.query<{ n: string }>("select count(*) n from catalog_units where provider = $1", [provider]);
  return Number(rows[0]!.n);
}
export async function demNhatKy(tokenId: string): Promise<number> {
  const { rows } = await appPool.query<{ n: string }>("select count(*) n from machine_token_calls where token_id = $1", [tokenId]);
  return Number(rows[0]!.n);
}
export async function dongNhatKy(tokenId: string) {
  const { rows } = await appPool.query<Record<string, unknown>>("select * from machine_token_calls where token_id = $1 order by called_at desc, id", [tokenId]);
  return rows;
}

export const nguon = (tag: string) => `[Mẫu] Nguồn token ${RUN} ${tag}`;
const upi = (tag: string, can: string) => `urn:onehub:upi:tm:${RUN}:${tag}:${can}`;
/** Gói mẫu v1: 1 khu, 1 toà, 2 căn. */
export const goiMau = (tag: string) => ({
  schemaVersion: 1,
  provider: nguon(tag),
  measuredAt: "2026-10-29T08:00:00+07:00",
  subdivisions: [
    {
      subdivisionKey: `tm-${RUN}-${tag}`,
      subdivisionName: "[Mẫu] Khu thử",
      complexName: null,
      buildings: [
        {
          buildingKey: "a",
          buildingName: "[Mẫu] Toà A",
          units: ["A.0101", "A.0102"].map((can, i) => ({
            upi: upi(tag, can),
            unitNumber: can,
            stack: can.slice(-2),
            floor: 1,
            livingArea: 50 + i,
            bedroomsTotal: 2,
            directionFaces: "Nam",
            propertyType: "Residential",
            propertySubType: "Condominium",
          })),
        },
      ],
    },
  ],
});
