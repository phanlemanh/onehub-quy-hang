import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { quetThuan } from "../../test/import/quet-thuan";

test("lõi nhập không I/O: quét tệp mã", () => {
  const thuMuc = new URL("./", import.meta.url);
  const tep = readdirSync(thuMuc).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));
  assert.ok(tep.length >= 10, `chỉ thấy ${tep.length} tệp mã`);
  const viPham = tep.flatMap((f) => quetThuan(`import/${f}`, readFileSync(new URL(f, thuMuc), "utf8")));
  assert.deepEqual(viPham, [], `${tep.length} tệp mã`);
});

test("lõi nhập không I/O: bộ quét bắt lời vi phạm", () => {
  // Ma trận viết tay: mỗi loại lời cấm AC-10 kê một phần tử, cộng biến thể.
  const VI_PHAM: [string, RegExp][] = [
    ['import { readFileSync } from "node:fs";', /node:fs/],
    ['import * as XLSX from "xlsx";', /xlsx/],
    ['const x = await import("xlsx");', /nhập động/],
    ['const fs = require("fs");', /require/],
    ['const r = await fetch("https://x.test");', /fetch/],
    ["const k = process.env.KEY;", /process/],
    ["const t = Date.now();", /Date\.now/],
    ["const t = new Date();", /new Date\(\)/],
    ["const t = new Date;", /new Date\)/],
    ['import { x } from "../../db/x";', /ra ngoài/],
  ];
  let dem = 0;
  for (const [chu, loi] of VI_PHAM) {
    const v = quetThuan("import/a.ts", chu);
    assert.equal(v.length, 1, `«${chu}»: ${JSON.stringify(v)}`);
    assert.match(v[0]!.loi, loi, `«${chu}»`);
    dem++;
  }
  assert.equal(dem, VI_PHAM.length);
  for (const sach of ['import { fold } from "./dictionaries";', 'import { docGia } from "../pricing/doc-gia";', "const t = new Date(NGAY + n * 86400000);"])
    assert.deepEqual(quetThuan("import/a.ts", sach), [], `«${sach}» sạch`);
});
