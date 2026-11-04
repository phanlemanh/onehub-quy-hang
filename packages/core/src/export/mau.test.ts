// E2 (hàng 43, AC-2) — năm mẫu, nhãn, thứ tự; ma trận cỡ n ∈ {1, 30, 31, 200} × năm mẫu = 20 ô viết trước; người nhận
// mặc định. Chiều đỏ dựng bản sao hỏng (ngưỡng ≥ 30) chạy trên CÙNG ma trận.
import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_SHARE_LISTINGS } from "../sharing";
import { LOI_QUA_TRAN, MAU_XUAT, mauBiKhoa, NGUOI_NHAN_MAC_DINH, TRAN_BAI_ANH, type MauXuat, type TrangThaiMau } from ".";

const K = true;
const M = false;
/** Ô viết tay: [n, post_zalo, post_facebook, xlsx, png, pdf] — true là khoá. */
const MA_TRAN: readonly [number, boolean, boolean, boolean, boolean, boolean][] = [
  [1, M, M, M, M, M],
  [30, M, M, M, M, M],
  [31, K, K, M, K, M],
  [200, K, K, M, K, M],
];
const THU_TU: readonly MauXuat[] = ["post_zalo", "post_facebook", "xlsx", "png", "pdf"];

type HamKhoa = (mau: MauXuat, n: number) => TrangThaiMau;

function kiemKhoa(ham: HamKhoa): string[] {
  const loi: string[] = [];
  for (const [n, ...mong] of MA_TRAN) {
    THU_TU.forEach((mau, i) => {
      const r = ham(mau, n);
      if (r.khoa && !mong[i]) loi.push(`n=${n} ${mau}: khoá oan`);
      if (!r.khoa && mong[i]) loi.push(`n=${n} ${mau}: không khoá`);
      if (r.khoa && r.loi !== LOI_QUA_TRAN) loi.push(`n=${n} ${mau}: lời khoá «${r.loi}»`);
    });
  }
  return loi;
}

test("E2 năm mẫu đúng mã, nhãn, thứ tự", () => {
  assert.deepEqual(
    MAU_XUAT.map((m) => [m.ma, m.nhan]),
    [
      ["post_zalo", "Bài Zalo"],
      ["post_facebook", "Bài Facebook"],
      ["xlsx", "Excel"],
      ["png", "Ảnh"],
      ["pdf", "PDF"],
    ],
  );
});

test("E2 ma trận cỡ × mẫu (20 ô) — bài, ảnh khoá khi n > 30; Excel, PDF không bao giờ khoá", () => {
  assert.deepEqual(kiemKhoa(mauBiKhoa), []);
  assert.equal(LOI_QUA_TRAN, "Quá 30 căn — dùng Excel hay PDF");
  assert.equal(TRAN_BAI_ANH, MAX_SHARE_LISTINGS, "ngưỡng phải bằng trần căn của Lần gửi");
});

test("E2 người nhận mặc định là Nhóm môi giới", () => {
  assert.equal(NGUOI_NHAN_MAC_DINH, "nhom_moi_gioi");
});

test("E2 chiều đỏ — bản sao đặt ngưỡng ≥ 30 thì ô n = 30 khoá oan", () => {
  const nguongSai: HamKhoa = (mau, n) =>
    ["post_zalo", "post_facebook", "png"].includes(mau) && n >= 30 ? { khoa: true, loi: LOI_QUA_TRAN } : { khoa: false, loi: null };
  const loi = kiemKhoa(nguongSai);
  assert.deepEqual(loi, ["n=30 post_zalo: khoá oan", "n=30 post_facebook: khoá oan", "n=30 png: khoá oan"]);
});
