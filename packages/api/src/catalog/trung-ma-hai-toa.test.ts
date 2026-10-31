// Lệnh đo tỉ lệ tự điền khi mã trùng ở hai toà (hàng 63, hồ sơ can-trung-ma-hai-toa) — E6.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { CatalogData } from "@quy-hang/core";
import { measureAutofill } from "./do-ti-le";

const can = (unitNumber: string, upi: string) => ({ upi, unitNumber, stack: null, floor: null, livingArea: 60, bedroomsTotal: 2, directionFaces: "Đông", propertyType: "Residential", propertySubType: "Condominium" });
const A1 = { buildingKey: "A1", buildingName: "[Mẫu] Toà A1", units: [can("1206", "upi:A1-1206"), can("0801", "upi:A1-0801")] };
const A2 = { buildingKey: "A2", buildingName: "[Mẫu] Toà A2", units: [can("1206", "upi:A2-1206")] };
const danhMuc = (buildings: (typeof A1)[]): CatalogData => ({
  subdivisions: [{ subdivisionKey: "mau-trung-ma", subdivisionName: "[Mẫu] Dự án trùng mã", complexName: null, buildings }],
});
const DAP_AN = [
  { input: "1206", upi: "upi:A1-1206" },
  { input: "0801", upi: "upi:A1-0801" },
];

test("đo tỉ lệ: mã trùng hai toà là nhiều căn, không là điền đoán", () => {
  const kq = measureAutofill(danhMuc([A1, A2]), DAP_AN, [], []);
  assert.deepEqual({ tong: kq.tong, dung: kq.dung, nhieuCan: kq.nhieuCan, dienDoan: kq.dienDoan }, { tong: 2, dung: 1, nhieuCan: 1, dienDoan: 0 }, kq.dong);
  assert.ok(kq.dong.endsWith(" · nhiều căn 1"), kq.dong);
  assert.deepEqual(kq.hut.map((h) => h.input), ["1206"]);

  // Đối chứng: bỏ toà A2 thì không còn mã trùng, cả hai mã tự điền đúng và dòng in không nói «nhiều căn».
  const mot = measureAutofill(danhMuc([A1]), DAP_AN, [], []);
  assert.deepEqual({ dung: mot.dung, nhieuCan: mot.nhieuCan, dienDoan: mot.dienDoan }, { dung: 2, nhieuCan: 0, dienDoan: 0 }, mot.dong);
  assert.ok(!mot.dong.includes("nhiều căn"), mot.dong);
});
