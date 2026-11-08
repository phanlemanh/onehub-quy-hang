import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { CatalogData, LotCatalogData } from "@quy-hang/core";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiDeps } from "../app";
import { resolveCompany } from "../auth/company";
import { ACTIVE_COMPANY_COOKIE } from "../auth/constants";
import { API_ERRORS, type ApiErrorEntry } from "../errors";
import { LOT_CATALOG_MAC_DINH } from "./lots";
import { SAMPLE_CATALOG } from "./sample";

/**
 * Đọc cả danh mục một lần (hàng 14): Bảng hàng ghép loại căn, diện tích, tầng, hướng theo toà + mã căn mà không tra từng
 * căn. Chỉ đọc, chỉ dữ liệu lớp danh mục. Tệp riêng cạnh `routes.ts` (dãy D đang sửa tuyến tra mã — yêu cầu B-1); danh
 * mục là tham số như `registerCatalogRoutes` để hàng 10 thay gói mẫu một chỗ.
 *
 * Hàng 79 (bang-hang-theo-loai-hinh): khu thấp tầng của danh mục lô — cùng nguồn với đường tra mã lô, mặc định rỗng (Hỏi-1
 * hàng 74) — nối sau các khu có toà, mỗi khu mang `blocks` (dãy → lô) và `buildings` rỗng; khu có toà giữ đúng khuôn cũ.
 * Bảng hàng đọc lô bằng chính hàm đọc lô của lõi (`buildLotIndex`), nên khoá lô theo kiểu `CatalogUnitData` của lõi.
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
  // Hàng 17: hồ sơ căn hiện loại hình — lớp công khai của danh mục, không phải lớp nguồn.
  propertyType: z.string(),
  propertySubType: z.string(),
});
/** Lô của dãy: khoá căn của danh mục cộng bốn trường thấp tầng (ADR-0016 quyết định 2) — lớp danh mục. */
const Lot = Unit.extend({
  lotSizeArea: z.number().nullable(),
  storiesTotal: z.number().nullable(),
  frontageLength: z.number().nullable(),
  accessRoadWidth: z.number().nullable(),
});
const Block = z.object({ blockKey: z.string(), blockName: z.string(), nhanSan: z.string().nullable(), units: z.array(Lot) });
const Catalog = z
  .object({
    subdivisions: z.array(
      z.object({
        subdivisionKey: z.string(),
        subdivisionName: z.string(),
        complexName: z.string().nullable(),
        buildings: z.array(z.object({ buildingKey: z.string(), buildingName: z.string(), units: z.array(Unit) })),
        blocks: z.array(Block).optional(),
      }),
    ),
  })
  .openapi("Catalog");

type CanChep = CatalogData["subdivisions"][number]["buildings"][number]["units"][number];
const chepCan = (u: CanChep) => ({
  upi: u.upi,
  unitNumber: u.unitNumber,
  stack: u.stack,
  floor: u.floor,
  livingArea: u.livingArea,
  bedroomsTotal: u.bedroomsTotal,
  directionFaces: u.directionFaces,
  propertyType: u.propertyType,
  propertySubType: u.propertySubType,
});

/** Chép đúng khuôn danh mục — khoá lạ trong gói đưa vào không lọt ra thân trả. */
function chepKhuon(catalog: CatalogData, lots: LotCatalogData): z.infer<typeof Catalog> & CatalogData {
  return {
    subdivisions: [...catalog.subdivisions.map((p) => ({
      subdivisionKey: p.subdivisionKey,
      subdivisionName: p.subdivisionName,
      complexName: p.complexName,
      buildings: p.buildings.map((b) => ({
        buildingKey: b.buildingKey,
        buildingName: b.buildingName,
        units: b.units.map(chepCan),
      })),
    })),
    ...lots.subdivisions
      .filter((s) => (s.blocks ?? []).length > 0)
      .map((s) => ({
        subdivisionKey: s.subdivisionKey,
        subdivisionName: s.subdivisionName,
        complexName: null,
        buildings: [],
        blocks: (s.blocks ?? []).map((b) => ({
          blockKey: b.blockKey,
          blockName: b.blockName,
          nhanSan: b.nhanSan ?? null,
          units: b.units.map((u) => ({
            ...chepCan(u),
            lotSizeArea: u.lotSizeArea ?? null,
            storiesTotal: u.storiesTotal ?? null,
            frontageLength: u.frontageLength ?? null,
            accessRoadWidth: u.accessRoadWidth ?? null,
          })),
        })),
      }))],
  };
}

export function registerCatalogReadAll(
  api: OpenAPIHono,
  { appPool, auth }: ApiDeps,
  catalog: CatalogData = SAMPLE_CATALOG,
  lots: LotCatalogData = LOT_CATALOG_MAC_DINH,
) {
  const than = chepKhuon(catalog, lots);

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
      summary: "Cả danh mục khu → toà → căn, chỉ lớp danh mục",
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
