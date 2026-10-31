// Bộ ghi .xlsx tối thiểu cho hai file bảng hàng mẫu: một sheet, chữ nội tuyến, ô số. Zip lưu không nén với giờ cố
// định nên cùng đầu vào ra cùng từng byte. Tự viết vì thêm thư viện phải sửa package-lock.json (ngoài ranh giới hàng 5).
// Đọc lại để kiểm bằng bộ đọc độc lập doc-xlsx.py (thư viện chuẩn của Python), không bằng mã của tệp này.
import { crc32 } from "node:zlib";

const NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const NS_PKG = "http://schemas.openxmlformats.org/package/2006/relationships";
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

const thoat = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Chỉ số cột (0) → chữ cột Excel (A, B, …, AA). */
export function chuCot(i) {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

function o(gt, ref) {
  if (gt === null || gt === undefined || gt === "") return "";
  if (typeof gt === "number") {
    if (!Number.isFinite(gt)) throw new Error(`ô ${ref}: số không hữu hạn`);
    return `<c r="${ref}"><v>${gt}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${thoat(gt)}</t></is></c>`;
}

function sheetXml(dong) {
  const hang = dong
    .map((cac, r) => `<row r="${r + 1}">${cac.map((gt, c) => o(gt, `${chuCot(c)}${r + 1}`)).join("")}</row>`)
    .join("");
  return `${XML}<worksheet xmlns="${NS}"><sheetData>${hang}</sheetData></worksheet>`;
}

function tep({ tenSheet, dong }) {
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

/**
 * Ghi một sổ một sheet. `dong` là mảng dòng, mỗi dòng mảng ô (chuỗi hoặc số; rỗng thì bỏ ô).
 * @param {{ tenSheet: string, dong: (string | number | null)[][] }} p
 * @returns {Buffer}
 */
export function ghiXlsx(p) {
  const dau = [];
  const muc = [];
  let lech = 0;
  for (const [ten, noiDung] of tep(p)) {
    const tenB = Buffer.from(ten, "utf8");
    const du = Buffer.from(noiDung, "utf8");
    const crc = crc32(du);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0);
    h.writeUInt16LE(20, 4);
    h.writeUInt16LE(0x0800, 6); // tên mục UTF-8
    h.writeUInt16LE(0, 8); // lưu không nén
    h.writeUInt16LE(GIO_DOS, 10);
    h.writeUInt16LE(NGAY_DOS, 12);
    h.writeUInt32LE(crc, 14);
    h.writeUInt32LE(du.length, 18);
    h.writeUInt32LE(du.length, 22);
    h.writeUInt16LE(tenB.length, 26);
    h.writeUInt16LE(0, 28);
    dau.push(h, tenB, du);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt16LE(0x0800, 8);
    c.writeUInt16LE(0, 10);
    c.writeUInt16LE(GIO_DOS, 12);
    c.writeUInt16LE(NGAY_DOS, 14);
    c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(du.length, 20);
    c.writeUInt32LE(du.length, 24);
    c.writeUInt16LE(tenB.length, 28);
    c.writeUInt32LE(lech, 42);
    muc.push(c, tenB);
    lech += h.length + tenB.length + du.length;
  }
  const trungTam = Buffer.concat(muc);
  const cuoi = Buffer.alloc(22);
  const soMuc = muc.length / 2;
  cuoi.writeUInt32LE(0x06054b50, 0);
  cuoi.writeUInt16LE(soMuc, 8);
  cuoi.writeUInt16LE(soMuc, 10);
  cuoi.writeUInt32LE(trungTam.length, 12);
  cuoi.writeUInt32LE(lech, 16);
  return Buffer.concat([...dau, trungTam, cuoi]);
}
