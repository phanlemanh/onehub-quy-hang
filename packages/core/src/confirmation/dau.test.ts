import assert from "node:assert/strict";
import { test } from "node:test";
import { dungKhungToa } from "./dung";
import type { SuKienXacNhan } from "./khuon";
import { dauKhungToa, nguCanhMau } from "./nen-thu.fixture";

test("dấu của lõi: chỉ hàm dựng tạo được kiểu sự kiện", () => {
  // Đối tượng tự viết đủ khoá của một khung toà hợp lệ vẫn không gán được vào kiểu sự kiện — bỏ dấu là tsc báo TS2578.
  // @ts-expect-error — thiếu dấu của lõi
  const tuViet: SuKienXacNhan = {
    schemaVersion: 1,
    eventType: "building_frame",
    officeKey: "x".repeat(43),
    memberKey: "y".repeat(43),
    observedOn: "2026-11-08",
    buildingKey: "A",
    storiesTotal: 15,
    skippedFloors: [],
    stacks: ["01"],
  };
  const kq = dungKhungToa(dauKhungToa(), nguCanhMau());
  assert.ok(kq.ok);
  const tuLoi: SuKienXacNhan = kq.suKien; // đối chứng: đầu ra hàm dựng gán được
  assert.equal(tuLoi.eventType, "building_frame");
  assert.equal(tuViet.eventType, "building_frame");
});
