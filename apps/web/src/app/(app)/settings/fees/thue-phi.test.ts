// Mục Thuế phí (hàng 49, AC-1, AC-2): ba dòng, nguồn, kiểm trước khi lưu, ví dụ về tay — gọi thẳng phần thuần của màn.
import assert from "node:assert/strict";
import { test } from "node:test";

import type { BanCauHinh, DongCauHinh } from "../lead-routing/luat";
import { doiCongTac, dongThuePhi, giaTriPhi, lenhLuu, LOI_CONG_TAC, LOI_MOI_GIOI, THEO_LUAT, viDu } from "./thue-phi";

const dong = (key: string, value: unknown, nguoi: string | null = null, luc: string | null = null): DongCauHinh => ({
  key,
  value,
  source: nguoi ? "company" : "default",
  updatedBy: nguoi,
  updatedAt: luc,
});
const MAC_DINH: BanCauHinh = {
  items: [dong("fee.inclusion", ["personalIncomeTax", "registrationFee", "brokerageFee"]), dong("fee.brokerage_pct", 1), dong("fee.personal_income_tax_pct", 2), dong("fee.registration_fee_pct", 0.5)],
  errors: [],
};
const TEN = new Map([["u-qt", "[Tên]"]]);

test("thuế phí: ba dòng mặc định", () => {
  const ds = dongThuePhi(MAC_DINH, giaTriPhi(MAC_DINH), TEN);
  assert.deepEqual(
    ds.map((d) => [d.ten, d.bat, d.tiLeChu, d.suaDuoc, d.nguon]),
    [
      ["Thuế thu nhập cá nhân", true, "2%", false, "Mặc định"],
      ["Lệ phí trước bạ", true, "0,5%", false, "Mặc định"],
      ["Môi giới", true, "1%", true, "Mặc định"],
    ],
  );
  assert.equal(THEO_LUAT, "theo luật");
});

test("thuế phí: dòng đã đổi mang người và ngày", () => {
  const ban: BanCauHinh = { ...MAC_DINH, items: MAC_DINH.items.map((x) => (x.key === "fee.brokerage_pct" ? dong(x.key, 1.5, "u-qt", "2026-11-06T03:00:00.000Z") : x)) };
  const ds = dongThuePhi(ban, giaTriPhi(ban), TEN);
  assert.equal(ds[2]!.tiLeChu, "1,5%");
  assert.equal(ds[2]!.nguon, "Đã đổi · [Tên] · 06/11");
  assert.deepEqual(ds.slice(0, 2).map((d) => d.nguon), ["Mặc định", "Mặc định"]);
});

test("thuế phí: lưu chỉ gửi khoá đã đổi, sai thì không gửi", () => {
  const truoc = giaTriPhi(MAC_DINH);
  const sau = doiCongTac({ ...truoc, moiGioi: 2 }, "le_phi_truoc_ba", false);
  assert.deepEqual(lenhLuu(truoc, sau), { than: { "fee.inclusion": ["personalIncomeTax", "brokerageFee"], "fee.brokerage_pct": 2 } });
  assert.deepEqual(lenhLuu(truoc, truoc), { khongDoi: true });
  // Chiều đỏ.
  assert.deepEqual(lenhLuu(truoc, { ...truoc, moiGioi: 6 }), { loi: { o: "moi_gioi", chu: LOI_MOI_GIOI } });
  assert.deepEqual(lenhLuu(truoc, { ...truoc, moiGioi: 1.25 }), { loi: { o: "moi_gioi", chu: LOI_MOI_GIOI } });
  assert.deepEqual(lenhLuu(truoc, { ...truoc, moiGioi: null }), { loi: { o: "moi_gioi", chu: LOI_MOI_GIOI } });
  let tat = truoc;
  for (const ma of ["thue_tncn", "le_phi_truoc_ba", "moi_gioi"] as const) tat = doiCongTac(tat, ma, false);
  assert.deepEqual(lenhLuu(truoc, tat), { loi: { o: "cong-tac", chu: LOI_CONG_TAC } });
});

test("thuế phí: ví dụ về tay theo định nghĩa đang sửa", () => {
  const truoc = giaTriPhi(MAC_DINH);
  assert.equal(viDu(truoc), "Giá bao phí 3 tỷ → về tay 2,895 tỷ");
  assert.equal(viDu(doiCongTac({ ...truoc, moiGioi: 2 }, "le_phi_truoc_ba", false)), "Giá bao phí 3 tỷ → về tay 2,88 tỷ");
});
