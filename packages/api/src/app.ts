import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { DATA_CLASSES } from "@quy-hang/core";

/**
 * API có phiên bản cho mọi bề mặt và mọi hệ thống ngoài (ADR-0017 §4). Mọi thay đổi dữ liệu sẽ là một lệnh qua đây —
 * đường ghi duy nhất; máy chủ kiểm quyền và luật trong packages/core rồi mới ghi sự kiện.
 */
export const API_VERSION = "v1";
const BASE = `/api/${API_VERSION}`;

export const api = new OpenAPIHono();

const Health = z
  .object({
    ok: z.literal(true),
    service: z.literal("quy-hang"),
    apiVersion: z.literal(API_VERSION),
    dataClasses: z.array(z.string()),
  })
  .openapi("Health");

api.openapi(
  createRoute({
    method: "get",
    path: `${BASE}/health`,
    summary: "Máy chủ còn sống",
    responses: { 200: { description: "Còn sống", content: { "application/json": { schema: Health } } } },
  }),
  (c) =>
    c.json(
      { ok: true as const, service: "quy-hang" as const, apiVersion: API_VERSION as typeof API_VERSION, dataClasses: [...DATA_CLASSES] },
      200,
    ),
);

api.doc(`${BASE}/openapi.json`, {
  openapi: "3.0.0",
  info: { title: "Quỹ hàng API", version: API_VERSION },
});
