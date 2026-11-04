import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { readCompanySettings, writeCompanySettings } from "./store";

/**
 * Cấu hình theo sàn — lối chung (hàng 82, ADR-0018): mọi thành viên đọc; vai trong `aiDoi` của sổ đổi một hay nhiều
 * điểm nguyên khối. Mỗi khoá ghi thêm một sự kiện vào nhật ký (trigger migration 026). Không khoá nào lớp nguồn.
 */
const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Khoá không có trong sổ, chưa mở, có lối riêng, sai khuôn, ngoài khoảng, hay cặp trái luật — lý do nêu khoá"),
  401: err("Chưa đăng nhập"),
  403: err("Vai không đổi được điểm này, hay chưa thuộc sàn nào"),
  409: err("Thuộc nhiều sàn, chưa chọn"),
};
const Settings = z
  .object({
    items: z.array(
      z.object({
        key: z.string(),
        value: z.unknown(),
        source: z.enum(["default", "company"]),
        updatedBy: z.string().nullable(),
        updatedAt: z.string().nullable(),
      }),
    ),
    errors: z.array(z.string()),
  })
  .openapi("CompanySettings");

export function registerSettingsRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, auth } = deps;
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry, reason?: string) => c.json({ error: l.code, ...(reason && { reason }) }, l.status as 400);

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/company/settings",
      summary: "Cấu hình của sàn — mọi điểm giá trị đơn đã mở của sổ, mặc định khi sàn chưa đổi; lỗi của dòng hỏng ở errors",
      responses: { 200: ok("Cấu hình", Settings), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await withCompany(appPool, ctx, readCompanySettings), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "patch",
      path: "/api/v1/company/settings",
      summary: "Đổi một hay nhiều điểm cấu hình của sàn, nguyên khối — mỗi khoá một sự kiện nhật ký",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: { 200: ok("Cấu hình mới", Settings), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => writeCompanySettings(tx, c.req.valid("json")));
      if ("refusal" in kq) return kq.refusal === "forbidden" ? tra(c, API_ERRORS.adminRequired) : tra(c, API_ERRORS.invalidSettings, kq.reason);
      return c.json(kq, 200);
    },
  );
}
