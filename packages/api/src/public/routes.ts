import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { SU_KIEN_LAN_GUI } from "@quy-hang/core/sharing";
import type { ApiDeps } from "../app";
import { withCompany } from "../db";
import { API_ERRORS } from "../errors";
import { chonKhoAnh, type KhoAnh, type KhoAnhVang } from "../photos/kho";
import { readPhoto } from "../photos/store";
import { docTrangKhach, ghiSuKien, timLanGui } from "./store";

/**
 * Route công khai của trang khách `/s/<mã>` (hàng 35) — không phiên, ra ngoài sàn. Mỗi route dưới `/api/v1/public/` phải có
 * bài rò rỉ nêu đúng đường của nó (`rao-route.test.ts`, luật đợt 39). Không lưu đệm: giá và trạng thái sống.
 */
export const PUBLIC_BASE = "/api/v1/public/shares";

const MA = z.string().openapi({ param: { name: "code", in: "path" } });
const Loi = z.object({ error: z.string() });
const loi = (description: string) => ({ description, content: { "application/json": { schema: Loi } } });
const ThanSuKien = z
  .object({
    type: z.enum([SU_KIEN_LAN_GUI.mo, SU_KIEN_LAN_GUI.quanTam]),
    visitor: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
    listingId: z.string().uuid().optional(),
  })
  .strict();

const homNay = () => new Date().toISOString().slice(0, 10);

export function registerPublicRoutes(api: OpenAPIHono, deps: ApiDeps, khoTruyen?: KhoAnh | KhoAnhVang) {
  const kho = khoTruyen ?? chonKhoAnh();

  // Thân trang khách: bản ra của luật ẩn, tên sàn, người gửi, người nhận (AC-1). Thân dựng ở lõi nên không khai schema ở đây.
  api.get(`${PUBLIC_BASE}/:code`, async (c) => {
    c.header("Cache-Control", "no-store");
    const s = await timLanGui(deps.appPool, c.req.param("code"));
    if (!s) return c.json({ error: API_ERRORS.notFound.code }, 404);
    return c.json(await docTrangKhach(deps, s, homNay()), 200);
  });

  api.openapi(
    createRoute({
      method: "post",
      path: `${PUBLIC_BASE}/{code}/events`,
      summary: "Trang khách: ghi lượt mở hay lượt quan tâm — một máy một lượt",
      request: { params: z.object({ code: MA }), body: { content: { "application/json": { schema: ThanSuKien } } } },
      responses: {
        200: { description: "Đã có, không thêm", content: { "application/json": { schema: z.object({ inserted: z.boolean() }) } } },
        201: { description: "Đã ghi", content: { "application/json": { schema: z.object({ inserted: z.boolean() }) } } },
        400: loi("Thân sai"),
        404: loi("Link không còn mở được"),
        409: loi("Căn không ghi được"),
      },
    }),
    async (c) => {
      c.header("Cache-Control", "no-store");
      const b = c.req.valid("json");
      const kq = await ghiSuKien(deps.appPool, c.req.valid("param").code, b.type, b.listingId ?? null, b.visitor);
      if ("inserted" in kq) return c.json(kq, kq.inserted ? 201 : 200);
      if (kq.loi === "khong-co") return c.json({ error: API_ERRORS.notFound.code }, 404);
      if (kq.loi === "khong-ghi-duoc") return c.json({ error: API_ERRORS.versionConflict.code }, 409);
      return c.json({ error: API_ERRORS.invalidPayload.code }, 400);
    },
  );

  // Ảnh của trang khách: chỉ ảnh có trong bản ra của chính Lần gửi này (AC-7).
  api.get(`${PUBLIC_BASE}/:code/photos/:photoId`, async (c) => {
    c.header("Cache-Control", "no-store");
    const s = await timLanGui(deps.appPool, c.req.param("code"));
    if (!s) return c.json({ error: API_ERRORS.notFound.code }, 404);
    const than = await docTrangKhach(deps, s, homNay());
    const id = c.req.param("photoId");
    if (!than.can.some((b) => b.photos?.some((a) => a.id === id))) return c.json({ error: API_ERRORS.notFound.code }, 404);
    if (kho.ten === "vang") return c.json({ error: API_ERRORS.photoStorageMissing.code }, 503);
    const k = kho;
    const kq = await withCompany(deps.appPool, { userId: s.senderUserId, companyId: s.companyId }, (tx) => readPhoto(tx, k, s.companyId, id, "original"));
    if ("error" in kq || kq.noiBo) return c.json({ error: API_ERRORS.notFound.code }, 404);
    const doc = kq.doc!;
    if (doc.kind === "link") return c.redirect(doc.url, 302);
    c.header("Content-Type", kq.type);
    return c.body(new Uint8Array(doc.bytes), 200);
  });
}
