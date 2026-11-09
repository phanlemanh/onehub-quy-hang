// Phạm vi của token máy (hàng 96) — E4: đúng một loại kết nối, một chiều, một route.
import { OpenAPIHono } from "@hono/zod-openapi";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { app, appPool, BASE_URL, capToken, demCan, donDep, dongNhatKy, FEED, goi, goiMau, sanCoToken, sanMoi, themThoaThuan, tin } from "./chung";

after(donDep);

const docLoi = async (res: Response) => ((await res.json()) as { error: string }).error;
const ID_MAU = "00000000-0000-4000-8000-000000000042";

test("token ngoài loại kết nối", async () => {
  const s = await sanMoi("e4-loai");
  await tin(s.companyId);
  const id = await themThoaThuan(s.companyId, { kind: "catalog_confirmation", direction: "outbound" });
  const t = await capToken(s, id);
  const feed = goiMau("e4-loai");
  const res = await goi("POST", FEED, { bearer: t.token, body: feed });
  assert.equal(res.status, 403);
  assert.equal(await docLoi(res), "token-scope");
  assert.equal(await demCan(feed.provider), 0);
  assert.deepEqual((await dongNhatKy(t.id)).map((r) => r.outcome), ["wrong_connection"]);
});

test("đổi chiều sau khi cấp", async () => {
  const s = await sanCoToken("e4-chieu");
  await appPool.query("update agreements set direction = 'outbound' where id = $1", [s.agreementId]);
  const feed = goiMau("e4-chieu");
  const res = await goi("POST", FEED, { bearer: s.token, body: feed });
  assert.equal(res.status, 403);
  assert.equal(await docLoi(res), "token-scope");
  assert.equal(await demCan(feed.provider), 0);
});

type Schema = { $ref?: string; type?: string | string[]; enum?: unknown[]; format?: string; properties?: Record<string, Schema>; required?: string[]; items?: Schema; minItems?: number; minLength?: number; minimum?: number; pattern?: string; anyOf?: Schema[]; oneOf?: Schema[]; allOf?: Schema[]; default?: unknown };
type Doc = { paths: Record<string, Record<string, { requestBody?: { content?: Record<string, { schema?: Schema }> } }>>; components?: { schemas?: Record<string, Schema> } };
type Route = { method: string; path: string; than?: unknown };
type Goi = { request: (u: string, i?: RequestInit) => Response | Promise<Response> };

/** Một giá trị đúng khuôn theo schema của tài liệu, để lời gọi qua được bộ kiểm thân và chạm tới lớp danh tính. */
function giaTriMau(s: Schema | undefined, doc: Doc): unknown {
  if (!s) return {};
  if (s.$ref) return giaTriMau(doc.components?.schemas?.[s.$ref.split("/").pop()!], doc);
  if (s.enum?.length) return s.enum[0];
  if (s.default !== undefined) return s.default;
  const nhanh = s.anyOf?.[0] ?? s.oneOf?.[0];
  if (nhanh) return giaTriMau(nhanh, doc);
  if (s.allOf) return Object.assign({}, ...s.allOf.map((x) => giaTriMau(x, doc)));
  const kieu = Array.isArray(s.type) ? s.type.find((t) => t !== "null") : s.type;
  switch (kieu) {
    case "object":
      return Object.fromEntries((s.required ?? []).map((k) => [k, giaTriMau(s.properties?.[k], doc)]));
    case "array":
      return Array.from({ length: s.minItems ?? 0 }, () => giaTriMau(s.items, doc));
    case "integer":
    case "number":
      return s.minimum ?? 1;
    case "boolean":
      return true;
    case "string":
      if (s.pattern === "^[0-9a-f]{64}$") return "a".repeat(64);
      if (s.format === "uuid") return ID_MAU;
      if (s.format === "date-time") return "2026-11-09T00:00:00.000Z";
      if (s.format === "email") return "t@example.test";
      if (s.format === "uri" || s.format === "url") return "https://example.test/mau";
      return "x".repeat(Math.max(s.minLength ?? 1, 1));
    default:
      return {};
  }
}

type KetQuaRoute = { ten: string; khong: number; voi: number };
/** Mã của từng route khi không header và khi có Bearer. */
async function quetRoute(a: Goi, routes: Route[], token: string): Promise<KetQuaRoute[]> {
  const kq: KetQuaRoute[] = [];
  for (const r of routes) {
    const path = r.path.replace(/\{[^}]+\}/g, ID_MAU);
    const co = r.method === "GET" || r.method === "HEAD" ? {} : { body: JSON.stringify(r.than ?? {}) };
    const khong = await a.request(`${BASE_URL}${path}`, { method: r.method, headers: { "content-type": "application/json" }, ...co });
    const voi = await a.request(`${BASE_URL}${path}`, { method: r.method, headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, ...co });
    kq.push({ ten: `${r.method} ${r.path}`, khong: khong.status, voi: voi.status });
  }
  return kq;
}
const lech = (kq: KetQuaRoute[]) => kq.filter((x) => x.khong !== x.voi).map((x) => `${x.ten}: ${x.khong} ≠ ${x.voi}`);

