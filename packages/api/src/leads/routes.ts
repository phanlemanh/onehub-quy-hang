import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { leadResultView, type LeadRecord } from "@quy-hang/core/dedupe";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { SAMPLE_CATALOG } from "../catalog/sample";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { createLead, discardLead, isRefusal, readOwnLead, type Refusal } from "./store";

/**
 * Ô nhận lead (hàng 24, ADR-0012). Người nhập chỉ nhận bản của telesales (`leadResultView` của lõi): kết quả kiểm trùng,
 * tên đầu chủ nhận, năm mục trừ số chủ — không mã hàng, không trường nào của hàng (luật 21).
 */
const BASE = "/api/v1/leads";

const ApiError = z.object({ error: z.string(), details: z.array(z.object({ path: z.string(), reason: z.string() })).optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Thiếu hay sai mục, hoặc bỏ lead không phải căn trùng"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn, hoặc vai không nhập được lead"),
  404: err("Không có lead này của người gọi"),
  409: err("Chọn sàn, hoặc lead đã bỏ"),
};
const Lead = z.object({ id: z.string(), outcome: z.string() }).passthrough();

/** Tên toà của danh mục mẫu (hàng 5) — chọn «chỉ biết toà». Danh mục thật thay ở hàng 10. */
const TOA = [...new Set(SAMPLE_CATALOG.projects.flatMap((p) => p.buildings.map((b) => b.buildingName)))].sort();

async function tenNguoi(identityPool: pg.Pool, userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const { rows } = await identityPool.query<{ name: string }>('select name from "user" where id = $1', [userId]);
  return rows[0]?.name ?? null;
}

export function registerLeadRoutes(api: OpenAPIHono, { appPool, identityPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);
  const tuChoi = (c: Context, r: Refusal) => c.json({ error: r.error.code, ...(r.details && { details: r.details }) }, r.error.status as 400);
  const ban = async (l: LeadRecord) => leadResultView(l, await tenNguoi(identityPool, l.matchedAgentUserId));
  const laMa = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/buildings`,
      summary: "Tên toà của danh mục — chọn khi chỉ biết toà",
      responses: { 200: ok("Tên toà", z.array(z.string())), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(TOA, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: BASE,
      summary: "Nhập lead năm mục — kiểm trùng ngay, trả kết quả cho người nhập",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: { 201: ok("Đã nhập", Lead), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => createLead(tx, c.req.valid("json")));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(await ban(kq), 201);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/{leadId}`,
      summary: "Kết quả của một lead mình đã nhập",
      request: { params: z.object({ leadId: z.string() }) },
      responses: { 200: ok("Lead", Lead), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { leadId } = c.req.valid("param");
      if (!laMa(leadId)) return tra(c, API_ERRORS.notFound);
      const l = await withCompany(appPool, ctx, (tx) => readOwnLead(tx, leadId));
      return l ? c.json(await ban(l), 200) : tra(c, API_ERRORS.notFound);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{leadId}/discard`,
      summary: "«Bỏ lead này» — chỉ lead căn trùng, chỉ người nhập, một lần, có ghi lại",
      request: { params: z.object({ leadId: z.string() }) },
      responses: { 200: ok("Đã bỏ", Lead), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { leadId } = c.req.valid("param");
      if (!laMa(leadId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => discardLead(tx, leadId));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(await ban(kq), 200);
    },
  );
}
