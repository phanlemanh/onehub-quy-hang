import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";

/**
 * Lần xuất bảng hàng (hàng 43 phat-hang, design §5, AC-8): hộp thoại «Xuất bảng hàng» gọi sau khi chép bài hay tải file
 * xong; máy chủ ghi một dòng cho người đang làm ở sàn đang làm — mẫu, người nhận, số căn, lúc xuất. Khuôn chặt: không nhận
 * nội dung đã xuất, không nhận danh sách căn — khoá lạ bị từ chối. Chỉ đầu chủ hay trưởng nhóm xuất bảng hàng.
 */
const BASE = "/api/v1/exports";

const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });

const LanXuat = z
  .object({
    format: z.enum(["post_zalo", "post_facebook", "xlsx", "png", "pdf"]),
    recipient: z.enum(["khach_rieng", "nhom_moi_gioi"]),
    listingCount: z.number().int().min(1).max(100_000),
  })
  .strict();

const VAI_XUAT = ["listing_agent", "team_lead"];

export function registerExportRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string; roles: string[] } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id, roles: r.active.roles ?? [] };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 401);

  api.openapi(
    createRoute({
      method: "post",
      path: BASE,
      summary: "Ghi một lần xuất bảng hàng của người đang làm — không nội dung, không danh sách căn",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: {
        201: { description: "Đã ghi", content: { "application/json": { schema: z.object({ id: z.string() }) } } },
        400: err("Lần xuất sai khuôn"),
        401: err("Chưa đăng nhập"),
        403: err("Chưa gắn sàn hay không mang vai đầu chủ, trưởng nhóm"),
        409: err("Chọn sàn"),
      },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      if (!ctx.roles.some((v) => VAI_XUAT.includes(v))) return tra(c, API_ERRORS.exportRoleRequired);
      const kq = LanXuat.safeParse(c.req.valid("json"));
      if (!kq.success) {
        const details = kq.error.issues.map((i) => ({ path: i.path.join(".") || "body", reason: i.message }));
        return c.json({ error: API_ERRORS.invalidPayload.code, details }, 400);
      }
      const l = kq.data;
      const id = await withCompany(appPool, ctx, async (tx) => {
        const { rows } = await tx.query<{ id: string }>(
          `insert into exports (company_id, user_id, format, recipient, listing_count)
           values (app.current_company_id(), app.current_user_id(), $1, $2, $3)
           returning id`,
          [l.format, l.recipient, l.listingCount],
        );
        return rows[0]!.id;
      });
      return c.json({ id }, 201);
    },
  );
}
