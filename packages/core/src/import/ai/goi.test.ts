// Gói đề xuất theo lớp (hàng 68, AC-2 phần lõi; phản biện P2): ma trận khai bằng `Record<ColumnClass, …>` — thêm lớp mới
// vào `ColumnClass` thì kiểm kiểu đỏ ở đây, không thể quên một ô.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { ColumnClass } from "../classify";
import type { ImportPlan, PlanColumn } from "../plan";
import type { ColumnProfile } from "../profile";
import { bamGoi, dungGoiDeXuat, kiemKhuonGoi } from "./goi";

const HINH = { rows: 2, blanks: 0, distinct: 1, minLength: 5, maxLength: 5, charClass: "letters" as const, leadingZeroPct: 0, withheld: 0 };
const cotHoSo = (index: number, cls: ColumnClass): ColumnProfile => ({ index, header: `Cột ${index}`, cls, shape: HINH, values: ["Toà A"] });
const cotKeHoach = (i: number, chuaGhep: boolean): PlanColumn =>
  chuaGhep ? { column: `Cột ${i}`, target: "keep_as_note", confidence: "low", reason: "chưa biết" } : { column: `Cột ${i}`, target: "buildingName", confidence: "high", reason: "từ điển" };

// true = cột chưa ghép mang giá trị; false = không mang.
const MA_TRAN: Record<ColumnClass, { chuaGhep: boolean; daGhep: boolean }> = {
  catalog: { chuaGhep: true, daGhep: false },
  shareable_listing: { chuaGhep: true, daGhep: false },
  source: { chuaGhep: false, daGhep: false },
  person_name: { chuaGhep: false, daGhep: false },
  free_text: { chuaGhep: false, daGhep: false },
  unknown: { chuaGhep: false, daGhep: false },
};

test("gói theo lớp: chỉ cột chưa ghép lớp mở mang giá trị", () => {
  let so = 0;
  for (const [cls, mong] of Object.entries(MA_TRAN) as [ColumnClass, { chuaGhep: boolean; daGhep: boolean }][]) {
    for (const chuaGhep of [true, false]) {
      const plan: ImportPlan = { headerRow: 0, columns: [cotKeHoach(0, chuaGhep)], questions: [] };
      const c = dungGoiDeXuat([cotHoSo(0, cls)], plan).cot[0]!;
      assert.equal("giaTri" in c, chuaGhep ? mong.chuaGhep : mong.daGhep, `${cls} × ${chuaGhep ? "chưa ghép" : "đã ghép"}`);
      if (!chuaGhep) assert.equal(c.dich, "buildingName", `${cls}: cột đã ghép mang đích`);
      so++;
    }
  }
  assert.equal(so, 12, "6 lớp × 2 tình trạng");
});

test("gói: tiêu đề trống hay trùng vẫn theo chỉ số cột; khuôn máy chủ nhận gói thật", async () => {
  const profile = [cotHoSo(0, "catalog"), { ...cotHoSo(1, "catalog"), header: "Cột 0" }, { ...cotHoSo(2, "unknown"), header: "" }];
  const plan: ImportPlan = { headerRow: 0, columns: [0, 1, 2].map((i) => cotKeHoach(i, true)), questions: [] };
  const goi = dungGoiDeXuat(profile, plan);
  assert.deepEqual(goi.cot.map((c) => c.cot), [0, 1, 2]);
  assert.ok("goi" in kiemKhuonGoi(goi), "khuôn nhận gói do mã dựng");
  assert.match(await bamGoi(goi), /^[0-9a-f]{64}$/);
  assert.equal(await bamGoi(goi), await bamGoi(structuredClone(goi)), "băm tất định");
});

test("khuôn máy chủ: từ chối khoá lạ, giá trị ở cột sai lớp, cột đã ghép mang giá trị", () => {
  const plan: ImportPlan = { headerRow: 0, columns: [cotKeHoach(0, true)], questions: [] };
  const goi = dungGoiDeXuat([cotHoSo(0, "catalog")], plan);
  const CA: [string, unknown, RegExp][] = [
    ["khoá lạ ở gốc", { ...goi, them: 1 }, /khoá lạ/],
    ["khoá lạ ở cột", { cot: [{ ...goi.cot[0], them: 1 }] }, /khoá lạ/],
    ["giá trị ở cột lớp nguồn", { cot: [{ ...goi.cot[0], lop: "source" }] }, /không được mang giá trị/],
    ["giá trị ở cột tên người", { cot: [{ ...goi.cot[0], lop: "person_name" }] }, /không được mang giá trị/],
    ["cột đã ghép mang giá trị", { cot: [{ ...goi.cot[0], dich: "buildingName" }] }, /đã ghép không mang giá trị/],
    ["hình dạng có khoá lạ", { cot: [{ ...goi.cot[0], hinhDang: { ...HINH, mau: "x" } }] }, /khoá lạ/],
  ];
  for (const [ten, v, re] of CA) {
    const r = kiemKhuonGoi(v);
    assert.ok("loi" in r && re.test(r.loi), `${ten}: ${JSON.stringify(r)}`);
  }
});

test("khuôn máy chủ: khoá kế thừa của Object không lọt (lop, hinhDang) — gói đi qua JSON như thân lời gọi", () => {
  const plan: ImportPlan = { headerRow: 0, columns: [cotKeHoach(0, true)], questions: [] };
  const goi = dungGoiDeXuat([cotHoSo(0, "catalog")], plan);
  // Đối chứng dương: cùng gói qua JSON vẫn được nhận — ca đỏ dưới đây đỏ vì khoá kế thừa, không vì đường JSON.
  assert.ok("goi" in kiemKhuonGoi(JSON.parse(JSON.stringify(goi))), "gói thật qua JSON được nhận");
  const KE_THUA = ["toString", "constructor", "valueOf", "hasOwnProperty", "__proto__"];
  for (const k of KE_THUA) {
    const lop = JSON.parse(JSON.stringify({ cot: [{ ...goi.cot[0], lop: k, giaTri: undefined }] }));
    const r1 = kiemKhuonGoi(lop);
    assert.ok("loi" in r1 && /lop lạ/.test(r1.loi), `lop «${k}» bị từ chối: ${JSON.stringify(r1)}`);
    // Thân JSON thô: «__proto__» thành khoá riêng của đối tượng khi JSON.parse, như máy chủ nhận.
    const tho = JSON.stringify({ cot: [{ ...goi.cot[0], giaTri: undefined }] }).replace('"hinhDang":{', `"hinhDang":{"${k}":"0900 000 001 [Tên]",`);
    const r2 = kiemKhuonGoi(JSON.parse(tho));
    assert.ok("loi" in r2 && /hinhDang có khoá lạ/.test(r2.loi), `hinhDang.${k} bị từ chối: ${JSON.stringify(r2)}`);
  }
});
