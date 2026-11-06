// Số đo ô lạ (hàng 69, AC-8 — E8): bộ ô lạ có đáp án, đề xuất ghi sẵn khớp gói và lời nhắc, năm số so ngưỡng.
import assert from "node:assert/strict";
import { test } from "node:test";
import { O_LA } from "../../../../../../_acceptance/nhap-o-la/thu/bo-o-la";
import { chuanBi, datNguongOLa, MO_HINH_DO, tinhSoDoOLa } from "../../../../../../_acceptance/nhap-o-la/thu/do-o-la";
import { docTep, lapBoi, soDoTatCa } from "../../../../../../_acceptance/nhap-o-la/thu/lap-de-xuat";
import soDoDaGhi from "../../../../../../_acceptance/nhap-o-la/so-do-o-la.json" with { type: "json" };
import { bamJson } from "../goi";
import { hoiOLa } from "../../../../../../apps/web/src/lib/nhap/o-la";
import { bamLoiNhacOLa, LOI_NHAC_O_LA, MO_HINH_O_LA } from "./loi-nhac";

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

test("số đo ô lạ", async () => {
  const tinh = await soDoTatCa();
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
  // Đối chứng dương của «tự ghi»: đường nhận của màn mà tự áp đề xuất vào ô (gọi hoiOLa thật rồi ghi đè ô) thì số ra 1.
  const { goi } = chuanBi();
  const tuAp = await tinhSoDoOLa(goi, docTep(MO_HINH_O_LA).dauRa, async (ong, hoi, tt) => {
    const sau = await hoiOLa(ong, hoi, tt);
    const c = ong.dong.flatMap((d) => d.cells).find((x) => x.mark === "needs_person" && x.by === "normalize")!;
    Object.assign(c, { mark: "keep" });
    return sau;
  });
  assert.equal(tuAp.tuGhi, 1, "đường nhận tự áp mà số tự ghi vẫn 0");
  assert.deepEqual(datNguongOLa(tuAp).filter((x) => x.startsWith("tự ghi")), ["tự ghi 1 > 0"]);
  // Đối chứng âm: đường nhận không nhận gì thì bài đo không được im lặng báo 0.
  await assert.rejects(tinhSoDoOLa(goi, docTep(MO_HINH_O_LA).dauRa, async (_o, _h, tt) => tt), /không đo được/);
});
