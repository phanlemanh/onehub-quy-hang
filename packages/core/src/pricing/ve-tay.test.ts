import assert from "node:assert/strict";
import { test } from "node:test";
import type { FeeInclusion } from "./types";
import { giaBaoPhiTuVeTay, tinhVeTay, TI_LE_BAO_PHI_MAC_DINH, type TiLeBaoPhi, type VeTay } from "./ve-tay";

const MAC_DINH = TI_LE_BAO_PHI_MAC_DINH;

// Bảng viết tay trước bộ tính (AC-3): [tên, giá, điều kiện, tỉ lệ, về tay, ba khoản theo thứ tự thue_tncn · le_phi_truoc_ba · moi_gioi].
const BANG: [string, number, FeeInclusion, TiLeBaoPhi, number, number[]][] = [
  ["2,75 tỷ bao phí", 2_750_000_000, "included", MAC_DINH, 2_653_750_000, [55_000_000, 13_750_000, 27_500_000]],
  ["2,75 tỷ không bao phí", 2_750_000_000, "excluded", MAC_DINH, 2_750_000_000, []],
  ["giá lẻ 1.234.567.891 bao phí", 1_234_567_891, "included", MAC_DINH, 1_191_358_015, [24_691_358, 6_172_839, 12_345_679]],
  ["môi giới 150 phần vạn", 2_750_000_000, "included", { ...MAC_DINH, moi_gioi: 150 }, 2_640_000_000, [55_000_000, 13_750_000, 41_250_000]],
  ["môi giới 0", 2_750_000_000, "included", { ...MAC_DINH, moi_gioi: 0 }, 2_681_250_000, [55_000_000, 13_750_000, 0]],
  ["1 tỷ bao phí", 1_000_000_000, "included", MAC_DINH, 965_000_000, [20_000_000, 5_000_000, 10_000_000]],
  ["nửa đồng làm tròn lên", 1_000_000_050, "included", MAC_DINH, 965_000_048, [20_000_001, 5_000_000, 10_000_001]],
  ["3,5 tỷ không bao phí", 3_500_000_000, "excluded", MAC_DINH, 3_500_000_000, []],
];

type BoTinh = (gia: number, dk: FeeInclusion, tiLe: TiLeBaoPhi) => VeTay;

/** Tên các dòng bộ tính làm sai. */
function dongSai(boTinh: BoTinh): string[] {
  return BANG.filter(([, gia, dk, tiLe, veTay, khoan]) => {
    const kq = boTinh(gia, dk, tiLe);
    return kq.veTay !== veTay || kq.khoan.map((k) => k.dong).join() !== khoan.join();
  }).map(([ten]) => ten);
}

test("về tay: bảng viết trước", () => {
  assert.equal(BANG.length, 8);
  assert.deepEqual(dongSai(tinhVeTay), []);
  assert.deepEqual(
    tinhVeTay(2_750_000_000, "included").khoan.map((k) => k.ma),
    ["thue_tncn", "le_phi_truoc_ba", "moi_gioi"],
  );
});

test("về tay: đối chứng đỏ — bộ tính hỏng bị gọi tên", () => {
  const soThuc: BoTinh = (gia, dk, tiLe) => {
    if (dk === "excluded") return { veTay: gia, khoan: [] };
    const khoan = (["thue_tncn", "le_phi_truoc_ba", "moi_gioi"] as const).map((ma) => ({ ma, tiLe: tiLe[ma], dong: (gia * tiLe[ma]) / 10_000 }));
    return { veTay: gia - khoan.reduce((t, k) => t + k.dong, 0), khoan };
  };
  assert.ok(dongSai(soThuc).includes("giá lẻ 1.234.567.891 bao phí"));
  const truCaKhongBaoPhi: BoTinh = (gia, _dk, tiLe) => tinhVeTay(gia, "included", tiLe);
  assert.ok(dongSai(truCaKhongBaoPhi).includes("2,75 tỷ không bao phí"));
});

/** Sinh số theo hạt giống cố định (LCG 32 bit) — lần chạy nào cũng cùng dãy. */
function* dayHatGiong(hat: number, n: number) {
  let s = hat >>> 0;
  for (let i = 0; i < n; i++) {
    s = (Math.imul(s, 1_664_525) + 1_013_904_223) >>> 0;
    const s2 = (Math.imul(s, 22_695_477) + 1) >>> 0;
    // 100 triệu – khoảng 100 tỷ, đủ lẻ tới từng đồng.
    yield 100_000_000 + ((s * 23 + s2) % 99_900_000_000);
  }
}

test("về tay: tính ngược", () => {
  let dem = 0;
  for (const tiLe of [MAC_DINH, { ...MAC_DINH, moi_gioi: 150 }]) {
    for (const n of dayHatGiong(28, 1_000)) {
      const g = giaBaoPhiTuVeTay(n, tiLe);
      assert.ok(tinhVeTay(g, "included", tiLe).veTay >= n, `về tay của ${g} thấp hơn ${n}`);
      assert.ok(tinhVeTay(g - 1, "included", tiLe).veTay < n, `${g - 1} đã đủ ${n} — chưa nhỏ nhất`);
      dem++;
    }
  }
  assert.equal(dem, 2_000);
  assert.equal(giaBaoPhiTuVeTay(2_653_750_000), 2_750_000_000);
});

test("về tay: số nguyên", () => {
  for (const gia of dayHatGiong(7, 500)) {
    const kq = tinhVeTay(gia, "included");
    assert.ok(Number.isSafeInteger(kq.veTay));
    for (const k of kq.khoan) assert.ok(Number.isSafeInteger(k.dong));
  }
});
