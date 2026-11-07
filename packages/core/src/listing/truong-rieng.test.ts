// Bản gập: trường riêng (hàng 47, E4b) — custom_changed trộn vào custom, null xoá khoá.
import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePayload, type EventType, type ListingEvent } from "./events";
import { foldListing } from "./fold";

const e = (seq: number, type: EventType, payload: Record<string, unknown>): ListingEvent => {
  assert.deepEqual(validatePayload(type, payload), [], `${type} ${JSON.stringify(payload)} phải qua khuôn`);
  return { seq, type, payload, actorUserId: "u1", actorRoles: ["listing_agent"], confirmedWithOwner: false, occurredAt: `2026-11-0${seq}T00:00:00.000Z` };
};

test("bản gập: trường riêng", () => {
  const BUOC: [EventType, Record<string, unknown>, Record<string, unknown>][] = [
    ["created", { buildingName: "[Toà mẫu]" }, {}],
    ["custom_changed", { can_goc: true }, { can_goc: true }],
    ["custom_changed", { noi_that_ban_giao: "co_ban" }, { can_goc: true, noi_that_ban_giao: "co_ban" }],
    ["custom_changed", { can_goc: null }, { noi_that_ban_giao: "co_ban" }],
    ["details_changed", { furnished: "x" }, { noi_that_ban_giao: "co_ban" }],
  ];
  const ds: ListingEvent[] = [];
  let dem = 0;
  BUOC.forEach(([type, p, mong], i) => {
    ds.push(e(i + 1, type, p));
    assert.deepEqual(foldListing(ds).custom, mong, `bước ${i + 1}: ${type} ${JSON.stringify(p)}`);
    dem++;
  });
  assert.equal(dem, BUOC.length);

  // Khuôn: khoá khuôn mã, giá trị có / không, mã lựa chọn hay null; từ chối tên có dấu, số, khối lồng, payload rỗng.
  assert.deepEqual(validatePayload("custom_changed", { can_goc: false, noi_that: "tho", x: null }), []);
  assert.match(JSON.stringify(validatePayload("custom_changed", { "Căn góc": true })), /mã trường riêng/);
  assert.match(JSON.stringify(validatePayload("custom_changed", { can_goc: 1 })), /có \/ không/);
  assert.match(JSON.stringify(validatePayload("custom_changed", { can_goc: { a: 1 } })), /khối lồng/);
  assert.match(JSON.stringify(validatePayload("custom_changed", {})), /không có trường nào/);
});
