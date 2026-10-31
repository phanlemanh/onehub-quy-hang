import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { buildCatalogIndex, lookupUnit, type CatalogData } from "@quy-hang/core";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { SAMPLE_CATALOG } from "./sample";

/**
 * Gõ mã căn ra thuộc tính căn (hàng 9). Chỉ đọc. Mọi thành viên của sàn đang làm tra được, ở mọi vai — danh mục là dữ
 * liệu dùng chung, và lead của Telesales cũng cần mã căn tự điền. Bốn kết cục tra đều là 200 với `status` trong thân.
 */
const BASE = "/api/v1/catalog/units";

const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
/** Mười thuộc tính căn — đúng `UNIT_ATTRIBUTE_FIELDS` của lõi, lớp danh mục. */
const Unit = z.object({
  projectKey: z.string(),
  projectName: z.string(),
  buildingName: z.string(),
  unitNumber: z.string(),
  upi: z.string(),
  floor: z.number().nullable(),
  stack: z.string().nullable(),
  livingArea: z.number().nullable(),
  bedroomsTotal: z.number().nullable(),
  directionFaces: z.string().nullable(),
});
const Lookup = z
  .union([
    z.object({ status: z.literal("found"), unit: Unit }),
    z.object({ status: z.literal("not_in_catalog"), read: z.array(z.object({ projectKey: z.string(), unitNumber: z.string() })) }),
    z.object({
      status: z.literal("unreadable"),
      input: z.string(),
      examples: z.array(z.object({ projectKey: z.string(), projectName: z.string(), example: z.string() })),
    }),
    z.object({ status: z.literal("ambiguous"), candidates: z.array(Unit) }),
  ])
  .openapi("CatalogLookup");

/** Danh mục là tham số: hàng 10 thay gói mẫu bằng danh mục dùng chung mà không đổi đường. */
export function registerCatalogRoutes(api: OpenAPIHono, { appPool, auth }: ApiDeps, catalog: CatalogData = SAMPLE_CATALOG) {
  const index = buildCatalogIndex(catalog);

  async function vao(c: Context): Promise<ApiErrorEntry | null> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return null;
  }

  const tra = (c: Context, l: ApiErrorEntry) => c.json({ error: l.code }, l.status as 401);

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/{code}`,
      summary: "Tra mã căn trong danh mục — found, not_in_catalog, unreadable hay ambiguous",
      request: { params: z.object({ code: z.string() }), query: z.object({ project: z.string().optional() }) },
      responses: {
        200: { description: "Kết quả tra", content: { "application/json": { schema: Lookup } } },
        401: err("Chưa đăng nhập"),
        403: err("Chưa gắn sàn"),
        404: err("Dự án không có trong danh mục"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
      },
    }),
    async (c) => {
      const loi = await vao(c);
      if (loi) return tra(c, loi);
      const { code } = c.req.valid("param");
      const { project } = c.req.valid("query");
      const kq = lookupUnit(index, code, project);
      if (kq.status === "unknown_project") return tra(c, API_ERRORS.notFound);
      return c.json(kq, 200);
    },
  );
}
