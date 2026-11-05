// Cách gọi riêng (hàng 45): kiểm nhãn, dựng dòng, từ vựng của sàn, phần ra ngoài (E3, E7, E10b).
import assert from "node:assert/strict";
import { test } from "node:test";
import { FIELD_CLASS } from "../import/fields";
import { truongRa, TRUONG_RA } from "../redaction";
import {
  boTuVung,
  DS_TRUONG_DAT_TEN,
  dungDongNhan,
  kiemNhanGiaTri,
  kiemNhanTruong,
  lopTruongDatTen,
  nhanGiaTri,
  nhanTruong,
  TRUONG_DAT_TEN,
  tuVungRaNgoai,
  type TruongDatTen,
  type TuVung,
} from "./index";

test("từ vựng: kiểm giá trị riêng", () => {
  // Bảng viết trước — mỗi dòng: [trường, neo, nhãn, kỳ vọng: true = ok | chuỗi phải có trong lỗi].
  const bang: [unknown, unknown, unknown, true | string][] = [
    ["feeInclusion", "included", "BP", true],
    ["feeInclusion", undefined, "BP", "labels.value.feeInclusion: thiếu giá trị chuẩn để neo"],
    ["feeInclusion", "maybe", "BP", "không thuộc included, excluded"],
    ["withdrawnReason", "unreachable", "Mất liên lạc", true],
    ["listPrice", "x", "Giá", "labels.value.listPrice: không phải trường có tập giá trị đóng"],
    ["standardStatus", "Active", "Đang rao", "labels.value.standardStatus: không phải trường có tập giá trị đóng"],
    ["feeInclusion", "excluded", "   ", "chữ rỗng"],
  ];
  let dem = 0;
  for (const [truong, neo, nhan, ky] of bang) {
    const kq = kiemNhanGiaTri(truong, neo, nhan);
    if (ky === true) assert.equal(kq.ok, true, `${String(truong)}/${String(neo)}`);
    else {
      assert.equal(kq.ok, false, `${String(truong)}/${String(neo)} phải lỗi`);
      assert.ok(!kq.ok && kq.loi.includes(ky), `${String(truong)}/${String(neo)}: ${!kq.ok ? kq.loi : ""}`);
    }
    dem++;
  }
  assert.equal(dem, 7);
  // Hai giá trị cùng chữ trong một trường là lỗi trùng.
  const trung = dungDongNhan({ fields: [], values: [{ field: "feeInclusion", value: "included", label: "BP" }, { field: "feeInclusion", value: "excluded", label: "bp" }] });
  assert.equal(trung.ok, false);
  assert.ok(!trung.ok && trung.loi.includes("hai giá trị cùng tên"), !trung.ok ? trung.loi : "");
});

test("từ vựng: kiểm tên trường — dài, số điện thoại, email", () => {
  assert.deepEqual(kiemNhanTruong("feeInclusion", "  Phí CN "), { ok: true, nhan: "Phí CN" });
  const bang: [unknown, unknown, string][] = [
    ["feeInclusion", "x".repeat(41), "dài hơn 40"],
    ["feeInclusion", "Gọi 0900 000 001", "số điện thoại"],
    ["feeInclusion", "[Tên]@vidu.vn", "email"],
    ["ownerPhone", "Số chủ", "không phải trường đổi tên được"],
  ];
  for (const [f, nhan, ky] of bang) {
    const kq = kiemNhanTruong(f, nhan);
    assert.ok(!kq.ok && kq.loi.includes(ky), `${String(f)}: ${kq.ok ? "ok" : kq.loi}`);
  }
  assert.equal(kiemNhanTruong("feeInclusion", "x".repeat(40)).ok, true);
});

test("từ vựng: dựng dòng nguyên khối", () => {
  const kq = dungDongNhan({
    fields: [{ field: "feeInclusion", label: "Phí CN" }],
    values: [{ field: "feeInclusion", value: "included", label: "BP" }],
  });
  assert.deepEqual(kq, { ok: true, dong: [{ key: "labels.field.feeInclusion", value: "Phí CN" }, { key: "labels.value.feeInclusion", value: { included: "BP" } }] });
  // Một ô sai thì cả bộ sai, lỗi nêu khoá.
  const sai = dungDongNhan({ fields: [{ field: "feeInclusion", label: "Phí CN" }], values: [{ field: "feeInclusion", value: "maybe", label: "BP" }] });
  assert.ok(!sai.ok && sai.loi.startsWith("labels.value.feeInclusion"), !sai.ok ? sai.loi : "");
  assert.deepEqual(dungDongNhan({ fields: [], values: [] }), { ok: true, dong: [] });
});

