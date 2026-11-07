import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { completeness, foldListing, freshness, type ListingState } from "@quy-hang/core/listing";
import { lamViecVoiHang } from "@quy-hang/core/access";
import { canRead, visibilityOf, type VisibilityFacts } from "@quy-hang/core/visibility";
import type { Context } from "hono";
import type pg from "pg";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { NO_QUEUE_FACTS, readQueueFacts } from "./lan-doi";
import { applyCommand, createListing, demAnhThatTheoCan, docThietBi, FACTS_SQL, khoaAnh, factsOf, isRefusal, loadEvents, STATE_COLUMNS, viewerOf, type Ctx, type Refusal } from "./store";

/**
 * Hàng và lệnh đổi hàng (ADR-0008). Trục ai thấy hàng (hàng 12): hàng «Chỉ tôi» chỉ người tạo đọc và gửi lệnh được, người
 * khác nhận 404 như hàng không có; hàng «Toàn sàn» mọi thành viên có Bảng hàng của sàn đang làm đọc và gửi lệnh được (Hỏi-2,
 * đọc lại 05/11). Bảng quyền của hàng (bang-quyen-theo-vai): người không có Bảng hàng — Telesales, Quản trị sàn — thấy danh
 * sách rỗng và nhận «không có hàng này» ở mọi đường; xét trước trục ai thấy hàng.
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
const view = (id: string, s: ListingState, facts: VisibilityFacts, photosCount: number) => ({
  id,
  ...s,
  freshness: freshness(s.lastConfirmedAt, homNay()),
  // Số ảnh thật gửi được (RESO `PhotosCount`, anh-khong-chan-ban) — cùng điều kiện với bước xét Đang bán; mức đủ có mục ảnh.
  photosCount,
  completeness: completeness(s, { photosCount }),
  visibility: visibilityOf(facts),
});

/** Số ảnh thật của một căn — cùng hàm đếm với danh sách. */
async function soAnh(tx: pg.PoolClient, s: ListingState): Promise<number> {
  return (await demAnhThatTheoCan(tx, [s])).get(khoaAnh(s.buildingName, s.unitNumber)) ?? 0;
}

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
      const kq = await withCompany(appPool, ctx, async (tx) => {
        const r = await createListing(tx, c.req.valid("json"), { device: docThietBi(c.req.header("x-quy-hang-device")), madeOffline: false });
        return isRefusal(r) ? r : { ...r, anh: await soAnh(tx, r.state) };
      });
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(view(kq.listingId, kq.state, kq.facts, kq.anh), 201);
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
        return { ...r, anh: await soAnh(tx, r.state) };
      }).catch((e: unknown) => {
        if (e && typeof e === "object" && "error" in e) return e as Refusal;
        throw e;
      });
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(view(kq.listingId, kq.state, kq.facts, kq.anh), 200);
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
        if (!lamViecVoiHang(await viewerOf(tx, ctx.userId))) return [];
        // Đọc bản tính bằng đúng tên cột của STATE_COLUMNS; số và ngày về đúng kiểu của bản tính.
        const cot = Object.entries(STATE_COLUMNS).map(([k, col]) => `${col === "list_price" || col === "close_price" ? `${col}::float8` : col === "close_date" ? `${col}::text` : col} as "${k}"`);
        const { rows } = await tx.query(
          `select l.id, ${cot.join(", ")}, ${FACTS_SQL.creatorUserId} as "creatorUserId", ${FACTS_SQL.statusesReached} as "statusesReached", ${FACTS_SQL.listingAgentUserId} as "listingAgentUserId"
           from listings l where l.company_id = app.current_company_id() and not l.voided order by l.id`,
        );
        const nguoiXem = await viewerOf(tx, ctx.userId);
        // Người giữ và lần đổi cuối (hàng 22) — tính lúc đọc từ bảng gán và bảng sự kiện.
        const hangDoi = await readQueueFacts(tx);
        const anh = await demAnhThatTheoCan(tx, rows.map((r: Record<string, unknown>) => ({ buildingName: String(r.buildingName), unitNumber: (r.unitNumber as string | null) ?? null })));
        return rows.flatMap((r: Record<string, unknown>) => {
          const { id, creatorUserId, statusesReached, listingAgentUserId, ...s } = r;
          const facts: VisibilityFacts = {
            creatorUserId: String(creatorUserId),
            statusesReached: statusesReached as string[],
            listingAgentUserId: (listingAgentUserId as string | null) ?? null,
          };
          if (!canRead(nguoiXem, facts)) return [];
          const st = { ...s, lastConfirmedAt: s.lastConfirmedAt instanceof Date ? s.lastConfirmedAt.toISOString() : null } as ListingState;
          return [{ ...view(String(id), st, facts, anh.get(khoaAnh(st.buildingName, st.unitNumber)) ?? 0), ...(hangDoi.get(String(id)) ?? NO_QUEUE_FACTS) }];
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
      const kq = await withCompany(appPool, ctx, async (tx) => {
        const events = await loadEvents(tx, listingId);
        return {
          events,
          // Dữ kiện ai thấy hàng cộng đầu chủ giữ căn (hàng 65a, AC-11).
          facts: events.length ? await factsOf(tx, listingId, events) : null,
          nguoiXem: await viewerOf(tx, ctx.userId),
          hangDoi: (await readQueueFacts(tx, [listingId])).get(listingId) ?? NO_QUEUE_FACTS,
          anh: events.length ? await soAnh(tx, foldListing(events)) : 0,
        };
      });
      // Người không có Bảng hàng; hàng đã gỡ khi hoàn tác lần nhập (hàng 66) — như hàng không có.
      if (!lamViecVoiHang(kq.nguoiXem)) return tra(c, API_ERRORS.notFound);
      if (!kq.facts || foldListing(kq.events).voided) return tra(c, API_ERRORS.notFound);
      const facts = kq.facts;
      // «Chỉ tôi» của người khác: cùng câu trả lời với hàng không có (AC-4).
      if (!canRead(kq.nguoiXem, facts)) return tra(c, API_ERRORS.notFound);
      return c.json({ ...view(listingId, foldListing(kq.events), facts, kq.anh), ...kq.hangDoi, events: kq.events }, 200);
    },
  );
}
