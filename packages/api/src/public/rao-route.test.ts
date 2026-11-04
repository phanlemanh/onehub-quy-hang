// Rào route công khai (hàng 35: AC-8, luật đợt 39; Ngoài-8 hàng 35 làm lại ở hàng 36: AC-10): mọi route dưới /api/v1/public/
// của app thật có một bài rò rỉ khai bằng `khaiBaiRoRi`, được nạp, chạy xanh và gọi chính route ấy trên app.
import { OpenAPIHono } from "@hono/zod-openapi";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { khaiBaiRoRi, napTepRoRi, routeCongKhai, timRouteThieuKiem, type BaiRoRi } from "./rao-route";
import { dungAppThu } from "./ro-ri-app";

const GOC_SRC = join(dirname(fileURLToPath(import.meta.url)), "..");
// Nạp trước khi khai test: tệp rò rỉ khai bài (và test của chính nó) lúc nạp.
const tep = await napTepRoRi(GOC_SRC);
const app = dungAppThu();
const BA_ROUTE = [
  "GET /api/v1/public/shares/:code",
  "GET /api/v1/public/shares/:code/photos/:photoId",
  "POST /api/v1/public/shares/:code/events",
];

test("rào route công khai: mọi route có bài khai chạy được trên app", async () => {
  assert.ok(tep.length > 0, "đối chứng: có tệp rò rỉ được nạp");
  assert.deepEqual(routeCongKhai(app).map((r) => `${r.method} ${r.path}`).sort(), BA_ROUTE);
  assert.deepEqual(await timRouteThieuKiem(app, dungAppThu), []);
});

test("rào route công khai: đối chứng đỏ", async () => {
  // Chỉ nhắc đường route trong chú thích (tệp rò rỉ vẫn nêu ba đường ở chú thích đầu) mà không khai bài → cả ba route thiếu.
  const khongBai = await timRouteThieuKiem(app, dungAppThu, []);
  assert.deepEqual(khongBai.map((r) => `${r.method} ${r.path} — ${r.ly_do}`).sort(), BA_ROUTE.map((r) => `${r} — không có bài khai`));
  // Bài khai mà không gọi route trên app → rào nêu route ấy.
  const baiRong: BaiRoRi[] = BA_ROUTE.map((r) => {
    const [method, path] = r.split(" ") as [string, string];
    return { method, path, chay: async () => {} };
  });
  assert.deepEqual((await timRouteThieuKiem(app, dungAppThu, baiRong)).map((r) => r.ly_do), BA_ROUTE.map(() => "bài không gọi route"));
  // App thử thêm một route công khai không bài → rào nêu đúng route ấy.
  const thu = new OpenAPIHono();
  thu.route("/", app);
  thu.get("/api/v1/public/thu", (c) => c.text("ok"));
  assert.deepEqual(await timRouteThieuKiem(thu, dungAppThu), [{ method: "GET", path: "/api/v1/public/thu", ly_do: "không có bài khai" }]);
});

// Khai muộn một bài trỏ route không có trên app: rào chỉ đi theo route của app, không theo sổ bài.
khaiBaiRoRi("GET", "/api/v1/public/khong-co", async () => {});