// Khuôn có điều kiện schema không tả được (địa chỉ phải thuộc dịch vụ đẩy đã biết): thân viết tay.
const DIA_CHI_DAY = "https://fcm.googleapis.com/fcm/send/mau";
const THAN_RIENG: Record<string, unknown> = {
  "POST /api/v1/me/push-subscriptions": { endpoint: DIA_CHI_DAY, keys: { p256dh: "a".repeat(87), auth: "a".repeat(22) } },
  "DELETE /api/v1/me/push-subscriptions": { endpoint: DIA_CHI_DAY },
};

// Route trả mã khác 401 khi không header, viết trước: phần còn lại phải dừng ở lớp danh tính, nếu không phép so không đo gì.
const KHONG_DUNG_O_DANH_TINH: Record<string, number> = {
  "GET /api/v1/health": 200,
  // Lớp khoá riêng của việc nền, ở đây chưa đặt khoá: Bearer lạ và không header cùng dừng ở đó.
  "POST /api/v1/jobs/lead-tick": 503,
  // Sự kiện của trang khách: đường công khai theo mã, không có lớp danh tính; mã mẫu sai dạng.
  "POST /api/v1/public/shares/{code}/events": 400,
};

test("token không mở route nào khác", async () => {
  const s = await sanCoToken("e4-route");
  const doc = (await (await app.request(`${BASE_URL}/api/v1/openapi.json`)).json()) as Doc;
  const routes: Route[] = Object.entries(doc.paths).flatMap(([path, cac]) =>
    Object.entries(cac)
      .filter(([m]) => ["get", "post", "put", "patch", "delete"].includes(m))
      .map(([m, op]) => ({ method: m.toUpperCase(), path, than: THAN_RIENG[`${m.toUpperCase()} ${path}`] ?? giaTriMau(op.requestBody?.content?.["application/json"]?.schema, doc) })),
  );
  const khac = routes.filter((r) => !(r.method === "POST" && r.path === FEED));
  assert.equal(khac.length, routes.length - 1);
  assert.ok(khac.length >= 100, `chỉ có ${khac.length} route`);
  const kqKhac = await quetRoute(app, khac, s.token);
  assert.equal(kqKhac.length, khac.length, "số route đã so phải bằng số đếm từ tài liệu");
  assert.deepEqual(lech(kqKhac), [], "token mở thêm route");
  // Không header thì mọi route phải dừng ở lớp danh tính, kể cả route có bộ kiểm thân: đo xem lời gọi có thật chạm tới đó không.
  assert.deepEqual(
    kqKhac.filter((x) => x.khong !== (KHONG_DUNG_O_DANH_TINH[x.ten] ?? 401)).map((x) => `${x.ten}: ${x.khong}`),
    [],
    "route không dừng ở lớp danh tính",
  );

  // Ba đường danh tính ngoài tài liệu OpenAPI.
  const danhTinh: Route[] = [
    { method: "GET", path: "/api/v1/auth/get-session" },
    { method: "GET", path: "/api/v1/auth/list-sessions" },
    { method: "POST", path: "/api/v1/auth/sign-out" },
  ];
  const kqDanhTinh = await quetRoute(app, danhTinh, s.token);
  assert.equal(kqDanhTinh.length, danhTinh.length);
  assert.deepEqual(lech(kqDanhTinh), [], "token mở đường danh tính");

  // Đối chứng dương: chính cửa nhận thì hai mã khác nhau.
  assert.equal(lech(await quetRoute(app, [{ method: "POST", path: FEED }], s.token)).length, 1);
  // Chiều đỏ: một bản viewer đọc Bearer làm người thì phép quét đỏ và nêu tên route.
  const gia = new OpenAPIHono();
  gia.get("/api/v1/me-gia", (c) => (c.req.header("authorization") ? c.json({ ok: true }, 200) : c.json({ error: "unauthenticated" }, 401)));
  const doGia = lech(await quetRoute(gia, [{ method: "GET", path: "/api/v1/me-gia" }], s.token));
  assert.equal(doGia.length, 1);
  assert.match(doGia[0]!, /me-gia/);
});

test("cookie sàn khác kèm token", async () => {
  const s = await sanCoToken("e4-ck");
  const khac = await sanMoi("e4-ck-khac");
  await tin(khac.companyId);
  const agrKhac = await themThoaThuan(khac.companyId);
  const demTheoThoaThuan = async (id: string) => Number((await appPool.query<{ n: string }>("select count(*) n from catalog_units where agreement_id = $1", [id])).rows[0]!.n);
  const truocKhac = await demTheoThoaThuan(agrKhac);
  const truocToken = await demTheoThoaThuan(s.agreementId);

  const feed = goiMau("e4-ck");
  assert.equal((await goi("POST", FEED, { bearer: s.token, cookie: khac.cookie, body: feed })).status, 200);
  assert.equal(await demTheoThoaThuan(agrKhac), truocKhac, "dòng gắn thoả thuận của sàn cookie bị đổi");
  assert.equal(await demTheoThoaThuan(s.agreementId), truocToken + 2, "đối chứng: sàn của token phải tăng");
});
