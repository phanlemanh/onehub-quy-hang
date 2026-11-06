import assert from "node:assert/strict";
import { test } from "node:test";

import { docPhanHoiMe, LoiDocPhien, POOL_DANH_TINH, POOL_UNG_DUNG } from "./api";

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
    });
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
  assert.ok(POOL_DANH_TINH.max + POOL_UNG_DUNG.max <= 5);
  for (const p of [POOL_DANH_TINH, POOL_UNG_DUNG]) {
    assert.ok(p.idleTimeoutMillis > 0 && p.idleTimeoutMillis <= 10_000);
    assert.ok(p.connectionTimeoutMillis > 0);
  }
});
