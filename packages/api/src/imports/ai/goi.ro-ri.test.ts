// Bộ kiểm rò nguồn ra AI (hàng 68, AC-2, E2; ADR-0011: «kiểm bắt buộc như bộ kiểm cách ly»): gói đề xuất — thứ duy nhất
// rời Quỹ hàng sang nhà cung cấp AI — dựng bằng đúng mã trình duyệt dùng, trên mọi file của bộ thử hàng 64 (gồm
// ban-nguon-giau) và bộ file lạ hàng 68, không được chứa chuỗi cấm nào của đáp án (nguồn, dữ liệu cá nhân, mọi dạng viết).
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildProfile, classifyColumns, dungGoiDeXuat, planFromDictionary, readTable, type Grid } from "@quy-hang/core/import";
import { sinhBoLa } from "../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/bo-la";
import { chay } from "../../../../core/test/import/do";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../../../core/test/import/sinh";

const goiCua = (grid: Grid) => {
  const table = readTable(grid);
  return dungGoiDeXuat(buildProfile(table, classifyColumns(table)).columns, planFromDictionary(table));
};

test("gói đề xuất không chứa chuỗi cấm", () => {
  const ctx = { today: HOM_NAY, catalog: danhMucMau() };
  const tep = [...sinhBoThu(), ...sinhBoLa()];
  assert.equal(tep.length, 13, "9 file bộ thử hàng 64 + 4 file lạ");
  for (const t of tep) {
    const r = chay(t, ctx);
    const goi = JSON.stringify(dungGoiDeXuat(r.profile.columns, r.plan));
    const trung = t.dapAn.camLo.filter((s) => goi.includes(s));
    assert.deepEqual(trung, [], `${t.ten}: gói chứa chuỗi cấm ${JSON.stringify(trung)}`);
  }
});

test("mồi rò: số chủ trong ghi chú và cột không tiêu đề chứa số +84 không ra gói", () => {
  // Cột «Ký hiệu» (danh mục, ngoài từ điển) là đối chứng dương trên CÙNG gói: giá trị được phép phải có mặt.
  const grid: Grid = [
    ["Mã căn", "Toà", "Giá (tỷ)", "Ghi chú", "", "Ký hiệu"],
    ["A-01.03", "Toà A", 4.65, "chủ [Tên] 0900 000 011", "+84 90 000 0012", "B-02.01"],
    ["A-01.05", "Toà A", 5.1, "xem nhà sau 18 giờ", "+84 90 000 0013", "B-02.03"],
  ];
  const goi = JSON.stringify(goiCua(grid));
  for (const s of ["0900 000 011", "0900000011", "+84 90 000 0012", "90 000 0012", "[Tên]"]) assert.ok(!goi.includes(s), `gói chứa «${s}»`);
  for (const s of ["Ghi chú", "Ký hiệu", "B-02.01", "B-02.03"]) assert.ok(goi.includes(s), `gói thiếu «${s}» — đối chứng dương: gói không rỗng giá trị`);
});
