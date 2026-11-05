import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { buildLotIndex, lookupLot, type LotCatalogData } from "@quy-hang/core";
import type { ApiDeps } from "../app";
import { API_ERRORS } from "../errors";
import { taoCuaVao } from "./cua-vao";

/**
 * Gõ mã lô thấp tầng ra thuộc tính lô (hàng 74). Chỉ đọc, cùng cửa vào với đường tra mã căn. Danh mục lô mặc định RỖNG
 * (Hỏi-1 Cổng Phạm vi hàng 74, chủ kho duyệt 05/11): bản thật không phục vụ khu thấp tầng mẫu — tra trả `unreadable` với
 * danh sách khu rỗng tới khi danh mục thật có dãy (Invest cấp dãy — LH11; lô của sàn — hàng 76).
 */
export const LOT_CATALOG_MAC_DINH: LotCatalogData = { subdivisions: [] };

const BASE = "/api/v1/catalog/lots";
const ApiError = z.object({ error: z.string() });
const err = (description: string) => ({ description, content: { "application/json": { schema: ApiError } } });

/** Mười sáu thuộc tính lô — đúng `LOT_ATTRIBUTE_FIELDS` của lõi, lớp danh mục. */
const Lot = z
  .object({
    subdivisionKey: z.string(),
    subdivisionName: z.string(),
    blockKey: z.string(),
    blockName: z.string(),
    blockLabel: z.string().nullable(),
    unitNumber: z.string(),
    upi: z.string(),
    propertyType: z.string(),
    propertySubType: z.string(),
    lotSizeArea: z.number().nullable(),
    storiesTotal: z.number().nullable(),
    frontageLength: z.number().nullable(),
    accessRoadWidth: z.number().nullable(),
    livingArea: z.number().nullable(),
    bedroomsTotal: z.number().nullable(),
    directionFaces: z.string().nullable(),
  })
  .strict();

const LotLookup = z
  .union([
    z.object({ status: z.literal("found"), unit: Lot }),
    z.object({
      status: z.literal("not_in_catalog"),
      read: z.array(z.object({ subdivisionKey: z.string(), blockKey: z.string(), unitNumber: z.string(), blockKnown: z.boolean() })),
    }),
    z.object({
      status: z.literal("unreadable"),
      input: z.string(),
      examples: z.array(z.object({ subdivisionKey: z.string(), subdivisionName: z.string(), example: z.string() })),
    }),
    z.object({ status: z.literal("ambiguous"), candidates: z.array(Lot) }),
  ])
  .openapi("CatalogLotLookup");

/** Danh mục lô là tham số: danh mục thật có dãy thì truyền vào, không đổi đường. */
export function registerLotRoutes(api: OpenAPIHono, deps: Pick<ApiDeps, "appPool" | "auth">, catalog: LotCatalogData = LOT_CATALOG_MAC_DINH) {
  const index = buildLotIndex(catalog);
  const { vao, tra } = taoCuaVao(deps);

  api.openapi(
    createRoute({
      method: "get",
      path: `${BASE}/{code}`,
      summary: "Tra mã lô thấp tầng — found, not_in_catalog, unreadable hay ambiguous (nhiều lô)",
      request: {
        params: z.object({ code: z.string() }),
        query: z.object({ subdivision: z.string().optional() }).strict(),
      },
      responses: {
        200: { description: "Kết quả tra", content: { "application/json": { schema: LotLookup } } },
        401: err("Chưa đăng nhập"),
        403: err("Chưa gắn sàn"),
        404: err("Khu không có trong danh mục"),
        409: err("Thuộc nhiều sàn, chưa chọn"),
      },
    }),
    async (c) => {
      const loi = await vao(c);
      if (loi) return tra(c, loi);
      const { code } = c.req.valid("param");
      const { subdivision } = c.req.valid("query");
      const kq = lookupLot(index, code, subdivision);
      if (kq.status === "unknown_subdivision") return tra(c, API_ERRORS.notFound);
      return c.json(kq, 200);
    },
  );
}
