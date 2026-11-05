import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { docMau, suaMau, xoaMau } from "./store";

/**
 * Mẫu file nhập của sàn (hàng 50 mau-nhap-va-bai): Quản trị sàn xem, sửa, xoá từng cột đã nhớ. Khoá tiêu đề đi trong đường
 * dẫn dạng mã hoá URL. Sửa và xoá ghi thêm một dòng sổ (`import_templates`, chỉ thêm); lần nhập đã mở hay đã ghi không đổi.
 */
const BASE = "/api/v1/company/import-templates";
const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const loi = { 401: err("Chưa đăng nhập"), 403: err("Không phải Quản trị sàn, hay chưa thuộc sàn nào"), 404: err("Khoá không có trong mẫu"), 409: err("Chọn sàn") };
const Transform = z.object({ name: z.string(), params: z.record(z.unknown()).optional() });
const Cot = z.object({
  headerKey: z.string(),
  target: z.string(),
  transform: Transform.optional(),
  valueMap: z.record(z.string()).optional(),
  nguon: z.union([
    z.object({ kieu: z.literal("lan-nhap"), importId: z.string(), at: z.string() }),
    z.object({ kieu: z.literal("sua"), editedBy: z.string().nullable(), at: z.string() }),
  ]),
});
const BanSua = z.object({ target: z.string(), transform: Transform.optional(), valueMap: z.record(z.string()).optional() }).strict();

export function registerTemplateRoutes(api: OpenAPIHono, { appPool, identityPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    if (!(r.active.roles ?? []).includes("company_admin")) return API_ERRORS.adminRequired;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry, reason?: string) => c.json({ error: l.code, ...(reason && { reason }) }, l.status as 400) as never;
  async function ra(cot: Awaited<ReturnType<typeof docMau>>) {
    const ids = [...new Set(cot.map((c) => c.sua?.editedBy).filter((x): x is string => !!x))];
    const ten = ids.length
      ? new Map((await identityPool.query<{ id: string; name: string | null }>('select id, name from identity."user" where id = any($1::text[])', [ids])).rows.map((r) => [r.id, r.name]))
      : new Map<string, string | null>();
    return cot.map(({ sua, importId, at, ...c }) => ({
      ...c,
      nguon: sua ? { kieu: "sua" as const, editedBy: ten.get(sua.editedBy) ?? null, at } : { kieu: "lan-nhap" as const, importId, at },
    }));
  }

  api.openapi(
    createRoute({ method: "get", path: BASE, summary: "Mẫu file nhập của sàn — mỗi tiêu đề đã nhớ một dòng, kèm nguồn", responses: { 200: { description: "Mẫu", content: { "application/json": { schema: z.array(Cot) } } }, ...loi } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await ra(await withCompany(appPool, ctx, docMau)), 200) as never;
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: `${BASE}/{headerKey}`,
      summary: "Sửa một cột đã nhớ — lần nhập kế dùng bản mới",
      request: { params: z.object({ headerKey: z.string().min(1).max(200) }), body: { content: { "application/json": { schema: BanSua } } } },
      responses: { 200: { description: "Cột sau khi sửa", content: { "application/json": { schema: Cot } } }, 400: err("Bản sửa trái luật — lý do"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => suaMau(tx, c.req.valid("param").headerKey, c.req.valid("json")));
      if ("loi" in kq) return kq.loi === "khong-co" ? tra(c, API_ERRORS.notFound) : tra(c, API_ERRORS.invalidPayload, kq.lyDo);
      return c.json((await ra([kq.ok]))[0], 200) as never;
    },
  );

  api.openapi(
    createRoute({
      method: "delete",
      path: `${BASE}/{headerKey}`,
      summary: "Xoá một cột đã nhớ — lần nhập kế ghép lại từ đầu",
      request: { params: z.object({ headerKey: z.string().min(1).max(200) }) },
      responses: { 204: { description: "Đã xoá" }, ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      if (!(await withCompany(appPool, ctx, (tx) => xoaMau(tx, c.req.valid("param").headerKey)))) return tra(c, API_ERRORS.notFound);
      return c.body(null, 204) as never;
    },
  );
}
