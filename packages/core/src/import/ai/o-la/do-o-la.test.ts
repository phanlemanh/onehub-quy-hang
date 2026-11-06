// Số đo ô lạ (hàng 69, AC-8 — E8): bộ ô lạ có đáp án, đề xuất ghi sẵn khớp gói và lời nhắc, năm số so ngưỡng.
import assert from "node:assert/strict";
import { test } from "node:test";
import { O_LA } from "../../../../../../_acceptance/nhap-o-la/thu/bo-o-la";
import { chuanBi, datNguongOLa, MO_HINH_DO } from "../../../../../../_acceptance/nhap-o-la/thu/do-o-la";
import { docTep, lapBoi, soDoTatCa } from "../../../../../../_acceptance/nhap-o-la/thu/lap-de-xuat";
import soDoDaGhi from "../../../../../../_acceptance/nhap-o-la/so-do-o-la.json" with { type: "json" };
import { bamJson } from "../goi";
import { bamLoiNhacOLa, LOI_NHAC_O_LA } from "./loi-nhac";

/** Mô hình của đường ô lạ — cùng hằng với máy chủ (packages/api/src/imports/ai/claude.ts, Hỏi-1). */
const MO_HINH_O_LA = "claude-opus-5-5";

test("bộ ô lạ có đủ bốn nhóm", () => {
  for (const [nhom, it] of [["dai", 8], ["ve-tay", 8], ["trang-thai", 8], ["doi-chung", 4]] as const)
    assert.ok(O_LA.filter((o) => o.nhom === nhom).length >= it, `nhóm ${nhom} cần ≥ ${it} ô`);
  const { ap } = chuanBi();
  const sai = O_LA.filter((o) => !ap.rows.some((r) => r.cells.some((c) => c.raw === o.chu && c.mark === "needs_person" && c.by === "normalize")));
  assert.deepEqual(sai.map((o) => o.chu), [], "mọi ô của bộ ra «cần người» do bộ chuẩn hoá");
});

test("đề xuất ghi sẵn khớp gói và lời nhắc", async () => {
  const { goi } = chuanBi();
  const bamGoi = await bamJson(goi);
  const bamLn = await bamLoiNhacOLa();
  for (const m of MO_HINH_DO) {
    const t = docTep(m);
    assert.equal(t.bamGoi, bamGoi, `${m}: gói đổi — ghi lại đề xuất`);
    assert.equal(t.bamLoiNhac, bamLn, `${m}: lời nhắc đổi — ghi lại đề xuất`);
    assert.equal(t.lapBoi, lapBoi(m), `${m}: dấu lập`);
  }
  const doi = await bamJson(`${LOI_NHAC_O_LA}.`);
  assert.notEqual(doi, docTep(MO_HINH_O_LA).bamLoiNhac, "lời nhắc đổi — ghi lại đề xuất");
});

test("số đo ô lạ", () => {
  const tinh = soDoTatCa();
  assert.deepEqual(tinh, soDoDaGhi, "số đo tính lại khác so-do-o-la.json đã commit");
  assert.equal(MO_HINH_O_LA, "claude-opus-5-5", "Hỏi-1: đường ô lạ dùng Opus 5.5");
  const so = tinh.mo_hinh[MO_HINH_O_LA]!;
  assert.ok(so.phu >= 0.9, `phủ ${so.phu}`);
  assert.ok(so.dung >= 0.95, `đúng ${so.dung}`);
  assert.equal(so.bia, 0, "bịa");
  assert.equal(so.tuGhi, 0, "tự ghi");
  assert.equal(so.roNguon, 0, "rò nguồn");
  for (const m of MO_HINH_DO) for (const k of ["phu", "dung", "bia", "tuGhi", "roNguon"] as const) assert.equal(typeof tinh.mo_hinh[m]![k], "number", `${m}.${k}`);
  // Ca dưới ngưỡng.
  const DAT = { phu: 0.9, dung: 0.95, bia: 0, tuGhi: 0, roNguon: 0 };
  assert.deepEqual(datNguongOLa(DAT), [], "đối chứng: đúng ngưỡng là đạt");
  assert.deepEqual(datNguongOLa({ ...DAT, phu: 0.89 }), ["phủ 0.89 < 0.9"]);
  assert.deepEqual(datNguongOLa({ ...DAT, dung: 0.94 }), ["đúng 0.94 < 0.95"]);
  assert.deepEqual(datNguongOLa({ ...DAT, bia: 1 }), ["bịa 1 > 0"]);
});
