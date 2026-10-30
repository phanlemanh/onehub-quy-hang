import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";
import { createApi } from "./app";
import { createAuth } from "./auth/auth";

// Pool không kết nối: hai đường dưới không chạm cơ sở dữ liệu.
const pool = new pg.Pool();
const api = createApi({
  appPool: pool,
  identityPool: pool,
  auth: createAuth({ identityPool: pool, secret: "s".repeat(40), baseURL: "http://localhost:3461", sender: async () => {} }),
});

test("health trả về phiên bản API", async () => {
  const res = await api.request("/api/v1/health");
  assert.equal(res.status, 200);
  const body = (await res.json()) as { ok: boolean; apiVersion: string };
  assert.equal(body.ok, true);
  assert.equal(body.apiVersion, "v1");
});

test("mô tả OpenAPI có đường health, me, san", async () => {
  const res = await api.request("/api/v1/openapi.json");
  assert.equal(res.status, 200);
  const doc = (await res.json()) as { paths: Record<string, unknown> };
  for (const p of ["/api/v1/health", "/api/v1/me", "/api/v1/me/san", "/api/v1/san"]) assert.ok(doc.paths[p], p);
});
