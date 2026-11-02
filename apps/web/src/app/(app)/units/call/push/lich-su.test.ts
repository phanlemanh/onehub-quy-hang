// Lịch sử trả giá (hàng 29, E2). Dãy sự kiện viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ListingEvent } from "@quy-hang/core/listing";
import { lichSuTraGia, type LichSuTraGia } from "./lich-su";

let s = 0;
const su = (type: ListingEvent["type"], payload: Record<string, unknown>, xacNhan = false): ListingEvent => ({
  seq: ++s, type, payload, actorUserId: "u", actorRoles: ["listing_agent"], confirmedWithOwner: xacNhan, occurredAt: `2026-10-${String(10 + s).padStart(2, "0")}T03:00:00.000Z`,
});
const DAY = [
  su("created", { buildingName: "Toà A", unitNumber: "A-15.08" }),
  su("details_changed", { furnished: "Đủ đồ" }),
  su("price_changed", { listPrice: 2_950_000_000, feeInclusion: "excluded" }, true),
  su("status_changed", { to: "Active" }, true),
  su("price_changed", { listPrice: 2_900_000_000, feeInclusion: "excluded" }, true),
  su("owner_confirmed", {}, true),
  su("price_changed", { listPrice: 2_900_000_000, feeInclusion: "included" }, true),
  su("price_changed", { listPrice: 3_100_000_000, feeInclusion: "included" }, true),
  su("status_changed", { to: "Pending" }, true),
];
const MONG = ["Đã cọc", "Tăng 2,9 tỷ → 3,1 tỷ", "Đổi điều kiện phí: không bao phí → bao phí", "Còn · giữ giá", "Hạ 2,95 tỷ → 2,9 tỷ", "Lên bảng 2,95 tỷ", "Tạo hồ sơ"];

type Fn = (ls: readonly ListingEvent[] | null) => LichSuTraGia;
const viec = (f: Fn) => {
  const k = f(DAY);
  return k.kind === "co" ? k.dong.map((d) => d.viec) : [];
};

test("lịch sử trả giá: ma trận sự kiện", () => {
  assert.equal(DAY.length, 9);
  const k = lichSuTraGia(DAY);
  assert.equal(k.kind, "co");
  if (k.kind !== "co") return;
  assert.equal(k.dong.length, 7);
  assert.deepEqual(viec(lichSuTraGia), MONG);
  assert.equal(k.dong.find((d) => d.viec.startsWith("Hạ"))!.xacNhan, true);
  assert.equal(k.dong.at(-1)!.xacNhan, false);
  assert.equal(k.dong[0]!.luc, DAY[8]!.occurredAt);
  const ket = lichSuTraGia([
    ...DAY.slice(0, 4),
    su("status_changed", { to: "Closed", closePrice: 2_750_000_000, closeDate: "2026-11-02" }, true),
  ]);
  assert.equal(ket.kind === "co" && ket.dong[0]!.viec, "Đã bán 2,75 tỷ");
  const ngung = lichSuTraGia([...DAY.slice(0, 4), su("status_changed", { to: "Withdrawn", withdrawnReason: "sold_elsewhere" }, true)]);
  assert.equal(ngung.kind === "co" && ngung.dong[0]!.viec, "Ngừng hẳn — chủ bán nơi khác");
  assert.deepEqual(lichSuTraGia(null), { kind: "dang-tai" });
});

test("lịch sử trả giá: đối chứng đỏ — so với giá đầu dãy bị gọi tên", () => {
  // Bộ đọc hỏng: mọi lần đổi giá so với giá đầu tiên 2,95 tỷ.
  const soVoiDau: Fn = (ls) => {
    const k = lichSuTraGia(ls);
    if (k.kind !== "co") return k;
    return { kind: "co", dong: k.dong.map((d) => (d.viec.startsWith("Tăng 2,9 tỷ") ? { ...d, viec: "Tăng 2,95 tỷ → 3,1 tỷ" } : d)) };
  };
  assert.notDeepEqual(viec(soVoiDau), MONG);
  assert.ok(!viec(soVoiDau).includes("Tăng 2,9 tỷ → 3,1 tỷ"));
});
