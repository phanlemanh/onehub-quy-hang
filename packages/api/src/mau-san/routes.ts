import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { readExportTemplates, readPostTemplates, writeExportTemplates, writePostTemplates, type TemplatesRefusal } from "./store";

/**
 * Mẫu của sàn (hàng mau-bang-hang-va-bai): `GET` — mọi vai của sàn đọc để xuất và gửi; `PUT` — Quản trị ghi nguyên khối.
 * Mẫu bảng hàng chỉ mang cột có khoá ra; bảng và bài dựng theo mẫu vẫn qua luật ẩn ở lõi.
 */
const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Mẫu sai khuôn — lý do nêu khoá (PUT)"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa thuộc sàn nào, hay (PUT) không phải quản trị sàn"),
  409: err("Thuộc nhiều sàn, chưa chọn"),
};
const MauBang = z.object({ id: z.string(), ten: z.string(), cot: z.array(z.string()) });
const LoiMauBai = z.object({ dau: z.string(), cuoi: z.string() });
const ExportTemplates = z.object({ templates: z.array(MauBang), errors: z.array(z.string()) }).openapi("ExportTemplates");
const PostTemplates = z
  .object({ templates: z.object({ zalo: LoiMauBai.optional(), facebook: LoiMauBai.optional() }), errors: z.array(z.string()) })
  .openapi("PostTemplates");

export function registerMauSanRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, auth } = deps;
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry, reason?: string) => c.json({ error: l.code, ...(reason && { reason }) }, l.status as 400);
  const tuChoi = (c: Context, kq: TemplatesRefusal) =>
    kq.refusal === "forbidden" ? tra(c, API_ERRORS.adminRequired) : tra(c, API_ERRORS.invalidSettings, kq.reason);

  for (const [duong, ten, schema, doc, ghi] of [
    ["/api/v1/company/templates/export", "Mẫu bảng hàng của sàn (#26) — tên, cột theo thứ tự khi xuất", ExportTemplates, readExportTemplates, writeExportTemplates],
    ["/api/v1/company/templates/posts", "Mẫu bài theo kênh của sàn (#27) — lời mở đầu, lời kết của bài Zalo, Facebook", PostTemplates, readPostTemplates, writePostTemplates],
  ] as const) {
    api.openapi(
      createRoute({ method: "get", path: duong, summary: ten, responses: { 200: ok(ten, schema), ...loi } }),
      async (c) => {
        const ctx = await vao(c);
        if ("code" in ctx) return tra(c, ctx);
        return c.json(await withCompany(appPool, ctx, async (tx): Promise<object> => doc(tx)), 200);
      },
    );
    api.openapi(
      createRoute({
        method: "put",
        path: duong,
        summary: `${ten} — ghi nguyên khối; một mẫu sai thì không ghi gì`,
        request: { body: { content: { "application/json": { schema: z.unknown() } } } },
        responses: { 200: ok(ten, schema), ...loi },
      }),
      async (c) => {
        const ctx = await vao(c);
        if ("code" in ctx) return tra(c, ctx);
        const than = await c.req.json().catch(() => null);
        const kq = await withCompany(appPool, ctx, async (tx): Promise<object> => ghi(tx, than));
        if ("refusal" in kq) return tuChoi(c, kq as TemplatesRefusal);
        return c.json(kq, 200);
      },
    );
  }
}
