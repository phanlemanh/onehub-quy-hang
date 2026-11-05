import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { normalizePhone } from "@quy-hang/core/access";
import { CONTACT_TYPES } from "@quy-hang/core/contacts";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../../app";
import { resolveCompany } from "../../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../../auth/constants";
import { withCompany } from "../../db";
import { API_ERRORS, type ApiErrorEntry } from "../../errors";
import { khoaSoChu } from "../../owners/khoa";
import { listContacts, lookupPhone, readProfile, revealPhone } from "./store";

/** Màn Liên hệ (hàng 103): danh sách, tìm theo số, hồ sơ, mở số — chỉ vai Đầu chủ, Trưởng nhóm (ADR-0021 qđ 3). */
const BASE = "/api/v1/contacts";
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string) => ({ description, content: { "application/json": { schema: z.object({}).passthrough() } } });
const loi = { 401: err("Chưa đăng nhập"), 403: err("Không có vai Đầu chủ hay Trưởng nhóm"), 404: err("Không có hay không được đọc"), 409: err("Chọn sàn") };
const laMa = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

async function tenNguoi(identityPool: pg.Pool, ids: (string | null)[]): Promise<Map<string, string>> {
  const can = [...new Set(ids.filter((x): x is string => !!x))];
  if (!can.length) return new Map();
  const { rows } = await identityPool.query<{ id: string; name: string | null }>('select id, name from identity."user" where id = any($1)', [can]);
  return new Map(rows.map((r) => [r.id, r.name ?? ""]));
}

export function registerContactReadRoutes(api: OpenAPIHono, { appPool, identityPool, auth }: ApiDeps) {
  const khoa = khoaSoChu();
  // Hồ sơ và mở số: vai không đọc được nhận 404 như liên hệ không có (một thân, không lộ có hay không — AC-5).
  async function vao(c: Context, an = false): Promise<{ userId: string; companyId: string; laTruongNhom: boolean } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    const vai = r.active.roles ?? [];
    if (!vai.includes("listing_agent") && !vai.includes("team_lead")) return an ? API_ERRORS.notFound : API_ERRORS.listingAgentRequired;
    return { userId: user.id, companyId: r.active.id, laTruongNhom: vai.includes("team_lead") };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400) as never;

  api.openapi(
    createRoute({
      method: "get",
      path: BASE,
      summary: "Danh sách liên hệ người xem đọc được — không số, không giá đáy",
      request: { query: z.object({ type: z.enum(CONTACT_TYPES).optional(), status: z.enum(["lead", "contact"]).optional(), q: z.string().max(200).optional(), cursor: z.string().max(200).optional() }) },
      responses: { 200: ok("Một trang liên hệ"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => listContacts(tx, c.req.valid("query"), ctx));
      const ten = await tenNguoi(identityPool, kq.items.map((i) => i.holderUserId));
      return c.json({ items: kq.items.map(({ holderUserId, ...i }) => ({ ...i, holderName: holderUserId ? (ten.get(holderUserId) ?? null) : null })), nextCursor: kq.nextCursor }, 200) as never;
    },
  );

  // POST để số không nằm trên địa chỉ (AC-3).
  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/lookup-phone`,
      summary: "Tìm liên hệ theo số — đọc được thì mã liên hệ; người khác giữ thì chỉ tên người giữ",
      request: { body: { content: { "application/json": { schema: z.object({ phone: z.string().max(40) }) } } } },
      responses: { 200: ok("Kết quả tìm"), 400: err("Số sai khuôn"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const so = normalizePhone(c.req.valid("json").phone);
      if (!so) return tra(c, API_ERRORS.invalidPayload);
      const kq = await withCompany(appPool, ctx, (tx) => lookupPhone(tx, so, ctx.companyId, khoa));
      if ("held" in kq) return c.json({ held: true, holderName: kq.holderUserId ? ((await tenNguoi(identityPool, [kq.holderUserId])).get(kq.holderUserId) ?? null) : null }, 200) as never;
      return c.json(kq, 200) as never;
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/{contactId}/profile`,
      summary: "Hồ sơ một người: số đã che, cơ hội, căn, dòng thời gian",
      request: { params: z.object({ contactId: z.string() }) },
      responses: { 200: ok("Hồ sơ"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c, true);
      if ("code" in ctx) return tra(c, ctx);
      const { contactId } = c.req.valid("param");
      if (!laMa(contactId)) return tra(c, API_ERRORS.notFound);
      const h = await withCompany(appPool, ctx, (tx) => readProfile(tx, contactId, ctx, khoa));
      if (!h) return tra(c, API_ERRORS.notFound);
      const ten = await tenNguoi(identityPool, [h.contact.holderUserId, ...h.opportunities.map((o) => ("agentUserId" in o ? o.agentUserId : null))]);
      const { holderUserId, ...contact } = h.contact;
      return c.json(
        {
          ...h,
          contact: { ...contact, holderName: holderUserId ? (ten.get(holderUserId) ?? null) : null },
          opportunities: h.opportunities.map((o) => {
            if (!("agentUserId" in o)) return o;
            const { agentUserId, ...r } = o;
            return { ...r, agentName: ten.get(agentUserId) ?? null };
          }),
        },
        200,
      ) as never;
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{contactId}/phones/{phoneId}/reveal`,
      summary: "Mở một số của liên hệ — mỗi lần là một sự kiện; không đọc được thì 404 như không có",
      request: { params: z.object({ contactId: z.string(), phoneId: z.string() }) },
      responses: { 200: ok("Số"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c, true);
      if ("code" in ctx) return tra(c, ctx);
      const { contactId, phoneId } = c.req.valid("param");
      if (!laMa(contactId) || !laMa(phoneId)) return tra(c, API_ERRORS.notFound);
      const so = await withCompany(appPool, ctx, (tx) => revealPhone(tx, contactId, phoneId, khoa));
      if (!so) return tra(c, API_ERRORS.notFound);
      c.header("Cache-Control", "no-store");
      return c.json({ phone: so }, 200) as never;
    },
  );
}
