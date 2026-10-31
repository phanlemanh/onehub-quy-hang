import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type pg from "pg";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { khoaSoChu } from "./khoa";
import { assignAgent, getOwner, isRefusal, putOwner, revealPhone, type Refusal } from "./store";

/** Chủ nhà của hàng, mở số, gán đầu chủ (hàng 11, ADR-0010). Ẩn ở lõi và cơ sở dữ liệu, không ở giao diện. */
const BASE = "/api/v1/listings/{listingId}";

const ApiError = z.object({
  error: z.string(),
  details: z.array(z.object({ path: z.string(), reason: z.string() })).optional(),
});
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const json = (schema: z.ZodTypeAny) => ({ body: { content: { "application/json": { schema } } } });
const params = { params: z.object({ listingId: z.string() }) };
const loi = {
  400: err("Payload sai khuôn, hoặc người được gán không phải đầu chủ của sàn"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn, hoặc không phải đầu chủ giữ căn hay trưởng nhóm"),
  404: err("Không có hàng này ở sàn đang làm, hoặc hàng chưa có chủ nhà / số chủ"),
  409: err("Chọn sàn"),
};
const OwnerView = z.union([
  z.object({ visible: z.literal(true), ownerName: z.string(), floorPrice: z.number().nullable(), hasPhone: z.boolean() }),
  z.object({ visible: z.literal(false), listingAgentUserId: z.string().nullable() }),
]);

export function registerOwnerRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  // Khoá số chủ đọc một lần lúc dựng: bản thật thiếu khoá thì ném ở đây, API không dựng (hàng 62, ADR-0013).
  const khoa = khoaSoChu();

  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }

  /** Chạy một lệnh trong giao dịch của sàn đang làm; bị từ chối thì huỷ cả giao dịch, trả mã lỗi. */
  async function chay<T extends object>(c: Context, fn: (tx: pg.PoolClient, listingId: string) => Promise<T | Refusal>) {
    const ctx = await vao(c);
    if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400);
    const listingId = c.req.param("listingId") ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(listingId)) return c.json({ error: API_ERRORS.notFound.code }, 404);
    const kq = await withCompany(appPool, ctx, async (tx) => {
      const r = await fn(tx, listingId);
      if (isRefusal(r)) throw r;
      return r;
    }).catch((e: unknown) => {
      if (isRefusal(e)) return e;
      throw e;
    });
    if (isRefusal(kq)) return c.json({ error: kq.error.code, ...(kq.details && { details: kq.details }) }, kq.error.status as 400);
    return c.json(kq, 200);
  }

  api.openapi(
    createRoute({ method: "get", path: `${BASE}/owner`, summary: "Chủ nhà của hàng — người không thấy nguồn chỉ nhận đầu chủ giữ căn", request: params, responses: { 200: ok("Chủ nhà", OwnerView), ...loi } }),
    (c) => chay(c, (tx, id) => getOwner(tx, id)) as never,
  );
  api.openapi(
    createRoute({ method: "put", path: `${BASE}/owner`, summary: "Ghi chủ nhà; hàng chưa ai giữ thì đầu chủ ghi đầu tiên giữ căn", request: { ...params, ...json(z.record(z.unknown())) }, responses: { 200: ok("Chủ nhà", OwnerView), ...loi } }),
    (c) => chay(c, (tx, id) => putOwner(tx, id, c.req.valid("json"), khoa)) as never,
  );
  api.openapi(
    createRoute({ method: "post", path: `${BASE}/owner/phone-reveal`, summary: "Mở số chủ — mỗi lần là một sự kiện", request: params, responses: { 200: ok("Số chủ", z.object({ ownerPhone: z.string() })), ...loi } }),
    (c) => chay(c, (tx, id) => revealPhone(tx, id, khoa)) as never,
  );
  api.openapi(
    createRoute({ method: "put", path: `${BASE}/listing-agent`, summary: "Trưởng nhóm gán, gán lại đầu chủ giữ căn", request: { ...params, ...json(z.record(z.unknown())) }, responses: { 200: ok("Đầu chủ giữ căn", z.object({ listingAgentUserId: z.string() })), ...loi } }),
    (c) => chay(c, (tx, id) => assignAgent(tx, id, c.req.valid("json"))) as never,
  );
}
