// Số đo có tác tử trên bảng kiểu lạ (hàng 68, AC-1, E1). Đề xuất ghi sẵn nằm ở hồ sơ, lập bởi tác tử context sạch chỉ đọc
// gói đã che và lời nhắc của mã; bài này chứng đề xuất khớp đúng gói và lời nhắc đang có, rồi tính lại số đo và so ngưỡng
// Kiến trúc «Nhập dữ liệu» §9 — và so với số nền của hàng 64 trên bộ thử của nó.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { sinhBoLa, TIEU_DE_LA, tieuDeDaBiet } from "../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/bo-la";
import { docDeXuat, SO_DO_URL, tinhSoDoTacTu } from "../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/do-tac-tu";
import { boDo, KHONG_GOI, LAP_BOI } from "../../../../../_acceptance/nhap-tac-tu-ke-hoach/thu/lap-de-xuat";
import type { SoNen } from "../../../test/import/do";
import { bamGoi, cotChuaGhep } from "./goi";
import { bamLoiNhac } from "./loi-nhac";
import { quetGoi } from "./quet";

const SO_NEN: SoNen = JSON.parse(readFileSync(new URL("../../../../../_acceptance/nhap-loi-tat-dinh/so-nen.json", import.meta.url), "utf8"));
const ti = (x: { tu: number; mau: number }) => (x.mau ? x.tu / x.mau : 0);

test("bộ lạ: mọi tiêu đề ngoài từ điển", () => {
  assert.deepEqual(tieuDeDaBiet(), []);
  const goc = TIEU_DE_LA["la-a-dong-nghia"]!.tieuDe;
  goc.push("Mã căn");
  try {
    assert.deepEqual(tieuDeDaBiet(), ["Mã căn"], "đối chứng: tiêu đề đã biết bị bắt");
  } finally {
    goc.pop();
  }
  assert.equal(sinhBoLa().length, 4);
});

test("đề xuất ghi sẵn khớp gói và lời nhắc", async () => {
  const dx = docDeXuat();
  const bamLn = await bamLoiNhac();
  const bo = boDo();
  assert.equal(bo.length, 13);
  for (const { t, goi } of bo) {
    const bam = await bamGoi(goi);
    const tep = dx.get(bam);
    assert.ok(tep, `${t.ten}: gói đổi — ghi lại đề xuất`);
    assert.equal(tep.bamLoiNhac, bamLn, `${t.ten}: lời nhắc đổi — ghi lại đề xuất`);
    assert.equal(tep.lapBoi, cotChuaGhep(goi).length ? LAP_BOI : KHONG_GOI, `${t.ten}: dấu lập bởi`);
    assert.deepEqual(quetGoi(goi), [], `${t.ten}: gói thật bị máy chủ chặn`);
  }
  // Đối chứng đỏ: đổi một tiêu đề thì băm gói không còn tệp đề xuất nào.
  const g = structuredClone(bo[0]!.goi);
  g.cot[0]!.tieuDe += " (đổi)";
  assert.equal(dx.get(await bamGoi(g)), undefined, "gói đổi mà vẫn khớp tệp đề xuất");
});

test("số đo có tác tử", async () => {
  const s = await tinhSoDoTacTu();
  const la = s.cong_la;
  assert.ok(ti(la.ghepCot) >= 0.95, `ghép cột ${(100 * ti(la.ghepCot)).toFixed(1)}% < 95%`);
  assert.ok(ti(la.loiLot) <= 0.005, `lỗi lọt ${(100 * ti(la.loiLot)).toFixed(2)}% > 0,5%`);
  assert.ok(ti(la.hoiNguoi) <= 0.1, `ô cần người ${(100 * ti(la.hoiNguoi)).toFixed(1)}% > 10%`);
  assert.equal(la.roNguon.tu, 0, "rò nguồn");
  assert.deepEqual(s, JSON.parse(readFileSync(SO_DO_URL, "utf8")), "so-do-tac-tu.json đã commit bằng lần tính lại");
  for (const [ten, nen] of Object.entries(SO_NEN.tep)) {
    const co = s.tep[ten]!;
    assert.ok(co.ghepCot.tu >= nen.ghepCot.tu, `${ten}: ghép cột tệ hơn nền`);
    assert.ok(co.loiLot.tu <= nen.loiLot.tu, `${ten}: lỗi lọt tệ hơn nền`);
    assert.ok(co.hoiNguoi.tu <= nen.hoiNguoi.tu, `${ten}: ô cần người tệ hơn nền`);
  }
});
