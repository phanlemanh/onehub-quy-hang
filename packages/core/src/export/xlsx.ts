/**
 * Bộ ghi .xlsx tối thiểu của bản xuất (hàng 43, Hỏi-3): một sheet, chữ nội tuyến, ô số; zip lưu không nén với giờ cố
 * định nên cùng đầu vào ra cùng từng byte. Chuyển từ `packages/db/seed/xlsx.mjs` để chạy được trong trình duyệt:
 * `Uint8Array` + `DataView` thay `Buffer`, crc32 tự tính bằng bảng thay `node:zlib`. Đọc lại để kiểm bằng bộ đọc độc lập
 * `packages/db/seed/doc-xlsx.py`, không bằng mã của tệp này.
 */

const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS_PKG = "http://schemas.openxmlformats.org/package/2006/relationships";
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

const THOAT: Readonly<Record<string, string>> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
// Ký tự điều khiển (trừ tab, xuống dòng) không hợp lệ trong XML 1.0 — bỏ.
const thoat = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[&<>"]/g, (c) => THOAT[c] ?? c);

const BANG_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

/** CRC-32 (IEEE 802.3) như zip đòi. */
export function crc32(du: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of du) c = BANG_CRC[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Chỉ số cột (0) → chữ cột Excel (A, B, …, AA). */
export function chuCot(i: number): string {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

export type OXlsx = string | number | null;

function o(gt: OXlsx | undefined, ref: string): string {
  if (gt === null || gt === undefined || gt === "") return "";
  if (typeof gt === "number") {
    if (!Number.isFinite(gt)) throw new Error(`ô ${ref}: số không hữu hạn`);
    return `<c r="${ref}"><v>${gt}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${thoat(gt)}</t></is></c>`;
}

function sheetXml(dong: readonly (readonly OXlsx[])[]): string {
  const hang = dong
    .map((cac, r) => `<row r="${r + 1}">${cac.map((gt, c) => o(gt, `${chuCot(c)}${r + 1}`)).join("")}</row>`)
    .join("");
  return `${XML}<worksheet xmlns="${NS}"><sheetData>${hang}</sheetData></worksheet>`;
}

function cacMuc(tenSheet: string, dong: readonly (readonly OXlsx[])[]): [string, string][] {
  return [
    [
      "[Content_Types].xml",
      `${XML}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        "</Types>",
    ],
    [
      "_rels/.rels",
      `${XML}<Relationships xmlns="${NS_PKG}">` +
        `<Relationship Id="rId1" Type="${NS_R}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `${XML}<workbook xmlns="${NS}" xmlns:r="${NS_R}"><sheets>` +
        `<sheet name="${thoat(tenSheet)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `${XML}<Relationships xmlns="${NS_PKG}">` +
        `<Relationship Id="rId1" Type="${NS_R}/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="${NS_R}/styles" Target="styles.xml"/></Relationships>`,
    ],
    [
      "xl/styles.xml",
      `${XML}<styleSheet xmlns="${NS}"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>` +
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>',
    ],
    ["xl/worksheets/sheet1.xml", sheetXml(dong)],
  ];
}

// Giờ DOS cố định 1980-01-01 00:00 cho mọi mục zip.
const GIO_DOS = 0;
const NGAY_DOS = (0 << 9) | (1 << 5) | 1;

export function noi(phan: readonly Uint8Array[]): Uint8Array {
  const ra = new Uint8Array(phan.reduce((s, p) => s + p.length, 0));
  let i = 0;
  for (const p of phan) {
    ra.set(p, i);
    i += p.length;
  }
  return ra;
}

/**
 * Đóng gói zip lưu không nén. `tinhCrc` chỉ để bài kiểm dựng bản sao hỏng (chiều đỏ); đường thật luôn dùng `crc32`.
 */
export function dongGoiZip(muc: readonly (readonly [string, Uint8Array])[], tinhCrc: (du: Uint8Array) => number = crc32): Uint8Array {
  const enc = new TextEncoder();
  const dau: Uint8Array[] = [];
  const trungTam: Uint8Array[] = [];
  let lech = 0;
  for (const [ten, du] of muc) {
    const tenB = enc.encode(ten);
    const crc = tinhCrc(du) >>> 0;
    const h = new Uint8Array(30);
    const hv = new DataView(h.buffer);
    hv.setUint32(0, 0x04034b50, true);
    hv.setUint16(4, 20, true);
    hv.setUint16(6, 0x0800, true); // tên mục UTF-8
    hv.setUint16(8, 0, true); // lưu không nén
    hv.setUint16(10, GIO_DOS, true);
    hv.setUint16(12, NGAY_DOS, true);
    hv.setUint32(14, crc, true);
    hv.setUint32(18, du.length, true);
    hv.setUint32(22, du.length, true);
    hv.setUint16(26, tenB.length, true);
    hv.setUint16(28, 0, true);
    dau.push(h, tenB, du);
    const c = new Uint8Array(46);
    const cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, GIO_DOS, true);
    cv.setUint16(14, NGAY_DOS, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, du.length, true);
    cv.setUint32(24, du.length, true);
    cv.setUint16(28, tenB.length, true);
    cv.setUint32(42, lech, true);
    trungTam.push(c, tenB);
    lech += h.length + tenB.length + du.length;
  }
  const tt = noi(trungTam);
  const cuoi = new Uint8Array(22);
  const kv = new DataView(cuoi.buffer);
  kv.setUint32(0, 0x06054b50, true);
  kv.setUint16(8, muc.length, true);
  kv.setUint16(10, muc.length, true);
  kv.setUint32(12, tt.length, true);
  kv.setUint32(16, lech, true);
  return noi([...dau, tt, cuoi]);
}

/** Các mục của gói .xlsx (tên, nội dung UTF-8) — tách ra để bài kiểm đóng gói lại bằng bản sao hỏng. */
export function mucXlsx(bang: { cot: readonly string[]; dong: readonly (readonly OXlsx[])[] }, tenSheet = "Bảng hàng"): [string, Uint8Array][] {
  const enc = new TextEncoder();
  return cacMuc(tenSheet, [bang.cot, ...bang.dong]).map(([ten, nd]) => [ten, enc.encode(nd)]);
}

/** Một sổ một sheet: dòng đầu là nhãn cột, rồi mỗi căn một dòng. Ô rỗng thì bỏ ô. */
export function ghiXlsx(bang: { cot: readonly string[]; dong: readonly (readonly OXlsx[])[] }, tenSheet = "Bảng hàng"): Uint8Array {
  return dongGoiZip(mucXlsx(bang, tenSheet));
}
