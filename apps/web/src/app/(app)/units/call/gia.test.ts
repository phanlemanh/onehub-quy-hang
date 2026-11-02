// Nhóm «Giá và phí» của danh sách hỏi (hàng 28, E7). Ma trận viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { GiaKemPhi } from "@quy-hang/core/pricing";
import { dungGhiGia, goiYGia, hieuLa, type KetQuaGia } from "./gia";

const CU: GiaKemPhi = { listPrice: 2_750_000_000, feeInclusion: "included" };
type DungGhi = typeof dungGhiGia;

const MA_TRAN: [string, (f: DungGhi) => boolean][] = [
  ["hồ sơ chưa giá gợi giá của lead", () => JSON.stringify(goiYGia({ listPrice: null, feeInclusion: null }, { listPrice: 2_750_000_000, feeInclusion: "included" })) === JSON.stringify({ chu: "2,75 tỷ", phi: "included" })],
  [
    "2,8 tỷ trên 2,75 bao phí ghi không hỏi",
    (f) => {
      const k = f(CU, "2,8 tỷ", "included");
      return k.kind === "ghi" && k.lenh.listPrice === 2_800_000_000 && k.lenh.feeInclusion === "included";
    },
  ],
  [
    "3,5 tỷ hỏi lại",
    (f) => {
      const k = f(CU, "3,5 tỷ", "included");
      return k.kind === "hoi-lai" && k.cuMoi === "2,75 tỷ · bao phí → 3,5 tỷ · bao phí" && k.phanTram === "+27%";
    },
  ],
  ["đổi điều kiện phí hỏi lại", (f) => f(CU, "2,75 tỷ", "excluded").kind === "hoi-lai"],
  ["abc chưa hiểu", (f) => (f(CU, "abc", "included") as KetQuaGia).kind === "chua-hieu"],
];

const caSai = (f: DungGhi) => MA_TRAN.filter(([, kiem]) => !kiem(f)).map(([ten]) => ten);

test("giá trong danh sách hỏi", () => {
  assert.equal(MA_TRAN.length, 5);
  assert.deepEqual(caSai(dungGhiGia), []);
  assert.equal(hieuLa("2,8 tỷ", "included"), "Hiểu là 2,8 tỷ · bao phí");
  assert.equal(hieuLa("2,8 tỷ", null), null);
  assert.equal(goiYGia(CU, { listPrice: 3_000_000_000, feeInclusion: "excluded" }).chu, "2,75 tỷ");
});

test("giá: đối chứng đỏ — bỏ qua hỏi lại bị gọi tên", () => {
  const boHoiLai: DungGhi = (_cu, chu, phi) => dungGhiGia({ listPrice: null, feeInclusion: null }, chu, phi);
  assert.ok(caSai(boHoiLai).includes("3,5 tỷ hỏi lại"));
});
