import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { DATA_CLASSES } from "@quy-hang/core";
import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type pg from "pg";
import type { Auth } from "./auth/auth";
import { resolveCompany } from "./auth/company";
import { ACTIVE_COMPANY_COOKIE, AUTH_BASE_PATH } from "./auth/constants";
import { withCompany } from "./db";
import { API_ERRORS } from "./errors";
import { registerListingRoutes } from "./listings/routes";
import { registerMemberRoutes } from "./thanh-vien";

/**
 * API có phiên bản cho mọi bề mặt và mọi hệ thống ngoài (ADR-0017 §4). Mọi thay đổi dữ liệu sẽ là một lệnh qua đây —
 * đường ghi duy nhất; máy chủ kiểm quyền và luật trong packages/core rồi mới ghi sự kiện.
 */
export const API_VERSION = "v1";
const BASE = `/api/${API_VERSION}`;

export type ApiDeps = {
  /** Kết nối tới bảng của công ty — chỉ dùng qua withCompany (vai quy_hang_app). */
  appPool: pg.Pool;
  /** Kết nối danh tính (search_path = identity) — chỉ cho phần danh tính: tạo tài khoản khi mời, đọc email. */
  identityPool: pg.Pool;
  auth: Auth;
};

const Health = z
  .object({
    ok: z.literal(true),
    service: z.literal("quy-hang"),
    apiVersion: z.literal(API_VERSION),
    dataClasses: z.array(z.string()),
  })
  .openapi("Health");

const Company = z.object({ id: z.string(), name: z.string(), roles: z.array(z.string()).optional() }).openapi("Company");
const Me = z
  .object({
    user: z.object({ id: z.string(), email: z.string() }),
    companies: z.array(Company),
    activeCompany: Company.nullable(),
  })
  .openapi("Me");
const ApiError = z.object({ error: z.string() }).openapi("ApiError");
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });

export function createApi(deps: ApiDeps) {
  const { appPool, auth } = deps;
  const api = new OpenAPIHono();

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/health`,
      summary: "Máy chủ còn sống",
      responses: { 200: { description: "Còn sống", content: { "application/json": { schema: Health } } } },
    }),
    (c) =>
      c.json(
        { ok: true as const, service: "quy-hang" as const, apiVersion: API_VERSION as typeof API_VERSION, dataClasses: [...DATA_CLASSES] },
        200,
      ),
  );

  // Danh tính: gửi mã, nhập mã, đăng xuất, đọc phiên — better-auth giữ trọn.
  api.on(["GET", "POST"], `${AUTH_BASE_PATH}/*`, (c) => auth.handler(c.req.raw));

  const viewer = async (c: Context) => (await auth.api.getSession({ headers: c.req.raw.headers }))?.user ?? null;

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/me`,
      summary: "Người đang đăng nhập, các sàn của họ và sàn đang làm",
      responses: { 200: { description: "Người", content: { "application/json": { schema: Me } } }, 401: err("Chưa đăng nhập") },
    }),
    async (c) => {
      const user = await viewer(c);
      if (!user) return c.json({ error: API_ERRORS.unauthenticated.code }, API_ERRORS.unauthenticated.status);
      const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
      return c.json({ user: { id: user.id, email: user.email }, companies: r.companies, activeCompany: r.active }, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/me/company`,
      summary: "Đổi sàn đang làm — chỉ nhận sàn người là thành viên",
      request: { body: { content: { "application/json": { schema: z.object({ companyId: z.string() }) } } } },
      responses: {
        200: { description: "Đã đổi", content: { "application/json": { schema: Company } } },
        401: err("Chưa đăng nhập"),
        403: err("Không thuộc sàn này"),
      },
    }),
    async (c) => {
      const user = await viewer(c);
      if (!user) return c.json({ error: API_ERRORS.unauthenticated.code }, API_ERRORS.unauthenticated.status);
      const { companyId } = c.req.valid("json");
      const r = await resolveCompany(appPool, user.id, companyId);
      if (r.active?.id !== companyId) return c.json({ error: API_ERRORS.notAMember.code }, API_ERRORS.notAMember.status);
      setCookie(c, ACTIVE_COMPANY_COOKIE, companyId, { path: "/", httpOnly: true, sameSite: "Lax", secure: c.req.url.startsWith("https:") });
      return c.json(r.active, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/company`,
      summary: "Sàn đang làm, đọc dưới luật theo dòng — đường dữ liệu mẫu cho mọi đường sau",
      responses: {
        200: { description: "Sàn", content: { "application/json": { schema: Company } } },
        401: err("Chưa đăng nhập"),
        403: err("Chưa thuộc sàn nào"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
      },
    }),
    async (c) => {
      const user = await viewer(c);
      if (!user) return c.json({ error: API_ERRORS.unauthenticated.code }, API_ERRORS.unauthenticated.status);
      const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
      if (!r.active) return r.reason === API_ERRORS.selectCompany.code
        ? c.json({ error: API_ERRORS.selectCompany.code }, API_ERRORS.selectCompany.status)
        : c.json({ error: API_ERRORS.noCompany.code }, API_ERRORS.noCompany.status);
      const row = await withCompany(appPool, { userId: user.id, companyId: r.active.id }, async (tx) => {
        const { rows } = await tx.query<{ id: string; name: string }>(
          "select id, name from companies where id = app.current_company_id()",
        );
        return rows[0];
      });
      if (!row) return c.json({ error: API_ERRORS.noCompany.code }, API_ERRORS.noCompany.status);
      return c.json(row, 200);
    },
  );

  registerMemberRoutes(api, deps);
  registerListingRoutes(api, deps);

  api.doc(`${BASE}/openapi.json`, {
    openapi: "3.0.0",
    info: { title: "Quỹ hàng API", version: API_VERSION },
  });

  return api;
}
