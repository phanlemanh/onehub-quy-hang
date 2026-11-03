import assert from "node:assert/strict";
import { test } from "node:test";
import { sinhBoThu } from "../../test/import/sinh";
import { decodeText, parseCsv, readTable } from "./grid";

const boThu = sinhBoThu();
const tep = (ten: string) => boThu.find((t) => t.ten === ten)!;

test("đọc bảng: tiêu đề ở dòng 4, hai tầng, bỏ dòng trống và dòng tổng", () => {
  const t = tep("ban-tieu-de");
  const b = readTable(t.grid!);
  assert.equal(b.headerRow, t.dapAn.headerRow, "dòng tiêu đề");
  assert.equal(b.headerRows, 2, "tiêu đề hai tầng");
  // Viết tay theo bộ sinh: ô cha «Thông tin căn» gộp bốn cột, «Giá» gộp hai, «Liên hệ chủ» gộp hai.
  assert.deepEqual(b.headers, [
    "STT",
    "Thông tin căn / Mã",
    "Thông tin căn / Toà",
    "Thông tin căn / S thông thuỷ",
    "Thông tin căn / Ph.ngủ",
    "Giá / Chào (tỷ)",
    "Giá / Phí",
    "Tình trạng",
    "Liên hệ chủ / Tên",
    "Liên hệ chủ / SĐT",
    "NV phụ trách",
    "Ghi chú",
  ]);
  assert.equal(b.rows.length, 40, "40 dòng dữ liệu");
  assert.deepEqual(b.rows.map((r) => r.source), t.dapAn.dong, "số dòng gốc của dòng dữ liệu");
  const trong = t.grid!.findIndex((d, i) => i > 5 && d.length === 0);
  const tong = t.grid!.length - 1;
  assert.ok(!b.rows.some((r) => r.source === trong || r.source === tong), "dòng trống và dòng tổng không là dữ liệu");
  assert.deepEqual(b.skipped, [{ source: trong, reason: "blank" }, { source: tong, reason: "total" }]);
});

test("csv: UTF-8 BOM và Windows-1258 ra cùng bảng mau-a", () => {
  const mauA = readTable(tep("mau-a").grid!);
  for (const ten of ["ban-csv-utf8", "ban-csv"]) {
    const b = readTable(parseCsv(decodeText(tep(ten).bytes!)));
    assert.deepEqual(b.headers, mauA.headers, `${ten}: tiêu đề`);
    assert.equal(b.rows.length, mauA.rows.length, `${ten}: số dòng`);
    let dem = 0;
    b.rows.forEach((r, i) =>
      r.cells.forEach((o, j) => {
        const goc = mauA.rows[i]!.cells[j] ?? null;
        assert.equal(o, goc === null ? null : String(goc).normalize("NFC"), `${ten}: ô dòng ${i + 1} cột ${j + 1}`);
        dem++;
      }),
    );
    assert.equal(dem + b.headers.length, 41 * 13, `${ten}: số ô so`);
  }
});

test("giải mã: vectơ byte Windows-1258 viết tay", () => {
  // Byte viết tay theo bảng mã windows-1258: dấu thanh là byte tổ hợp tách rời (0xCC huyền, 0xEC sắc, 0xDE ngã),
  // «Đ» 0xD0, «ô» 0xF4. KHÔNG sinh bằng bộ mã hoá của bộ thử.
  const ca: [number[], string][] = [
    [[0x54, 0x6f, 0xcc, 0x61], "Tòa"],
    [[0xd0, 0xf4, 0x6e, 0x67, 0x20, 0x4e, 0x61, 0x6d], "Đông Nam"],
    [[0xd0, 0x61, 0xde, 0x20, 0x62, 0x61, 0xec, 0x6e], "Đã bán"],
  ];
  for (const [b, chu] of ca) assert.equal(decodeText(new Uint8Array(b)), chu, `byte ${b.map((x) => x.toString(16)).join(" ")}`);
  assert.equal(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, 0x41])), "A", "BOM UTF-8 bị bỏ");
});