test("từ vựng: sàn chưa đặt", () => {
  assert.deepEqual(boTuVung([]), { tuVung: { truong: {}, giaTri: {} }, loi: [] });
  const { tuVung, loi } = boTuVung([
    { key: "labels.field.feeInclusion", value: "Phí CN" },
    { key: "labels.field.ownerPhone", value: "Số" },
    { key: "labels.field.livingArea", value: 12 },
    { key: "labels.value.feeInclusion", value: { included: "BP", maybe: "Có lẽ" } },
    { key: "labels.value.withdrawnReason", value: "không phải đối tượng" },
    { key: "lead_routing.strategy", value: "manual" },
  ]);
  assert.deepEqual(tuVung, { truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } });
  assert.equal(loi.length, 4, loi.join(" | "));
  for (const k of ["labels.field.ownerPhone", "labels.field.livingArea", "labels.value.feeInclusion", "labels.value.withdrawnReason"])
    assert.ok(loi.some((l) => l.startsWith(k)), k);
});

test("từ vựng: chữ hiện — tên riêng hay mặc định của mặt", () => {
  const tv: TuVung = { truong: { feeInclusion: "Phí CN" }, giaTri: { feeInclusion: { included: "BP" } } };
  assert.equal(nhanTruong(tv, "feeInclusion", "Phí"), "Phí CN");
  assert.equal(nhanTruong(tv, "listPrice", "Giá"), "Giá");
  assert.equal(nhanTruong(null, "feeInclusion", "Phí"), "Phí");
  assert.equal(nhanGiaTri(tv, "feeInclusion", "included", "Bao phí"), "BP");
  assert.equal(nhanGiaTri(tv, "feeInclusion", "excluded", "Không bao phí"), "Không bao phí");
});

test("từ vựng: chỉ phần ra ngoài", () => {
  const day: TuVung = {
    truong: Object.fromEntries(DS_TRUONG_DAT_TEN.map((f) => [f, `Riêng ${f}`])) as Partial<Record<TruongDatTen, string>>,
    giaTri: { feeInclusion: { included: "BP", excluded: "KBP" }, withdrawnReason: { unreachable: "MOI-LYDO" } },
  };
  // Tập viết trước: giao 15 trường với khoá ra của từng người nhận.
  const KY: Record<string, string[]> = {
    khach_rieng: ["buildingName", "unitNumber", "livingArea", "floor", "directionFaces", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType"],
    nhom_moi_gioi: ["buildingName", "unitNumber", "livingArea", "floor", "directionFaces", "listPrice", "feeInclusion", "furnished", "legalStatus", "financing", "occupantType"],
  };
  for (const nn of Object.keys(TRUONG_RA) as (keyof typeof TRUONG_RA)[]) {
    const ra = tuVungRaNgoai(day, TRUONG_RA[nn]);
    assert.deepEqual(Object.keys(ra.truong).sort(), [...KY[nn]!].sort(), nn);
    assert.deepEqual(ra.giaTri, { feeInclusion: { included: "BP", excluded: "KBP" } }, nn);
    for (const cam of ["withdrawnReason", "closePrice", "closeDate", "standardStatus"]) assert.ok(!(cam in ra.truong), `${nn}: ${cam}`);
    assert.ok(!JSON.stringify(ra).includes("MOI-LYDO"), nn);
  }
  // Khách riêng ẩn mã căn: tập khoá thật bỏ mã căn → nhãn mã căn cũng không đi.
  const an = tuVungRaNgoai(day, truongRa("khach_rieng", { showConfirmedAge: true, privateHidesUnitNumber: true }));
  assert.ok(!("unitNumber" in an.truong));
  assert.deepEqual(tuVungRaNgoai(null, TRUONG_RA.khach_rieng), { truong: {}, giaTri: {} });
});

test("từ vựng: không trường source nào đổi tên được", () => {
  const nguon = (ds: readonly string[]) => ds.filter((f) => (FIELD_CLASS as Record<string, string>)[f] === "source");
  assert.deepEqual(nguon(DS_TRUONG_DAT_TEN), []);
  for (const f of DS_TRUONG_DAT_TEN) assert.notEqual(lopTruongDatTen(f), "source", f);
  // Đối chứng dương: bộ kiểm bắt khi bản sao danh sách chèn ownerPhone.
  assert.deepEqual(nguon([...Object.keys(TRUONG_DAT_TEN), "ownerPhone"]), ["ownerPhone"]);
});
