import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { readFields, writeFields, type FieldsRefusal } from "./store";

/**
 * Trường riêng (hàng 47): `GET` — bộ trường của sàn (mọi vai của sàn); `PUT` — quản trị sàn ghi cả bộ nguyên khối. Tên trùng
 * nghĩa một trường chuẩn → 409 kèm trường chuẩn (đổi tên ở Cách gọi, §7 câu hỏi thứ nhất).
 */
const ApiError = z.object({
  error: z.string(),
  reason: z.string().optional(),
  standardField: z.string().optional(),
  standardLabel: z.string().optional(),
});
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Bộ trường sai — lý do nêu khoá (PUT)"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa thuộc sàn nào, hay (PUT) không phải quản trị sàn"),
  409: err("Thuộc nhiều sàn, chưa chọn; hay (PUT) tên trùng nghĩa một trường chuẩn — kèm trường chuẩn"),
};
const Truong = z.object({
  code: z.string(),
  target: z.enum(["listing", "contact"]),
  contactTypes: z.array(z.string()),
  kind: z.enum(["bool", "single_select"]),
  label: z.string(),
  options: z.array(z.object({ code: z.string(), label: z.string() })),
  dataClass: z.enum(["custom_field", "source"]),
  archived: z.boolean(),
});
const Fields = z.object({ fields: z.array(Truong) }).openapi("CompanyFields");

export function registerCustomFieldsRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, auth } = deps;
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry, them: Record<string, unknown> = {}) => c.json({ error: l.code, ...them }, l.status as 400);

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/company/fields",
      summary: "Trường riêng của sàn — trường của hàng và của liên hệ theo loại, kèm kiểu, lựa chọn, lớp; trường đã bỏ đứng sau",
      responses: { 200: ok("Bộ trường riêng", Fields), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await withCompany(appPool, ctx, readFields), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: "/api/v1/company/fields",
      summary: "Ghi cả bộ trường riêng của sàn, nguyên khối — trường còn sống phải đủ; bỏ trường bằng archived; tên trùng nghĩa trường chuẩn bị từ chối",
      request: { body: { content: { "application/json": { schema: z.unknown() } } } },
      responses: { 200: ok("Bộ trường riêng mới", Fields), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const than = await c.req.json().catch(() => null);
      const kq = await withCompany(appPool, ctx, async (tx) => {
        const r = await writeFields(tx, than);
        if ("refusal" in r) throw r;
        return r;
      }).catch((e: unknown) => {
        if (e && typeof e === "object" && "refusal" in e) return e as FieldsRefusal;
        throw e;
      });
      if (!("refusal" in kq)) return c.json(kq, 200);
      if (kq.refusal === "forbidden") return tra(c, API_ERRORS.adminRequired);
      if (kq.refusal === "trung-nghia")
        return tra(c, API_ERRORS.customFieldSameMeaning, { reason: kq.reason, standardField: kq.trungNghia.truong, standardLabel: kq.trungNghia.nhan });
      return tra(c, API_ERRORS.invalidSettings, { reason: kq.reason });
    },
  );
}
