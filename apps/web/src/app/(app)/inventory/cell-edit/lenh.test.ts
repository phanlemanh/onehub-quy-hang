// Dựng lệnh từ trình sửa trên ô (hàng 15) — E2b, E3, E4. Lệnh nào cũng phải qua khuôn chặt của lõi.
import assert from "node:assert/strict";
import { test } from "node:test";
import { validatePayload } from "@quy-hang/core/listing";
import { CHON_PHI, chuaHieu, chuDienSan, dungLenhGia, dungLenhPhi, dungLenhTrangThai, hieuLaGia, hieuLaGiaChot, moTaThayDoi, type HangSua, type KetQuaLenh } from "./lenh";

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
  assert.equal(kq.hieuLa, "Hiểu là: 4,8 tỷ, không bao phí");
  assert.equal(hieuLaGia("4,8 tỷ", "included"), "Hiểu là: 4,8 tỷ, bao phí");
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

// Mọi chỗ trình sửa hiện giá viết đúng từng đồng (va-sua-tren-o AC-2, AC-3) — bảng viết tay: chỗ × giá → chữ mong đợi.
type Cho = "đọc lại" | "giá chốt" | "hỏi lại" | "điền sẵn";
const GIA_LE: [number, string, string][] = [
  [4_655_000_000, "4,655 tỷ", "4,655 tỷ"],
  [4_650_500_000, "4,6505 tỷ", "4,6505 tỷ"],
];

/** Chữ của từng chỗ cho một giá, với bộ viết cho trước (mặc định bộ viết thật). */
function choHienGia(dong: number, chuGo: string, viet?: (d: number) => string): Record<Cho, string | null> {
  const hang: HangSua = { ...HANG, listPrice: dong };
  const lenh = dungLenhGia(HANG, chuGo, "included");
  assert.ok(lenh.ok);
  assert.equal(lenh.lenh.type === "price_changed" && lenh.lenh.payload.listPrice, dong, `lệnh mang listPrice ${dong}`);
  const chot = dungLenhTrangThai(HANG, "Closed", { giaChot: chuGo, ngayBan: "2026-11-01" });
  assert.ok(chot.ok);
  assert.equal(chot.lenh.type === "status_changed" && chot.lenh.payload.closePrice, dong, `lệnh mang closePrice ${dong}`);
  return {
    "đọc lại": hieuLaGia(chuGo, "excluded", viet),
    "giá chốt": hieuLaGiaChot(chuGo, viet),
    "hỏi lại": moTaThayDoi(HANG, lenh.lenh, viet),
    "điền sẵn": chuDienSan(hang, viet),
  };
}

const MONG: (chu: string) => Record<Cho, string> = (chu) => ({
  "đọc lại": `Hiểu là: ${chu}, không bao phí`,
  "giá chốt": `Hiểu là: giá chốt ${chu}`,
  "hỏi lại": `4,5 tỷ, Không bao phí → ${chu}, Bao phí`,
  "điền sẵn": chu,
});

for (const [dong, chuGo, chu] of GIA_LE) {
  const thuc = choHienGia(dong, chuGo);
  for (const cho of Object.keys(MONG(chu)) as Cho[]) {
    test(`AC-2: ${cho} của ${dong} → «${MONG(chu)[cho]}»`, () => {
      assert.equal(thuc[cho], MONG(chu)[cho], `chỗ «${cho}», giá ${dong}`);
    });
  }
}

test("AC-2: đọc lại «4 tỷ 655» và «1,5 triệu»", () => {
  assert.equal(hieuLaGia("4 tỷ 655", "excluded"), "Hiểu là: 4,655 tỷ, không bao phí");
  assert.equal(hieuLaGia("1,5 triệu", "included"), "Hiểu là: 1,5 triệu, bao phí");
});

test("AC-3: căn 4,655 tỷ — chữ điền sẵn đọc lại đúng số cũ, Enter không đổi giá", () => {
  const hang: HangSua = { ...HANG, listPrice: 4_655_000_000 };
  const kq = dungLenhGia(hang, chuDienSan(hang), "excluded");
  assert.ok(kq.ok);
  assert.equal(kq.lenh.type === "price_changed" && kq.lenh.payload.listPrice, 4_655_000_000);
});

test("đối chứng đỏ: bộ viết làm tròn hai số lẻ thì chỗ đọc lại, hỏi lại, điền sẵn bị gọi tên", () => {
  const SO_2 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
  const vietTron = (d: number) => (d >= 1e9 ? `${SO_2.format(d / 1e9)} tỷ` : `${SO_2.format(d / 1e6)} triệu`);
  const [dong, chuGo, chu] = GIA_LE[0]!;
  const sai = choHienGia(dong, chuGo, vietTron);
  const lech = (Object.keys(MONG(chu)) as Cho[]).filter((c) => sai[c] !== MONG(chu)[c]);
  assert.deepEqual(lech, ["đọc lại", "giá chốt", "hỏi lại", "điền sẵn"], `chỗ lệch: ${lech.join(", ")}`);
});
