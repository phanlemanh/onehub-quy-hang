import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { rolesOf } from "../routing/store";
import { readAssignedLead, readAssignedLeads, readQueueSettings, writeQueueSettings } from "./store";

/**
 * Hôm nay của đầu chủ (hàng 22): bộ nhóm của sàn (đọc cả sàn, ghi chỉ quản trị sàn) và lead giao cho tôi (vai Đầu chủ).
 * Không lối nào trả số chủ hay khoá nào của lớp nguồn.
 */
const ApiError = z.object({
  error: z.string(),
  details: z.array(z.object({ path: z.string(), reason: z.string() })).optional(),
});
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Bộ nhóm sai — details nêu chỗ sai"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn, hay vai không làm được việc này"),
  409: err("Chọn sàn"),
};
const QueueSettings = z.object({
  groups: z.array(z.record(z.unknown())),
  source: z.enum(["default", "company"]),
  errors: z.array(z.string()),
});
const AssignedLead = z.object({
  id: z.string(),
  buildingName: z.string(),
  unitNumber: z.string().nullable(),
  need: z.string(),
  priceText: z.string(),
  createdAt: z.string(),
  stage: z.string(),
  acceptedAt: z.string().nullable(),
  acceptDueAt: z.string(),
  callDueAt: z.string(),
});
const AssignedLeadDetail = AssignedLead.extend({
  listPrice: z.number(),
  feeInclusion: z.enum(["included", "excluded"]),
  listingId: z.string().nullable(),
});

export function registerTodayRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/company/settings/queue",
      summary: "Bộ nhóm Hôm nay đang áp của sàn — bộ của sàn, hay bộ mặc định (kèm lỗi khi bộ của sàn hỏng)",
      responses: { 200: ok("Bộ nhóm", QueueSettings), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await withCompany(appPool, ctx, readQueueSettings), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: "/api/v1/company/settings/queue",
      summary: "Quản trị sàn ghi bộ nhóm Hôm nay — kiểm chặt, sai thì không ghi gì",
      request: { body: { content: { "application/json": { schema: z.object({ groups: z.unknown() }).strict() } } } },
      responses: { 200: ok("Bộ nhóm mới", QueueSettings), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { groups } = c.req.valid("json");
      const kq = await withCompany(appPool, ctx, async (tx) =>
        (await rolesOf(tx)).includes("company_admin") ? writeQueueSettings(tx, groups) : null,
      );
      if (kq === null) return tra(c, API_ERRORS.adminRequired);
      if (!("groups" in kq)) {
        const l = API_ERRORS.invalidSettings;
        return c.json({ error: l.code, details: kq.errors.map((reason) => ({ path: "groups", reason })) }, l.status);
      }
      return c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/leads/assigned",
      summary: "Lead giao cho tôi đang ở nhóm lead của bộ đang áp — toà, căn, nhu cầu, câu giá, hạn nhận, hạn gọi; không số chủ",
      responses: { 200: ok("Lead giao cho tôi", z.array(AssignedLead)), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, async (tx) =>
        (await rolesOf(tx)).includes("listing_agent") ? readAssignedLeads(tx) : null,
      );
      return kq === null ? tra(c, API_ERRORS.listingAgentRequired) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/leads/assigned/{leadId}",
      summary: "Một lead giao cho tôi bất kể nhóm Hôm nay — như dòng danh sách, thêm giá số, điều kiện phí, hồ sơ căn của lead; không số chủ",
      request: { params: z.object({ leadId: z.string() }) },
      responses: { 200: ok("Lead giao cho tôi", AssignedLeadDetail), 404: err("Không phải lead của tôi, đã bỏ hay đã trả lại"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { leadId } = c.req.valid("param");
      const kq = await withCompany(appPool, ctx, async (tx) => {
        if (!(await rolesOf(tx)).includes("listing_agent")) return API_ERRORS.listingAgentRequired;
        // Mã không đúng khuôn trả 404 như lead không có — không để câu chọn báo lỗi kiểu.
        return /^[0-9a-f-]{36}$/i.test(leadId) ? ((await readAssignedLead(tx, leadId)) ?? API_ERRORS.notFound) : API_ERRORS.notFound;
      });
      return "code" in kq ? tra(c, kq) : c.json(kq, 200);
    },
  );
}
