import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { completeness, foldListing, freshness, type ListingState } from "@quy-hang/core/listing";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { applyCommand, createListing, isRefusal, loadEvents, STATE_COLUMNS, type Ctx, type Refusal } from "./store";

/** Hàng và lệnh đổi hàng (ADR-0008). Mọi thành viên của sàn đang làm gửi được lệnh (Hỏi-2). */
const BASE = "/api/v1/listings";

const ApiError = z.object({
  error: z.string(),
  details: z.array(z.object({ path: z.string(), reason: z.string() })).optional(),
  missing: z.array(z.string()).optional(),
  reason: z.string().optional(),
});
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const json = (schema: z.ZodTypeAny) => ({ body: { content: { "application/json": { schema } } } });
const loi = {
  400: err("Payload sai khuôn, chuyển trạng thái không hợp lệ hay thiếu điều kiện"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn"),
  404: err("Không có hàng này ở sàn đang làm"),
  409: err("Chọn sàn, hoặc phiên bản cũ — đã có người sửa trước"),
};
const Listing = z.object({ id: z.string() }).passthrough();
const Command = z
  .object({
    type: z.string(),
    payload: z.record(z.unknown()),
    expectedVersion: z.number().int().optional(),
    confirmedWithOwner: z.boolean().optional(),
  })
  .strict();

const homNay = () => new Date().toISOString().slice(0, 10);
/** Hàng như API trả: bản tính + độ tươi, mức đủ tính lúc đọc (phụ thuộc «hôm nay»). */
const view = (id: string, s: ListingState) => ({
  id,
  ...s,
  freshness: freshness(s.lastConfirmedAt, homNay()),
  completeness: completeness(s),
});

export function registerListingRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<Ctx | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);
  const tuChoi = (c: Context, r: Refusal) =>
    c.json({ error: r.error.code, ...(r.details && { details: r.details }), ...(r.missing && { missing: r.missing }), ...(r.reason && { reason: r.reason }) }, r.error.status as 400);

  api.openapi(
    createRoute({
      method: "post",
      path: BASE,
      summary: "Tạo hàng — sự kiện created, nấc Chưa đủ để rao",
      request: json(z.record(z.unknown())),
      responses: { 201: ok("Đã tạo", Listing), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => createListing(tx, c.req.valid("json")));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(view(kq.listingId, kq.state), 201);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{listingId}/events`,
      summary: "Lệnh duy nhất đổi hàng — ghi một sự kiện và bản tính mới",
      request: { params: z.object({ listingId: z.string() }), ...json(Command) },
      responses: { 200: ok("Đã ghi", Listing), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { listingId } = c.req.valid("param");
      if (!/^[0-9a-f-]{36}$/i.test(listingId)) return tra(c, API_ERRORS.notFound);
      // Bị từ chối thì huỷ cả giao dịch: không sự kiện nào, bản tính không đổi.
      const kq = await withCompany(appPool, ctx, async (tx) => {
        const r = await applyCommand(tx, listingId, c.req.valid("json"));
        if (isRefusal(r)) throw r;
        return r;
      }).catch((e: unknown) => {
        if (e && typeof e === "object" && "error" in e) return e as Refusal;
        throw e;
      });
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(view(kq.listingId, kq.state), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: BASE,
      summary: "Hàng của sàn đang làm, kèm trạng thái, độ tươi, mức đủ",
      responses: { 200: ok("Hàng", z.array(Listing)), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const ds = await withCompany(appPool, ctx, async (tx) => {
        // Đọc bản tính bằng đúng tên cột của STATE_COLUMNS; số và ngày về đúng kiểu của bản tính.
        const cot = Object.entries(STATE_COLUMNS).map(([k, col]) => `${col === "list_price" || col === "close_price" ? `${col}::float8` : col === "close_date" ? `${col}::text` : col} as "${k}"`);
        const { rows } = await tx.query(`select id, ${cot.join(", ")} from listings where company_id = app.current_company_id() order by id`);
        return rows.map((r: Record<string, unknown>) => {
          const { id, ...s } = r;
          const st = { ...s, lastConfirmedAt: s.lastConfirmedAt instanceof Date ? s.lastConfirmedAt.toISOString() : null } as ListingState;
          return view(String(id), st);
        });
      });
      return c.json(ds, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/{listingId}`,
      summary: "Một hàng kèm lịch sử sự kiện",
      request: { params: z.object({ listingId: z.string() }) },
      responses: { 200: ok("Hàng", Listing), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { listingId } = c.req.valid("param");
      if (!/^[0-9a-f-]{36}$/i.test(listingId)) return tra(c, API_ERRORS.notFound);
      const events = await withCompany(appPool, ctx, (tx) => loadEvents(tx, listingId));
      if (!events.length) return tra(c, API_ERRORS.notFound);
      return c.json({ ...view(listingId, foldListing(events)), events }, 200);
    },
  );
}
