import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { lamViecVoiHang } from "@quy-hang/core/access";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { isRefusal, viewerOf, type Ctx, type Refusal } from "../listings/store";
import { danhSachCan, docCan, timHayTaoCan } from "./store";

/**
 * Căn ngoài khu của sàn (hàng 76 can-ngoai-khu): nhà mặt đường, nhà trong hẻm, đất lẻ — định danh bằng địa chỉ chuẩn. Tạo
 * căn trước, rồi tạo hàng bằng `POST /api/v1/listings { offCompoundUnitId }` (Hỏi-4 Cổng Phạm vi 07/11).
 */
const BASE = "/api/v1/off-compound-units";
const ApiError = z.object({ error: z.string(), details: z.array(z.object({ path: z.string(), reason: z.string() })).optional(), reason: z.string().optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const Can = z.object({ id: z.string() }).passthrough();
const ok = (description: string, schema: z.ZodTypeAny = Can) => ({ description, content: { "application/json": { schema } } });
const loi = { 400: err("Địa chỉ đọc chưa chắc, loại hình sai hay khoá lạ"), 401: err("Chưa đăng nhập"), 403: err("Chưa gắn sàn"), 404: err("Không có căn này ở sàn đang làm"), 409: err("Chọn sàn") };

export function registerOffCompoundUnitRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<Ctx | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);
  const tuChoi = (c: Context, r: Refusal) => c.json({ error: r.error.code, ...(r.details && { details: r.details }), ...(r.reason && { reason: r.reason }) }, r.error.status as 400);

  api.openapi(
    createRoute({
      method: "post",
      path: BASE,
      summary: "Tìm hay tạo căn ngoài khu từ địa chỉ — cùng khoá địa chỉ trong sàn là một căn",
      request: { body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: { 200: ok("Căn đã có cùng khoá địa chỉ"), 201: ok("Đã tạo căn"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => timHayTaoCan(tx, c.req.valid("json")));
      if (isRefusal(kq as never)) return tuChoi(c, kq as Refusal);
      const { can, moi } = kq as Exclude<typeof kq, Refusal>;
      if (moi) return c.json(can, 201);
      return c.json(can, 200);
    },
  );

  const DanhSach = z.object({ units: z.array(z.object({ id: z.string(), propertySubType: z.string(), unparsedAddress: z.string() })) });
  api.openapi(
    createRoute({
      method: "get",
      path: BASE,
      summary: "Mọi căn ngoài khu của sàn đang làm — mã, loại hình, địa chỉ đã gõ (Bảng hàng ghép loại hình, hàng 79)",
      responses: { 200: ok("Các căn", DanhSach), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const units = await withCompany(appPool, ctx, (tx) => danhSachCan(tx));
      // Người không làm việc với Bảng hàng: 403, không phải danh sách rỗng — rỗng là «sàn chưa có căn ngoài khu nào».
      if (units === null) return c.json({ error: "forbidden" }, 403 as 400);
      return c.json({ units }, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/{id}`,
      summary: "Một căn ngoài khu của sàn đang làm",
      request: { params: z.object({ id: z.string() }) },
      responses: { 200: ok("Căn"), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const can = await withCompany(appPool, ctx, async (tx) => (lamViecVoiHang(await viewerOf(tx, ctx.userId)) ? docCan(tx, c.req.valid("param").id) : null));
      return can ? c.json(can, 200) : tra(c, API_ERRORS.notFound);
    },
  );
}
