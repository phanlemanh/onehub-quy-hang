// Ghi trên máy trước (hàng 13: AC-3).
import assert from "node:assert/strict";
import { test } from "node:test";
import { foldListing } from "@quy-hang/core/listing";
import { apTrenMay, suKienTam } from "./ap-tren-may";
import { moHoSo } from "./doc";
import { canMau, suKien, NGAY } from "./mau.test-helpers";
import { nganTrong, type Ngan } from "./types";

// Căn ở phiên bản 3: created, giá, chi tiết.
const { view, events } = canMau("h", "[Toà A]", [
  suKien(2, "price_changed", { listPrice: 3_000_000_000, feeInclusion: "excluded" }),
  suKien(3, "details_changed", { legalStatus: "pink_book" }),
]);
const goc = (): Ngan => ({ ...nganTrong(), listings: [view], lastPullAt: NGAY, lastAttempt: "ok" });

test("ghi trên máy trước: đổi ngay, xếp hàng, nối chuỗi phiên bản", () => {
  assert.equal(view.version, 3);
  const a = apTrenMay(goc(), "h", "price_changed", { listPrice: 3_100_000_000, feeInclusion: "excluded" }, NGAY, "op-1");
  assert.ok(a.ok);
  const b = apTrenMay(a.ngan, "h", "details_changed", { occupantType: "vacant" }, NGAY, "op-2");
  assert.ok(b.ok);
  const can = moHoSo(b.ngan, "h")!.can;
  // Bản trên máy = bản lõi gấp trên cùng dãy (sự kiện máy chủ + sự kiện tạm của hai thao tác).
  const mong = foldListing([...events, suKienTam(a.op), suKienTam(b.op)]);
  assert.deepEqual({ ...can, id: undefined, visibility: undefined }, { ...mong, id: undefined, visibility: undefined });
  assert.equal(can.listPrice, 3_100_000_000);
  assert.equal(can.occupantType, "vacant");
  assert.equal(b.ngan.queue.length, 2);
  assert.notEqual(b.ngan.queue[0]!.opId, b.ngan.queue[1]!.opId);
  assert.deepEqual(b.ngan.queue.map((o) => o.expectedVersion), [3, 4]);
});

test("ghi sai bị từ chối ngay, không xếp hàng", () => {
  const a = apTrenMay(goc(), "h", "price_changed", { listPrice: 3_100_000_000, feeInclusion: "excluded" }, NGAY, "op-1");
  assert.ok(a.ok);
  const truoc = structuredClone(a.ngan);
  const banTruoc = moHoSo(a.ngan, "h")!.can;
  const sai = apTrenMay(a.ngan, "h", "price_changed", { listPrice: -1, feeInclusion: "excluded", ownerPhone: "0900 000 012" }, NGAY, "op-2");
  assert.ok(!sai.ok);
  assert.equal(sai.loi.kind, "invalid-payload");
  if (sai.loi.kind === "invalid-payload") assert.ok(sai.loi.errors.some((e) => e.path === "ownerPhone"), JSON.stringify(sai.loi));
  const cam = apTrenMay(a.ngan, "h", "status_changed", { to: "Closed", closePrice: 1 }, NGAY, "op-3");
  assert.ok(!cam.ok);
  assert.deepEqual(cam.loi, { kind: "invalid-transition", reason: "Incomplete không chuyển sang Closed" });
  assert.equal(a.ngan.queue.length, 1);
  assert.deepEqual(a.ngan, truoc);
  assert.deepEqual(moHoSo(a.ngan, "h")!.can, banTruoc);
});
