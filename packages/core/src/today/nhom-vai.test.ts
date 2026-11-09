import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TAP_DONG } from "../labels";
import { BO_NHOM_MAC_DINH } from "./mac-dinh";
import { MOC_VIEC_DAU_KHACH_GIO, NHOM_VAI } from "./nhom-vai";

const MONG = [
  ["lead_overdue", "Lead quá hạn", "team_lead"],
  ["lead_unrouted", "Chưa chia được", "team_lead"],
  ["lead_returned", "Lead bị trả lại", "telesales"],
  ["buyer_reaction", "Khách phản ứng", "buyer_agent"],
  ["buyer_changed", "Vừa đổi", "buyer_agent"],
  ["buyer_new_match", "Căn mới khớp", "buyer_agent"],
] as const;

describe("nhóm việc của vai khác đầu chủ", () => {
  it("đúng sáu mã, nhãn và vai", () => {
    assert.deepEqual(NHOM_VAI.map((n) => [n.code, n.label, n.vai]), MONG.map((m) => [...m]));
  });
  it("không trùng mã bộ nhóm mặc định", () => {
    const co = new Set(BO_NHOM_MAC_DINH.map((n) => n.code));
    for (const n of NHOM_VAI) assert.equal(co.has(n.code), false, `mã ${n.code} trùng bộ nhóm đầu chủ`);
  });
  it("tập đóng của sổ từ vựng có đủ sáu neo", () => {
    assert.deepEqual(Object.keys(TAP_DONG.nhomViec).sort(), MONG.map((m) => m[0]).sort());
  });
  it("mốc tự hết là 48 giờ", () => assert.equal(MOC_VIEC_DAU_KHACH_GIO, 48));
});
