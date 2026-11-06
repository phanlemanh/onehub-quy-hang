// Máy chủ quét lại gói (hàng 68, AC-3, E3): chặn lần hai bằng đúng bộ dò mà hồ sơ dùng để che. Dáng họ tên chỉ quét ở giá
// trị — tiêu đề viết hoa đầu không được chặn gói (phản biện P1). Đối chứng dương trên gói thật của 13 file.
import assert from "node:assert/strict";
import { test } from "node:test";
import { dungGoiDeXuat, quetGoi, type GoiDeXuat } from "@quy-hang/core/import";
import { sinhBoLa } from "../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/bo-la";
import { chay } from "../../../../core/test/import/do";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../../../core/test/import/sinh";

const HINH = { rows: 2, blanks: 0, distinct: 2, minLength: 1, maxLength: 20, charClass: "mixed" as const, leadingZeroPct: 0, withheld: 0 };
const goiMot = (tieuDe: string, giaTri: string[] | undefined): GoiDeXuat => ({ cot: [{ cot: 0, tieuDe, lop: "catalog", hinhDang: HINH, ...(giaTri && { giaTri }) }] });

test("máy chủ quét lại gói", () => {
  // Ma trận viết tay: sáu mẫu dữ liệu cá nhân × hai chỗ.
  const MAU: [string, string][] = [
    ["0900 000 011", "phone"],
    ["0900.000.011", "phone"],
    ["+84 900 000 011", "phone"],
    ["mau@example.test", "email"],
    ["012345678", "id_number"],
    ["012345678901", "id_number"],
  ];
  let so = 0;
  for (const [s, loai] of MAU) {
    for (const cho of ["tieu_de", "gia_tri"] as const) {
      const t = quetGoi(cho === "tieu_de" ? goiMot(`Liên hệ ${s}`, undefined) : goiMot("Mã căn", ["A-01.03", s]));
      assert.ok(t.some((x) => x.trung === loai && x.cho === cho), `${s} ở ${cho} phải trúng ${loai}: ${JSON.stringify(t)}`);
      so++;
    }
  }
  assert.equal(so, 12);
  assert.ok(quetGoi(goiMot("Mã căn", ["Nguyễn Văn An"])).some((x) => x.trung === "person_name" && x.cho === "gia_tri"), "dáng họ tên ở giá trị trúng");
  for (const tieuDe of ["Unit Code", "Khối Tháp"]) assert.deepEqual(quetGoi(goiMot(tieuDe, undefined)), [], `tiêu đề «${tieuDe}» không bị chặn`);
});

test("đối chứng dương: gói thật của 13 file không bị chặn", () => {
  const ctx = { today: HOM_NAY, catalog: danhMucMau() };
  for (const t of [...sinhBoThu(), ...sinhBoLa()]) {
    const r = chay(t, ctx);
    assert.deepEqual(quetGoi(dungGoiDeXuat(r.profile.columns, r.plan)), [], `${t.ten}: gói thật bị chặn`);
  }
});
