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

type Route = { method: string; path: string };
type Goi = { request: (u: string, i?: RequestInit) => Response | Promise<Response> };

/** Route nào trả mã khác nhau giữa có Bearer và không header. */
async function quetRoute(a: Goi, routes: Route[], token: string): Promise<string[]> {
  const lech: string[] = [];
  for (const r of routes) {
    const path = r.path.replace(/\{[^}]+\}/g, ID_MAU);
    const co = r.method === "GET" || r.method === "HEAD" ? {} : { body: "{}" };
    const khong = await a.request(`${BASE_URL}${path}`, { method: r.method, headers: { "content-type": "application/json" }, ...co });
    const voi = await a.request(`${BASE_URL}${path}`, { method: r.method, headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, ...co });
    if (khong.status !== voi.status) lech.push(`${r.method} ${r.path}: ${khong.status} ≠ ${voi.status}`);
  }
  return lech;
}

test("token không mở route nào khác", async () => {
  const s = await sanCoToken("e4-route");
  const doc = (await (await app.request(`${BASE_URL}/api/v1/openapi.json`)).json()) as { paths: Record<string, Record<string, unknown>> };
  const routes: Route[] = Object.entries(doc.paths).flatMap(([path, cac]) =>
    Object.keys(cac)
      .filter((m) => ["get", "post", "put", "patch", "delete"].includes(m))
      .map((m) => ({ method: m.toUpperCase(), path })),
  );
  const khac = routes.filter((r) => !(r.method === "POST" && r.path === FEED));
  assert.equal(khac.length, routes.length - 1);
  assert.ok(khac.length >= 100, `chỉ có ${khac.length} route`);
  // Ba đường danh tính ngoài tài liệu OpenAPI.
  const danhTinh: Route[] = [
    { method: "GET", path: "/api/v1/auth/get-session" },
    { method: "GET", path: "/api/v1/auth/list-sessions" },
    { method: "POST", path: "/api/v1/auth/sign-out" },
  ];
  let soRoute = 0;
  for (const nhom of [khac, danhTinh]) {
    assert.deepEqual(await quetRoute(app, nhom, s.token), [], "token mở thêm route");
    soRoute += nhom.length;
  }
  assert.equal(soRoute, routes.length - 1 + danhTinh.length);

  // Đối chứng dương: chính cửa nhận thì hai mã khác nhau.
  assert.equal((await quetRoute(app, [{ method: "POST", path: FEED }], s.token)).length, 1);
  // Chiều đỏ: một bản viewer đọc Bearer làm người thì phép quét đỏ và nêu tên route.
  const gia = new OpenAPIHono();
  gia.get("/api/v1/me-gia", (c) => (c.req.header("authorization") ? c.json({ ok: true }, 200) : c.json({ error: "unauthenticated" }, 401)));
  const lech = await quetRoute(gia, [{ method: "GET", path: "/api/v1/me-gia" }], s.token);
  assert.equal(lech.length, 1);
  assert.match(lech[0]!, /me-gia/);
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
