// Bộ mã hoá số chủ và dấu vết (hàng 62: AC-1, AC-2, AC-3 — ADR-0013). Khoá thử sinh trong tệp, số mẫu `0900 000 0xx`.
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import { test } from "node:test";
import { normalizePhone } from "@quy-hang/core/access";
import { dauVetSo, giaiMaSo, maHoaSo, nguCanhChuNha, timDangSo, type KhoaSoChu } from "./ma-hoa";

const KHOA: KhoaSoChu = { key: randomBytes(32) };
const KHOA_KHAC: KhoaSoChu = { key: randomBytes(32) };
const SAN_A = "11111111-1111-4111-8111-111111111111";
const SAN_B = "22222222-2222-4222-8222-222222222222";
const HANG_1 = "33333333-3333-4333-8333-333333333333";
const HANG_2 = "44444444-4444-4444-8444-444444444444";
const SO = "0900000012";
const NGU_CANH = nguCanhChuNha(SAN_A, HANG_1);

/** Bản mã viết ra mọi dạng chữ người đọc thẳng bảng hay bản sao lưu có thể gặp. */
const cacDangChu = (b: Buffer) => [b.toString("hex"), b.toString("base64"), b.toString("utf8"), b.toString("latin1")];

test("mã hoá: khứ hồi ra đúng số, khuôn 0x01 ‖ nonce ‖ thẻ ‖ thân", () => {
  const banMa = maHoaSo(SO, NGU_CANH, KHOA);
  assert.equal(banMa[0], 0x01, "byte đầu là phiên bản khoá 0x01");
  assert.equal(banMa.length, 1 + 12 + 16 + 10, "bản mã của số 10 chữ số dài 39 byte");
  assert.equal(giaiMaSo(banMa, NGU_CANH, KHOA), SO);
});

test("mã hoá: hai lần ra hai bản mã khác", () => {
  const a = maHoaSo(SO, NGU_CANH, KHOA);
  const b = maHoaSo(SO, NGU_CANH, KHOA);
  assert.notDeepEqual(a, b, "nonce ngẫu nhiên mỗi lần ghi");
  assert.equal(giaiMaSo(b, NGU_CANH, KHOA), SO);
});

test("mã hoá: bản mã không mang số ở bốn dạng", () => {
  // Đối chứng dương cùng hàm quét: chuỗi cấy số phải bị bắt và nêu dạng bị bắt.
  assert.equal(timDangSo(Buffer.from(`x${SO}x`).toString("utf8"), SO), SO);
  assert.equal(timDangSo("goi +84900000012 nhe", SO), "+84900000012");
  for (let i = 0; i < 50; i++) {
    for (const chu of cacDangChu(maHoaSo(SO, NGU_CANH, KHOA))) assert.equal(timDangSo(chu, SO), null, `lộ số trong «${chu}»`);
  }
});

test("mã hoá: sai ngữ cảnh, sai khoá, sửa một byte đều bị từ chối", () => {
  const banMa = maHoaSo(SO, NGU_CANH, KHOA);
  assert.equal(giaiMaSo(banMa, NGU_CANH, KHOA), SO, "đối chứng dương: bản gốc giải được");
  const sua = (i: number) => {
    const b = Buffer.from(banMa);
    b[i] = b[i]! ^ 0xff;
    return b;
  };
  const ca: [string, () => string][] = [
    ["ngữ cảnh hàng khác", () => giaiMaSo(banMa, nguCanhChuNha(SAN_A, HANG_2), KHOA)],
    ["ngữ cảnh sàn khác", () => giaiMaSo(banMa, nguCanhChuNha(SAN_B, HANG_1), KHOA)],
    ["khoá khác", () => giaiMaSo(banMa, NGU_CANH, KHOA_KHAC)],
    ["sửa byte phiên bản", () => giaiMaSo(sua(0), NGU_CANH, KHOA)],
    ["sửa byte nonce", () => giaiMaSo(sua(1), NGU_CANH, KHOA)],
    ["sửa byte thẻ", () => giaiMaSo(sua(13), NGU_CANH, KHOA)],
    ["sửa byte thân", () => giaiMaSo(sua(29), NGU_CANH, KHOA)],
  ];
  let dem = 0;
  for (const [ten, fn] of ca) {
    assert.throws(fn, (e: Error) => {
      assert.match(e.message, /bản mã số chủ không giải được/, ten);
      assert.equal(timDangSo(e.message, SO), null, `${ten}: thông điệp lộ số`);
      assert.ok(!e.message.includes(KHOA.key.toString("base64")), `${ten}: thông điệp lộ khoá`);
      return true;
    }, ten);
    dem++;
  }
  assert.equal(dem, 7);
});

test("dấu vết: cùng số cùng sàn bằng nhau, khác sàn hay khác số thì khác", () => {
  const dang = ["0900000012", "0900 000 012", "+84900000012", "84900000012"].map((d) => normalizePhone(d));
  const vet = dang.map((d) => dauVetSo(d!, SAN_A, KHOA));
  for (const v of vet) {
    assert.equal(v.length, 32);
    assert.deepEqual(v, vet[0], "bốn dạng của cùng số cho cùng dấu vết");
  }
  assert.notDeepEqual(dauVetSo(SO, SAN_B, KHOA), vet[0], "khác sàn → khác");
  assert.notDeepEqual(dauVetSo("0900000013", SAN_A, KHOA), vet[0], "khác số → khác");
});

test("dấu vết: không mang số, khoá con tách khỏi khoá mã hoá", () => {
  const vet = dauVetSo(SO, SAN_A, KHOA);
  const truc = createHmac("sha256", KHOA.key).update(`${SAN_A}:${SO}`).digest();
  assert.notDeepEqual(vet, truc, "dấu vết không tính thẳng bằng khoá mã hoá");
  for (const chu of cacDangChu(vet)) assert.equal(timDangSo(chu, SO), null);
});
