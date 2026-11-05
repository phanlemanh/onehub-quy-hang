// Sự kiện `voided` (hàng 66 nhap-hoan-tac, AC-7, E7): cờ khi gấp, không phải trạng thái thứ bảy (ADR-0011 quyết định 8).
import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePayload, type EventType, type ListingEvent } from "./events";
import { foldListing } from "./fold";
import { STANDARD_STATUSES, TRANSITIONS, type StandardStatus } from "./status";

let lan = 0;
const e = (seq: number, type: EventType, payload: Record<string, unknown> = {}): ListingEvent => {
  assert.deepEqual(validatePayload(type, payload), [], `${type} ${JSON.stringify(payload)} phải qua khuôn`);
  return { seq, type, payload, actorUserId: "u1", actorRoles: ["listing_agent"], confirmedWithOwner: false, occurredAt: `2026-11-0${(lan++ % 5) + 1}T00:00:00.000Z` };
};

// Đường tới từng trạng thái chuẩn qua bảng chuyển — ma trận viết tay, phủ đủ sáu.
const DUONG: Record<StandardStatus, Record<string, unknown>[]> = {
  Incomplete: [],
  Active: [{ to: "Active" }],
  Pending: [{ to: "Active" }, { to: "Pending" }],
  Closed: [{ to: "Active" }, { to: "Closed", closePrice: 3_000_000_000 }],
  Hold: [{ to: "Hold" }],
  Withdrawn: [{ to: "Withdrawn", withdrawnReason: "owner_changed_mind" }],
};

function day(den: StandardStatus, voided: boolean): ListingEvent[] {
  const ds = [e(1, "created", { buildingName: "[Toà mẫu]", unitNumber: "A-01" }), e(2, "price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" })];
  for (const p of DUONG[den]) ds.push(e(ds.length + 1, "status_changed", p));
  if (voided) ds.push(e(ds.length + 1, "voided"));
  return ds;
}

test("sự kiện voided: cờ khi gấp, không phải trạng thái", () => {
  assert.deepEqual(new Set(Object.keys(DUONG)), new Set(STANDARD_STATUSES), "ma trận phải phủ đúng sáu trạng thái chuẩn");
  let dem = 0;
  for (const s of STANDARD_STATUSES) {
    const kq = foldListing(day(s, true));
    assert.equal(kq.standardStatus, s, `trạng thái ${s}: voided không đổi trạng thái`);
    assert.equal(kq.voided, true, `trạng thái ${s}: voided = true`);
    dem += 2;
  }
  assert.equal(foldListing(day("Active", false)).voided, false, "dãy không voided → voided false");
  dem++;
  assert.deepEqual(validatePayload("voided", {}), []);
  assert.ok(validatePayload("voided", { x: 1 }).some((l) => l.path === "x" && l.reason === "khoá lạ"), "payload có khoá lạ bị từ chối");
  dem += 2;
  const trongBang = [...Object.keys(TRANSITIONS), ...Object.values(TRANSITIONS).flat()];
  assert.ok(!trongBang.includes("voided"), "bảng chuyển không có voided");
  dem++;
  assert.equal(dem, 16);
});
