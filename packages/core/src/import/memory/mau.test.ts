// Bộ nhớ mẫu file (hàng 67, E1 E2 E3 E11). Kế hoạch «đã nhớ» sinh bằng đường thật (planFromDictionary trên tệp của bộ thử
// hàng 64, rồi đổi đích như màn đổi), không viết tay khuôn bên đọc. Dữ liệu mẫu: [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { test } from "node:test";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../../test/import/sinh";
import { readTable, type Grid, type Table } from "../grid";
import { planFromDictionary, type ImportPlan, type PlanTarget } from "../plan";
import type { ImportContext } from "../transforms";
import { apMau, doMau, khoaMau, LY_DO_NGUOI_CHON, LY_DO_THEO_MAU, taoMau, type CotMau } from "./mau";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const boThu = sinhBoThu();
const luoi = (ten: string): Grid => boThu.find((t) => t.ten === ten)!.grid!;

/** Đổi đích một cột như bước ghép cột của màn đổi. */
function doi(plan: ImportPlan, header: string, target: PlanTarget): ImportPlan {
  return { ...plan, columns: plan.columns.map((c) => (c.column === header ? { column: c.column, target, confidence: "high" as const, reason: LY_DO_NGUOI_CHON } : c)) };
}

/** Đảo thứ tự cột của một lưới (giữ dòng tiêu đề ở đầu). */
function dao(g: Grid): Grid {
  return g.map((r) => [...r].reverse());
}

function keHoachNho(ten: "mau-a" | "mau-b"): { table: Table; plan: ImportPlan } {
  const table = readTable(luoi(ten));
  let plan = planFromDictionary(table);
  const tt = ten === "mau-a" ? "TT" : "Trạng thái";
  plan = doi(plan, "Ghi chú", "keep_as_note");
  plan = doi(plan, "Nhãn", "privateRemarks");
  plan = { ...plan, columns: plan.columns.map((c) => (c.column === tt ? { ...c, valueMap: { "đã cọc rồi": "Đã cọc" } } : c)) };
  return { table, plan };
}

