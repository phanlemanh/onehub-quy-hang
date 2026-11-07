// Kiểm đề xuất ô lạ (hàng 69, AC-3 — E3): mỗi đề xuất sai chỉ bỏ đề xuất ấy, lý do nêu được.
import assert from "node:assert/strict";
import { test } from "node:test";
import { giaBaoPhiTuVeTay } from "../../../pricing/ve-tay";
import type { GoiOLa } from "./goi";
import { docDai, kiemDeXuatOLa } from "./kiem";

const HOM_NAY = "2026-11-06";
const TY = 1_000_000_000;
const PHEP_TY = { name: "price", params: { unit: "ty" } } as const;
const GOI: GoiOLa = {
  o: [
    { id: "o1", cot: 0, tieuDe: "Giá (tỷ)", truong: "listPrice", giaTri: "4.6–4.8 tỷ", lyDoMa: "«ô»: dải giá — cần người chọn một giá", phep: PHEP_TY },
    { id: "o2", cot: 0, tieuDe: "Giá (tỷ)", truong: "listPrice", giaTri: "thu về 4.2", lyDoMa: "«ô»: giá về tay chủ — cần người quy ra giá chào (luật 12)", phep: PHEP_TY },
    { id: "o3", cot: 1, tieuDe: "Tình trạng", truong: "standardStatus", giaTri: "đang đàm phán", lyDoMa: "«ô» không phải trạng thái đã biết" },
    { id: "o4", cot: 2, tieuDe: "Phí", truong: "feeInclusion", giaTri: "thu về", lyDoMa: "«ô»: giá về tay chủ" },
    { id: "o5", cot: 3, tieuDe: "Giá (VNĐ)", truong: "listPrice", giaTri: "thu về 4200000000", lyDoMa: "«ô»: giá về tay chủ", phep: { name: "price", params: { unit: "dong" } } },
  ],
};
const dx = (id: string, gia_tri: string, ly_do = "vì ô ghi như vậy") => ({ id, gia_tri, ly_do });
const kiem = (...d: ReturnType<typeof dx>[]) => kiemDeXuatOLa(GOI, { de_xuat: d }, HOM_NAY);
const lyDo = (r: ReturnType<typeof kiem>, id: string) => r.loi.find((l) => l.id === id)?.lyDo ?? "";

test("kiểm đề xuất ô lạ", () => {
  // Hợp lệ.
  for (const [id, v] of [["o1", "4,8 tỷ"], ["o1", "4,6 tỷ"], ["o2", "4,2 tỷ KBP"], ["o3", "Đang giao dịch"], ["o4", "KBP"]] as const)
    assert.deepEqual(kiem(dx(id, v)).deXuat.map((d) => d.giaTri), [v], `${id} «${v}» qua kiểm`);
  const baoPhi = giaBaoPhiTuVeTay(4.2 * TY);
  assert.equal(kiem(dx("o5", `${baoPhi} BP`)).deXuat.length, 1, "giá bao phí quy từ về tay kèm BP qua kiểm");
  assert.match(lyDo(kiem(dx("o5", `${baoPhi + 1_000_000} BP`)), "o5"), /lệch luật 12/);

  // Bị loại, lý do nêu được.
  assert.match(lyDo(kiem(dx("o1", "4,9 tỷ")), "o1"), /ngoài dải/);
  assert.match(lyDo(kiem(dx("o2", "4,3 tỷ KBP")), "o2"), /lệch luật 12/);
  assert.match(lyDo(kiem(dx("o2", "4,2 tỷ BP")), "o2"), /lệch luật 12/);
  assert.match(lyDo(kiem(dx("o3", "abc")), "o3"), /không đọc được ở trường standardStatus/);
  assert.match(lyDo(kiem(dx("o9", "4 tỷ")), "o9"), /không có trong gói/);
  const lap = kiem(dx("o3", "Đang giao dịch"), dx("o3", "Đang bán"));
  assert.equal(lap.deXuat.length, 1, "lần đầu giữ");
  assert.match(lyDo(lap, "o3"), /đã có đề xuất/);
  assert.match(lyDo(kiem(dx("o3", "Đang bán", " ")), "o3"), /thiếu lý do/);

  // Một đề xuất sai không làm mất đề xuất đúng khác.
  const tron = kiem(dx("o1", "9 tỷ"), dx("o3", "Đang giao dịch"));
  assert.deepEqual(tron.deXuat.map((d) => d.id), ["o3"], "đề xuất đúng còn");

  // Gốc sai khuôn → không đề xuất nào.
  for (const v of [{ de_xuat: [], la: 1 }, { de_xuat: "x" }]) {
    const r = kiemDeXuatOLa(GOI, v, HOM_NAY);
    assert.deepEqual([r.deXuat.length, r.loi[0]?.lyDo], [0, "đầu ra sai khuôn"]);
  }
});

test("đọc cận của dải: cận thiếu đơn vị mượn cận kia", () => {
  assert.deepEqual(docDai({ truong: "listPrice", giaTri: "4,6 - 4,8 tỷ", phep: PHEP_TY }, HOM_NAY), [4.6 * TY, 4.8 * TY]);
  assert.deepEqual(docDai({ truong: "listPrice", giaTri: "4600~4800tr", phep: PHEP_TY }, HOM_NAY), [4.6 * TY, 4.8 * TY]);
});
