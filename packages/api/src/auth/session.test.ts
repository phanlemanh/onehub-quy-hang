// Phiên 30 ngày, trượt theo ngày dùng (hồ sơ phien-dang-nhap-30-ngay, AC-6, AC-7). Không cần cơ sở dữ liệu.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import pg from "pg";
import { createAuth } from "./auth";
import { SESSION_EXPIRES_SEC, SESSION_UPDATE_AGE_SEC } from "./constants";

const DAY = 86400;

test("phiên: createAuth khai 30 ngày, làm mới mỗi ngày", async () => {
  assert.equal(SESSION_EXPIRES_SEC, 2592000, "hợp đồng ghim 2592000 giây (30 ngày)");
  assert.equal(SESSION_UPDATE_AGE_SEC, 86400, "hợp đồng ghim 86400 giây (1 ngày)");
  const pool = new pg.Pool();
  try {
    const auth = createAuth({ identityPool: pool, secret: "s".repeat(40), baseURL: "http://localhost:3461" });
    assert.equal(auth.options.session?.expiresIn, SESSION_EXPIRES_SEC, "createAuth không khai session.expiresIn");
    assert.equal(auth.options.session?.updateAge, SESSION_UPDATE_AGE_SEC, "createAuth không khai session.updateAge");
  } finally {
    await pool.end();
  }
});

test("phiên: ADR-0005 và Tham chiếu ghi đúng số của mã", () => {
  const read = (rel: string) => readFileSync(new URL(`../../../../${rel}`, import.meta.url), "utf8");
  const days = SESSION_EXPIRES_SEC / DAY;
  const adr = read("docs/adr/0005-dang-nhap-theo-san.md");
  assert.match(adr, new RegExp(`[Pp]hiên đăng nhập sống ${days} ngày`), `ADR-0005 thiếu câu «phiên đăng nhập sống ${days} ngày»`);
  assert.match(adr, /làm mới tối đa mỗi ngày một lần/, "ADR-0005 thiếu nhịp làm mới mỗi ngày");
  const ref = read("docs/product/tham-chieu.md");
  const row = ref.split("\n").find((l) => l.startsWith("| 31/10 |") && l.includes(`Phiên đăng nhập ${days} ngày`));
  assert.ok(row, `Tham chiếu §12 thiếu dòng 31/10 «Phiên đăng nhập ${days} ngày»`);
});
