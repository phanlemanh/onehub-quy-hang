import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { decideValueAlias, proposeValueAlias, readValueAliases, type TuDienRefusal } from "./store";

/**
 * Từ điển của sàn (hàng 70): `GET` — mọi dòng và sức khoẻ (mọi vai của sàn), `POST …/proposals` — người nhập file chọn gợi
 * ý thành đề xuất, `PUT …/{id}` — quản trị sàn duyệt hay bỏ. Duyệt không đổi dữ liệu căn nào; chỉ cách gõ đã duyệt vào
 * chuẩn hoá của lần nhập.
 */
const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const Dong = z
  .object({ id: z.string(), field: z.string(), raw: z.string(), value: z.string(), status: z.string(), pickCount: z.number(), proposedAt: z.string(), decidedAt: z.string().nullable() })
  .openapi("ValueAlias");
const SucKhoe = z.object({ gap: z.number(), daNeo: z.number(), cho: z.number(), daBo: z.number(), lanChon: z.number() });
const Bang = z.object({ rows: z.array(Dong), health: z.record(z.string(), SucKhoe) }).openapi("ValueAliases");
const loi = { 400: err("Cách gõ hay quyết sai — lý do nêu chỗ"), 401: err("Chưa đăng nhập"), 403: err("Chưa thuộc sàn, hay sai vai"), 404: err("Không có cách gõ này"), 409: err("Thuộc nhiều sàn, chưa chọn") };

export function registerValueAliasesRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, auth } = deps;
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry, reason?: string) => c.json({ error: l.code, ...(reason && { reason }) }, l.status as 400);
  const traTuChoi = (c: Context, r: TuDienRefusal) =>
    r.refusal === "invalid" ? tra(c, API_ERRORS.invalidSettings, r.reason)
    : r.refusal === "role" ? tra(c, API_ERRORS.importRoleRequired)
    : r.refusal === "forbidden" ? tra(c, API_ERRORS.adminRequired)
    : tra(c, API_ERRORS.notFound);

  api.openapi(
    createRoute({ method: "get", path: "/api/v1/company/value-aliases", summary: "Từ điển của sàn — mọi cách gõ và sức khoẻ dữ liệu theo trường", responses: { 200: ok("Từ điển", Bang), ...loi } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await withCompany(appPool, ctx, readValueAliases), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: "/api/v1/company/value-aliases/proposals",
      summary: "Đề xuất một cách gõ (chữ gốc → giá trị chuẩn); cùng chữ gập thì tăng số lần chọn",
      request: { body: { content: { "application/json": { schema: z.unknown() } } } },
      responses: { 201: ok("Dòng từ điển", Dong), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const than = await c.req.json().catch(() => null);
      const kq = await withCompany(appPool, ctx, (tx) => proposeValueAlias(tx, than));
      if ("refusal" in kq) return traTuChoi(c, kq);
      return c.json(kq, 201);
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: "/api/v1/company/value-aliases/{id}",
      summary: "Quản trị sàn duyệt hay bỏ một cách gõ — không đổi dữ liệu căn nào",
      request: { params: z.object({ id: z.string() }), body: { content: { "application/json": { schema: z.unknown() } } } },
      responses: { 200: ok("Dòng từ điển", Dong), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const than = await c.req.json().catch(() => null);
      const kq = await withCompany(appPool, ctx, (tx) => decideValueAlias(tx, c.req.param("id"), than));
      if ("refusal" in kq) return traTuChoi(c, kq);
      return c.json(kq, 200);
    },
  );
}
