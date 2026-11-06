// Gói ô lạ (hàng 69, AC-1 phần lõi — E1): ma trận lớp × dấu khai bằng `Record<ColumnClass, …>` — thêm lớp mới vào
// `ColumnClass` thì kiểm kiểu đỏ ở đây.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { AppliedCell, AppliedRow, DecidedBy } from "../../apply";
import type { ColumnClass } from "../../classify";
import type { ImportPlan, PlanColumn, PlanTarget } from "../../plan";
import type { ColumnProfile } from "../../profile";
import type { Mark } from "../../transforms";
import { dungGoiOLa, kiemKhuonGoiOLa, MAX_O_LA } from "./goi";

const HINH = { rows: 1, blanks: 0, distinct: 1, minLength: 1, maxLength: 9, charClass: "mixed" as const, leadingZeroPct: 0, withheld: 0 };
const hoSo = (index: number, cls: ColumnClass, header = `Cột ${index}`): ColumnProfile => ({ index, header, cls, shape: HINH });
const cotKH = (i: number, target: PlanTarget): PlanColumn => ({ column: `Cột ${i}`, target, confidence: "high", reason: "từ điển" });
const o = (raw: string, mark: Mark, by: DecidedBy = "normalize", target: PlanTarget = "listPrice"): AppliedCell => ({
  column: "c",
  target,
  raw,
  mark,
  by,
  ...(mark === "needs_person" || mark === "blocked" ? { reason: `«${raw}» lý do mã` } : {}),
});
const dong = (source: number, cells: AppliedCell[]): AppliedRow => ({ source, cells, extra: {} });

// Lớp nào được mở cho ô lạ (chỉ khi dấu là needs_person).
const MO: Record<ColumnClass, boolean> = { catalog: true, shareable_listing: true, source: false, person_name: false, free_text: false, unknown: false };
const DAU: readonly Mark[] = ["keep", "fixed", "needs_person", "blocked"];

test("gói ô lạ: chỉ ô được mở", () => {
  // Một bảng: mỗi lớp một cột ghép vào trường mở (listPrice), mỗi dấu một dòng.
  const lop = Object.keys(MO) as ColumnClass[];
  const profile = lop.map((c, i) => hoSo(i, c));
  const plan: ImportPlan = { headerRow: 0, columns: lop.map((_, i) => cotKH(i, "listPrice")), questions: [] };
  const rows = DAU.map((d, r) => dong(r, lop.map((_, i) => o(`ô ${i}-${r}`, d))));
  const goi = dungGoiOLa(profile, plan, rows);
  let so = 0;
  for (const [i, cls] of lop.entries())
    for (const [r, d] of DAU.entries()) {
      const coMat = goi.o.some((x) => x.cot === i && x.giaTri === `ô ${i}-${r}`);
      assert.equal(coMat, MO[cls] && d === "needs_person", `cột lớp ${cls} × dấu ${d}`);
      so++;
    }
  assert.equal(so, 24, "6 lớp × 4 dấu");

  // Ô cần người do luật cấp dòng không vào gói.
  for (const by of ["fee_from_price", "catalog", "duplicate"] as const) {
    const g = dungGoiOLa([hoSo(0, "shareable_listing")], { headerRow: 0, columns: [cotKH(0, "listPrice")], questions: [] }, [dong(0, [o("4.6–4.8 tỷ", "needs_person", by)])]);
    assert.equal(g.o.length, 0, `luật cấp dòng ${by}`);
  }
  // Cột lớp mở mà ghép vào ghi chú hay trường riêng: không vào gói.
  for (const t of ["keep_as_note", "custom:Ghi chú sàn"] as const) {
    const g = dungGoiOLa([hoSo(0, "catalog")], { headerRow: 0, columns: [cotKH(0, t)], questions: [] }, [dong(0, [o("Toà ?", "needs_person", "normalize", t)])]);
    assert.equal(g.o.length, 0, `đích ${t}`);
  }
});

