import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE, AUTH_BASE_PATH } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { khoaSoChu } from "../owners/khoa";
import { guiHopThu, webPushSender } from "./gui";
import { khoaVapid } from "./khoa-vapid";
import { goDangKy, luuDangKy } from "./store";

/**
 * Thông báo lead (hàng 26, ADR-0025): khoá công khai VAPID cho trình duyệt, bật và gỡ đăng ký của thiết bị. Đăng ký gắn
 * người và sàn đang làm; luật theo dòng chỉ cho người chạm đăng ký của chính mình.
 */
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const loi = { 401: err("Chưa đăng nhập"), 403: err("Chưa gắn sàn"), 409: err("Chọn sàn") };

const Endpoint = z.string().url().startsWith("https://").max(2048);
const DangKy = z
  .object({
    endpoint: Endpoint,
    expirationTime: z.number().nullable().optional(),
    keys: z.object({ p256dh: z.string().regex(/^[A-Za-z0-9_-]{80,100}=*$/), auth: z.string().regex(/^[A-Za-z0-9_-]{16,32}=*$/) }).strict(),
  })
  .strict();
const GoDangKy = z.object({ endpoint: Endpoint }).strict();

/** Lối giao lead gửi các dòng mới của sàn sau khi giao dịch đã ghi xong; dòng lỗi tạm để nhịp chia gửi lại. */
export const guiSauKhiGhi = (deps: ApiDeps, companyId: string) =>
  guiHopThu(deps.appPool, companyId, deps.pushSender ?? webPushSender, new Date(), true);

export function registerPushRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 401);

  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/push/public-key",
      summary: "Khoá công khai VAPID của máy chủ — máy chủ tự sinh ở lần dùng đầu",
      responses: {
        200: { description: "Khoá", content: { "application/json": { schema: z.object({ publicKey: z.string() }) } } },
        ...loi,
        503: err("Máy chủ chưa dựng được khoá"),
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      let goc;
      try {
        goc = khoaSoChu();
      } catch {
        return tra(c, API_ERRORS.pushNotConfigured);
      }
      const k = await withCompany(appPool, ctx, (tx) => khoaVapid(tx, goc));
      return c.json({ publicKey: k.publicKey }, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: "/api/v1/me/push-subscriptions",
      summary: "Lưu đăng ký nhận thông báo của thiết bị này — bật lại cùng thiết bị không thêm dòng",
      request: { body: { content: { "application/json": { schema: DangKy } } } },
      responses: {
        200: { description: "Đã có, cập nhật khoá", content: { "application/json": { schema: z.object({ ok: z.literal(true) }) } } },
        201: { description: "Đã lưu", content: { "application/json": { schema: z.object({ ok: z.literal(true) }) } } },
        400: err("Thân sai khuôn"),
        ...loi,
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const r = await withCompany(appPool, ctx, (tx) => luuDangKy(tx, c.req.valid("json")));
      return c.json({ ok: true as const }, r.moi ? 201 : 200);
    },
  );

  api.openapi(
    createRoute({
      method: "delete",
      path: "/api/v1/me/push-subscriptions",
      summary: "Gỡ đăng ký nhận thông báo của thiết bị này",
      request: { body: { content: { "application/json": { schema: GoDangKy } } } },
      responses: { 204: { description: "Đã gỡ" }, 400: err("Thân sai khuôn"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      await withCompany(appPool, ctx, (tx) => goDangKy(tx, c.req.valid("json").endpoint));
      return c.body(null, 204);
    },
  );
}

/**
 * Đăng xuất gỡ đăng ký của thiết bị: thân yêu cầu đăng xuất mang `pushEndpoint` (thiết bị đang bật) thì gỡ trước, rồi
 * chuyển cho better-auth như mọi lần đăng xuất. Phải đăng ký TRƯỚC lối danh tính chung. Gỡ lỗi thì vẫn đăng xuất.
 */
export function registerPushSignOut(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  api.post(`${AUTH_BASE_PATH}/sign-out`, async (c) => {
    const raw = c.req.raw;
    const than = await raw.clone().json().catch(() => null) as { pushEndpoint?: unknown } | null;
    const endpoint = Endpoint.safeParse(than?.pushEndpoint);
    if (endpoint.success) {
      try {
        const user = (await auth.api.getSession({ headers: raw.headers }))?.user;
        const r = user ? await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE)) : null;
        if (user && r?.active) await withCompany(appPool, { userId: user.id, companyId: r.active.id }, (tx) => goDangKy(tx, endpoint.data));
      } catch (e) {
        console.error("đăng xuất: gỡ đăng ký thông báo lỗi", e instanceof Error ? e.message.slice(0, 200) : "");
      }
    }
    return auth.handler(raw);
  });
}
