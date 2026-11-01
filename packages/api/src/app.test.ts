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

test("OpenAPI liệt đúng bộ đường tiếng Anh", async () => {
  const res = await api.request("/api/v1/openapi.json");
  assert.equal(res.status, 200);
  const doc = (await res.json()) as { paths: Record<string, Record<string, unknown>> };
  const thay = Object.entries(doc.paths)
    .flatMap(([p, ops]) => Object.keys(ops).map((m) => `${m.toUpperCase()} ${p}`))
    .sort();
  const muon = [
    "GET /api/v1/health",
    "GET /api/v1/me",
    "POST /api/v1/me/company",
    "GET /api/v1/company",
    "GET /api/v1/company/members",
    "POST /api/v1/company/members",
    "PATCH /api/v1/company/members/{userId}",
    "DELETE /api/v1/company/members/{userId}",
    "GET /api/v1/company/zones",
    "POST /api/v1/company/zones",
    // Hàng 8 (ADR-0008).
    "POST /api/v1/listings",
    "GET /api/v1/listings",
    "GET /api/v1/listings/{listingId}",
    "POST /api/v1/listings/{listingId}/events",
    "GET /api/v1/listings/{listingId}/owner",
    "PUT /api/v1/listings/{listingId}/owner",
    "POST /api/v1/listings/{listingId}/owner/phone-reveal",
    "PUT /api/v1/listings/{listingId}/listing-agent",
    "GET /api/v1/catalog/units/{code}",
    // Nhận danh mục Invest (ADR-0015).
    "POST /api/v1/catalog/feeds",
    // Hàng 14: Bảng hàng đọc cả danh mục một lần.
    "GET /api/v1/catalog",
    // Hàng 24 (ADR-0012).
    "POST /api/v1/leads",
    "GET /api/v1/leads/buildings",
    "GET /api/v1/leads/{leadId}",
    "POST /api/v1/leads/{leadId}/discard",
  ].sort();
  const thua = thay.filter((x) => !muon.includes(x));
  const thieu = muon.filter((x) => !thay.includes(x));
  assert.deepEqual({ thua, thieu }, { thua: [], thieu: [] });
});
