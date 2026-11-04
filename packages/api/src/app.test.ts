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
    "POST /api/v1/imports",
    "POST /api/v1/imports/{importId}/rows",
    "GET /api/v1/imports/{importId}",
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
    // Hàng 25 (ADR-0017).
    "GET /api/v1/company/settings/lead-routing",
    "PUT /api/v1/company/settings/lead-routing",
    "PUT /api/v1/company/members/{userId}/leave",
    "POST /api/v1/leads/{leadId}/accept",
    "POST /api/v1/leads/{leadId}/first-call",
    "POST /api/v1/leads/{leadId}/claim",
    "POST /api/v1/leads/{leadId}/assign",
    "GET /api/v1/lead-pool",
    "GET /api/v1/lead-alerts",
    "POST /api/v1/jobs/lead-tick",
    // Hàng 27 (ADR-0020).
    "GET /api/v1/leads",
    "POST /api/v1/leads/{leadId}/return",
    "POST /api/v1/leads/{leadId}/resubmit",
    // Hàng 85 (ADR-0021).
    "POST /api/v1/leads/{leadId}/listing",
    "GET /api/v1/contacts/{contactId}",
    "PATCH /api/v1/contacts/{contactId}",
    // lien-he-khach (hàng 86).
    "POST /api/v1/prospects",
    "GET /api/v1/prospects/{prospectId}",
    "PATCH /api/v1/prospects/{prospectId}",
    "POST /api/v1/prospects/{prospectId}/phones",
    "POST /api/v1/prospects/{prospectId}/close",
    "GET /api/v1/prospects/{prospectId}/shares",
    "POST /api/v1/shares",
    // Hàng 22: Hôm nay của đầu chủ.
    "GET /api/v1/company/settings/queue",
    "PUT /api/v1/company/settings/queue",
    "GET /api/v1/leads/assigned",
    // Hàng 28: một lead của tôi cho chế độ cuộc gọi.
    "GET /api/v1/leads/assigned/{leadId}",
    // Hàng 26 (ADR-0025).
    "GET /api/v1/push/public-key",
    "POST /api/v1/me/push-subscriptions",
    "DELETE /api/v1/me/push-subscriptions",
    // Hàng 38: tab Tôi — máy đang đăng nhập, báo mất máy.
    "GET /api/v1/me/devices",
    "POST /api/v1/me/devices/report-lost",
    // Hàng mo-so-lead.
    "POST /api/v1/leads/{leadId}/phone-reveal",
    // Hàng 30: gọi từ máy tính.
    "POST /api/v1/leads/{leadId}/phone-dial",
    // Hàng 34: khách đang mở của đầu khách cho màn Gửi.
    "GET /api/v1/prospects",
    // Hàng ghi-thiet-bi-va-mat-mang: lượt mất mạng của bộ đồng bộ.
    "POST /api/v1/sync/offline-sessions",
    // Hàng 35: trang khách — ghi lượt mở, lượt quan tâm (route đọc và route ảnh không khai OpenAPI).
    "POST /api/v1/public/shares/{code}/events",
    // Hàng 42: Hôm nay trưởng nhóm.
    "GET /api/v1/team/lead-queue",
    "GET /api/v1/team/listing-agents",
    // Hàng 43 (phat-hang): lần xuất bảng hàng.
    "POST /api/v1/exports",
  ].sort();
  const thua = thay.filter((x) => !muon.includes(x));
  const thieu = muon.filter((x) => !thay.includes(x));
  assert.deepEqual({ thua, thieu }, { thua: [], thieu: [] });
});