test("nhớ mẫu: tiêu đề đã gặp lấy đúng kế hoạch đã nhớ", () => {
  for (const ten of ["mau-a", "mau-b"] as const) {
    const { table, plan } = keHoachNho(ten);
    const mau = taoMau(plan, table.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
    const moi = readTable(dao(luoi(ten)));
    const kq = apMau(moi, mau, CTX);
    let so = 0;
    moi.headers.forEach((h, i) => {
      const goc = plan.columns[table.headers.indexOf(h)]!;
      const cot = kq.plan.columns[i]!;
      assert.deepEqual({ target: cot.target, transform: cot.transform, valueMap: cot.valueMap }, { target: goc.target, transform: goc.transform, valueMap: goc.valueMap }, `${ten} · cột «${h}»`);
      assert.ok(cot.reason.startsWith(LY_DO_THEO_MAU), `${ten} · cột «${h}» không theo mẫu: ${cot.reason}`);
      so++;
    });
    assert.equal(so, table.headers.length);
  }
});

test("nhớ mẫu: cột mới đi từ điển", () => {
  const { table, plan } = keHoachNho("mau-a");
  const mau = taoMau(plan, table.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
  const g = luoi("mau-a").map((r, i) => [...r, i === 0 ? "Hướng ban công" : "Đông", i === 0 ? "Cột lạ" : "x"]);
  const moi = readTable(g);
  const kq = apMau(moi, mau, CTX);
  const tuDien = planFromDictionary(moi);
  for (const h of ["Hướng ban công", "Cột lạ"]) {
    const i = moi.headers.indexOf(h);
    assert.deepEqual(kq.plan.columns[i], tuDien.columns[i], h);
    assert.ok(!kq.plan.columns[i]!.reason.startsWith(LY_DO_THEO_MAU), h);
  }
});

test("nhớ mẫu: lần mới nhất thắng", () => {
  const table = readTable(luoi("mau-a"));
  const tuDien = planFromDictionary(table);
  const cu = taoMau(doi(tuDien, "Nhãn", "custom:Nhãn cũ"), table.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
  const moi = taoMau(doi(tuDien, "Nhãn", "custom:Nhãn mới"), table.headers, { importId: "lan-2", at: "2026-11-03T00:00:00Z" });
  const i = table.headers.indexOf("Nhãn");
  assert.equal(apMau(table, [...cu, ...moi], CTX).plan.columns[i]!.target, "custom:Nhãn mới");
  assert.equal(apMau(table, [...moi, ...cu], CTX).plan.columns[i]!.target, "custom:Nhãn mới");
});

test("nhớ mẫu: cột không hợp lệ về từ điển", () => {
  const a = readTable(luoi("mau-a"));
  const mauA = taoMau(planFromDictionary(a), a.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
  const giaI = a.headers.indexOf("Giá (tỷ)");
  assert.equal(mauA.find((c) => c.headerKey === khoaMau("Giá (tỷ)"))!.transform?.name, "price");
  // Cột «Giá (tỷ)» toàn chữ: phép giá đã nhớ đọc không được.
  const g = luoi("mau-a").map((r, i) => r.map((c, j) => (i > 0 && j === giaI ? (i % 2 ? "liên hệ" : "thoả thuận") : c)));
  const moi = readTable(g);
  const kq = apMau(moi, mauA, CTX);
  assert.deepEqual(validate(kq.plan, moi), []);
  assert.deepEqual({ ...kq.plan.columns[giaI], reason: "" }, { ...planFromDictionary(moi).columns[giaI], reason: "" });
  assert.match(kq.plan.columns[giaI]!.reason, /mẫu không còn hợp lệ/);
  moi.headers.forEach((h, i) => i !== giaI && assert.ok(kq.plan.columns[i]!.reason.startsWith(LY_DO_THEO_MAU), h));

  // Ma trận ba lý do vô hiệu × một cột mỗi lý do.
  const t = readTable([
    ["Mã căn", "Giá", "Ghi chú", "SĐT chủ"],
    ["A-01.01", "liên hệ", "căn góc", "0900 000 012"],
    ["A-01.02", "thoả thuận", "view hồ", "0900 000 013"],
  ]);
  const at = "2026-11-02T00:00:00Z";
  const mauLoi: CotMau[] = [
    { headerKey: khoaMau("Giá"), target: "listPrice", transform: { name: "price", params: { unit: "ty" } }, importId: "x", at },
    { headerKey: khoaMau("Ghi chú"), target: "ownerPhone", importId: "x", at },
    { headerKey: khoaMau("SĐT chủ"), target: "ownerPhone", valueMap: { "0900 000 012": "0900 000 099" }, importId: "x", at },
  ];
  const kqLoi = apMau(t, mauLoi, CTX);
  for (const h of ["Giá", "Ghi chú", "SĐT chủ"]) assert.ok(!kqLoi.plan.columns[t.headers.indexOf(h)]!.reason.startsWith(LY_DO_THEO_MAU), `«${h}» phải về từ điển`);
  // Đối chứng dương: cùng ba cột, mẫu hợp lệ.
  const tot = readTable([
    ["Mã căn", "Giá", "Ghi chú", "SĐT chủ"],
    ["A-01.01", 3.2, "căn góc", "0900 000 012"],
    ["A-01.02", 3.5, "view hồ", "0900 000 013"],
  ]);
  const mauTot: CotMau[] = [
    { headerKey: khoaMau("Giá"), target: "listPrice", transform: { name: "price", params: { unit: "ty" } }, importId: "x", at },
    { headerKey: khoaMau("Ghi chú"), target: "keep_as_note", importId: "x", at },
    { headerKey: khoaMau("SĐT chủ"), target: "ownerPhone", importId: "x", at },
  ];
  const kqTot = apMau(tot, mauTot, CTX);
  for (const h of ["Giá", "Ghi chú", "SĐT chủ"]) assert.ok(kqTot.plan.columns[tot.headers.indexOf(h)]!.reason.startsWith(LY_DO_THEO_MAU), `«${h}» phải theo mẫu`);
});

import { validatePlan } from "../plan";
const validate = (p: ImportPlan, t: Table) => validatePlan(p, t);

test("nhớ mẫu: mẫu không mang giá trị nguồn, tên người", () => {
  const t = readTable([
    ["SĐT chủ", "Tên chủ", "Giá đáy", "Đầu chủ", "Trạng thái"],
    ["0900000012", "[Tên chủ mẫu]", 3100000000, "[Tên đầu chủ mẫu]", "đã cọc rồi"],
    ["0900 000 013", "[Tên chủ mẫu]", 3200000000, "[Tên đầu chủ mẫu]", "Còn"],
  ]);
  const tuDien = planFromDictionary(t);
  const plan: ImportPlan = {
    ...tuDien,
    columns: tuDien.columns.map((c) =>
      c.column === "Trạng thái"
        ? { ...c, valueMap: { "đã cọc rồi": "Đã cọc" } }
        : // Chèn thẳng (đi vòng validatePlan) bảng quy đổi mang giá trị mồi vào mọi cột không được nhớ.
          { ...c, valueMap: { [String(t.rows[0]!.cells[t.headers.indexOf(c.column)])]: "[Tên]" } },
    ),
  };
  const mau = taoMau(plan, t.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
  assert.equal(tuDien.columns[t.headers.indexOf("Đầu chủ")]!.target, "listAgentName");
  for (const h of ["SĐT chủ", "Tên chủ", "Giá đáy", "Đầu chủ"]) {
    const c = mau.find((m) => m.headerKey === khoaMau(h))!;
    assert.ok(!("valueMap" in c), `«${h}» không được mang bảng quy đổi`);
  }
  assert.deepEqual(mau.find((m) => m.headerKey === khoaMau("Trạng thái"))!.valueMap, { "đã cọc rồi": "Đã cọc" });
  const chu = JSON.stringify(mau);
  for (const v of ["0900000012", "0900 000 013", "[Tên chủ mẫu]", "[Tên đầu chủ mẫu]", "3100000000", "3200000000"]) assert.ok(!chu.includes(v), `mẫu chứa «${v}»`);
});

test("đo mẫu: ba số từ kế hoạch đã lưu", () => {
  const table = readTable(luoi("mau-a"));
  const tuDien = planFromDictionary(table);
  const mau = taoMau(tuDien, table.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
  const toan = apMau(table, mau, CTX).plan;
  const motPhan = doi(apMau(table, mau.slice(0, 5), CTX).plan, "Nhãn", "custom:Nhãn");
  const n = table.headers.length;
  assert.deepEqual(doMau(toan), { theoMau: n, nguoiDoi: 0, tong: n });
  assert.deepEqual(doMau(motPhan), { theoMau: 5, nguoiDoi: 1, tong: n });
  assert.deepEqual(doMau(tuDien), { theoMau: 0, nguoiDoi: 0, tong: n });
  assert.equal(doMau.length, 1);
});

// Ngoài-4 của hàng 67 (hàng 66 nhap-hoan-tac, AC-10, E10): cột theo mẫu và cột theo từ điển cùng đích — ở cả hai thứ tự.
test("nhớ mẫu: hai cột không cùng đích ở cả hai thứ tự", () => {
  // Mẫu sinh bằng đường thật: lần trước người đổi cột «Cột X» (từ điển không nhận ra) thành listPrice.
  const truoc = readTable([["Toà", "Mã căn", "Cột X"], ["Toà A", "A-01.01", "3 tỷ"]]);
  const tuDienTruoc = planFromDictionary(truoc);
  assert.notEqual(tuDienTruoc.columns[2]!.target, "listPrice", "tiền đề: từ điển không nhận «Cột X» là giá");
  const mau = taoMau(doi(tuDienTruoc, "Cột X", "listPrice"), truoc.headers, { importId: "lan-1", at: "2026-11-01T00:00:00Z" });
  let dem = 0;
  for (const [thuTu, tieuDe] of [
    ["mẫu trước", ["Toà", "Mã căn", "Cột X", "Giá"]],
    ["từ điển trước", ["Toà", "Mã căn", "Giá", "Cột X"]],
  ] as const) {
    const table = readTable([[...tieuDe], ["Toà A", "A-01.01", "3 tỷ", "3,1 tỷ"]]);
    const { plan } = apMau(table, mau, CTX);
    const iMau = tieuDe.indexOf("Cột X");
    const iTuDien = tieuDe.indexOf("Giá");
    assert.equal(plan.columns[iMau]!.target, "listPrice", `${thuTu}: cột theo mẫu giữ đích`);
    assert.ok(plan.columns[iMau]!.reason.startsWith(LY_DO_THEO_MAU), `${thuTu}: cột theo mẫu mang nhãn theo mẫu`);
    assert.equal(plan.columns[iTuDien]!.target, "keep_as_note", `${thuTu}: cột từ điển trùng đích về chưa rõ`);
    assert.equal(plan.columns[iTuDien]!.confidence, "low", `${thuTu}: cột trùng đích cần người chọn`);
    assert.ok(plan.questions.some((q) => q.includes("trùng đích với cột theo mẫu «Cột X»")), `${thuTu}: câu hỏi trùng đích`);
    assert.deepEqual(validatePlan(plan, table), [], `${thuTu}: kế hoạch hợp lệ`);
    assert.equal(plan.columns.filter((c) => c.target === "listPrice").length, 1, `${thuTu}: một cột giá`);
    dem += 6;
  }
  const chiMau = apMau(readTable([["Toà", "Mã căn", "Cột X"], ["Toà A", "A-01.01", "3 tỷ"]]), mau, CTX).plan;
  assert.ok(!chiMau.questions.some((q) => q.includes("trùng đích")), "đối chứng: không cột trùng thì không câu hỏi trùng");
  dem++;
  assert.equal(dem, 13);
});
