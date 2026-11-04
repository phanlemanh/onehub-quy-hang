import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { CatalogData } from "@quy-hang/core";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { SAMPLE_CATALOG } from "../catalog/sample";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { khoaSoChu } from "../owners/khoa";
import { dauChuCuaSan, isRefusal, mauCuaSan, openImport, readImport, writeBatch, type BatchResult, type OpenImportInput, type Refusal } from "./store";

/**
 * Lần nhập file bảng hàng (hàng 65a, ADR-0011): mở lần nhập với kế hoạch, gửi từng gói ≤ 200 dòng (xem thử hay ghi), đọc
 * lại. Màn Nhập Excel (hàng man-nhap-excel) là bên gọi; thân trả không mang số chủ, tên chủ hay hàng người gửi không đọc được.
 */
const BASE = "/api/v1/imports";

const ApiError = z.object({ error: z.string(), details: z.array(z.object({ path: z.string(), reason: z.string() })).optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const json = (schema: z.ZodTypeAny) => ({ body: { content: { "application/json": { schema } } } });
const loi = {
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn, hoặc không phải Đầu chủ hay Trưởng nhóm"),
  404: err("Không có lần nhập này của người gọi ở sàn đang làm"),
  409: err("Chọn sàn"),
  422: err("Kế hoạch sai khuôn, hoặc gói quá 200 dòng"),
};

const O = z.union([z.string(), z.number(), z.null()]);
const OpenBody = z
  .object({
    fileName: z.string().min(1).max(255),
    fileHash: z.string().regex(/^[0-9a-f]{64}$/),
    sheet: z.string().max(100).nullable().optional(),
    fileKind: z.enum(["xlsx", "csv"]),
    headers: z.array(z.string()),
    headerRow: z.union([z.number().int().min(0), z.tuple([z.number().int().min(0), z.number().int().min(0)])]),
    plan: z.record(z.unknown()),
    units: z.array(z.object({ row: z.number().int().min(0), buildingName: z.string().nullable(), unitNumber: z.string().nullable() }).strict()),
  })
  .strict();
const RowsBody = z
  .object({
    dryRun: z.boolean(),
    rows: z.array(z.object({ row: z.number().int().min(0), cells: z.array(O), agentUserId: z.string().optional(), skip: z.boolean().optional() }).strict()),
  })
  .strict();
const RowResult = z.object({ row: z.number(), action: z.enum(["create", "update", "supplement", "skip"]), reason: z.string(), listingId: z.string().optional() });
const Summary = z.object({ create: z.number(), update: z.number(), supplement: z.number(), skip: z.number() });

/** Ném để lùi giao dịch của bản xem thử mà vẫn trả kết quả. */
class XemThu {
  constructor(readonly ketQua: BatchResult) {}
}

export function registerImportRoutes(api: OpenAPIHono, { appPool, auth, identityPool }: ApiDeps, catalog: CatalogData = SAMPLE_CATALOG) {
  const khoa = khoaSoChu();

  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, r: Refusal) => c.json({ error: r.error.code, ...(r.details && { details: r.details }) }, r.error.status as 400);

  api.openapi(
    createRoute({ method: "post", path: BASE, summary: "Mở một lần nhập: kế hoạch, tiêu đề, toà và mã căn của mọi dòng", request: json(OpenBody), responses: { 201: ok("Lần nhập", z.object({ id: z.string(), status: z.string() })), ...loi } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400) as never;
      const kq = await withCompany(appPool, ctx, async (tx) => {
        const r = await openImport(tx, c.req.valid("json") as unknown as OpenImportInput);
        if (isRefusal(r)) throw r;
        return r;
      }).catch((e: unknown) => {
        if (isRefusal(e)) return e;
        throw e;
      });
      if (isRefusal(kq)) return tra(c, kq) as never;
      return c.json(kq, 201);
    },
  );

  api.openapi(
    createRoute({
      method: "post",
      path: `${BASE}/{importId}/rows`,
      summary: "Một gói ≤ 200 dòng: xem thử (không ghi) hay ghi; gửi lại dòng đã ghi trả đúng kết quả cũ",
      request: { params: z.object({ importId: z.string() }), ...json(RowsBody) },
      responses: { 200: ok("Hành động từng dòng", z.object({ importId: z.string(), rows: z.array(RowResult), summary: Summary })), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400) as never;
      const { importId } = c.req.valid("param");
      const body = c.req.valid("json");
      const kq = await withCompany(appPool, ctx, async (tx) => {
        const r = await writeBatch(tx, importId, body.rows, { khoa, catalog });
        if (isRefusal(r)) throw r;
        if (body.dryRun) throw new XemThu(r);
        return r;
      }).catch((e: unknown) => {
        if (isRefusal(e)) return e;
        if (e instanceof XemThu) return e.ketQua;
        throw e;
      });
      if (isRefusal(kq)) return tra(c, kq) as never;
      return c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/agents`,
      summary: "Đầu chủ của sàn đang làm — để Trưởng nhóm chọn người giữ căn khi nhập hộ; chỉ vai nhập, chỉ mã người và tên",
      responses: { 200: ok("Đầu chủ", z.array(z.object({ userId: z.string(), name: z.string() }))), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400) as never;
      const ids = await withCompany(appPool, ctx, (tx) => dauChuCuaSan(tx));
      if (isRefusal(ids)) return tra(c, ids) as never;
      const ten = ids.length
        ? new Map((await identityPool.query<{ id: string; name: string }>('select id, name from identity."user" where id = any($1::text[])', [ids])).rows.map((r) => [r.id, r.name]))
        : new Map<string, string>();
      return c.json(ids.map((userId) => ({ userId, name: ten.get(userId) ?? userId })), 200);
    },
  );

  const CotMau = z.object({
    headerKey: z.string(),
    target: z.string(),
    transform: z.object({ name: z.string(), params: z.record(z.unknown()).optional() }).optional(),
    valueMap: z.record(z.string()).optional(),
    importId: z.string(),
    at: z.string(),
  });
  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/templates`,
      summary: "Mẫu file của sàn: cột đã nhớ từ các lần nhập đã ghi (hàng 67) — vai nhập, không ô nào của tệp",
      responses: { 200: ok("Cột đã nhớ", z.array(CotMau)), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400) as never;
      const kq = await withCompany(appPool, ctx, (tx) => mauCuaSan(tx));
      if (isRefusal(kq)) return tra(c, kq) as never;
      return c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/{importId}`,
      summary: "Lần nhập: trạng thái, hành động từng dòng đã ghi, đếm",
      request: { params: z.object({ importId: z.string() }) },
      responses: { 200: ok("Lần nhập", z.object({ id: z.string(), status: z.string(), fileName: z.string(), rows: z.array(RowResult), summary: Summary })), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return c.json({ error: ctx.code }, ctx.status as 400) as never;
      const kq = await withCompany(appPool, ctx, (tx) => readImport(tx, c.req.valid("param").importId));
      if (isRefusal(kq)) return tra(c, kq) as never;
      return c.json(kq, 200);
    },
  );
}
