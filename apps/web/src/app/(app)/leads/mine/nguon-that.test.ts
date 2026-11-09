// Lời đọc danh sách của Lead đã nhập (hồ sơ va-lead-da-nhap-than-hong): nội dung không dùng được là đọc hỏng, không ném, không lọt tới màn.
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { myLeadView, type MyLeadRecord, type MyLeadView } from "@quy-hang/core/dedupe";

import { nguon } from "./nguon-that";

const that = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = that;
});
const tra = (than: string, status = 200) => {
  globalThis.fetch = (async () => new Response(than, { status })) as typeof fetch;
};
// Lead dựng bằng chính hàm mà API dùng để trả, không chép tay khuôn.
const LEAD = JSON.parse(JSON.stringify(myLeadView({ id: "l1", buildingName: "Toà A", need: "sale", listPrice: 1, createdAt: "2026-11-09T01:00:00.000Z" } as MyLeadRecord, null))) as MyLeadView;

describe("đọc Lead đã nhập", () => {
  it("thân không phải JSON", async () => {
    tra("{hong");
    assert.equal(await nguon.lay(), null);
  });

  it("JSON không phải danh sách", async () => {
    const BANG = ['{"a":1}', "null", '"chuoi"', "[null]", '[{"a":1}]'];
    let dem = 0;
    for (const than of BANG) {
      tra(than);
      assert.equal(await nguon.lay(), null, than);
      dem++;
    }
    assert.equal(dem, 5);
  });

  it("phản hồi đúng giữ nguyên", async () => {
    let dem = 0;
    tra(JSON.stringify([LEAD]));
    assert.deepEqual(await nguon.lay(), [LEAD]);
    dem++;
    tra("[]");
    assert.deepEqual(await nguon.lay(), []);
    dem++;
    tra("[]", 500);
    assert.equal(await nguon.lay(), null);
    dem++;
    globalThis.fetch = (async () => {
      throw new TypeError("failed to fetch");
    }) as typeof fetch;
    assert.equal(await nguon.lay(), null);
    dem++;
    assert.equal(dem, 4);
  });
});
