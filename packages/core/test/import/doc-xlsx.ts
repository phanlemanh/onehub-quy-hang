/**
 * Bộ đọc xlsx CHỈ ĐỂ THỬ (hàng 64): đọc đúng khuôn mà bộ ghi của hàng 5 (`packages/db/seed/xlsx.mjs`) sinh — zip lưu không
 * nén, một sheet, ô chữ nội tuyến và ô số. Khuôn khác (nén, chữ dùng chung, nhiều sheet) → ném lỗi, không đoán. Lõi nhập
 * không dùng tệp này: đọc xlsx trên trình duyệt là việc của hàng 65.
 */
import type { Grid } from "../../src/import/grid";

function mucZip(buf: Uint8Array): Map<string, Uint8Array> {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const out = new Map<string, Uint8Array>();
  let i = 0;
  while (i + 30 <= buf.length && dv.getUint32(i, true) === 0x04034b50) {
    const cachNen = dv.getUint16(i + 8, true);
    const coNen = dv.getUint32(i + 18, true);
    const dTen = dv.getUint16(i + 26, true);
    const dThem = dv.getUint16(i + 28, true);
    const ten = new TextDecoder().decode(buf.subarray(i + 30, i + 30 + dTen));
    if (cachNen !== 0) throw new Error(`doc-xlsx: mục ${ten} nén (cách ${cachNen}) — bộ đọc thử chỉ nhận zip lưu không nén`);
    const dau = i + 30 + dTen + dThem;
    out.set(ten, buf.subarray(dau, dau + coNen));
    i = dau + coNen;
  }
  if (out.size === 0) throw new Error("doc-xlsx: không phải zip");
  return out;
}

const boThoat = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

function chiSoCot(ref: string): [number, number] {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) throw new Error(`doc-xlsx: ô ${ref} lạ`);
  let c = 0;
  for (const ch of m[1]!) c = c * 26 + (ch.charCodeAt(0) - 64);
  return [Number(m[2]) - 1, c - 1];
}

/** Byte tệp xlsx → lưới (ô chữ giữ nguyên văn, ô số là number, ô vắng là null). */
export function docXlsx(bytes: Uint8Array): Grid {
  const muc = mucZip(bytes);
  const sheet = muc.get("xl/worksheets/sheet1.xml");
  if (!sheet) throw new Error("doc-xlsx: thiếu xl/worksheets/sheet1.xml");
  if (muc.has("xl/sharedStrings.xml")) throw new Error("doc-xlsx: có sharedStrings — ngoài khuôn bộ ghi hàng 5");
  const xml = new TextDecoder().decode(sheet);
  const grid: Grid = [];
  for (const m of xml.matchAll(/<c r="([A-Z]+\d+)"(?: t="(\w+)")?>(.*?)<\/c>/gs)) {
    const [r, c] = chiSoCot(m[1]!);
    const loai = m[2];
    const than = m[3]!;
    let v: string | number;
    if (loai === "inlineStr") v = boThoat(/<t[^>]*>(.*?)<\/t>/s.exec(than)?.[1] ?? "");
    else if (loai === undefined) v = Number(/<v>(.*?)<\/v>/.exec(than)?.[1]);
    else throw new Error(`doc-xlsx: kiểu ô ${loai} ngoài khuôn`);
    while (grid.length <= r) grid.push([]);
    const dong = grid[r]!;
    while (dong.length < c) dong.push(null);
    dong[c] = v;
  }
  return grid;
}
