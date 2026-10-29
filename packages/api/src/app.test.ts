import assert from "node:assert/strict";
import { test } from "node:test";
import { api } from "./app";

test("health trả về phiên bản API", async () => {
  const res = await api.request("/api/v1/health");
  assert.equal(res.status, 200);
  const body = (await res.json()) as { ok: boolean; apiVersion: string };
  assert.equal(body.ok, true);
  assert.equal(body.apiVersion, "v1");
});

test("mô tả OpenAPI có đường health", async () => {
  const res = await api.request("/api/v1/openapi.json");
  assert.equal(res.status, 200);
  const doc = (await res.json()) as { paths: Record<string, unknown> };
  assert.ok(doc.paths["/api/v1/health"]);
});
