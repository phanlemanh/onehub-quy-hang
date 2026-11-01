import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { isRefusal, type Refusal } from "../leads/store";
import { patchContact, readContact } from "./store";

/** Liên hệ (hàng 85, ADR-0021): xem bản của lõi (không số) và sửa loại liên hệ. */
const BASE = "/api/v1/contacts";
const ApiError = z.object({ error: z.string(), details: z.array(z.object({ path: z.string(), reason: z.string() })).optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Sai khuôn, hay bỏ hết loại chủ nhà khi liên hệ còn hàng hoặc lead"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn"),
  404: err("Không có liên hệ này, hay người gọi không được xem"),
  409: err("Chọn sàn"),
};
const Contact = z.object({ id: z.string(), contactTypes: z.array(z.string()) }).passthrough();
const params = z.object({ contactId: z.string() });

export function registerContactRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);
  const tuChoi = (c: Context, r: Refusal) => c.json({ error: r.error.code, ...(r.details && { details: r.details }) }, r.error.status as 400);
  const laMa = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

  api.openapi(
    createRoute({ method: "get", path: `${BASE}/{contactId}`, summary: "Một liên hệ — tên, loại, người giữ, số lượng số, Lead hay Liên hệ; không số", request: { params }, responses: { 200: ok("Liên hệ", Contact), ...loi } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { contactId } = c.req.valid("param");
      if (!laMa(contactId)) return tra(c, API_ERRORS.notFound);
      const v = await withCompany(appPool, ctx, (tx) => readContact(tx, contactId));
      return v ? c.json(v, 200) : tra(c, API_ERRORS.notFound);
    },
  );

  api.openapi(
    createRoute({
      method: "patch",
      path: `${BASE}/{contactId}`,
      summary: "Sửa loại liên hệ (người giữ, trưởng nhóm) — một người nhiều loại vẫn là một liên hệ",
      request: { params, body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: { 200: ok("Liên hệ", Contact), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { contactId } = c.req.valid("param");
      if (!laMa(contactId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => patchContact(tx, contactId, c.req.valid("json")));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );
}
