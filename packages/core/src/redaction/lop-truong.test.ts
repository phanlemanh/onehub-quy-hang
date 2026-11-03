// E2 (hàng 31) — bảng lớp trọn: mỗi khoá bản vào một lớp, danh sách được ra chỉ đọc lớp ra ngoài được, và bảng khớp bảng
// gốc của lõi (trường chủ nhà hàng 11, ngăn ảnh hàng 18) — đọc bằng import, không chép tay.
import assert from "node:assert/strict";
import { test } from "node:test";
import { OWNER_FIELDS } from "../access";
import type { DataClass } from "../data-classes";
import { SOURCE_KEYS } from "../listing";
import { COMPARTMENT_CLASS } from "../photos";
import { canMoi, KHOA_CHUA_CO_BANG_GOC, kiemBangGoc, kiemBangLop, LOP_TRUONG, nguonRaTheoNguoiNhan, TRUONG_RA } from ".";

const GOC = { ownerFields: OWNER_FIELDS, sourceKeys: SOURCE_KEYS, compartmentClass: COMPARTMENT_CLASS };

test("E2 bảng lớp trọn — vật lành xanh", () => {
  assert.deepEqual(kiemBangLop(LOP_TRUONG, nguonRaTheoNguoiNhan(), Object.keys(canMoi())), []);
  assert.deepEqual(Object.keys(canMoi()).sort(), Object.keys(LOP_TRUONG).sort());
  assert.deepEqual(kiemBangGoc(LOP_TRUONG, GOC), []);
  // Danh sách viết trước: khoá lần đầu được xếp lớp ở luật ẩn.
  assert.deepEqual([...KHOA_CHUA_CO_BANG_GOC].sort(), [
    "bedroomsTotal", "buildingFloorsTotal", "buildingName", "closeDate", "closePrice", "companyName", "contacts",
    "customFields", "directionFaces", "feeInclusion", "financing", "floor", "furnished", "holderName", "holderUserId",
    "lastConfirmedAt", "legalStatus", "listPrice", "livingArea", "occupantType", "propertySubType", "propertyType",
    "senderName", "stack", "standardStatus", "unitNumber", "upi", "version", "withdrawnReason",
  ]);
});

test("E2 bảng gốc đổi lớp mà luật ẩn không đổi theo → đỏ nêu khoá", () => {
  const loi = kiemBangGoc(LOP_TRUONG, { ...GOC, ownerFields: { ...OWNER_FIELDS, ownerName: "company_internal" } });
  assert.equal(loi.length, 1);
  assert.match(loi[0]!, /ownerName/);
});

test("E2 khoá bản vào chưa xếp lớp → đỏ nêu khoá", () => {
  const loi = kiemBangLop(LOP_TRUONG, nguonRaTheoNguoiNhan(), [...Object.keys(canMoi()), "ghiChuNoiBo"]);
  assert.equal(loi.length, 1);
  assert.match(loi[0]!, /ghiChuNoiBo/);
  assert.match(loi[0]!, /chưa xếp lớp/);
});

test("E2 thêm vào danh sách được ra một khoá của từng lớp không ra → đỏ nêu khoá và lớp", () => {
  const bang: Record<string, DataClass> = { ...LOP_TRUONG, hanhViMoi: "behavior" };
  const ca: [string, DataClass][] = [
    ["holderName", "company_internal"],
    ["customFields", "custom_field"],
    ["closePrice", "transaction"],
    ["hanhViMoi", "behavior"],
    ["ownerPhone", "source"],
  ];
  for (const [khoa, lop] of ca) {
    const nguon = nguonRaTheoNguoiNhan(TRUONG_RA);
    const loi = kiemBangLop(bang, { ...nguon, khach_rieng: [...nguon.khach_rieng, khoa] }, Object.keys(canMoi()));
    assert.equal(loi.length, 1, `${khoa}: ${loi.join(" | ")}`);
    assert.match(loi[0]!, new RegExp(`${khoa}: lớp ${lop} không ra ngoài`));
  }
});
