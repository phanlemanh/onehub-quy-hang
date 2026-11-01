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

// Hàng 15 (AC-9): trình sửa trên ô mở ở phiên bản người đã thấy; kho kéo bản mới trong lúc gõ thì lần sửa vẫn mang
// phiên bản cũ để máy chủ trả xung đột (vào «Cần xem»), không ghi đè lặng.
test("cơ sở người đã thấy: cũ hơn bản trên máy thì lần sửa mang phiên bản cũ; vắng hay không cũ hơn thì như trước", () => {
  const gia = { listPrice: 3_200_000_000, feeInclusion: "excluded" };
  const cu = apTrenMay(goc(), "h", "price_changed", gia, NGAY, "op-1", 2);
  assert.ok(cu.ok);
  assert.equal(cu.op.expectedVersion, 2, "cơ sở 2 < bản trên máy 3 → lần sửa mang 2");
  // Đối chứng: không có cơ sở, hay cơ sở bằng bản trên máy, giữ hành vi cũ (bản trên máy).
  for (const coSo of [undefined, 3, 9]) {
    const kq = apTrenMay(goc(), "h", "price_changed", gia, NGAY, "op-2", coSo);
    assert.ok(kq.ok);
    assert.equal(kq.op.expectedVersion, 3, `cơ sở ${coSo} → mang bản trên máy 3`);
  }
});
