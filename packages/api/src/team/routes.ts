import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { rolesOf } from "../routing/store";
import { tenHienThi } from "../ten-hien-thi";
import { readLeadQueue, readListingAgents } from "./store";

/**
 * Lối của trưởng nhóm cho Hôm nay (hàng 42): hàng đợi lead quá hạn đang mở và danh sách đầu chủ để giao. Chỉ vai
 * `team_lead`; phạm vi cả sàn (chưa có «Nhóm», sổ K5). Không lối nào trả số, tên chủ nhà hay email.
 */
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  401: err("Chưa đăng nhập"),
  403: err("Không phải trưởng nhóm, hay chưa thuộc sàn nào"),
  409: err("Thuộc nhiều sàn, chưa chọn"),
};

const LeadQueue = z
  .object({
    items: z.array(
      z.object({
        leadId: z.string(),
        kind: z.enum(["unrouted", "accept_overdue", "first_call_overdue"]),
        buildingName: z.string(),
        unitNumber: z.string().nullable(),
        agentUserId: z.string().nullable(),
        dueAt: z.string(),
      }),
    ),
  })
  .openapi("TeamLeadQueue");
const ListingAgents = z
  .object({
    items: z.array(z.object({ userId: z.string(), displayName: z.string(), onLeave: z.boolean(), openLeads: z.number() })),
  })
  .openapi("TeamListingAgents");



export function registerTeamRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, identityPool, auth } = deps;
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 401);
  /** Chạy `doc` trong ngữ cảnh sàn khi người gọi là trưởng nhóm; không thì trả lỗi vai, không đọc gì. */
  const truongNhom = <T>(ctx: { userId: string; companyId: string }, doc: (tx: pg.PoolClient) => Promise<T>) =>
    withCompany(appPool, ctx, async (tx) => ((await rolesOf(tx)).includes("team_lead") ? { ok: await doc(tx) } : null));

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/team/lead-queue",
      summary: "Lead đang mở cần trưởng nhóm — chưa chia được, quá hạn nhận, quá hạn gọi; quá hạn lâu nhất trước",
      responses: { 200: ok("Hàng đợi", LeadQueue), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await truongNhom(ctx, readLeadQueue);
      if (!kq) return tra(c, API_ERRORS.teamLeadRequired);
      return c.json({ items: kq.ok }, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/team/listing-agents",
      summary: "Đầu chủ của sàn để giao — tên hiển thị, đang nghỉ, số lead đang mở; không email, không số",
      responses: { 200: ok("Đầu chủ", ListingAgents), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await truongNhom(ctx, readListingAgents);
      if (!kq) return tra(c, API_ERRORS.teamLeadRequired);
      const ten = await tenHienThi(identityPool, kq.ok.map((r) => r.userId));
      return c.json(
        { items: kq.ok.map((r) => ({ userId: r.userId, displayName: ten.get(r.userId) ?? "", onLeave: r.onLeave, openLeads: r.openLeads })) },
        200,
      );
    },
  );
}
