import assert from "node:assert/strict";
import { test } from "node:test";

import type pg from "pg";

import { docPhanHoiMe, dungPools, KHACH_KHAC, LoiDocPhien, NOI_CHAN_DAU, NOI_TRANG, SO_BAN_DU_KIEN, TRAN_POOLER } from "./api";

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

// Pooler chế độ session: TỔNG 15 kết nối cho cả dự án. Mỗi bản triển khai chạy hai hàm có bộ pool riêng — hàm trang và
// hàm bước chặn đầu — nên quan hệ phải đếm cả hai, và phải nhỏ hơn HẲN trần.
test("cỡ pool: số bản × (hàm trang + hàm bước chặn đầu) + khách khác nhỏ hơn hẳn trần 15 của pooler", () => {
  const moiBan = NOI_TRANG.danhTinh.max + NOI_TRANG.ungDung.max + NOI_CHAN_DAU.danhTinh.max + NOI_CHAN_DAU.ungDung.max;
  const tong = SO_BAN_DU_KIEN * moiBan + KHACH_KHAC;
  assert.equal(TRAN_POOLER, 15);
  assert.ok(tong < TRAN_POOLER, `cỡ pool: ${SO_BAN_DU_KIEN} bản × ${moiBan} + ${KHACH_KHAC} = ${tong} chạm trần ${TRAN_POOLER}`);
  for (const p of [NOI_TRANG.danhTinh, NOI_TRANG.ungDung, NOI_CHAN_DAU.danhTinh, NOI_CHAN_DAU.ungDung]) {
    assert.ok(p.idleTimeoutMillis > 0 && p.idleTimeoutMillis <= 10_000, "cỡ pool: kết nối rảnh không được nhả sớm");
    assert.ok(p.connectionTimeoutMillis > 0, "cỡ pool: chờ kết nối không có hạn");
  }
});

test("hai pool dựng đúng cỡ của nơi chạy và cả hai gắn attachDatabasePool", async () => {
  for (const [noi, co] of [
    ["trang", NOI_TRANG],
    ["chan-dau", NOI_CHAN_DAU],
  ] as const) {
    const gan: pg.Pool[] = [];
    const { identityPool, appPool } = dungPools("postgres://u:p@127.0.0.1:1/x", noi, (p) => gan.push(p));
    try {
      assert.deepEqual(gan, [identityPool, appPool], `attachDatabasePool: thiếu pool chưa gắn (${noi})`);
      for (const [pool, c] of [
        [identityPool, co.danhTinh],
        [appPool, co.ungDung],
      ] as const) {
        assert.equal(pool.options.max, c.max, `cỡ pool ${noi}: max lệch`);
        assert.equal(pool.options.idleTimeoutMillis, c.idleTimeoutMillis);
        assert.equal(pool.options.connectionTimeoutMillis, c.connectionTimeoutMillis);
      }
      // Pool danh tính giữ search_path=identity; pool ứng dụng không (luật cách ly đặt trong giao dịch, không ở chuỗi nối).
      assert.equal((identityPool.options as { options?: string }).options, "-c search_path=identity");
      assert.equal((appPool.options as { options?: string }).options, undefined);
    } finally {
      await Promise.all([identityPool.end(), appPool.end()]);
    }
  }
  // Mặc định là cỡ của hàm trang.
  const { identityPool, appPool } = dungPools("postgres://u:p@127.0.0.1:1/x", undefined, () => {});
  try {
    assert.equal(identityPool.options.max, NOI_TRANG.danhTinh.max);
  } finally {
    await Promise.all([identityPool.end(), appPool.end()]);
  }
});
