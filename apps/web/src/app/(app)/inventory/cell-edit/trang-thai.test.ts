// Trình sửa Trạng thái (hàng 15) — E6. Bảng nấc viết tay theo ADR-0008, không sinh từ TRANSITIONS.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { LY_DO_DUA_LEN_DANG_BAN, type DongBangQuyen } from "@quy-hang/core/access";
import type { StandardStatus } from "@quy-hang/core/listing";
import { coDuaLenDangBan, dungLenhTrangThai, nacTrangThai, type HangSua } from "./lenh";

const BANG: Record<StandardStatus, StandardStatus[]> = {
  Incomplete: ["Active", "Hold", "Withdrawn"],
  Active: ["Pending", "Closed", "Hold", "Withdrawn"],
  Pending: ["Active", "Closed", "Withdrawn"],
  Hold: ["Active", "Withdrawn"],
  Closed: [],
  Withdrawn: [],
};

for (const [tu, nac] of Object.entries(BANG) as [StandardStatus, StandardStatus[]][]) {
  test(`nấc từ ${tu}`, () => assert.deepEqual([...nacTrangThai(tu, true)].sort(), [...nac].sort(), tu));
}

test("đối chứng đỏ: thêm nấc Đã bán → Đang bán thì ma trận bắt", () => {
  const nacSai = (tu: StandardStatus) => (tu === "Closed" ? ["Active"] : [...nacTrangThai(tu, true)]);
  const lech = (Object.keys(BANG) as StandardStatus[]).filter((tu) => JSON.stringify([...nacSai(tu)].sort()) !== JSON.stringify([...BANG[tu]].sort()));
  assert.deepEqual(lech, ["Closed"]);
});

const DU: HangSua = { id: "h", unitNumber: "B-08.02", listPrice: 4_500_000_000, feeInclusion: "excluded", standardStatus: "Active", legalStatus: "[Mẫu] Sổ hồng", occupantType: "[Mẫu] Để trống" };

test("Đã bán thiếu giá chốt → báo, không lệnh", () => {
  assert.deepEqual(dungLenhTrangThai(DU, "Closed", {}, true), { ok: false, loi: "Cần giá chốt" });
});

test("Đã bán có giá chốt + ngày → status_changed đủ", () => {
  const kq = dungLenhTrangThai(DU, "Closed", { giaChot: "4,5 tỷ", ngayBan: "2026-10-31" }, true);
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh.payload, { to: "Closed", closePrice: 4_500_000_000, closeDate: "2026-10-31" });
  assert.equal(kq.khongHoanTac, true);
});

test("Ngừng hẳn thiếu lý do → báo; có lý do → withdrawnReason", () => {
  assert.deepEqual(dungLenhTrangThai(DU, "Withdrawn", {}, true), { ok: false, loi: "Cần lý do ngừng" });
  const kq = dungLenhTrangThai(DU, "Withdrawn", { lyDo: "owner_changed_mind" }, true);
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh.payload, { to: "Withdrawn", withdrawnReason: "owner_changed_mind" });
});

test("Đang bán trên hàng thiếu pháp lý → gọi tên phần thiếu, không lệnh", () => {
  const thieu: HangSua = { ...DU, standardStatus: "Incomplete", legalStatus: null, occupantType: null };
  assert.deepEqual(dungLenhTrangThai(thieu, "Active", {}, true), { ok: false, loi: "Chưa lên Đang bán được: thiếu pháp lý, tình trạng sử dụng" });
});

test("Tạm ngừng → status_changed Hold, hoàn tác được", () => {
  const kq = dungLenhTrangThai(DU, "Hold", {}, true);
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh, { type: "status_changed", payload: { to: "Hold" } });
  assert.equal(kq.khongHoanTac, false);
});

// ---- Bảng quyền của hàng (bang-quyen-theo-vai, AC-6): nấc Đang bán theo cờ «Sẵn sàng bán» của lõi ----

const BANG_QUYEN: DongBangQuyen[] = JSON.parse(
  readFileSync(new URL("../../../../../../../packages/core/src/access/bang-quyen-hang.json", import.meta.url), "utf8"),
);

test("ô Trạng thái: không có nấc Đang bán khi không đủ cờ", () => {
  for (const tu of ["Hold", "Incomplete"] as const) {
    assert.ok(!nacTrangThai(tu, false).includes("Active"), `${tu}: còn nấc Đang bán khi không đủ cờ`);
    assert.deepEqual([...nacTrangThai(tu, true)].sort(), [...BANG[tu]].sort(), `${tu}: người đủ cờ thấy như bảng chuyển`);
  }
  const hold: HangSua = { ...DU, standardStatus: "Hold" };
  assert.deepEqual(dungLenhTrangThai(hold, "Active", {}, false), { ok: false, loi: LY_DO_DUA_LEN_DANG_BAN });
  assert.equal(LY_DO_DUA_LEN_DANG_BAN, "Chỉ đầu chủ giữ căn hay trưởng nhóm đưa lên Đang bán");
  const du = dungLenhTrangThai(hold, "Active", {}, true);
  assert.ok(du.ok && "lenh" in du && du.lenh.type === "status_changed", "người đủ cờ dựng được lệnh đổi trạng thái");
  assert.equal(du.lenh.payload.to, "Active");
});

test("ô Trạng thái: cờ lấy từ lõi", () => {
  const NGUOI = "u-me";
  let so = 0;
  for (const o of BANG_QUYEN) {
    const giu = o.giu === "minh" ? NGUOI : o.giu === "chua" ? null : "u-khac";
    assert.equal(coDuaLenDangBan({ userId: NGUOI, roles: o.vai }, giu), o.dua_len_dang_ban, `«${o.o}»`);
    so++;
  }
  assert.equal(so, 14);
});
