import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { DongTrangThai } from "../statuses/routes";
import { readLabels, writeLabels } from "./store";

/**
 * Cách gọi riêng (hàng 45): `GET` — bộ nhãn của sàn (mọi vai), `PUT` — quản trị sàn ghi cả bộ nguyên khối. Tên riêng
 * chỉ là chữ hiện; căn vẫn lưu giá trị chuẩn, lọc và đếm theo giá trị chuẩn.
 */
const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Nhãn sai — lý do nêu khoá (PUT)"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa thuộc sàn nào, hay (PUT) không phải quản trị sàn"),
  409: err("Thuộc nhiều sàn, chưa chọn"),
};
const Labels = z
  .object({
    fields: z.array(z.object({ field: z.string(), label: z.string(), default: z.string(), custom: z.boolean() })),
    values: z.array(z.object({ field: z.string(), value: z.string(), label: z.string(), default: z.string(), custom: z.boolean() })),
    // Trạng thái riêng (hàng 46), chỉ đọc: deepEqual thân `GET /api/v1/company/statuses`.
    statuses: z.array(DongTrangThai),
  })
  .openapi("CompanyLabels");
export function registerLabelsRoutes(api: OpenAPIHono, deps: ApiDeps) {
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
      path: "/api/v1/company/labels",
      summary: "Cách gọi riêng của sàn — tên của các trường chuẩn và tên giá trị của tập đóng, kèm tên mặc định",
      responses: { 200: ok("Bộ nhãn", Labels), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await withCompany(appPool, ctx, readLabels), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: "/api/v1/company/labels",
      summary: "Ghi cả bộ cách gọi của sàn, nguyên khối — vắng một trường hay giá trị là trả về mặc định; mỗi khoá đổi một sự kiện nhật ký",
      request: { body: { content: { "application/json": { schema: z.unknown() } } } },
      responses: { 200: ok("Bộ nhãn mới", Labels), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, async (tx) => writeLabels(tx, await c.req.json().catch(() => null)));
      if ("refusal" in kq) return kq.refusal === "forbidden" ? tra(c, API_ERRORS.adminRequired) : tra(c, API_ERRORS.invalidSettings, kq.reason);
      return c.json(kq, 200);
    },
  );
}
