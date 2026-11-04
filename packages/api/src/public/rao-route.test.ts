// Rào route công khai (hàng 35: AC-8, luật đợt 39): mọi route dưới /api/v1/public/ của app thật có bài rò rỉ nêu đường.
import { OpenAPIHono } from "@hono/zod-openapi";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { createApi } from "../app";
import { routeCongKhai, timRouteThieuKiem } from "./rao-route";

const GOC_SRC = join(dirname(fileURLToPath(import.meta.url)), "..");
// App thật: pool không nối (không truy vấn nào chạy khi chỉ đọc danh sách route).
const app = createApi({ appPool: new pg.Pool(), identityPool: new pg.Pool(), auth: { handler: () => new Response(), api: {} } as never });

test("rào route công khai: mọi route có bài rò rỉ", () => {
  const ds = routeCongKhai(app).map((r) => `${r.method} ${r.path}`);
  assert.deepEqual(ds.sort(), [
    "GET /api/v1/public/shares/:code",
    "GET /api/v1/public/shares/:code/photos/:photoId",
    "POST /api/v1/public/shares/:code/events",
  ]);
  assert.deepEqual(timRouteThieuKiem(app, GOC_SRC), []);
  // Đối chứng đỏ: một route công khai mới không có bài thì rào nêu đúng route ấy.
  const thu = new OpenAPIHono();
  thu.route("/", app);
  thu.get("/api/v1/public/thu", (c) => c.text("ok"));
  assert.deepEqual(timRouteThieuKiem(thu, GOC_SRC), [{ method: "GET", path: "/api/v1/public/thu" }]);
});
