import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { STANDARD_STATUSES } from "@quy-hang/core/listing";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { readStatuses, writeStatuses, type StatusesRefusal } from "./store";

/**
 * Trạng thái riêng (hàng 46): `GET` — sáu trạng thái chuẩn, nhãn mặc định và nhãn riêng của sàn kèm số căn đang mang (mọi
 * vai); `PUT` — quản trị sàn ghi cả bộ nhãn nguyên khối, gỡ nhãn còn căn mang thì kèm `replace`. Sàn thêm nhãn, không
 * thêm nghĩa: luật, màu, đếm theo trạng thái chuẩn neo.
 */
const ApiError = z.object({ error: z.string(), reason: z.string().optional(), code: z.string().optional(), count: z.number().int().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Bộ nhãn sai — lý do nêu khoá (PUT)"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa thuộc sàn nào, hay (PUT) không phải quản trị sàn"),
  409: err("Thuộc nhiều sàn, chưa chọn; hay (PUT) gỡ nhãn còn căn mang mà thiếu nhãn thay — kèm mã và số căn"),
};
export const DongTrangThai = z.object({
  status: z.enum(STANDARD_STATUSES as unknown as [string, ...string[]]),
  default: z.string(),
  labels: z.array(z.object({ code: z.string(), label: z.string(), inUse: z.number().int() })),
});
const Statuses = z.object({ statuses: z.array(DongTrangThai) }).openapi("CompanyStatuses");

export function registerStatusesRoutes(api: OpenAPIHono, deps: ApiDeps) {
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
      path: "/api/v1/company/statuses",
      summary: "Trạng thái của sàn — sáu trạng thái chuẩn, nhãn mặc định, nhãn riêng neo vào từng trạng thái kèm số căn đang mang",
      responses: { 200: ok("Bộ trạng thái", Statuses), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      return c.json(await withCompany(appPool, ctx, readStatuses), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "put",
      path: "/api/v1/company/statuses",
      summary:
        "Ghi cả bộ nhãn trạng thái của sàn, nguyên khối — vắng một nhãn là gỡ; nhãn gỡ còn căn mang cần replace cùng neo, mỗi căn nhận một sự kiện đổi nhãn",
      request: { body: { content: { "application/json": { schema: z.unknown() } } } },
      responses: { 200: ok("Bộ trạng thái mới", Statuses), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const than = await c.req.json().catch(() => null);
      // Bị từ chối thì huỷ cả giao dịch: không khoá nào, không sự kiện nào của hàng.
      const kq = await withCompany(appPool, ctx, async (tx) => {
        const r = await writeStatuses(tx, than);
        if ("refusal" in r) throw r;
        return r;
      }).catch((e: unknown) => {
        if (e && typeof e === "object" && "refusal" in e) return e as StatusesRefusal;
        throw e;
      });
      if (!("refusal" in kq)) return c.json(kq, 200);
      if (kq.refusal === "forbidden") return tra(c, API_ERRORS.adminRequired);
      if (kq.refusal === "in-use") return tra(c, API_ERRORS.statusLabelInUse, { reason: kq.reason, code: kq.code, count: kq.count });
      return tra(c, API_ERRORS.invalidSettings, { reason: kq.reason });
    },
  );
}
