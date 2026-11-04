// Hàng cũ theo người (hồ sơ hom-nay-truong-nhom, E4). Bảng viết trước, kỳ vọng viết tay.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { giaiCauHinh } from "../config/giai";
import { hangCuTheoNguoi, tongCanGoiLai, type CanHangCu } from "./index";

const HOM_NAY = "2026-11-04";
const N13 = "2026-10-22T03:00:00Z"; // 13 ngày trước
const N14 = "2026-10-21T03:00:00Z"; // 14 ngày trước
const N20 = "2026-10-15T03:00:00Z"; // 20 ngày trước

/** Tám căn của ba người giữ và một căn chưa có người giữ. */
const BANG: CanHangCu[] = [
  { listAgentKey: "u-a", standardStatus: "Active", lastConfirmedAt: N13 },
  { listAgentKey: "u-a", standardStatus: "Active", lastConfirmedAt: N14 },
  { listAgentKey: "u-a", standardStatus: "Pending", lastConfirmedAt: N20 },
  { listAgentKey: "u-a", standardStatus: "Closed", lastConfirmedAt: N20 },
  { listAgentKey: "u-b", standardStatus: "Active", lastConfirmedAt: null },
  { listAgentKey: "u-b", standardStatus: "Withdrawn", lastConfirmedAt: N14 },
  { listAgentKey: "u-b", standardStatus: "Active", lastConfirmedAt: N13 },
  { listAgentKey: "u-c", standardStatus: "Pending", lastConfirmedAt: N14 },
  { listAgentKey: null, standardStatus: "Active", lastConfirmedAt: N20 },
];

describe("hàng cũ theo người", () => {
  it("hàng cũ theo người: đếm theo sổ", () => {
    const cau20 = giaiCauHinh([{ key: "queue.call_back_after_days", value: 20 }]);
    assert.deepEqual(cau20.loi, []);

    const macDinh = hangCuTheoNguoi(BANG, HOM_NAY);
    assert.deepEqual(macDinh, [
      { userId: "u-a", mo: 3, canGoiLai: 2, tiLeTuoi: 1 / 3 },
      { userId: "u-b", mo: 2, canGoiLai: 1, tiLeTuoi: 1 / 2 },
      { userId: "u-c", mo: 1, canGoiLai: 1, tiLeTuoi: 0 },
      { userId: null, mo: 1, canGoiLai: 1, tiLeTuoi: 0 },
    ]);
    const ngay20 = hangCuTheoNguoi(BANG, HOM_NAY, cau20.cauHinh);
    assert.deepEqual(ngay20, [
      { userId: "u-a", mo: 3, canGoiLai: 1, tiLeTuoi: 2 / 3 },
      { userId: "u-b", mo: 2, canGoiLai: 1, tiLeTuoi: 1 / 2 },
      { userId: "u-c", mo: 1, canGoiLai: 0, tiLeTuoi: 1 },
      { userId: null, mo: 1, canGoiLai: 1, tiLeTuoi: 0 },
    ]);

    // số dòng = số người giữ + 1 (dòng «Chưa có người giữ»)
    assert.equal(macDinh.length, 3 + 1);
    assert.equal(macDinh.at(-1)?.userId, null);
    // căn Closed/Withdrawn không đếm: 9 căn, 2 đã đóng
    assert.equal(macDinh.reduce((t, d) => t + d.mo, 0), 7);

    // chiều đỏ: cấu hình 20 làm căn 14 ngày rời canGoiLai
    const c = macDinh.find((d) => d.userId === "u-c")!;
    const c20 = ngay20.find((d) => d.userId === "u-c")!;
    assert.equal(c.canGoiLai, 1);
    assert.equal(c20.canGoiLai, 0);

    // ô «Hàng cũ»
    assert.equal(tongCanGoiLai(macDinh), 5);
    assert.equal(tongCanGoiLai(ngay20), 3);
    assert.equal(tongCanGoiLai([]), 0);
  });
});
