import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { leadResultView, myLeadView, type LeadRecord, type MyLeadRecord } from "@quy-hang/core/dedupe";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { SAMPLE_CATALOG } from "../catalog/sample";
import { withCompany } from "../db";
import { guiSauKhiGhi } from "../push/routes";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import {
  createLead,
  createListingFromLead,
  discardLead,
  isRefusal,
  listMyLeads,
  readOwnLead,
  RefusalAfterWrite,
  resubmitLead,
  returnLead,
  type Refusal,
} from "./store";

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
  409: err("Chọn sàn, lead đã bỏ, đã trả lại, đã lên bảng, chưa trả lại hay đã gửi lại"),
};
const Lead = z.object({ id: z.string(), outcome: z.string() }).passthrough();

/** Tên toà của danh mục mẫu (hàng 5) — chọn «chỉ biết toà». Danh mục thật thay ở hàng 10. */
const TOA = [...new Set(SAMPLE_CATALOG.subdivisions.flatMap((p) => p.buildings.map((b) => b.buildingName)))].sort();

async function tenNguoi(identityPool: pg.Pool, userId: string | null): Promise<string | null> {
  if (!userId) return null;
  const { rows } = await identityPool.query<{ name: string }>('select name from "user" where id = $1', [userId]);
  return rows[0]?.name ?? null;
}

export function registerLeadRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, identityPool, auth } = deps;
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
      if (isRefusal(kq)) return tuChoi(c, kq);
      await guiSauKhiGhi(deps, ctx.companyId);
      return c.json(await ban(kq), 201);
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

  // ---- Lead bốn nấc (hàng 27, ADR-0020): bản `myLeadView` của lõi — nấc và mốc, không số chủ, không mã hàng ----
  const banNac = async (rows: MyLeadRecord[]) => {
    const ten = new Map<string, string | null>();
    for (const r of rows) if (r.matchedAgentUserId && !ten.has(r.matchedAgentUserId)) ten.set(r.matchedAgentUserId, await tenNguoi(identityPool, r.matchedAgentUserId));
    return rows.map((r) => myLeadView(r, r.matchedAgentUserId ? (ten.get(r.matchedAgentUserId) ?? null) : null));
  };

  api.openapi(
    createRoute({
      method: "get",
      path: BASE,
      summary: "Lead mình đã nhập, mới nhất trước — nấc, mốc từng nấc, tên đầu chủ",
      responses: { 200: ok("Lead đã nhập", z.array(Lead)), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const rows = await withCompany(appPool, ctx, (tx) => listMyLeads(tx));
      return c.json(await banNac(rows), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{leadId}/return`,
      summary: "Đầu chủ trả lại lead — số không liên lạc được; được tới khi lead lên bảng",
      request: { params: z.object({ leadId: z.string() }) },
      responses: { 200: ok("Đã trả lại", Lead), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { leadId } = c.req.valid("param");
      if (!laMa(leadId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => returnLead(tx, leadId));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json((await banNac([kq]))[0], 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{leadId}/resubmit`,
      summary: "«Sửa số và gửi lại» — lead mới với số mới, kiểm trùng và chia như lead mới",
      request: {
        params: z.object({ leadId: z.string() }),
        body: { content: { "application/json": { schema: z.record(z.unknown()) } } },
      },
      responses: { 201: ok("Lead mới", Lead), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { leadId } = c.req.valid("param");
      if (!laMa(leadId)) return tra(c, API_ERRORS.notFound);
      try {
        const kq = await withCompany(appPool, ctx, (tx) => resubmitLead(tx, leadId, c.req.valid("json")));
        if (isRefusal(kq)) return tuChoi(c, kq);
        await guiSauKhiGhi(deps, ctx.companyId);
        return c.json((await banNac([kq]))[0], 201);
      } catch (e) {
        if (e instanceof RefusalAfterWrite) return tuChoi(c, e.refusal);
        throw e;
      }
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{leadId}/listing`,
      summary: "Đầu chủ của lead tạo hàng từ lead — hàng mang mã lead, chủ nhà là liên hệ của lead",
      request: { params: z.object({ leadId: z.string() }) },
      responses: { 201: ok("Hàng mới", z.object({ id: z.string() })), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { leadId } = c.req.valid("param");
      if (!laMa(leadId)) return tra(c, API_ERRORS.notFound);
      try {
        const kq = await withCompany(appPool, ctx, (tx) => createListingFromLead(tx, leadId));
        return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 201);
      } catch (e) {
        if (e instanceof RefusalAfterWrite) return tuChoi(c, e.refusal);
        throw e;
      }
    },
  );
}
