// Trình sửa Trạng thái (hàng 15) — E6. Bảng nấc viết tay theo ADR-0008, không sinh từ TRANSITIONS.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { StandardStatus } from "@quy-hang/core/listing";
import { dungLenhTrangThai, nacTrangThai, type HangSua } from "./lenh";

const BANG: Record<StandardStatus, StandardStatus[]> = {
  Incomplete: ["Active", "Hold", "Withdrawn"],
  Active: ["Pending", "Closed", "Hold", "Withdrawn"],
  Pending: ["Active", "Closed", "Withdrawn"],
  Hold: ["Active", "Withdrawn"],
  Closed: [],
  Withdrawn: [],
};

for (const [tu, nac] of Object.entries(BANG) as [StandardStatus, StandardStatus[]][]) {
  test(`nấc từ ${tu}`, () => assert.deepEqual([...nacTrangThai(tu)].sort(), [...nac].sort(), tu));
}

test("đối chứng đỏ: thêm nấc Đã bán → Đang bán thì ma trận bắt", () => {
  const nacSai = (tu: StandardStatus) => (tu === "Closed" ? ["Active"] : [...nacTrangThai(tu)]);
  const lech = (Object.keys(BANG) as StandardStatus[]).filter((tu) => JSON.stringify([...nacSai(tu)].sort()) !== JSON.stringify([...BANG[tu]].sort()));
  assert.deepEqual(lech, ["Closed"]);
});

const DU: HangSua = { id: "h", unitNumber: "B-08.02", listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: "Active", legalStatus: "[Mẫu] Sổ hồng", occupantType: "[Mẫu] Để trống" };

test("Đã bán thiếu giá chốt → báo, không lệnh", () => {
  assert.deepEqual(dungLenhTrangThai(DU, "Closed"), { ok: false, loi: "Cần giá chốt" });
});

test("Đã bán có giá chốt + ngày → status_changed đủ", () => {
  const kq = dungLenhTrangThai(DU, "Closed", { giaChot: "4,5 tỷ", ngayBan: "2026-10-31" });
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh.payload, { to: "Closed", closePrice: 4_500_000_000, closeDate: "2026-10-31" });
  assert.equal(kq.khongHoanTac, true);
});

test("Ngừng hẳn thiếu lý do → báo; có lý do → withdrawnReason", () => {
  assert.deepEqual(dungLenhTrangThai(DU, "Withdrawn"), { ok: false, loi: "Cần lý do ngừng" });
  const kq = dungLenhTrangThai(DU, "Withdrawn", { lyDo: "owner_changed_mind" });
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh.payload, { to: "Withdrawn", withdrawnReason: "owner_changed_mind" });
});

test("Đang bán trên hàng thiếu pháp lý → gọi tên phần thiếu, không lệnh", () => {
  const thieu: HangSua = { ...DU, standardStatus: "Incomplete", legalStatus: null, occupantType: null };
  assert.deepEqual(dungLenhTrangThai(thieu, "Active"), { ok: false, loi: "Chưa lên Đang bán được: thiếu pháp lý, tình trạng sử dụng" });
});

test("Tạm ngừng → status_changed Hold, hoàn tác được", () => {
  const kq = dungLenhTrangThai(DU, "Hold");
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh, { type: "status_changed", payload: { to: "Hold" } });
  assert.equal(kq.khongHoanTac, false);
});
