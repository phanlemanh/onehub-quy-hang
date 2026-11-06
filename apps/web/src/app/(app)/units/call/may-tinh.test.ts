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

test("máy tính cuộc gọi: theo định nghĩa của sàn", async () => {
  const { soGiaToa } = await import("@quy-hang/core/pricing");
  const { dinhNghiaTuBan } = await import("./dinh-nghia-san");
  const dn = dinhNghiaTuBan({
    items: [
      { key: "fee.inclusion", value: ["personalIncomeTax", "brokerageFee"] },
      { key: "fee.brokerage_pct", value: 2 },
    ],
  });
  const s = mayTinhDau(3_000_000_000, "included", dn);
  assert.deepEqual(s.ketQua?.khoan.map((k) => k.ma), ["thue_tncn", "moi_gioi"]);
  assert.equal(s.ketQua?.veTay, 2_880_000_000);
  assert.equal(s.chuMoiGioi, "2");
  // Đối chứng: sàn mặc định (đọc hỏng cũng vậy) ra ba khoản, 2,895 tỷ.
  const md = mayTinhDau(3_000_000_000, "included", dinhNghiaTuBan(null));
  assert.equal(md.ketQua?.khoan.length, 3);
  assert.equal(md.ketQua?.veTay, 2_895_000_000);
  // So giá toà nhận cùng định nghĩa.
  const so = soGiaToa({
    can: { id: null, buildingName: "Toà A", unitNumber: null, bedroomsTotal: null, listPrice: null, feeInclusion: null },
    cacCan: [{ id: "c1", buildingName: "Toà A", unitNumber: "A-01.01", bedroomsTotal: 2, standardStatus: "Active", listPrice: 3_000_000_000, feeInclusion: "included", lastConfirmedAt: null }],
    tiLe: dn.tiLe,
    tapKhoan: dn.khoan,
  });
  assert.equal(so.dong[0]?.veTay, 2_880_000_000);
});
