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
// Lead dựng bằng chính hàm mà API dùng để trả, đủ dữ kiện, rồi qua JSON như trên đường truyền.
const BAN_GHI: MyLeadRecord = {
  id: "l-1",
  outcome: "new",
  matchedAgentUserId: null,
  matchedListingId: null,
  ownerPhone: "0900 000 031",
  buildingName: "Toà A",
  unitNumber: "A-02.06",
  need: "sale",
  listPrice: 3_200_000_000,
  feeInclusion: "included",
  desiredListingTime: "now",
  createdAt: "2026-11-09T01:00:00.000Z",
  discardedAt: null,
  routedAt: "2026-11-09T01:05:00.000Z",
  acceptedAt: null,
  firstCalledAt: null,
  boardAt: null,
  returnedAt: null,
  resubmittedAt: null,
  resubmittedLeadId: null,
};
const LEAD = JSON.parse(JSON.stringify(myLeadView(BAN_GHI, null))) as MyLeadView;

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

  it("phần tử sai khuôn", async () => {
    assert.equal(LEAD.stage, "sent", "lead mẫu là một lead thật ở nấc đầu");
    const SAI: [string, unknown][] = [
      ["id", 1],
      ["buildingName", null],
      ["unitNumber", 1],
      ["need", "la"],
      ["listPrice", "x"],
      ["listPrice", null],
      ["feeInclusion", 1],
      ["stage", "la"],
      ["stage", 1],
      ["createdAt", "khong-phai-ngay"],
      ["createdAt", null],
      ...["routedAt", "acceptedAt", "firstCalledAt", "boardAt", "returnedAt", "resubmittedAt"].map((k): [string, unknown] => [k, "khong-phai-ngay"]),
    ];
    let dem = 0;
    for (const [khoa, gia] of SAI) {
      tra(JSON.stringify([{ ...LEAD, [khoa]: gia }]));
      assert.equal(await nguon.lay(), null, `${khoa} = ${String(gia)}`);
      dem++;
    }
    assert.equal(dem, 17);
    for (const than of [[LEAD, null], [null, LEAD], [LEAD, { a: 1 }]]) {
      tra(JSON.stringify(than));
      assert.equal(await nguon.lay(), null, "một phần tử sai ở vị trí bất kỳ");
    }
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
