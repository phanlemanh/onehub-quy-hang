// Sửa hàng loạt (hàng 16) — E1, E2, E4, E9b. Bảng viết tay trước mã; mỗi bảng một đối chứng đỏ.
import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePayload, type StandardStatus } from "@quy-hang/core/listing";
import type { HangSua } from "../cell-edit/lenh";
import { CAN_DA_DONG, CHON_LY_DO, DA_O_NAC, demLocAn, gomKetQua, hangCuaLo, LENH_DA_GOI, nacMenu, xetDaGoi, xetDoiTrangThai, type XetLo } from "./lo";

const DU = { listPrice: 4_500_000_000, feeInclusion: "excluded", legalStatus: "[Mẫu] Sổ hồng", occupantType: "[Mẫu] Để trống" };
const can = (id: string, s: StandardStatus, them: Partial<HangSua> = {}): HangSua => ({ id, unitNumber: `B-${id}`, standardStatus: s, ...DU, ...them });

// [hiện tại, đích, ngăn] — «doi» đổi được; chữ là lý do không đổi được. Viết tay theo bảng chuyển ADR-0008.
const TU_C = "không chuyển được từ";
const MA_TRAN: [StandardStatus, StandardStatus, string][] = [
  ["Incomplete", "Incomplete", DA_O_NAC], ["Incomplete", "Active", "doi"], ["Incomplete", "Pending", `${TU_C} Chưa đủ để rao`], ["Incomplete", "Hold", "doi"], ["Incomplete", "Withdrawn", "doi"],
  ["Active", "Incomplete", `${TU_C} Đang bán`], ["Active", "Active", DA_O_NAC], ["Active", "Pending", "doi"], ["Active", "Hold", "doi"], ["Active", "Withdrawn", "doi"],
  ["Pending", "Incomplete", `${TU_C} Đang giao dịch`], ["Pending", "Active", "doi"], ["Pending", "Pending", DA_O_NAC], ["Pending", "Hold", `${TU_C} Đang giao dịch`], ["Pending", "Withdrawn", "doi"],
  ["Closed", "Incomplete", `${TU_C} Đã bán`], ["Closed", "Active", `${TU_C} Đã bán`], ["Closed", "Pending", `${TU_C} Đã bán`], ["Closed", "Hold", `${TU_C} Đã bán`], ["Closed", "Withdrawn", `${TU_C} Đã bán`],
  ["Hold", "Incomplete", `${TU_C} Tạm ngừng`], ["Hold", "Active", "doi"], ["Hold", "Pending", `${TU_C} Tạm ngừng`], ["Hold", "Hold", DA_O_NAC], ["Hold", "Withdrawn", "doi"],
  ["Withdrawn", "Incomplete", `${TU_C} Ngừng hẳn`], ["Withdrawn", "Active", `${TU_C} Ngừng hẳn`], ["Withdrawn", "Pending", `${TU_C} Ngừng hẳn`], ["Withdrawn", "Hold", `${TU_C} Ngừng hẳn`], ["Withdrawn", "Withdrawn", DA_O_NAC],
];

const ngan = (kq: XetLo) => (kq.doiDuoc.length ? "doi" : kq.khongDoi[0]!.lyDo);

for (const [tu, sang, mong] of MA_TRAN) {
  test(`E1 ${tu} → ${sang}: ${mong}`, () => {
    assert.equal(ngan(xetDoiTrangThai([can("1", tu)], sang, { lyDo: "unreachable" })), mong, `ô ${tu}→${sang}`);
  });
}

test("E1 thiếu mục thì không lên Đang bán, kể đủ mục thiếu", () => {
  const kq = xetDoiTrangThai([can("1", "Incomplete", { listPrice: null, feeInclusion: null })], "Active");
  assert.deepEqual(kq.khongDoi, [{ id: "1", maCan: "B-1", lyDo: "thiếu giá, điều kiện phí" }]);
});

test("E1 lô trộn ra đúng hai danh sách theo thứ tự đầu vào", () => {
  const kq = xetDoiTrangThai([can("1", "Active"), can("2", "Closed"), can("3", "Hold"), can("4", "Hold")], "Hold");
  assert.deepEqual(kq.doiDuoc.map((h) => h.id), ["1"]);
  assert.deepEqual(kq.khongDoi.map((k) => [k.id, k.lyDo]), [["2", `${TU_C} Đã bán`], ["3", DA_O_NAC], ["4", DA_O_NAC]]);
});

test("E1 Ngừng hẳn chưa chọn lý do: không căn nào đổi được", () => {
  const kq = xetDoiTrangThai([can("1", "Active"), can("2", "Hold")], "Withdrawn");
  assert.deepEqual(kq.doiDuoc, []);
  assert.deepEqual(kq.khongDoi.map((k) => k.lyDo), [CHON_LY_DO, CHON_LY_DO]);
});

test("E1 menu chỉ có nấc ít nhất một căn đổi được, không bao giờ Đã bán", () => {
  assert.deepEqual(nacMenu([can("1", "Active"), can("2", "Pending")]), ["Active", "Pending", "Hold", "Withdrawn"]);
  assert.deepEqual(nacMenu([can("1", "Closed"), can("2", "Withdrawn")]), []);
  for (const s of ["Incomplete", "Active", "Pending", "Closed", "Hold", "Withdrawn"] as StandardStatus[]) assert.ok(!nacMenu([can("1", s)]).includes("Closed"), s);
});