test("gói ô lạ: gộp cùng chữ, trần 300, bỏ dáng dữ liệu cá nhân, khoá và cỡ", () => {
  const profile = [hoSo(0, "shareable_listing", "Trạng thái"), hoSo(1, "shareable_listing", "TT cũ")];
  const plan: ImportPlan = { headerRow: 0, columns: [cotKH(0, "standardStatus"), cotKH(1, "standardStatus")], questions: [] };
  const muoi = Array.from({ length: 10 }, (_, r) => dong(r, [o("đang đàm phán", "needs_person", "normalize", "standardStatus"), o("x", "keep", "normalize", "standardStatus")]));
  assert.equal(dungGoiOLa(profile, plan, muoi).o.length, 1, "mười dòng cùng chữ ở một cột → một ô");
  const haiCot = [dong(0, [o("đang đàm phán", "needs_person"), o("đang đàm phán", "needs_person")])];
  assert.equal(dungGoiOLa(profile, plan, haiCot).o.length, 2, "cùng chữ ở hai cột → hai ô");

  const nhieu = Array.from({ length: 320 }, (_, r) => dong(r, [o(`ô lạ số ${String(r).padStart(3, "0")}`, "needs_person"), o("y", "keep")]));
  const g300 = dungGoiOLa(profile, plan, nhieu);
  assert.equal(g300.o.length, MAX_O_LA, "320 ô khác nhau → đúng 300");
  assert.deepEqual(g300.o.slice(0, 2).map((x) => x.giaTri), ["ô lạ số 000", "ô lạ số 001"], "theo thứ tự cột rồi dòng");

  const caNhan = dungGoiOLa(
    [hoSo(0, "shareable_listing", "Giá"), hoSo(1, "shareable_listing", "Trạng thái")],
    { headerRow: 0, columns: [cotKH(0, "listPrice"), cotKH(1, "standardStatus")], questions: [] },
    [dong(0, [o("0900 000 011", "needs_person"), o("Nguyễn Văn An", "needs_person", "normalize", "standardStatus")])],
  );
  assert.ok(!caNhan.o.some((x) => x.cot === 0), "ô số điện thoại ở cột giá không vào gói");
  assert.ok(!caNhan.o.some((x) => x.cot === 1), "ô dáng họ tên ở cột trạng thái không vào gói");
  const trongCau = dungGoiOLa(
    [hoSo(0, "shareable_listing", "Trạng thái")],
    { headerRow: 0, columns: [cotKH(0, "standardStatus")], questions: [] },
    [dong(0, [o("chủ Nguyễn Văn An giữ", "needs_person", "normalize", "standardStatus")]), dong(1, [o("chủ [Tên] giữ", "needs_person", "normalize", "standardStatus")]), dong(2, [o("giữ chỗ", "needs_person", "normalize", "standardStatus")])],
  );
  assert.deepEqual(trongCau.o.map((x) => x.giaTri), ["giữ chỗ"], "họ tên giữa câu không vào gói; đối chứng «giữ chỗ» vào");

  const mot = dungGoiOLa(profile, plan, [dong(0, [o("giữ chỗ", "needs_person", "normalize", "standardStatus"), o("y", "keep")])]).o[0]!;
  assert.deepEqual(Object.keys(mot).sort(), ["cot", "giaTri", "id", "lyDoMa", "tieuDe", "truong"], "đúng sáu khoá (cột không mang phép)");
  assert.equal(mot.lyDoMa, "«ô» lý do mã", "lyDoMa là reason của ô, bỏ đoạn chép lại chữ của ô");

  const dai = "a".repeat(190);
  const goiDai = dungGoiOLa(profile, plan, Array.from({ length: 300 }, (_, r) => dong(r, [o(`${dai}${String(r).padStart(10, "0")}`, "needs_person"), o("y", "keep")])));
  assert.ok(JSON.stringify(goiDai).length <= 96 * 1024, `gói 300 ô dài nhất ≤ 96 KB (đo ${JSON.stringify(goiDai).length})`);
});

test("khuôn gói ô lạ ở máy chủ", () => {
  const sach = { o: [{ id: "o1", cot: 0, tieuDe: "Giá", truong: "listPrice", giaTri: "thu về 4.2", lyDoMa: "về tay" }] };
  assert.ok("goi" in kiemKhuonGoiOLa(sach), "gói sạch qua khuôn");
  assert.match((kiemKhuonGoiOLa({ ...sach, la: 1 }) as { loi: string }).loi, /khoá lạ/);
  assert.match((kiemKhuonGoiOLa({ o: [{ ...sach.o[0], truong: "ownerPhone" }] }) as { loi: string }).loi, /không thuộc lớp được mở/);
  const quaTran = { o: Array.from({ length: 301 }, (_, i) => ({ ...sach.o[0], id: `o${i + 1}` })) };
  assert.match((kiemKhuonGoiOLa(quaTran) as { loi: string }).loi, /1–300/);
});
