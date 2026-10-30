// AC-11: bản thật thiếu bộ gửi mã thì không dựng — không rơi về bộ gửi dev in mã ra nhật ký.
import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";
import { createAuth } from "./auth";

const base = { identityPool: new pg.Pool(), secret: "s".repeat(40), baseURL: "https://quy-hang.example.test" };

test("dựng: production thiếu bộ gửi ném lỗi", () => {
  assert.throws(() => createAuth({ ...base, env: "production" }), /thiếu bộ gửi mã đăng nhập/);
});

test("dựng: production có bộ gửi dựng được", () => {
  assert.doesNotThrow(() => createAuth({ ...base, env: "production", sender: async () => {} }));
});
