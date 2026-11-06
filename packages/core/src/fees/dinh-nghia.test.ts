// Định nghĩa bao phí theo tập khoản (hàng 49, AC-9, E9). Ma trận viết trước: bảy tập con khác rỗng × ba giá.
import assert from "node:assert/strict";
import { test } from "node:test";
import { giaiCauHinh } from "../config/giai";
import { giaBaoPhiTuVeTay, tinhVeTay, type MaKhoan } from "../pricing/ve-tay";
import { DINH_NGHIA_MAC_DINH, dinhNghiaBaoPhi, tuDau } from ".";

const BAY_TAP: readonly (readonly MaKhoan[])[] = [
  ["thue_tncn"],
  ["le_phi_truoc_ba"],
  ["moi_gioi"],
  ["thue_tncn", "le_phi_truoc_ba"],
  ["thue_tncn", "moi_gioi"],
  ["le_phi_truoc_ba", "moi_gioi"],
  ["thue_tncn", "le_phi_truoc_ba", "moi_gioi"],
];
const BA_GIA = [1_000_000_000, 2_750_000_000, 4_650_000_000] as const;

test("thuế phí: bảy tập khoản, hai chiều khớp", () => {
  const tiLe = DINH_NGHIA_MAC_DINH.tiLe;
  let so = 0;
  for (const tap of BAY_TAP) {
    for (const gia of BA_GIA) {
      const kq = tinhVeTay(gia, "included", tiLe, tap);
      assert.deepEqual(
        kq.khoan.map((k) => k.ma),
        tap,
        `${tap.join("+")} × ${gia}: khoản ngoài tập không được có`,
      );
      assert.equal(kq.veTay, gia - kq.khoan.reduce((t, k) => t + k.dong, 0));
      const nguoc = giaBaoPhiTuVeTay(kq.veTay, tiLe, tap);
      assert.ok(tinhVeTay(nguoc, "included", tiLe, tap).veTay >= kq.veTay, `${tap.join("+")} × ${gia}: chiều ngược đủ về tay`);
      assert.ok(nguoc === 0 || tinhVeTay(nguoc - 1, "included", tiLe, tap).veTay < kq.veTay, `${tap.join("+")} × ${gia}: chiều ngược nhỏ nhất`);
      so++;
    }
  }
  assert.equal(so, 21);
});

test("thuế phí: định nghĩa đọc từ cấu hình của sàn", () => {
  assert.deepEqual(DINH_NGHIA_MAC_DINH, { khoan: ["thue_tncn", "le_phi_truoc_ba", "moi_gioi"], tiLe: { thue_tncn: 200, le_phi_truoc_ba: 50, moi_gioi: 100 } });
  const { cauHinh } = giaiCauHinh([
    { key: "fee.inclusion", value: ["personalIncomeTax", "brokerageFee"] },
    { key: "fee.brokerage_pct", value: 1.5 },
  ]);
  const dn = dinhNghiaBaoPhi(cauHinh);
  assert.deepEqual(dn.khoan, ["thue_tncn", "moi_gioi"]);
  assert.equal(dn.tiLe.moi_gioi, 150, "1,5% là 150 phần vạn, không 1");
  // Về tay 3 tỷ: 2% + 1,5% = 105 triệu.
  assert.equal(tinhVeTay(3_000_000_000, "included", dn.tiLe, dn.khoan).veTay, 2_895_000_000);
});

test("thuế phí: định nghĩa đọc từ dấu đã đóng", () => {
  const dn = tuDau({ includedItems: ["personalIncomeTax", "brokerageFee", "khoanLa"], rates: { personalIncomeTax: 200, registrationFee: 50, brokerageFee: 200 } });
  assert.deepEqual(dn, { khoan: ["thue_tncn", "moi_gioi"], tiLe: { thue_tncn: 200, le_phi_truoc_ba: 50, moi_gioi: 200 } });
  assert.equal(tinhVeTay(3_000_000_000, "included", dn.tiLe, dn.khoan).veTay, 2_880_000_000);
});
