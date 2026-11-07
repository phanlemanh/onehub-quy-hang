import assert from "node:assert/strict";
import { test } from "node:test";
import { confirmsWithOwner, validatePayload, type EventType, type ListingEvent } from "./events";
import { foldListing } from "./fold";
import { kiemGanMaCan, kiemMaCan, LY_DO_MA_CAN_KHONG_CHU_SO, MA_CAN_DA_CO } from "./gan-ma-can";
import { missingFor } from "./status";

function day(buoc: [EventType, Record<string, unknown>][]): ListingEvent[] {
  return buoc.map(([type, payload], i) => ({
    seq: i + 1,
    type,
    payload,
    actorUserId: "u-1",
    actorRoles: ["listing_agent"],
    confirmedWithOwner: confirmsWithOwner(type),
    occurredAt: `2026-11-0${i + 1}T09:00:00.000Z`,
  }));
}
const CHUA_MA: [EventType, Record<string, unknown>] = ["created", { buildingName: "[Toà mẫu]" }];
const CO_MA: [EventType, Record<string, unknown>] = ["created", { buildingName: "[Toà mẫu]", unitNumber: "A-12.01" }];
const GAN: [EventType, Record<string, unknown>] = ["unit_number_assigned", { unitNumber: "A-12.05" }];

test("gắn mã căn: khuôn và gấp", () => {
  // Ma trận viết trước: [tên ca, payload, đường khoá của lỗi duy nhất — null là hợp lệ]
  const CA: [string, Record<string, unknown>, string | null][] = [
    ["hợp lệ", { unitNumber: "A-12.05" }, null],
    ["thiếu unitNumber", {}, "unitNumber"],
    ["chuỗi rỗng", { unitNumber: "  " }, "unitNumber"],
    ["201 ký tự", { unitNumber: "A".repeat(201) }, "unitNumber"],
    ["khoá lạ x", { unitNumber: "A-12.05", x: 1 }, "x"],
    ["khoá chủ nhà ownerPhone", { unitNumber: "A-12.05", ownerPhone: "0900 000 001" }, "ownerPhone"],
  ];
  assert.equal(CA.length, 6);
  for (const [ten, payload, duong] of CA) {
    const loi = validatePayload("unit_number_assigned", payload);
    assert.deepEqual(
      loi.map((l) => l.path),
      duong ? [duong] : [],
      `${ten}: ${JSON.stringify(loi)}`,
    );
  }
  assert.equal(validatePayload("unit_number_assigned", { unitNumber: "A-12.05", ownerPhone: "0900 000 001" })[0]!.reason, "thông tin chủ nhà không vào hàng");

  // Gấp: hàng chưa mã mang mã mới; sự kiện không tính là xác nhận với chủ nhà.
  const sau = foldListing(day([CHUA_MA, GAN]));
  assert.equal(sau.unitNumber, "A-12.05");
  assert.equal(sau.lastConfirmedAt, null);
  assert.equal(sau.version, 2);

  // Lõi từ chối hàng đã có mã; đối chứng cùng fixture: hàng chưa mã nhận.
  assert.equal(kiemGanMaCan(foldListing(day([CO_MA]))), MA_CAN_DA_CO);
  assert.equal(kiemGanMaCan(foldListing(day([CHUA_MA]))), null);
  // Hàng vừa gắn mã cũng thôi nhận lần gắn thứ hai.
  assert.equal(kiemGanMaCan(sau), MA_CAN_DA_CO);
});

test("mã căn phải có chữ hay số", () => {
  // Ma trận viết trước: mã → hợp lệ? Tập ký tự theo app.unit_key (0-9A-Za-z) — chữ có dấu và «_» một mình không tính.
  const MA: [string, boolean][] = [
    ["A-12.05", true],
    ["a 02.06", true],
    ["12", true],
    ["---", false],
    [".", false],
    ["/ /", false],
    ["Đ", false],
    ["_", false],
    ["__", false],
    ["Đ-Ê", false],
  ];
  let so = 0;
  for (const khuon of [
    (ma: string) => validatePayload("created", { buildingName: "[Toà mẫu]", unitNumber: ma }),
    (ma: string) => validatePayload("unit_number_assigned", { unitNumber: ma }),
  ]) {
    for (const [ma, hopLe] of MA) {
      const loi = khuon(ma);
      assert.deepEqual(loi, hopLe ? [] : [{ path: "unitNumber", reason: LY_DO_MA_CAN_KHONG_CHU_SO }], `${ma}: ${JSON.stringify(loi)}`);
      so++;
    }
  }
  assert.equal(so, 2 * 10);
  for (const [ma, hopLe] of MA) assert.equal(kiemMaCan(ma), hopLe ? null : LY_DO_MA_CAN_KHONG_CHU_SO, ma);
  assert.equal(LY_DO_MA_CAN_KHONG_CHU_SO, "Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)");
});

test("sẵn sàng bán sau khi gắn mã", () => {
  const ctx = { listPrice: 3_200_000_000, feeInclusion: "included", legalStatus: "Sổ hồng", occupantType: "Đang trống", realPhotoCount: 0, minRealPhotos: 1 };
  const truoc = missingFor("Active", { ...ctx, unitNumber: foldListing(day([CHUA_MA])).unitNumber });
  assert.ok(truoc.includes("unitNumber"));
  assert.ok(!truoc.includes("realPhoto"));
  const sau = missingFor("Active", { ...ctx, unitNumber: foldListing(day([CHUA_MA, GAN])).unitNumber });
  assert.ok(!sau.includes("unitNumber"));
  assert.ok(sau.includes("realPhoto"));
});
