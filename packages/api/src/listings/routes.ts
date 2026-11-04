import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { completeness, foldListing, freshness, type ListingState } from "@quy-hang/core/listing";
import { canRead, factsFromEvents, visibilityOf, type VisibilityFacts } from "@quy-hang/core/visibility";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { NO_QUEUE_FACTS, readQueueFacts } from "./lan-doi";
import { applyCommand, createListing, docThietBi, FACTS_SQL, isRefusal, loadEvents, STATE_COLUMNS, viewerOf, type Ctx, type Refusal } from "./store";

/**
 * Hàng và lệnh đổi hàng (ADR-0008). Trục ai thấy hàng (hàng 12): hàng «Chỉ tôi» chỉ người tạo đọc và gửi lệnh được, người
 * khác nhận 404 như hàng không có; hàng «Toàn sàn» mọi thành viên của sàn đang làm đọc và gửi lệnh được (Hỏi-2).
 */
const BASE = "/api/v1/listings";

const ApiError = z.object({
  error: z.string(),
  details: z.array(z.object({ path: z.string(), reason: z.string() })).optional(),
  missing: z.array(z.string()).optional(),
  reason: z.string().optional(),
  conflictListingId: z.string().optional(),
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
  422: err("Gắn mã căn: hàng đã có mã, hay căn đã có hàng đang mở khác của sàn"),
};
const Listing = z.object({ id: z.string() }).passthrough();
const Command = z
  .object({
    type: z.string(),
    payload: z.record(z.unknown()),
    expectedVersion: z.number().int().optional(),
    confirmedWithOwner: z.boolean().optional(),
    /** Thao tác ghi trên máy lúc mất mạng (hàng ghi-thiet-bi-va-mat-mang). */
    madeOffline: z.boolean().optional(),
  })
  .strict();

const homNay = () => new Date().toISOString().slice(0, 10);
/** Hàng như API trả: bản tính + độ tươi, mức đủ tính lúc đọc (phụ thuộc «hôm nay») + nấc của trục ai thấy hàng. */
const view = (id: string, s: ListingState, facts: VisibilityFacts) => ({
  id,
  ...s,
  freshness: freshness(s.lastConfirmedAt, homNay()),
  completeness: completeness(s),
  visibility: visibilityOf(facts),
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
    c.json({ error: r.error.code, ...(r.details && { details: r.details }), ...(r.missing && { missing: r.missing }), ...(r.reason && { reason: r.reason }), ...(r.conflictListingId && { conflictListingId: r.conflictListingId }) }, r.error.status as 400);

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
      const kq = await withCompany(appPool, ctx, (tx) => createListing(tx, c.req.valid("json"), { device: docThietBi(c.req.header("x-quy-hang-device")), madeOffline: false }));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(view(kq.listingId, kq.state, kq.facts), 201);
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
        const r = await applyCommand(tx, await viewerOf(tx, ctx.userId), listingId, c.req.valid("json"), docThietBi(c.req.header("x-quy-hang-device")));
        if (isRefusal(r)) throw r;
        return r;
      }).catch((e: unknown) => {
        if (e && typeof e === "object" && "error" in e) return e as Refusal;
        throw e;
      });
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(view(kq.listingId, kq.state, kq.facts), 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: BASE,
      summary: "Hàng của sàn đang làm, kèm trạng thái, độ tươi, mức đủ, người giữ và lần đổi giá, trạng thái cuối",
      responses: { 200: ok("Hàng", z.array(Listing)), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const ds = await withCompany(appPool, ctx, async (tx) => {
        // Đọc bản tính bằng đúng tên cột của STATE_COLUMNS; số và ngày về đúng kiểu của bản tính.
        const cot = Object.entries(STATE_COLUMNS).map(([k, col]) => `${col === "list_price" || col === "close_price" ? `${col}::float8` : col === "close_date" ? `${col}::text` : col} as "${k}"`);
        const { rows } = await tx.query(
          `select l.id, ${cot.join(", ")}, ${FACTS_SQL.creatorUserId} as "creatorUserId", ${FACTS_SQL.statusesReached} as "statusesReached"
           from listings l where l.company_id = app.current_company_id() order by l.id`,
        );
        const nguoiXem = await viewerOf(tx, ctx.userId);
        // Người giữ và lần đổi cuối (hàng 22) — tính lúc đọc từ bảng gán và bảng sự kiện.
        const hangDoi = await readQueueFacts(tx);
        return rows.flatMap((r: Record<string, unknown>) => {
          const { id, creatorUserId, statusesReached, ...s } = r;
          const facts: VisibilityFacts = { creatorUserId: String(creatorUserId), statusesReached: statusesReached as string[] };
          if (!canRead(nguoiXem, facts)) return [];
          const st = { ...s, lastConfirmedAt: s.lastConfirmedAt instanceof Date ? s.lastConfirmedAt.toISOString() : null } as ListingState;
          return [{ ...view(String(id), st, facts), ...(hangDoi.get(String(id)) ?? NO_QUEUE_FACTS) }];
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
      const kq = await withCompany(appPool, ctx, async (tx) => ({
        events: await loadEvents(tx, listingId),
        nguoiXem: await viewerOf(tx, ctx.userId),
        hangDoi: (await readQueueFacts(tx, [listingId])).get(listingId) ?? NO_QUEUE_FACTS,
      }));
      if (!kq.events.length) return tra(c, API_ERRORS.notFound);
      const facts = factsFromEvents(kq.events);
      // «Chỉ tôi» của người khác: cùng câu trả lời với hàng không có (AC-4).
      if (!canRead(kq.nguoiXem, facts)) return tra(c, API_ERRORS.notFound);
      return c.json({ ...view(listingId, foldListing(kq.events), facts), ...kq.hangDoi, events: kq.events }, 200);
    },
  );
}
