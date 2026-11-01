// Dựng lệnh từ trình sửa trên ô (hàng 15) — E2b, E3, E4. Lệnh nào cũng phải qua khuôn chặt của lõi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePayload } from "@quy-hang/core/listing";
import { CHON_PHI, chuaHieu, dungLenhGia, dungLenhPhi, dungLenhTrangThai, hieuLaGia, type HangSua, type KetQuaLenh } from "./lenh";

const HANG: HangSua = {
  id: "h1",
  unitNumber: "A-01.03",
  listPrice: 4_500_000_000,
  feeInclusion: "excluded",
  standardStatus: "Active",
  legalStatus: "[Mẫu] Sổ hồng",
  occupantType: "[Mẫu] Để trống",
};
const CHUA_GIA: HangSua = { ...HANG, id: "h2", listPrice: null, feeInclusion: null, standardStatus: "Incomplete" };

const lenhCua = (kq: KetQuaLenh) => (kq.ok ? [kq.lenh] : []);

test("E2b: trình sửa Giá dựng đúng một lệnh đổi giá đủ hai khoá, qua khuôn lõi", () => {
  const kq = dungLenhGia(HANG, "4,8 tỷ", "excluded");
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh, { type: "price_changed", payload: { listPrice: 4_800_000_000, feeInclusion: "excluded" } });
  assert.deepEqual(Object.keys(kq.lenh.payload).sort(), ["feeInclusion", "listPrice"]);
  assert.deepEqual(validatePayload(kq.lenh.type, kq.lenh.payload), []);
  assert.equal(kq.hieuLa, "Hiểu là: 4,8 tỷ, chưa bao phí");
  assert.equal(hieuLaGia("4,8 tỷ", "included"), "Hiểu là: 4,8 tỷ, đã bao phí");
});

test("E2b đối chứng đỏ: lệnh thiếu điều kiện phí bị khuôn lõi gọi tên", () => {
  const loi = validatePayload("price_changed", { listPrice: 4_800_000_000 });
  assert.deepEqual(loi, [{ path: "feeInclusion", reason: "thiếu" }]);
});

// Cùng bảng «chưa hiểu» của E1 (pricing/doc-gia.test.ts).
const CHUA_HIEU = ["", "abc", "12", "950", "4,65", "4,65 tỷ 3 triệu 2", "-5 tỷ", "1001 tỷ", "4,65 đô", "tỷ"];

for (const chu of CHUA_HIEU) {
  test(`E3: chưa hiểu «${chu}» → báo, không lệnh`, () => {
    const kq = dungLenhGia(HANG, chu, "excluded");
    assert.deepEqual(kq, { ok: false, loi: chuaHieu(chu) });
    assert.deepEqual(lenhCua(kq), []);
  });
}

test("E3 đối chứng đỏ: dựng lệnh bỏ kiểm bộ đọc thì «abc» sinh lệnh", () => {
  const dungSai = (chu: string) => ({ ok: true as const, lenh: { type: "price_changed", payload: { listPrice: Number(chu) || 0, feeInclusion: "excluded" } } });
  assert.equal([dungSai("abc")].length, 1, "bản sai sinh một lệnh cho «abc»");
  assert.notDeepEqual(lenhCua(dungLenhGia(HANG, "abc", "excluded")), [dungSai("abc").lenh]);
});

test("E4a: sửa Phí trên hàng có giá → giá cũ + phí mới", () => {
  const kq = dungLenhPhi(HANG, "included");
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh, { type: "price_changed", payload: { listPrice: 4_500_000_000, feeInclusion: "included" } });
  assert.equal(kq.hoiLai?.hoi, true, "đổi phí luôn hỏi lại");
});

test("E4b: sửa Phí trên hàng chưa có giá → mở trình sửa Giá, không lệnh", () => {
  assert.deepEqual(dungLenhPhi(CHUA_GIA, "included"), { ok: false, moTrinhSuaGia: true });
});

test("E4c: hàng chưa có giá, chưa chọn phí → báo chọn phí, không lệnh", () => {
  assert.deepEqual(dungLenhGia(CHUA_GIA, "3 tỷ", null), { ok: false, loi: CHON_PHI });
  const kq = dungLenhGia(CHUA_GIA, "3 tỷ", "included");
  assert.ok(kq.ok && kq.khongHoanTac, "lần đặt giá đầu không hoàn tác được");
  assert.equal(kq.ok && kq.hoiLai?.hoi, false);
});

test("E4d: mọi đường dựng lệnh đổi giá đều đủ hai khoá", () => {
  const tat: KetQuaLenh[] = [
    dungLenhGia(HANG, "4,8 tỷ", "excluded"),
    dungLenhGia(HANG, "9 tỷ", "included"),
    dungLenhGia(CHUA_GIA, "3 tỷ", "excluded"),
    dungLenhPhi(HANG, "included"),
    dungLenhPhi(HANG, "excluded"),
  ];
  for (const kq of tat) {
    assert.ok(kq.ok);
    assert.equal(kq.lenh.type, "price_changed");
    assert.deepEqual(Object.keys(kq.lenh.payload).sort(), ["feeInclusion", "listPrice"], JSON.stringify(kq.lenh));
  }
});

test("E4 đối chứng đỏ: lệnh chỉ có điều kiện phí bị bắt, gọi tên listPrice", () => {
  const loi = validatePayload("price_changed", { feeInclusion: "included" });
  assert.deepEqual(loi, [{ path: "listPrice", reason: "thiếu" }]);
});

test("Đã bán đọc giá chốt bằng cùng bộ đọc", () => {
  const kq = dungLenhTrangThai(HANG, "Closed", { giaChot: "4,5 tỷ", ngayBan: "2026-11-01" });
  assert.ok(kq.ok);
  assert.deepEqual(kq.lenh, { type: "status_changed", payload: { to: "Closed", closePrice: 4_500_000_000, closeDate: "2026-11-01" } });
  assert.equal(kq.hieuLa, "Hiểu là: giá chốt 4,5 tỷ");
});
