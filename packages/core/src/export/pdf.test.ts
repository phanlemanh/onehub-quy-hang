// E6 (hàng 43, AC-6) — bộ ghi PDF của lõi: k trang ảnh JPEG (k ∈ {1, 3}) → tệp bắt đầu %PDF-, đúng k đối tượng /Page,
// bảng xref trỏ đúng từng đối tượng (bộ đọc trong bài), %%EOF ở cuối; chia trang 25 căn mỗi trang. Chiều đỏ: bản sao
// lệch một byte offset xref trên CÙNG tệp → bộ đọc nêu đối tượng lệch.
import assert from "node:assert/strict";
import { test } from "node:test";
import { chiaTheoTrang, chiaTrang, ghiPdf, type TrangJpeg } from ".";

/** JPEG giả đủ dấu SOI/EOI — bộ ghi chỉ chép byte, không giải mã. */
const jpeg = (n: number): TrangJpeg => ({
  bytes: Uint8Array.of(0xff, 0xd8, 0xff, 0xe0, ...new Array<number>(40 + n).fill(n), 0xff, 0xd9),
  rong: 1123,
  cao: 794,
});

const latin1 = (b: Uint8Array) => new TextDecoder("latin1").decode(b);

/** Bộ đọc trong bài: đọc startxref, bảng xref, rồi kiểm từng offset trỏ đúng «n 0 obj». */
function docPdf(b: Uint8Array): { soPage: number; loi: string[] } {
  const t = latin1(b);
  const loi: string[] = [];
  if (!t.startsWith("%PDF-")) loi.push("không mở đầu %PDF-");
  if (!/%%EOF\n?$/.test(t)) loi.push("thiếu %%EOF ở cuối");
  const sx = /startxref\n(\d+)\n%%EOF\n?$/.exec(t);
  if (!sx) return { soPage: 0, loi: [...loi, "thiếu startxref"] };
  const xref = Number(sx[1]);
  const dau = /^xref\n0 (\d+)\n/.exec(t.slice(xref));
  if (!dau) return { soPage: 0, loi: [...loi, `startxref ${xref} không trỏ bảng xref`] };
  const tong = Number(dau[1]);
  const than = t.slice(xref + dau[0].length);
  for (let i = 1; i < tong; i++) {
    const dong = than.slice(i * 20, i * 20 + 20);
    const m = /^(\d{10}) 00000 n \n$/.exec(dong);
    if (!m) {
      loi.push(`xref dòng ${i} hỏng`);
      continue;
    }
    const off = Number(m[1]);
    if (!t.startsWith(`${i} 0 obj`, off)) loi.push(`đối tượng ${i}: xref trỏ ${off}, gặp «${t.slice(off, off + 8)}»`);
  }
  const soPage = [...t.matchAll(/\/Type \/Page(?!s)\b/g)].length;
  return { soPage, loi };
}

for (const k of [1, 3]) {
  test(`E6 PDF ${k} trang ảnh — %PDF-, ${k} /Page, xref đúng, %%EOF`, () => {
    const trang = Array.from({ length: k }, (_, i) => jpeg(i));
    const b = ghiPdf(trang);
    const kq = docPdf(b);
    assert.deepEqual(kq.loi, []);
    assert.equal(kq.soPage, k);
    const t = latin1(b);
    assert.equal([...t.matchAll(/\/Filter \/DCTDecode/g)].length, k);
    assert.match(t, new RegExp(`/Count ${k} `));
    // Byte JPEG chép nguyên vẹn.
    const dau = t.indexOf("stream\n", t.indexOf("/DCTDecode")) + "stream\n".length;
    assert.deepEqual(b.subarray(dau, dau + trang[0]!.bytes.length), trang[0]!.bytes);
  });
}

test("E6 chia trang — 25 căn mỗi trang", () => {
  assert.deepEqual([1, 25, 26, 30, 31, 60].map((n) => chiaTrang(n, 25)), [1, 1, 2, 2, 2, 3]);
  assert.equal(chiaTrang(60), 3);
  assert.deepEqual(chiaTheoTrang(Array.from({ length: 60 }, (_, i) => i)).map((p) => p.length), [25, 25, 10]);
});

test("E6 không nhận trang rỗng hay byte không phải JPEG", () => {
  assert.throws(() => ghiPdf([]), /ít nhất một trang/);
  assert.throws(() => ghiPdf([{ bytes: Uint8Array.of(0x89, 0x50, 0x4e, 0x47), rong: 10, cao: 10 }]), /không phải JPEG/);
});

test("E6 chiều đỏ — bản sao lệch một byte offset xref thì bộ đọc nêu đối tượng lệch", () => {
  const b = ghiPdf([jpeg(0), jpeg(1), jpeg(2)]);
  const t = latin1(b);
  const xref = Number(/startxref\n(\d+)/.exec(t)![1]);
  // Dòng xref của đối tượng 3 (trang đầu): cộng một vào offset.
  const viTri = xref + "xref\n0 12\n".length + 3 * 20;
  const cu = Number(t.slice(viTri, viTri + 10));
  const hong = b.slice();
  hong.set(new TextEncoder().encode(String(cu + 1).padStart(10, "0")), viTri);
  assert.deepEqual(docPdf(hong).loi, [`đối tượng 3: xref trỏ ${cu + 1}, gặp «${t.slice(cu + 1, cu + 9)}»`]);
});