test("E1 đối chứng đỏ: hàm xét bỏ bảng chuyển thì ô Closed→Active và Withdrawn→Hold bị gọi tên", () => {
  const xetSai = (tu: StandardStatus, sang: StandardStatus) => (tu === sang ? DA_O_NAC : "doi");
  const lech = MA_TRAN.filter(([t, s, m]) => xetSai(t, s) !== m).map(([t, s]) => `${t}→${s}`);
  assert.ok(lech.includes("Closed→Active") && lech.includes("Withdrawn→Hold"), `ô lệch: ${lech.join(", ")}`);
});

// E2 — đánh dấu đã gọi: [trạng thái, ngăn].
const DA_GOI: [StandardStatus, string][] = [["Incomplete", "doi"], ["Active", "doi"], ["Pending", "doi"], ["Hold", "doi"], ["Closed", CAN_DA_DONG], ["Withdrawn", CAN_DA_DONG]];
for (const [s, mong] of DA_GOI) {
  test(`E2 đã gọi trên căn ${s}: ${mong}`, () => assert.equal(ngan(xetDaGoi([can("1", s)])), mong, `ô ${s}`));
}

test("E2 lệnh đã gọi là «Còn / giữ giá» của lõi, qua khuôn chặt", () => {
  assert.deepEqual(LENH_DA_GOI, { type: "owner_confirmed", payload: {} });
  assert.deepEqual(validatePayload(LENH_DA_GOI.type, LENH_DA_GOI.payload), []);
});

test("E2 đối chứng đỏ: không loại căn đóng thì ô Closed bị gọi tên", () => {
  const lech = DA_GOI.filter(([, m]) => m !== "doi").map(([s]) => s);
  assert.deepEqual(lech, ["Closed", "Withdrawn"], "hàm giả nhận mọi căn phải lệch đúng hai ô nấc cuối");
});

// E4 — căn tích bị lọc ẩn.
const AN: [string, string[], string[], number][] = [
  ["tích 4, hiện cả 4", ["a", "b", "c", "d"], ["a", "b", "c", "d"], 0],
  ["tích 4, hiện 2", ["a", "b", "c", "d"], ["a", "b"], 2],
  ["tích 0", [], ["a"], 0],
  ["tích 3, hiện 5 căn khác", ["a", "b", "c"], ["v", "w", "x", "y", "z"], 3],
];
for (const [ten, tich, hien, mong] of AN) test(`E4 ${ten}`, () => assert.equal(demLocAn(tich, hien), mong, ten));

test("E4 lô gồm mọi căn tích kể cả căn không hiện", () => {
  const moi = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
  assert.deepEqual(hangCuaLo(new Set(["a", "b", "c", "d"]), moi).map((h) => h.id), ["a", "b", "c", "d"]);
});

test("E4 đối chứng đỏ: lấy giao với căn đang hiện thì ca «tích 4, hiện 2» bị gọi tên", () => {
  const loSai = (tich: string[], hien: string[]) => tich.filter((id) => hien.includes(id));
  assert.notEqual(loSai(["a", "b", "c", "d"], ["a", "b"]).length, 4, "ca tích 4, hiện 2: bản sai chỉ trả căn đang hiện");
  assert.equal(hangCuaLo(new Set(["a", "b", "c", "d"]), ["a", "b", "c", "d"].map((id) => ({ id }))).length, 4);
});

// E9b — gom kết quả ghi.
test("E9b đủ 3 căn ghi được", () => {
  assert.deepEqual(gomKetQua("trang-thai", [{ id: "1", ok: true }, { id: "2", ok: true }, { id: "3", ok: true }], []), { thongBao: "Đã đổi trạng thái 3 căn", boTich: ["1", "2", "3"], conTich: [] });
});

test("E9b căn 2 bị kho trên máy từ chối: còn tích, thông báo đếm thật", () => {
  const kq = gomKetQua("trang-thai", [{ id: "1", ok: true }, { id: "2", ok: false }, { id: "3", ok: true }], [{ id: "4", maCan: "B-4", lyDo: DA_O_NAC }]);
  assert.deepEqual(kq, { thongBao: "Đã đổi trạng thái 2 căn · 1 căn chưa ghi được", boTich: ["1", "3"], conTich: ["2", "4"] });
});

test("E9b đánh dấu đã gọi cùng cách đếm", () => {
  assert.equal(gomKetQua("da-goi", [{ id: "1", ok: true }, { id: "2", ok: false }], []).thongBao, "Đã đánh dấu đã gọi 1 căn · 1 căn chưa ghi được");
});

test("E9b đối chứng đỏ: đếm theo số căn định ghi thì ca có căn bị từ chối bị gọi tên", () => {
  const ghi = [{ id: "1", ok: true }, { id: "2", ok: false }, { id: "3", ok: true }];
  const chuSai = `Đã đổi trạng thái ${ghi.length} căn`;
  assert.notEqual(chuSai, gomKetQua("trang-thai", ghi, []).thongBao, "ca căn 2 bị từ chối");
});
