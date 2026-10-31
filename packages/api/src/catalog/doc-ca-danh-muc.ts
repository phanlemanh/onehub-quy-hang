import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { CatalogData } from "@quy-hang/core";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { SAMPLE_CATALOG } from "./sample";

/**
 * Đọc cả danh mục một lần (hàng 14): Bảng hàng ghép loại căn, diện tích, tầng, hướng theo toà + mã căn mà không tra từng
 * căn. Chỉ đọc, chỉ dữ liệu lớp danh mục. Tệp riêng cạnh `routes.ts` (dãy D đang sửa tuyến tra mã — yêu cầu B-1); danh
 * mục là tham số như `registerCatalogRoutes` để hàng 10 thay gói mẫu một chỗ.
 */
const PATH = "/api/v1/catalog";

const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });
const Unit = z.object({
  upi: z.string(),
  unitNumber: z.string(),
  stack: z.string().nullable(),
  floor: z.number().nullable(),
  livingArea: z.number().nullable(),
  bedroomsTotal: z.number().nullable(),
  directionFaces: z.string().nullable(),
});
const Catalog = z
  .object({
    projects: z.array(
      z.object({
        projectKey: z.string(),
        projectName: z.string(),
        complexName: z.string().nullable(),
        buildings: z.array(z.object({ buildingKey: z.string(), buildingName: z.string(), units: z.array(Unit) })),
      }),
    ),
  })
  .openapi("Catalog");

/** Chép đúng khuôn danh mục — khoá lạ trong gói đưa vào không lọt ra thân trả. */
function chepKhuon(catalog: CatalogData): z.infer<typeof Catalog> {
  return {
    projects: catalog.projects.map((p) => ({
      projectKey: p.projectKey,
      projectName: p.projectName,
      complexName: p.complexName,
      buildings: p.buildings.map((b) => ({
        buildingKey: b.buildingKey,
        buildingName: b.buildingName,
        units: b.units.map((u) => ({
          upi: u.upi,
          unitNumber: u.unitNumber,
          stack: u.stack,
          floor: u.floor,
          livingArea: u.livingArea,
          bedroomsTotal: u.bedroomsTotal,
          directionFaces: u.directionFaces,
        })),
      })),
    })),
  };
}

export function registerCatalogReadAll(api: OpenAPIHono, { appPool, auth }: ApiDeps, catalog: CatalogData = SAMPLE_CATALOG) {
  const than = chepKhuon(catalog);

  // Cùng luật vào với tuyến tra mã căn (`routes.ts`): chép lại thay vì tách, vì `routes.ts` đang ở vùng của dãy D.
  async function vao(c: Context): Promise<ApiErrorEntry | null> {
    const user = (await auth.api.getSession({ headers: c.req.raw.headers }))?.user;
    if (!user) return API_ERRORS.unauthenticated;
    const r = await resolveCompany(appPool, user.id, getCookie(c, ACTIVE_COMPANY_COOKIE));
    if (!r.active) return r.reason === API_ERRORS.selectCompany.code ? API_ERRORS.selectCompany : API_ERRORS.noCompany;
    return null;
  }

  api.openapi(
    createRoute({
      method: "get",
      path: PATH,
      summary: "Cả danh mục dự án → toà → căn, chỉ lớp danh mục",
      responses: {
        200: { description: "Danh mục", content: { "application/json": { schema: Catalog } } },
        401: err("Chưa đăng nhập"),
        403: err("Chưa gắn sàn"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
      },
    }),
    async (c) => {
      const loi = await vao(c);
      if (loi) return c.json({ error: loi.code }, loi.status as 401);
      return c.json(than, 200);
    },
  );
}
