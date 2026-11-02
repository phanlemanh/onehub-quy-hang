// Mở số của lead ở Hôm nay (hồ sơ mo-so-lead, E5 và E7). Mỗi bảng viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { chuSo, LOI_MO_SO, moSo, telHref } from "./mo-so";

describe("mở số: viết số và liên kết gọi", () => {
  it("bảng bốn dạng vào → số theo nhóm", () => {
    const BANG: [string, string][] = [
      ["0900000011", "0900 000 011"],
      ["0900 000 011", "0900 000 011"],
      ["+84900000011", "0900 000 011"],
      ["", ""],
    ];
    let so = 0;
    for (const [vao, mong] of BANG) {
      assert.equal(chuSo(vao), mong, `dòng «${vao}»`);
      so++;
    }
    assert.equal(so, 4);
  });
  it("liên kết gọi không có dấu cách", () => {
    assert.equal(telHref("0900 000 011"), "tel:0900000011");
    assert.equal(telHref("0900000011"), "tel:0900000011");
  });
});

describe("mở số: câu trả lời của máy chủ", () => {
  const traLoi = (status: number, body?: unknown) =>
    (async () => new Response(body === undefined ? null : JSON.stringify(body), { status })) as unknown as typeof fetch;
  const matMang = (async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch;

  it("bảng năm câu trả lời → kết quả viết trước, không chạm kho trên máy", async () => {
    // Bọc kho trên máy: bị gọi là ném — mô-đun không được lưu số.
    const g = globalThis as Record<string, unknown>;
    const cu = { localStorage: g.localStorage, sessionStorage: g.sessionStorage, indexedDB: g.indexedDB };
    const cam = new Proxy({}, { get: () => { throw new Error("mở số chạm kho trên máy"); } });
    Object.assign(g, { localStorage: cam, sessionStorage: cam, indexedDB: cam });
    try {
      const BANG: [string, typeof fetch, Awaited<ReturnType<typeof moSo>>][] = [
        ["200 có số", traLoi(200, { ownerPhone: "0900000011" }), { ok: true, so: "0900000011" }],
        ["403", traLoi(403, { error: "listing-agent-required" }), { ok: false, loi: LOI_MO_SO.khongCon }],
        ["404", traLoi(404, { error: "not-found" }), { ok: false, loi: LOI_MO_SO.khongCon }],
        ["401", traLoi(401, { error: "unauthenticated" }), { ok: false, loi: LOI_MO_SO.hetPhien }],
        ["mạng lỗi", matMang, { ok: false, loi: LOI_MO_SO.matMang }],
      ];
      let so = 0;
      for (const [ten, goi, mong] of BANG) {
        assert.deepEqual(await moSo("0b6f1c2e-3d4a-4e5f-8a9b-0c1d2e3f4a5b", goi), mong, `dòng «${ten}»`);
        so++;
      }
      assert.equal(so, 5);
    } finally {
      Object.assign(g, cu);
    }
    assert.equal(LOI_MO_SO.khongCon, "Lead này không còn của bạn.");
    assert.equal(LOI_MO_SO.matMang, "Mất mạng — chưa mở được số, thử lại khi có mạng.");
  });
});

describe("mở số lead: tài liệu khớp", () => {
  // Gốc kho suy từ vị trí tệp này: apps/web/src/app/(app)/today → sáu cấp lên.
  const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..", "..");
  it("Tham chiếu §12 có dòng «Mở số của lead» nói vết và không lưu trên máy", () => {
    const t = readFileSync(join(GOC, "docs/product/tham-chieu.md"), "utf8");
    const dau = t.search(/^## 12\./m);
    assert.ok(dau >= 0, "Tham chiếu không có mục §12");
    const sau = t.slice(dau + 1).search(/^## /m);
    const s12 = sau < 0 ? t.slice(dau) : t.slice(dau, dau + 1 + sau);
    const dong = s12.split("\n").find((l) => l.includes("Mở số của lead"));
    assert.ok(dong, "Tham chiếu §12 thiếu dòng «Mở số của lead»");
    let so = 0;
    for (const cum of ["Mở số của lead", "vết", "không lưu trên máy"]) {
      assert.ok(dong.includes(cum), `dòng §12 thiếu «${cum}»`);
      so++;
    }
    assert.equal(so, 3);
  });
});
