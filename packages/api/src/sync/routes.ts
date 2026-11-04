import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

/**
 * Lượt mất mạng (hàng ghi-thiet-bi-va-mat-mang): bộ đồng bộ trên máy ghi lúc mất mạng bắt đầu và lúc có mạng lại, rồi gửi
 * về đây — máy chủ không thấy lúc máy mất mạng. Một dòng cho người đang làm ở sàn đang làm; gửi lại cùng giờ bắt đầu của
 * cùng người và thiết bị không thêm dòng, nên bộ đồng bộ gửi lại được khi lần gửi trước mất phản hồi. Khuôn chặt: không ô
 * nào ngoài giờ, thiết bị và số thao tác — không đường cho thông tin chủ nhà (bất biến 2).
 */
const BASE = "/api/v1/sync/offline-sessions";

const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });

const Luot = z
  .object({
    startedAt: z.string().datetime({ offset: true }),
    endedAt: z.string().datetime({ offset: true }),
    device: z.enum(["desktop", "mobile"]),
    queuedOps: z.number().int().min(0).max(100_000),
  })
  .strict()
  .refine((l) => Date.parse(l.endedAt) >= Date.parse(l.startedAt), { message: "endedAt trước startedAt", path: ["endedAt"] });

export function registerSyncRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
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
      method: "post",
      path: BASE,
      summary: "Ghi một lượt mất mạng của người đang làm — gửi lại không trùng",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: {
        201: { description: "Đã ghi", content: { "application/json": { schema: z.object({ recorded: z.boolean() }) } } },
        200: { description: "Đã có từ lần gửi trước", content: { "application/json": { schema: z.object({ recorded: z.boolean() }) } } },
        400: err("Lượt sai khuôn"),
        401: err("Chưa đăng nhập"),
        403: err("Chưa gắn sàn"),
        409: err("Chọn sàn"),
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = Luot.safeParse(c.req.valid("json"));
      if (!kq.success) {
        const details = kq.error.issues.map((i) => ({ path: i.path.join(".") || "body", reason: i.message }));
        return c.json({ error: API_ERRORS.invalidPayload.code, details }, 400);
      }
      const l = kq.data;
      const moi = await withCompany(appPool, ctx, async (tx) => {
        const { rowCount } = await tx.query(
          `insert into offline_sessions (company_id, user_id, device, started_at, ended_at, queued_ops)
           values (app.current_company_id(), app.current_user_id(), $1, $2, $3, $4)
           on conflict do nothing`,
          [l.device, l.startedAt, l.endedAt, l.queuedOps],
        );
        return rowCount === 1;
      });
      return c.json({ recorded: moi }, moi ? 201 : 200);
    },
  );
}
