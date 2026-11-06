import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS } from "../errors";
import { readFeeBasis } from "./store";

/**
 * Dấu định nghĩa bao phí của giá (hàng 49): người xem giá biết giá ấy tính theo định nghĩa ngày nào. Chỉ đọc — dấu do cơ
 * sở dữ liệu đóng (migration 050). Lớp `company_internal`, không ra trang khách.
 */
const ApiError = z.object({ error: z.string(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const FeeBasis = z
  .object({
    includedItems: z.array(z.string()),
    rates: z.record(z.number()),
    computedAt: z.string(),
  })
  .nullable()
  .openapi("FeeBasis");

export function registerFeeRoutes(api: OpenAPIHono, deps: ApiDeps) {
  const { appPool, auth } = deps;
  api.openapi(
    createRoute({
      method: "get",
      path: "/api/v1/listings/{id}/fee-basis",
      summary: "Định nghĩa bao phí mà giá hiện hành của căn mang — khoản, tỉ lệ (phần vạn), ngày tính; null khi giá không bao phí hay chưa có giá",
      request: { params: z.object({ id: z.string().uuid() }) },
      responses: {
        200: { description: "Dấu hoặc null", content: { "application/json": { schema: FeeBasis } } },
        401: err("Chưa đăng nhập"),
        403: err("Chưa thuộc sàn nào"),
        404: err("Không có căn này, hoặc không đọc được"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
      },
    }),
    async (c) => {
      const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
      if (!user) return c.json({ error: API_ERRORS.unauthenticated.code }, 401);
      const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
      if (!r.active) {
        const l = r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
        return c.json({ error: l.code }, l.status as 403);
      }
      const kq = await withCompany(appPool, { userId: user.id, companyId: r.active.id }, (tx) => readFeeBasis(tx, c.req.valid("param").id));
      if (kq.kind === "not-found") return c.json({ error: API_ERRORS.notFound.code }, 404);
      return c.json(kq.dau, 200);
    },
  );
}
