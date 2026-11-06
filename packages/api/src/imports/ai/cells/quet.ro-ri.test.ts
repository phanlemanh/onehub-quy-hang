// Máy chủ quét lại gói ô lạ (hàng 69, AC-2, E2b): ma trận viết tay sáu mẫu dữ liệu cá nhân × ba chỗ, dáng họ tên chỉ ở giá
// trị, đối chứng dương trên gói thật của bộ ô lạ.
import assert from "node:assert/strict";
import { test } from "node:test";
import { quetGoiOLa, type OLa } from "@quy-hang/core/import";
import { chuanBi } from "../../../../../../_acceptance/nhap-o-la/thu/do-o-la";

const O: OLa = { id: "o1", cot: 2, tieuDe: "Trạng thái", truong: "standardStatus", giaTri: "giữ chỗ", lyDoMa: "«ô» không phải trạng thái đã biết" };
const MAU = ["0900 000 011", "0900.000.011", "+84 900 000 011", "chu.nha@example.com", "012345678", "012345678901"];

test("máy chủ quét lại gói ô lạ", () => {
  let so = 0;
  for (const m of MAU)
    for (const [cho, khoa] of [["tieu_de", "tieuDe"], ["gia_tri", "giaTri"], ["ly_do", "lyDoMa"]] as const) {
      const t = quetGoiOLa({ o: [{ ...O, [khoa]: `x ${m}` }] });
      assert.ok(t.some((x) => x.cho === cho && x.trung !== "person_name"), `«${m}» ở ${cho} không trúng`);
      so++;
    }
  assert.equal(so, 18, "6 mẫu × 3 chỗ");
  assert.ok(quetGoiOLa({ o: [{ ...O, giaTri: "Nguyễn Văn An" }] }).some((x) => x.trung === "person_name"), "dáng họ tên ở giá trị");
  assert.deepEqual(quetGoiOLa({ o: [{ ...O, tieuDe: "Trạng Thái" }] }), [], "dáng họ tên ở tiêu đề không trúng");
  assert.deepEqual(quetGoiOLa(chuanBi().goi), [], "gói thật của bộ ô lạ không trúng");
});
