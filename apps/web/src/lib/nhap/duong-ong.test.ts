// Đường ống và ghép cột của màn Nhập Excel (hàng man-nhap-excel, E2, E3). So với đường ống thử của lõi hàng 64 trên cùng bộ
// thử; số nền đọc từ tệp, không chép số. Dữ liệu mẫu: [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { decodeText, parseCsv, type Grid, type ImportContext, type PlanTarget } from "@quy-hang/core/import";

import { chay, doTep, type SoNen } from "../../../../../packages/core/test/import/do";
import { danhMucMau, HOM_NAY, sinhBoThu } from "../../../../../packages/core/test/import/sinh";
import { chayOng, coTheTiepGhep, doiDich, loiTheoCot, mauCot } from "./duong-ong";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const SO_NEN: SoNen = JSON.parse(readFileSync(new URL("../../../../../_acceptance/nhap-loi-tat-dinh/so-nen.json", import.meta.url), "utf8"));
const luoi = (t: ReturnType<typeof sinhBoThu>[number]): Grid => t.grid ?? parseCsv(decodeText(t.bytes!));

test("đường ống: màn ra đúng dấu của lõi", () => {
  const bo = sinhBoThu();
  let so = 0;
  for (const t of bo) {
    const man = chayOng(luoi(t), CTX);
    const loi = chay(t, CTX);
    const dau = (rows: typeof man.dong) => rows.map((r) => ({ source: r.source, cells: r.cells.map((c) => [c.mark, c.reason ?? null, c.value ?? null]) }));
    assert.deepEqual(dau(man.dong), dau(loi.applied.rows), t.ten);
    so++;
  }
  assert.equal(so, bo.length);
});

test("đường ống: đếm theo dấu khớp số nền", () => {
  let canNguoi = 0;
  let tongO = 0;
  for (const t of sinhBoThu()) {
    const d = chayOng(luoi(t), CTX).dem;
    canNguoi += d.needs_person;
    tongO += d.keep + d.fixed + d.needs_person + d.blocked;
  }
  assert.deepEqual({ tu: canNguoi, mau: tongO }, SO_NEN.cong.hoiNguoi);
});

test("đường ống: ngưỡng Cổng Đáng trên tệp mẫu", () => {
  const NGUONG_CAN_NGUOI = 0.1;
  const NGUONG_LOI_LOT = 0.005;
  let so = 0;
  for (const t of sinhBoThu().filter((x) => x.ten === "mau-a" || x.ten === "mau-b")) {
    const man = chayOng(luoi(t), CTX);
    const d = man.dem;
    const tong = d.keep + d.fixed + d.needs_person + d.blocked;
    assert.ok(d.needs_person / tong <= NGUONG_CAN_NGUOI, `${t.ten}: cần người ${d.needs_person}/${tong}`);
    const soDo = doTep(t, { table: man.table, plan: man.plan, profile: { columns: man.profile }, applied: { rows: man.dong } });
    assert.ok(soDo.loiLot.tu / soDo.loiLot.mau <= NGUONG_LOI_LOT, `${t.ten}: lỗi lọt ${soDo.loiLot.tu}/${soDo.loiLot.mau}`);
    so++;
  }
  assert.equal(so, 2);
});

const LUOI_NGUON: Grid = [
  ["Toà", "Mã căn", "SĐT chủ", "Tên chủ", "Giá đáy", "Giá"],
  ["Toà A", "A-01.01", "0900 000 001", "[Tên chủ một]", 3100000000, "3,2 tỷ"],
  ["Toà A", "A-01.02", "0900 000 002", "[Tên chủ hai]", 3300000000, "3,5 tỷ"],
];
const NGUON: [number, string, PlanTarget][] = [
  [2, "SĐT chủ", "ownerPhone"],
  [3, "Tên chủ", "ownerName"],
  [4, "Giá đáy", "floorPrice"],
];

test("ghép cột: cột nguồn sang trường ngoài lớp nguồn bị chặn", () => {
  const goc = chayOng(LUOI_NGUON, CTX);
  assert.ok(coTheTiepGhep(goc), "kế hoạch từ điển của lưới nguồn phải hợp lệ");
  let so = 0;
  for (const [cot, ten, dung] of NGUON) {
    for (const sai of ["privateRemarks", "keep_as_note", "listPrice"] as PlanTarget[]) {
      const o = doiDich(goc, cot, sai, CTX);
      const loi = loiTheoCot(o.loi).get(cot) ?? "";
      assert.ok(loi.includes(ten) && !coTheTiepGhep(o), `${ten} → ${sai}: «${loi}»`);
      so++;
    }
    for (const dungDich of [dung, "ignore_with_reason"] as PlanTarget[]) {
      const o = doiDich(goc, cot, dungDich, CTX);
      assert.ok(!loiTheoCot(o.loi).has(cot) && coTheTiepGhep(o), `${ten} → ${dungDich}`);
      so++;
    }
  }
  assert.equal(so, 15);
});

test("ghép cột: ô mẫu cột nguồn chỉ hình dạng", () => {
  const o = chayOng(LUOI_NGUON, CTX);
  const HINH: Record<number, string> = { 2: "chữ số · 12 ký tự", 3: "chữ · 13 ký tự", 4: "chữ số · 10 ký tự" };
  for (const [cot] of NGUON) {
    const mau = mauCot(o.profile[cot]!);
    for (const r of LUOI_NGUON.slice(1)) assert.ok(!mau.includes(String(r[cot])), `mẫu cột ${cot} lộ «${r[cot]}»`);
    assert.ok(!mau.includes("0900 000 0"));
    assert.equal(mau, HINH[cot]);
  }
  // Đối chứng: cột danh mục hiện giá trị thật.
  assert.equal(mauCot(o.profile[1]!), "A-01.01");
});
