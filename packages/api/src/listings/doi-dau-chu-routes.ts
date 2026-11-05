import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { doi, hoanTac, isRefusal, type Refusal, xemTruoc } from "./doi-dau-chu";

/** Đổi đầu chủ hàng loạt (hàng 89): xem trước, đổi, hoàn tác — chỉ trưởng nhóm. */
const BASE = "/api/v1/listings/agent-reassignments";

const ApiError = z.object({ error: z.string(), details: z.array(z.object({ path: z.string(), reason: z.string() })).optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const json = (schema: z.ZodTypeAny) => ({ body: { content: { "application/json": { schema } } } });
const loi = {
  400: err("Thân sai khuôn, người nhận không phải đầu chủ của sàn, hay quá 200 căn"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn, hoặc không phải trưởng nhóm"),
  404: err("Có căn hay lần đổi không thuộc sàn đang làm"),
  409: err("Chọn sàn, hoặc lần đổi đã hoàn tác"),
};
const XemTruocView = z.object({
  listings: z.array(z.object({ listingId: z.string(), selected: z.boolean(), fromUserId: z.string().nullable(), contactId: z.string().nullable() })),
  contacts: z.number(),
});

export function registerAgentReassignmentRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }

  async function chay<T extends object>(c: Context, trangThai: 200 | 201, fn: (tx: pg.PoolClient) => Promise<T | Refusal>) {
    const ctx = await vao(c);
    if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400);
    const kq = await withCompany(appPool, ctx, async (tx) => {
      const r = await fn(tx);
      if (isRefusal(r)) throw r;
      return r;
    }).catch((e: unknown) => {
      if (isRefusal(e)) return e;
      throw e;
    });
    if (isRefusal(kq)) return c.json({ error: kq.error.code, ...(kq.details && { details: kq.details }) }, kq.error.status as 400);
    return c.json(kq, trangThai);
  }

  api.openapi(
    createRoute({ method: "post", path: `${BASE}/preview`, summary: "Xem trước: căn đã tích, căn cùng chủ nhà, đầu chủ cũ, số liên hệ", request: json(z.record(z.unknown())), responses: { 200: ok("Bản xem trước", XemTruocView), ...loi } }),
    (c) => chay(c, 200, (tx) => xemTruoc(tx, c.req.valid("json"))) as never,
  );
  api.openapi(
    createRoute({ method: "post", path: BASE, summary: "Đổi đầu chủ các căn và người giữ liên hệ chủ nhà, ghi một lần đổi", request: json(z.record(z.unknown())), responses: { 201: ok("Lần đổi", z.object({ id: z.string(), listings: z.number(), contacts: z.number() })), ...loi } }),
    (c) => chay(c, 201, (tx) => doi(tx, c.req.valid("json"))) as never,
  );
  api.openapi(
    createRoute({ method: "post", path: `${BASE}/{id}/undo`, summary: "Hoàn tác một lần đổi, một lần", request: { params: z.object({ id: z.string() }) }, responses: { 200: ok("Kết quả hoàn tác", z.object({ restored: z.number(), skipped: z.number(), keptNoPriorAgent: z.number() })), ...loi } }),
    (c) => chay(c, 200, (tx) => hoanTac(tx, c.req.param("id") ?? "")) as never,
  );
}
