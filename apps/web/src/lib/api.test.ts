import assert from "node:assert/strict";
import { test } from "node:test";

import type pg from "pg";

import { docPhanHoiMe, dungPools, LoiDocPhien, POOL_DANH_TINH, POOL_UNG_DUNG } from "./api";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const ME = { user: { id: "u1", email: "[ten]@vi-du.test" }, companies: [], activeCompany: null };

// Sự cố 06/11: pooler cạn → better-auth không đọc được phiên → /me trả 500 → vỏ đá người đã đăng nhập về /login.
test("5xx của /me là lỗi hạ tầng: ném LoiDocPhien, không trả null như «chưa đăng nhập»", async () => {
  for (const status of [500, 502, 503]) {
    await assert.rejects(docPhanHoiMe(json(status, { message: "Failed to get session" })), (e: unknown) => {
      assert.ok(e instanceof LoiDocPhien);
      assert.equal(e.status, status);
      return true;
    }, `5xx của /me (HTTP ${status}): phải ném LoiDocPhien, không trả null`);
  }
});

test("401 thường là chưa đăng nhập (null); 401 máy bị báo mất trả mã người; 200 trả người", async () => {
  assert.equal(await docPhanHoiMe(json(401, { error: "unauthenticated" })), null);
  assert.deepEqual(await docPhanHoiMe(json(401, { error: "device_reported_lost", userId: "u9" })), { biBao: "u9" });
  assert.deepEqual(await docPhanHoiMe(json(200, ME)), { me: ME });
});

// Pooler chế độ session: TỔNG 15 kết nối cho cả dự án, mọi phiên bản hàm cùng chia. Một phiên bản không được giữ quá
// một phần ba, và phải nhả kết nối rảnh sớm.
test("cỡ pool mỗi phiên bản hàm đủ nhỏ để nhiều phiên bản cùng sống dưới trần 15 của pooler", () => {
  assert.ok(POOL_DANH_TINH.max + POOL_UNG_DUNG.max <= 5, "cỡ pool: một phiên bản giữ quá 5 kết nối của trần 15");
  for (const p of [POOL_DANH_TINH, POOL_UNG_DUNG]) {
    assert.ok(p.idleTimeoutMillis > 0 && p.idleTimeoutMillis <= 10_000, "cỡ pool: kết nối rảnh không được nhả sớm");
    assert.ok(p.connectionTimeoutMillis > 0, "cỡ pool: chờ kết nối không có hạn");
  }
});

test("hai pool dựng đúng cỡ và cả hai gắn attachDatabasePool", async () => {
  const gan: pg.Pool[] = [];
  const { identityPool, appPool } = dungPools("postgres://u:p@127.0.0.1:1/x", (p) => gan.push(p));
  try {
    assert.deepEqual(gan, [identityPool, appPool], "attachDatabasePool: thiếu pool chưa gắn");
    for (const [pool, co] of [
      [identityPool, POOL_DANH_TINH],
      [appPool, POOL_UNG_DUNG],
    ] as const) {
      assert.equal(pool.options.max, co.max);
      assert.equal(pool.options.idleTimeoutMillis, co.idleTimeoutMillis);
      assert.equal(pool.options.connectionTimeoutMillis, co.connectionTimeoutMillis);
    }
    // Pool danh tính giữ search_path=identity; pool ứng dụng không (luật cách ly đặt trong giao dịch, không ở chuỗi nối).
    assert.equal((identityPool.options as { options?: string }).options, "-c search_path=identity");
    assert.equal((appPool.options as { options?: string }).options, undefined);
  } finally {
    await Promise.all([identityPool.end(), appPool.end()]);
  }
});
