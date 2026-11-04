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
import { registerOwnerRoutes } from "./owners/routes";
import { registerImportRoutes } from "./imports/routes";
import { registerFeedRoutes } from "./catalog/feeds";
import { registerCatalogRoutes } from "./catalog/routes";
import { registerCatalogReadAll } from "./catalog/doc-ca-danh-muc";
import { registerContactRoutes } from "./contacts/routes";
import { registerLeadRoutes } from "./leads/routes";
import { registerRoutingRoutes } from "./routing/routes";
import { registerSettingsRoutes } from "./settings/routes";
import { registerTeamRoutes } from "./team/routes";
import { registerTodayRoutes } from "./today/routes";
import { registerJobRoutes } from "./jobs/routes";
import { registerMemberRoutes } from "./thanh-vien";
import { registerPhotoRoutes } from "./photos/routes";
import { registerPublicRoutes } from "./public/routes";
import type { NguonCongKhai } from "./public/store";
import { registerDaGuiRoutes } from "./da-gui/routes";
import { registerTodayBuyerRoutes } from "./today-buyer/routes";
import { registerSyncRoutes } from "./sync/routes";
import { registerExportRoutes } from "./exports/routes";
import type { KhoAnh, KhoAnhVang } from "./photos/kho";
import type { PushSender } from "./push/gui";
import { chanMayBiBao } from "./auth/may-bi-bao";
import { registerDeviceRoutes } from "./me/routes";
import { registerPushRoutes, registerPushSignOut } from "./push/routes";

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
  /** Khoá của lối việc nền (`JOB_SECRET`); vắng thì lối ấy trả 503. Chủ kho đặt ở Vercel và Supabase (ADR-0017). */
  jobSecret?: string;
  /** Kho byte ảnh (ADR-0014); vắng thì chọn theo môi trường — test truyền bản S3 trỏ máy chủ giả. */
  khoAnh?: KhoAnh | KhoAnhVang;
  /** Bộ gửi thông báo lead (ADR-0025); vắng thì gửi bằng `web-push` — test truyền bộ gửi giả ghi lại. */
  pushSender?: PushSender;
  /** Nguồn dữ liệu của route công khai trang khách; vắng thì đọc cơ sở dữ liệu — bài rò rỉ của rào route truyền nguồn mồi. */
  nguonCongKhai?: NguonCongKhai;
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

  // Đăng xuất gỡ đăng ký thông báo của thiết bị trước khi tới better-auth (ADR-0025) — đăng ký trước lối danh tính chung.
  registerPushSignOut(api, deps);
  // Danh tính: gửi mã, nhập mã, đăng xuất, đọc phiên — better-auth giữ trọn.
  api.on(["GET", "POST"], `${AUTH_BASE_PATH}/*`, (c) => auth.handler(c.req.raw));
  // Máy bị báo mất (hàng 38): 401 của phiên đã bị thu qua «Báo mất máy» mang mã riêng để máy ấy xoá kho của người.
  api.use(`${BASE}/*`, chanMayBiBao(deps.identityPool));

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
  registerOwnerRoutes(api, deps);
  registerImportRoutes(api, deps);
  registerCatalogRoutes(api, deps);
  registerFeedRoutes(api, deps);
  registerCatalogReadAll(api, deps);
  // Hàng 22: trước lối lead — /leads/assigned phải khớp trước /leads/{leadId}.
  registerTodayRoutes(api, deps);
  registerLeadRoutes(api, deps);
  registerRoutingRoutes(api, deps);
  // Hàng 82: cấu hình theo sàn qua lối chung, có nhật ký.
  registerSettingsRoutes(api, deps);
  // Hàng 42: Hôm nay trưởng nhóm — hàng đợi lead quá hạn, đầu chủ để giao.
  registerTeamRoutes(api, deps);
  registerContactRoutes(api, deps);
  registerJobRoutes(api, deps);
  registerPushRoutes(api, deps);
  registerDeviceRoutes(api, deps);
  registerPhotoRoutes(api, deps, deps.khoAnh);
  registerPublicRoutes(api, deps, deps.khoAnh);
  registerDaGuiRoutes(api, deps);
  registerTodayBuyerRoutes(api, deps);
  registerSyncRoutes(api, deps);
  registerExportRoutes(api, deps);

  api.doc(`${BASE}/openapi.json`, {
    openapi: "3.0.0",
    info: { title: "Quỹ hàng API", version: API_VERSION },
  });

  return api;
}
