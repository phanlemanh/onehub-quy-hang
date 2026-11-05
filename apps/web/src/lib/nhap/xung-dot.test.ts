// Sửa ô bị cờ xung đột không học thành cách gọi (hàng 66 nhap-hoan-tac, AC-9, E9 — Ngoài-3 của hàng 67). Ô «cần người» vì
// xung đột (lõi gắn `by` khác `normalize`) chỉ đổi đúng ô ấy; ô «cần người» vì giá trị lạ vẫn thành cách gọi như hàng 67.
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Grid, ImportContext } from "@quy-hang/core/import";
import { danhMucMau, HOM_NAY } from "../../../../../packages/core/test/import/sinh";
import { chayOng } from "./duong-ong";
import { napTep, suaO, taoTrangThai, type TrangThaiNhap } from "./trang-thai";

const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const TEP = { ten: "xung-dot.csv", bam: "b".repeat(64), loai: "csv" as const, trang: null };
const voi = (g: Grid): TrangThaiNhap => napTep(taoTrangThai(["listing_agent"]), TEP, chayOng(g, CTX));

// Căn của danh mục mẫu: A-01.01 (Toà A, Đông Nam), A-01.02 (Toà A, Đông Bắc), A-01.03…
const LUOI: Grid = [
  ["Toà", "Mã căn", "Giá", "Phí", "Hướng"],
  ["Toà A", "A-01.01", "3 tỷ bao phí", "không bao phí", "Đông Nam"], // phí trong ô giá mâu thuẫn ô phí
  ["Toà A", "A-01.02", "3 tỷ", "không bao phí", "Tây"], //            lệch danh mục hướng
  ["Toà B", "A-01.03", "3 tỷ", "không bao phí", "Tây"], //            lệch danh mục toà (cùng chữ hướng với dòng trên)
  ["Toà A", "A-01.04", "3 tỷ", "không bao phí", "Tây"], //            ô cùng chữ ở dòng khác
  ["Toà A", "A-01.05", "3 tỷ", "phí riêng", "Đông Nam"], //           giá trị lạ (lõi không nhận)
  ["Toà A", "A-01.06", "3 tỷ", "phí riêng", "Đông Nam"], //           ô cùng chữ giá trị lạ
];

const oCua = (s: TrangThaiNhap, dong: number, cot: string) => {
  const o = s.ong!;
  const i = o.table.headers.indexOf(cot);
  const src = o.table.rows[dong]!.source;
  return { src, i, o: o.dong.find((d) => d.source === src)!.cells[i]! };
};

test("xem trước: sửa ô xung đột không học thành cách gọi", () => {
  const s0 = voi(LUOI);
  const phi = oCua(s0, 0, "Phí");
  const huong = oCua(s0, 1, "Hướng");
  const toa = oCua(s0, 2, "Toà");
  const la = oCua(s0, 4, "Phí");
  // Lý do lõi trả phân biệt xung đột với giá trị lạ — đọc trước khi sửa.
  assert.deepEqual([phi.o.mark, phi.o.by], ["needs_person", "fee_from_price"], "ô phí mâu thuẫn ô giá");
  assert.deepEqual([huong.o.mark, huong.o.by], ["needs_person", "catalog"], "ô hướng lệch danh mục");
  assert.deepEqual([toa.o.mark, toa.o.by], ["needs_person", "catalog"], "ô toà lệch danh mục");
  assert.deepEqual([la.o.mark, la.o.by], ["needs_person", "normalize"], "ô phí giá trị lạ");

  const XUNG_DOT: [string, { src: number; i: number }, string, number, string][] = [
    ["phí trong ô giá", phi, "bao phí", 1, "Phí"],
    ["lệch danh mục hướng", huong, "Đông Bắc", 3, "Hướng"],
    ["lệch danh mục toà", toa, "Toà A", 3, "Hướng"],
  ];
  let dem = 0;
  for (const [ten, o, moi, dongCungChu, cotCungChu] of XUNG_DOT) {
    const s = suaO(s0, o.src, o.i, moi, CTX);
    assert.deepEqual(s.ong!.plan.columns[o.i]!.valueMap, s0.ong!.plan.columns[o.i]!.valueMap, `${ten}: bảng quy đổi không đổi`);
    const truoc = oCua(s0, dongCungChu, cotCungChu).o;
    const sau = oCua(s, dongCungChu, cotCungChu).o;
    assert.deepEqual([sau.mark, sau.value], [truoc.mark, truoc.value], `${ten}: ô cùng chữ ở dòng khác giữ nguyên`);
    assert.equal(s.soOTheo ?? 0, 0, `${ten}: không báo đổi theo`);
    dem += 3;
  }
  // Đối chứng dương: ô giá trị lạ vẫn thành cách gọi của cột (hàng 67).
  const s = suaO(s0, la.src, la.i, "bao phí", CTX);
  assert.equal(s.ong!.plan.columns[la.i]!.valueMap?.["phí riêng"], "bao phí", "giá trị lạ: học cặp quy đổi");
  assert.notEqual(oCua(s, 5, "Phí").o.mark, "needs_person", "giá trị lạ: ô cùng chữ đổi theo");
  assert.equal(s.soOTheo, 1, "giá trị lạ: báo đổi theo 1 ô");
  dem += 3;
  // Kế hoạch sau ba lần sửa xung đột không mang chữ nguyên văn nào của các ô ấy.
  let s3 = s0;
  for (const [, o, moi] of XUNG_DOT) s3 = suaO(s3, o.src, o.i, moi, CTX);
  const ke = JSON.stringify(s3.ong!.plan.columns.map((c) => c.valueMap ?? {}));
  assert.ok(!["không bao phí", "Tây", "Toà B"].some((v) => ke.includes(v)), `kế hoạch gửi máy chủ mang chữ ô xung đột: ${ke}`);
  dem++;
  assert.equal(dem, 13);
});
