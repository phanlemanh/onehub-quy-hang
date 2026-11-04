// Hằng số mặc định lấy số từ sổ (hàng 81: AC-9). Bảng mười dòng; chiều đỏ là cùng hàm trên bản sao sổ đổi một mặc định.
import assert from "node:assert/strict";
import { test } from "node:test";
import { bangHangSo, soHangSo } from "./hang-so";
import { SO_DIEM } from "./so";

test("hằng số mặc định lấy số từ sổ", () => {
  const bang = bangHangSo();
  assert.equal(bang.length, 10);
  for (const r of bang) assert.deepEqual(r.ma, r.so, `${r.hang} ↔ ${r.khoa}`);
  assert.deepEqual(soHangSo(), []);

  const banSao = SO_DIEM.map((d) => (d.khoa === "price.change_confirm_pct" ? { ...d, macDinh: 25 } : d));
  const lech = soHangSo(banSao);
  assert.equal(lech.length, 1, JSON.stringify(lech));
  assert.ok(lech[0]!.includes("MUC_HOI_LAI_DOI_GIA_PHAN_TRAM") && lech[0]!.includes("price.change_confirm_pct"), lech[0]);
});
