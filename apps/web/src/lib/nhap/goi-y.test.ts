// Gợi ý «Ý bạn là» ở bước xem trước (hàng 70: E2, E4). Bảng dựng từ tệp mẫu thật qua lõi nhập; dữ liệu [Tên], 0900 000 0xx.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cachGoDaDuyet, decodeText, parseCsv, type DongCachGo, type ImportContext } from "@quy-hang/core/import";

import { danhMucMau, HOM_NAY } from "../../../../../packages/core/test/import/sinh";
import { chayOng } from "./duong-ong";
import { chonGoiY, goiYCuaO } from "./goi-y";
import { napTep, taoTrangThai, type TrangThaiNhap } from "./trang-thai";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const TEP = { ten: "tu-dien.csv", bam: "b".repeat(64), loai: "csv" as const, trang: null };
const luoi = parseCsv(decodeText(readFileSync(join(GOC, "_acceptance/chuan-hoa-moi-cua/thu/tu-dien.csv"))));
const voi = (ctx: ImportContext): TrangThaiNhap => napTep(taoTrangThai(["listing_agent"]), TEP, chayOng(luoi, ctx));
const CTX: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
const cot = (s: TrangThaiNhap, f: string) => s.ong!.plan.columns.findIndex((c) => c.target === f);
const o = (s: TrangThaiNhap, src: number, f: string) => s.ong!.dong.find((d) => d.source === src)!.cells.find((c) => c.target === f)!;

test("gợi ý ở ô cần người", () => {
  const s = voi(CTX);
  const src = s.ong!.dong[0]!.source;
  // Bảng viết trước: [trường, gợi ý đầu (chữ)] cho dòng đầu của tệp mẫu.
  const BANG: [string, string | null][] = [
    ["directionFaces", "Đông Nam"],
    ["standardStatus", "Đang giao dịch"],
    ["feeInclusion", null], // «bao phi het» quá xa — không gợi ý
    ["listPrice", null], // ngoài ba trường
    ["unitNumber", null],
  ];
  let dem = 0;
  for (const [f, dau] of BANG) {
    const g = goiYCuaO(s.ong!, CTX, src, cot(s, f));
    assert.equal(g?.goiY[0]?.chu ?? null, dau, `${f}: ${JSON.stringify(g)}`);
    dem++;
  }
  assert.equal(dem, BANG.length);
  // Chọn gợi ý trạng thái: ô thành Pending (fixed hay keep), đề xuất chữ gốc → giá trị.
  const r = chonGoiY(s, src, cot(s, "standardStatus"), "Pending", CTX);
  assert.deepEqual(r.deXuat, { field: "standardStatus", raw: "dang giao dch", value: "Pending" });
  const sau = o(r.s, src, "standardStatus");
  assert.ok(sau.mark === "fixed" || sau.mark === "keep", `ô sau khi chọn: ${sau.mark}`);
  assert.equal(sau.value, "Pending");
  // Chọn gợi ý hướng: ô thành Đông Nam.
  const h = chonGoiY(s, src, cot(s, "directionFaces"), "Đông Nam", CTX);
  assert.deepEqual(h.deXuat, { field: "directionFaces", raw: "dong nm", value: "Đông Nam" });
  assert.equal(o(h.s, src, "directionFaces").value, "Đông Nam", `ô hướng: ${JSON.stringify(o(h.s, src, "directionFaces"))}`);
  // Gợi ý không có trong danh sách → không đổi gì.
  assert.equal(chonGoiY(s, src, cot(s, "standardStatus"), "Closed", CTX).deXuat, null);
});

test("đề xuất chưa duyệt không đổi chuẩn hoá ở bước xem trước", () => {
  const dong = (status: DongCachGo["status"]): DongCachGo[] => [{ field: "standardStatus", raw: "dang giao dch", value: "Pending", status, pickCount: 1 }];
  const mark = (ds: DongCachGo[]) => o(voi({ ...CTX, companyAliases: cachGoDaDuyet(ds) }), voi(CTX).ong!.dong[0]!.source, "standardStatus").mark;
  assert.equal(mark(dong("proposed")), "needs_person", "đề xuất chưa duyệt đã đổi chuẩn hoá");
  assert.equal(mark(dong("rejected")), "needs_person");
  assert.equal(mark(dong("approved")), "fixed", "cách gõ đã duyệt phải chuẩn hoá thẳng");
});
