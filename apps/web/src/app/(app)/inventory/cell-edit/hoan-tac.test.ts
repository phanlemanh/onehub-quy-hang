// Hoàn tác (hàng 15) — E8. Ma trận viết tay: hoàn tác được ⟺ chiều ngược có trong bảng ADR-0008.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { StandardStatus } from "@quy-hang/core/listing";
import { hoanTacDuoc, lenhHoanTac, type Truoc } from "./hoan-tac";
import { dungLenhTrangThai, type HangSua, type Lenh } from "./lenh";

test("hoàn tác đổi giá → một lệnh về đúng giá và phí cũ", () => {
  const truoc: Truoc = { listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: "Active" };
  const sua: Lenh = { type: "price_changed", payload: { listPrice: 5_000_000_000, feeInclusion: "included" } };
  assert.deepEqual(lenhHoanTac(truoc, sua), { type: "price_changed", payload: { listPrice: 4_500_000_000, feeInclusion: "excluded" } });
});

test("lần đặt giá đầu không hoàn tác được", () => {
  const truoc: Truoc = { listPrice: null, feeInclusion: null, standardStatus: "Incomplete" };
  assert.equal(lenhHoanTac(truoc, { type: "price_changed", payload: { listPrice: 3_000_000_000, feeInclusion: "included" } }), null);
});

// [từ, sang, hoàn tác được] — mọi chuyển của bảng ADR-0008, viết tay.
const CHUYEN: [StandardStatus, StandardStatus, boolean][] = [
  ["Incomplete", "Active", false],
  ["Incomplete", "Hold", false],
  ["Incomplete", "Withdrawn", false],
  ["Active", "Pending", true],
  ["Active", "Closed", false],
  ["Active", "Hold", true],
  ["Active", "Withdrawn", false],
  ["Pending", "Active", true],
  ["Pending", "Closed", false],
  ["Pending", "Withdrawn", false],
  ["Hold", "Active", true],
  ["Hold", "Withdrawn", false],
];

for (const [tu, sang, duoc] of CHUYEN) {
  test(`hoàn tác ${tu} → ${sang}: ${duoc ? "được" : "không"}`, () => {
    const truoc: Truoc = { listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: tu };
    const lenh: Lenh = { type: "status_changed", payload: { to: sang } };
    assert.equal(hoanTacDuoc(truoc, lenh), duoc);
    assert.deepEqual(lenhHoanTac(truoc, lenh), duoc ? { type: "status_changed", payload: { to: tu } } : null);
  });
}

test("trình sửa báo «Không hoàn tác được» bằng cùng hàm", () => {
  const hang: HangSua = { id: "h", unitNumber: "x", listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: "Active", legalStatus: "a", occupantType: "b" };
  for (const [tu, sang, duoc] of CHUYEN.filter(([t]) => t === "Active")) {
    const kq = dungLenhTrangThai({ ...hang, standardStatus: tu }, sang, { giaChot: "4 tỷ", lyDo: "unreachable" });
    assert.ok(kq.ok, `${tu}→${sang}`);
    assert.equal(kq.khongHoanTac, !duoc, `${tu}→${sang}`);
  }
});

test("đối chứng đỏ: coi Đã bán → Đang bán là hoàn tác được thì ma trận bắt", () => {
  const duocSai = (tu: StandardStatus, sang: StandardStatus) => (sang === "Closed" ? true : hoanTacDuoc({ listPrice: 1, feeInclusion: "excluded", standardStatus: tu }, { type: "status_changed", payload: { to: sang } }));
  const lech = CHUYEN.filter(([t, s, d]) => duocSai(t, s) !== d).map(([t, s]) => `${t}→${s}`);
  assert.deepEqual(lech, ["Active→Closed", "Pending→Closed"]);
});
