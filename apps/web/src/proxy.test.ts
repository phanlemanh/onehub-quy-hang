// Bộ chặn đăng nhập (hàng 35: AC-1, E1b): trang khách `/s/<mã>` mở không phiên; trang vận hành chưa phiên vẫn về /login.
import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

test("bộ chặn: trang khách mở không phiên", async () => {
  const BANG: [string, string | null][] = [
    ["/s/AbCdEfGhIjKl", null],
    ["/s/Zz_-0123abcd", null],
    ["/today", "/login"],
    ["/shares/new", "/login"],
    ["/sx", "/login"],
  ];
  assert.equal(BANG.length, 5, "số dòng bảng viết trước");
  for (const [duong, ve] of BANG) {
    const r = await proxy(new NextRequest(new URL(duong, "http://quyhang.test")));
    const loc = r.headers.get("location");
    assert.equal(loc ? new URL(loc).pathname : null, ve, duong);
  }
});
