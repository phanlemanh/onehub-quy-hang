// Hạ giá trong cuộc gọi ép giá (hàng 29, E5). Ma trận viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { GiaKemPhi } from "@quy-hang/core/pricing";
import { dungHaGia } from "./ha-gia";

const CU: GiaKemPhi = { listPrice: 2_800_000_000, feeInclusion: "excluded" };
type Fn = typeof dungHaGia;
const MA_TRAN: [string, (f: Fn) => boolean][] = [
  [
    "2,72 tỷ không bao phí",
    (f) => {
      const k = f(CU, "2,72 tỷ", "excluded");
      return k.kind === "ghi" && k.lenh.listPrice === 2_720_000_000 && k.lenh.feeInclusion === "excluded" && k.hieuLa === "Hiểu là 2,72 tỷ · không bao phí · trước 2,8 tỷ · −3%";
    },
  ],
  [
    "2 tỷ hỏi lại",
    (f) => {
      const k = f(CU, "2 tỷ", "excluded");
      return k.kind === "hoi-lai" && k.cuMoi === "2,8 tỷ · không bao phí → 2 tỷ · không bao phí" && k.phanTram === "−29%";
    },
  ],
  ["đổi điều kiện phí hỏi lại", (f) => f(CU, "2,8 tỷ", "included").kind === "hoi-lai"],
  ["abc chưa hiểu", (f) => f(CU, "abc", "excluded").kind === "chua-hieu"],
  [
    "lệnh không mang khoá gợi ý",
    (f) => {
      const k = f(CU, "2,72 tỷ", "excluded");
      return k.kind === "ghi" && JSON.stringify(Object.keys(k.lenh).sort()) === JSON.stringify(["feeInclusion", "listPrice"]);
    },
  ],
];
const caSai = (f: Fn) => MA_TRAN.filter(([, k]) => !k(f)).map(([t]) => t);

test("hạ giá: luật sửa giá", () => {
  assert.equal(MA_TRAN.length, 5);
  assert.deepEqual(caSai(dungHaGia), []);
});

test("hạ giá: đối chứng đỏ — bỏ qua hỏi lại bị gọi tên", () => {
  const boHoiLai: Fn = (_cu, chu, phi) => dungHaGia({ listPrice: null, feeInclusion: null }, chu, phi);
  assert.ok(caSai(boHoiLai).includes("2 tỷ hỏi lại"));
});
