// Máy tính giá bao phí ↔ về tay (hàng 28, E4). Ma trận viết trước, đếm bằng assert số.
import assert from "node:assert/strict";
import { test } from "node:test";
import { giaBaoPhiTuVeTay, TI_LE_BAO_PHI_MAC_DINH, tinhVeTay, type TiLeBaoPhi } from "@quy-hang/core/pricing";
import { doiMayTinh, mayTinhDau, type DoiMayTinh, type MayTinh } from "./may-tinh";

type Doi = (s: MayTinh, d: DoiMayTinh, coSo?: TiLeBaoPhi) => MayTinh;
const chay = (doi: Doi, buoc: DoiMayTinh[], coSo?: TiLeBaoPhi) => buoc.reduce((s, d) => doi(s, d, coSo), mayTinhDau(null, "included", coSo));

// [tên, các bước, kiểm].
const MA_TRAN: [string, DoiMayTinh[], (s: MayTinh) => boolean][] = [
  ["giá bao phí ra về tay", [{ o: "gia", chu: "2,75 tỷ" }], (s) => s.ketQua?.veTay === 2_653_750_000 && s.ketQua.khoan.map((k) => k.dong).join() === "55000000,13750000,27500000"],
  ["về tay ra giá bao phí", [{ o: "ve-tay", chu: "2,65 tỷ" }], (s) => s.ketQua?.gia === giaBaoPhiTuVeTay(2_650_000_000) && s.chuGia !== ""],
  [
    "đổi môi giới 1 → 1,5",
    [{ o: "gia", chu: "2,75 tỷ" }, { o: "moi-gioi", chu: "1,5" }],
    (s) => s.ketQua?.veTay === 2_653_750_000 - 13_750_000,
  ],
  ["chữ chưa hiểu giữ số cũ", [{ o: "gia", chu: "2,75 tỷ" }, { o: "gia", chu: "abc" }], (s) => s.loi?.o === "gia" && s.ketQua?.veTay === 2_653_750_000],
  ["không bao phí", [{ o: "phi", phi: "excluded" }, { o: "gia", chu: "2,75 tỷ" }], (s) => s.ketQua?.veTay === 2_750_000_000 && s.ketQua.khoan.length === 0],
];

const caSai = (doi: Doi) => MA_TRAN.filter(([, buoc, kiem]) => !kiem(chay(doi, buoc))).map(([ten]) => ten);

test("máy tính: hai chiều", () => {
  assert.equal(MA_TRAN.length, 5);
  assert.deepEqual(caSai(doiMayTinh), []);
});

/** Tỉ lệ lõi đổi (sàn đặt thuế 3% ở hàng 49): máy tính phải đổi theo. */
const LOI_DOI: TiLeBaoPhi = { ...TI_LE_BAO_PHI_MAC_DINH, thue_tncn: 300 };
const theoTiLeLoi = (doi: Doi) => chay(doi, [{ o: "gia", chu: "2,75 tỷ" }], LOI_DOI).ketQua?.veTay === tinhVeTay(2_750_000_000, "included", LOI_DOI).veTay;

test("máy tính: đọc tỉ lệ của lõi", () => {
  assert.ok(theoTiLeLoi(doiMayTinh));
  assert.equal(mayTinhDau(null, null).chuMoiGioi, "1");
});

test("máy tính: đối chứng đỏ — tự giữ tỉ lệ riêng bị gọi tên", () => {
  const tuGiu: Doi = (s, d) => doiMayTinh(s, d, { thue_tncn: 200, le_phi_truoc_ba: 50, moi_gioi: 100 });
  assert.equal(theoTiLeLoi(tuGiu), false, "ca đổi tỉ lệ lõi");
});
