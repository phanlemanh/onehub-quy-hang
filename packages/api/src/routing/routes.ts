import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import {
  acceptLead,
  canReadAlerts,
  claimLead,
  isRefusal,
  markFirstCall,
  readAlerts,
  readPool,
  readSettings,
  reassignLead,
  rolesOf,
  setLeave,
  writeSettings,
  type Refusal,
} from "./store";

/**
 * Chia lead và hạn — lối của người (hàng 25, ADR-0017): cấu hình chia lead của sàn, nhận và ghi gọi, kho chung, giao lại,
 * đánh dấu nghỉ, danh sách báo. Mặc định và thực đơn ở lõi (`@quy-hang/core/routing`); không lối nào trả số chủ.
 */
const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Cấu hình sai, người nhận không phải đầu chủ, hay lead không giao được"),
  401: err("Chưa đăng nhập"),
  403: err("Vai không làm được việc này, hay người đang nghỉ"),
  404: err("Không có lead hay người này"),
  409: err("Chọn sàn, hoặc mốc đã ghi, lead đã có người"),
};
const Settings = z.object({
  strategy: z.string(),
  acceptMinutes: z.number(),
  firstCallMinutes: z.number(),
  alertTo: z.string(),
});
const Moc = z.object({ id: z.string(), acceptedAt: z.string().nullable(), firstCalledAt: z.string().nullable() });
const leadParam = { params: z.object({ leadId: z.string() }) };
const laMa = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

async function tenNguoi(identityPool: pg.Pool, ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const { rows } = await identityPool.query<{ id: string; name: string }>('select id, name from "user" where id = any($1)', [ids]);
  return new Map(rows.map((r) => [r.id, r.name]));
}

export function registerRoutingRoutes(api: OpenAPIHono, { appPool, identityPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);
  const tuChoi = (c: Context, r: Refusal) => c.json({ error: r.error.code, ...(r.reason && { reason: r.reason }) }, r.error.status as 400);

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/company/settings/lead-routing",
      summary: "Cấu hình chia lead của sàn — cách chia, hạn nhận, hạn gọi, người đọc báo (mặc định khi chưa đặt)",
      responses: { 200: ok("Cấu hình", Settings), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await withCompany(appPool, ctx, readSettings), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: "/api/v1/company/settings/lead-routing",
      summary: "Quản trị sàn đổi một phần cấu hình chia lead — áp cho lead chưa vào nhịp",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: { 200: ok("Cấu hình mới", Settings), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const body = c.req.valid("json");
      const kq = await withCompany(appPool, ctx, async (tx) =>
        (await rolesOf(tx)).includes("company_admin") ? writeSettings(tx, body) : ({ error: API_ERRORS.adminRequired } as Refusal),
      );
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: "/api/v1/company/members/{userId}/leave",
      summary: "Đánh dấu một người nghỉ hay đi làm lại — chính người đó, trưởng nhóm, quản trị sàn",
      request: {
        params: z.object({ userId: z.string() }),
        body: { content: { "application/json": { schema: z.object({ onLeave: z.boolean() }) } } },
      },
      responses: { 200: ok("Đã ghi", z.object({ userId: z.string(), onLeave: z.boolean() })), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { userId } = c.req.valid("param");
      const { onLeave } = c.req.valid("json");
      const kq = await withCompany(appPool, ctx, (tx) => setLeave(tx, userId, onLeave));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json({ userId, onLeave }, 200);
    },
  );

  for (const [duoi, ghi, tom] of [
    ["accept", acceptLead, "Đầu chủ nhận lead đã về mình"],
    ["first-call", markFirstCall, "Đầu chủ ghi đã gọi lần đầu (chưa nhận thì ghi luôn mốc nhận)"],
    ["claim", claimLead, "Đầu chủ tự nhận một lead ở kho chung của toà mình phụ trách"],
  ] as const) {
    api.openapi(
      createRoute({
        method: "post",
        path: `/api/v1/leads/{leadId}/${duoi}`,
        summary: tom,
        request: leadParam,
        responses: { 200: ok("Đã ghi", Moc), ...loi },
      }),
      async (c) => {
        const ctx = await vao(c);
        if ("code" in ctx) return tra(c, ctx);
        const { leadId } = c.req.valid("param");
        if (!laMa(leadId)) return tra(c, API_ERRORS.notFound);
        const kq = await withCompany(appPool, ctx, async (tx) => {
          if (duoi === "claim" && !(await rolesOf(tx)).includes("listing_agent")) return { error: API_ERRORS.listingAgentRequired } as Refusal;
          return ghi(tx, leadId);
        });
        return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
      },
    );
  }

  api.openapi(
    createRoute({
      method: "post",
      path: "/api/v1/leads/{leadId}/assign",
      summary: "Trưởng nhóm giao một lead cho một đầu chủ — mốc hạn bắt đầu lại",
      request: { ...leadParam, body: { content: { "application/json": { schema: z.object({ agentUserId: z.string() }) } } } },
      responses: {
        200: ok("Đã giao", z.object({ id: z.string(), agentUserId: z.string(), deadlineFrom: z.string() })),
        ...loi,
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { leadId } = c.req.valid("param");
      const { agentUserId } = c.req.valid("json");
      if (!laMa(leadId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => reassignLead(tx, leadId, agentUserId));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/lead-pool",
      summary: "Lead kho chung chưa ai nhận ở toà người gọi phụ trách — không chủ nhà, không số",
      responses: {
        200: ok(
          "Kho chung",
          z.array(z.object({ id: z.string(), buildingName: z.string(), unitNumber: z.string().nullable(), need: z.string(), createdAt: z.string() })),
        ),
        ...loi,
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, async (tx) =>
        (await rolesOf(tx)).includes("listing_agent") ? readPool(tx) : ({ error: API_ERRORS.listingAgentRequired } as Refusal),
      );
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/lead-alerts",
      summary: "Lời báo của sàn, mới nhất trước — trưởng nhóm, và quản trị khi sàn chọn",
      responses: {
        200: ok(
          "Lời báo",
          z.array(
            z.object({
              id: z.string(),
              kind: z.string(),
              leadId: z.string(),
              buildingName: z.string(),
              unitNumber: z.string().nullable(),
              agentUserId: z.string().nullable(),
              agentName: z.string().nullable(),
              deadlineFrom: z.string(),
              raisedAt: z.string(),
            }),
          ),
        ),
        ...loi,
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, async (tx) =>
        (await canReadAlerts(tx)) ? readAlerts(tx) : ({ error: API_ERRORS.alertReaderRequired } as Refusal),
      );
      if (isRefusal(kq)) return tuChoi(c, kq);
      const ten = await tenNguoi(identityPool, [...new Set(kq.flatMap((a) => (a.agent_user_id ? [a.agent_user_id] : [])))]);
      return c.json(
        kq.map((a) => ({
          id: a.id,
          kind: a.kind,
          leadId: a.lead_id,
          buildingName: a.building_name,
          unitNumber: a.unit_number,
          agentUserId: a.agent_user_id,
          agentName: a.agent_user_id ? (ten.get(a.agent_user_id) ?? null) : null,
          deadlineFrom: a.deadline_from.toISOString(),
          raisedAt: a.raised_at.toISOString(),
        })),
        200,
      );
    },
  );
}
