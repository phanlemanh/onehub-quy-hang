import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { withCompany } from "../db";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { isRefusal, type Refusal } from "../leads/store";
import { addProspectPhone, closeProspect, createProspect, createShare, listMyOpenProspects, listProspectShares, readProspect, reassignProspect } from "./prospects";
import { patchContact, readContact } from "./store";

/** Liên hệ (hàng 85, ADR-0021): xem bản của lõi (không số) và sửa loại liên hệ. */
const BASE = "/api/v1/contacts";
const ApiError = z.object({ error: z.string(), details: z.array(z.object({ path: z.string(), reason: z.string() })).optional() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const ok = (description: string, schema: z.ZodTypeAny) => ({ description, content: { "application/json": { schema } } });
const loi = {
  400: err("Sai khuôn, hay bỏ hết loại chủ nhà khi liên hệ còn hàng hoặc lead"),
  401: err("Chưa đăng nhập"),
  403: err("Chưa gắn sàn"),
  404: err("Không có liên hệ này, hay người gọi không được xem"),
  409: err("Chọn sàn"),
};
const Contact = z.object({ id: z.string(), contactTypes: z.array(z.string()) }).passthrough();
const params = z.object({ contactId: z.string() });

export function registerContactRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps) {
  async function vao(c: Context): Promise<{ userId: string; companyId: string } | ApiErrorEntry> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return { userId: user.id, companyId: r.active.id };
  }
  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 400);
  const tuChoi = (c: Context, r: Refusal) => c.json({ error: r.error.code, ...(r.details && { details: r.details }) }, r.error.status as 400);
  const laMa = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

  api.openapi(
    createRoute({ method: "get", path: `${BASE}/{contactId}`, summary: "Một liên hệ — tên, loại, người giữ, số lượng số, Lead hay Liên hệ; không số", request: { params }, responses: { 200: ok("Liên hệ", Contact), ...loi } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { contactId } = c.req.valid("param");
      if (!laMa(contactId)) return tra(c, API_ERRORS.notFound);
      const v = await withCompany(appPool, ctx, (tx) => readContact(tx, contactId));
      return v ? c.json(v, 200) : tra(c, API_ERRORS.notFound);
    },
  );

  api.openapi(
    createRoute({
      method: "patch",
      path: `${BASE}/{contactId}`,
      summary: "Sửa loại liên hệ (người giữ, trưởng nhóm) — một người nhiều loại vẫn là một liên hệ",
      request: { params, body: { content: { "application/json": { schema: z.record(z.unknown()) } } } },
      responses: { 200: ok("Liên hệ", Contact), ...loi },
    }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { contactId } = c.req.valid("param");
      if (!laMa(contactId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => patchContact(tx, contactId, c.req.valid("json")));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  // ---- Nhu cầu khách và Lần gửi (hàng 86) ----
  const P = "/api/v1/prospects";
  const loiNhuCau = {
    400: err("Sai khuôn, đích không mang vai Đầu khách, hay căn không gửi được"),
    401: err("Chưa đăng nhập"),
    403: err("Chưa gắn sàn, hay cần vai Đầu khách"),
    404: err("Không có nhu cầu khách này, hay người gọi không được xem"),
    409: err("Chọn sàn, số đã thuộc liên hệ khác, hay nhu cầu đã đóng"),
  };
  const Prospect = z.object({ id: z.string(), displayName: z.string(), need: z.string() }).passthrough();
  const Share = z.object({ id: z.string(), code: z.string(), audience: z.string() }).passthrough();
  const pParams = z.object({ prospectId: z.string() });
  const than = { content: { "application/json": { schema: z.record(z.unknown()) } } };

  api.openapi(
    createRoute({ method: "post", path: P, summary: "Đầu khách lưu một khách: tên, số, loại giao dịch, tiêu chí — một số một người", request: { body: than }, responses: { 201: ok("Nhu cầu khách", Prospect), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => createProspect(tx, c.req.valid("json")));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 201);
    },
  );

  api.openapi(
    createRoute({ method: "get", path: P, summary: "Khách đang mở của chính đầu khách gọi, mới trước — không số, không mã liên hệ (màn Gửi)", responses: { 200: ok("Nhu cầu khách", z.array(Prospect)), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => listMyOpenProspects(tx));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({ method: "get", path: `${P}/{prospectId}`, summary: "Một nhu cầu khách — không số, không mã liên hệ", request: { params: pParams }, responses: { 200: ok("Nhu cầu khách", Prospect), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { prospectId } = c.req.valid("param");
      if (!laMa(prospectId)) return tra(c, API_ERRORS.notFound);
      const v = await withCompany(appPool, ctx, (tx) => readProspect(tx, prospectId));
      return v ? c.json(v, 200) : tra(c, API_ERRORS.notFound);
    },
  );

  api.openapi(
    createRoute({ method: "patch", path: `${P}/{prospectId}`, summary: "Trưởng nhóm đổi đầu khách giữ — Lần gửi cũ đi theo, người gửi giữ nguyên", request: { params: pParams, body: than }, responses: { 200: ok("Nhu cầu khách", Prospect), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { prospectId } = c.req.valid("param");
      if (!laMa(prospectId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => reassignProspect(tx, prospectId, c.req.valid("json")));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({ method: "post", path: `${P}/{prospectId}/phones`, summary: "Thêm số vào cùng khách — số của liên hệ khác thì 409, không gộp", request: { params: pParams, body: than }, responses: { 200: ok("Số đã có", Prospect), 201: ok("Đã thêm số", Prospect), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { prospectId } = c.req.valid("param");
      if (!laMa(prospectId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => addProspectPhone(tx, prospectId, c.req.valid("json")));
      if (isRefusal(kq)) return tuChoi(c, kq);
      return kq.ket === "added" ? c.json(kq.view, 201) : c.json(kq.view, 200);
    },
  );

  api.openapi(
    createRoute({ method: "post", path: `${P}/{prospectId}/close`, summary: "Đóng nhu cầu khách (đầu khách giữ, trưởng nhóm)", request: { params: pParams }, responses: { 200: ok("Nhu cầu khách", Prospect), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { prospectId } = c.req.valid("param");
      if (!laMa(prospectId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => closeProspect(tx, prospectId));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({ method: "get", path: `${P}/{prospectId}/shares`, summary: "Lần gửi của một nhu cầu khách, mới trước", request: { params: pParams }, responses: { 200: ok("Lần gửi", z.array(Share)), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const { prospectId } = c.req.valid("param");
      if (!laMa(prospectId)) return tra(c, API_ERRORS.notFound);
      const kq = await withCompany(appPool, ctx, (tx) => listProspectShares(tx, prospectId));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 200);
    },
  );

  api.openapi(
    createRoute({ method: "post", path: "/api/v1/shares", summary: "Tạo một Lần gửi — khách riêng (một nhu cầu khách) hay nhóm môi giới; căn đã lên bảng", request: { body: than }, responses: { 201: ok("Lần gửi", Share), ...loiNhuCau } }),
    async (c) => {
      const ctx = await vao(c);
      if ("code" in ctx) return tra(c, ctx);
      const kq = await withCompany(appPool, ctx, (tx) => createShare(tx, c.req.valid("json")));
      return isRefusal(kq) ? tuChoi(c, kq) : c.json(kq, 201);
    },
  );
}
