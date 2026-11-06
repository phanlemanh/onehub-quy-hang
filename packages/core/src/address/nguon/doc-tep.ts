/**
 * Đọc hai tệp nguồn của danh mục (hàng danh-muc-xa-day-du) bằng Node thuần, không thư viện: XML của dịch vụ danh mục xã
 * của Cục Thống kê, và tệp xlsx bảng chuyển đổi (tệp zip chứa XML). Chỉ dùng cho bộ sinh và bộ kiểm — bộ đọc địa chỉ
 * không gọi tới tệp này.
 */
import { inflateRawSync } from "node:zlib";

/** Giải tệp zip; trả bảng tên tệp → nội dung. Chỉ nhận hai kiểu nén của xlsx: lưu thẳng (0) và deflate (8). */
export function giaiZip(buf: Buffer): Map<string, Buffer> {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("tệp zip hỏng: không thấy mục lục cuối");
  const soMuc = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const ra = new Map<string, Buffer>();
  for (let k = 0; k < soMuc; k++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("tệp zip hỏng: mục lục lệch");
    const kieu = buf.readUInt16LE(p + 10);
    const coNen = buf.readUInt32LE(p + 20);
    const dTen = buf.readUInt16LE(p + 28);
    const dThem = buf.readUInt16LE(p + 30);
    const dGhi = buf.readUInt16LE(p + 32);
    const viTri = buf.readUInt32LE(p + 42);
    const ten = buf.toString("utf8", p + 46, p + 46 + dTen);
    const dTenCuc = buf.readUInt16LE(viTri + 26);
    const dThemCuc = buf.readUInt16LE(viTri + 28);
    const dau = viTri + 30 + dTenCuc + dThemCuc;
    const nen = buf.subarray(dau, dau + coNen);
    if (kieu === 0) ra.set(ten, Buffer.from(nen));
    else if (kieu === 8) ra.set(ten, inflateRawSync(nen));
    else throw new Error(`tệp zip: kiểu nén ${kieu} chưa đọc được (${ten})`);
    p += 46 + dTen + dThem + dGhi;
  }
  return ra;
}

const THUC_THE: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** Giải thực thể XML (&amp; &#10; &#x41;). */
export function giaiThucThe(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (_, e: string) =>
    e.startsWith("#x") ? String.fromCodePoint(parseInt(e.slice(2), 16))
    : e.startsWith("#") ? String.fromCodePoint(parseInt(e.slice(1), 10))
    : THUC_THE[e]!,
  );
}

/** Số cột từ chữ cột («A» = 0, «K» = 10, «AA» = 26). */
function soCot(chu: string): number {
  let n = 0;
  for (const c of chu) n = n * 26 + (c.charCodeAt(0) - 64);
  return n - 1;
}

/** Đọc một sheet của tệp xlsx theo tên; trả mảng dòng, mỗi dòng mảng ô chuỗi (ô trống là ""). */
export function docSheet(xlsx: Buffer, tenSheet: string): string[][] {
  const tep = giaiZip(xlsx);
  const doc = (ten: string) => {
    const b = tep.get(ten);
    if (!b) throw new Error(`tệp xlsx thiếu ${ten}`);
    return b.toString("utf8");
  };
  const wb = doc("xl/workbook.xml");
  const sheet = [...wb.matchAll(/<sheet\b[^>]*>/g)].map((m) => m[0]).find((t) => giaiThucThe(/name="([^"]*)"/.exec(t)?.[1] ?? "") === tenSheet);
  if (!sheet) throw new Error(`tệp xlsx không có sheet «${tenSheet}»`);
  const rid = /r:id="([^"]*)"/.exec(sheet)?.[1];
  const rels = doc("xl/_rels/workbook.xml.rels");
  const rel = [...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).find((t) => t.includes(`Id="${rid}"`));
  const dich = /Target="([^"]*)"/.exec(rel ?? "")?.[1];
  if (!dich) throw new Error(`tệp xlsx: sheet «${tenSheet}» không trỏ tệp nào`);
  const duong = dich.startsWith("/") ? dich.slice(1) : `xl/${dich}`;

  const chung: string[] = [];
  if (tep.has("xl/sharedStrings.xml")) {
    for (const m of doc("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)) {
      chung.push([...m[1]!.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => giaiThucThe(t[1]!)).join(""));
    }
  }

  const dong: string[][] = [];
  for (const r of doc(duong).matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>|<row\b[^>]*\/>/g)) {
    const o: string[] = [];
    for (const c of (r[1] ?? "").matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const thuoc = c[1]!;
      const cot = soCot(/r="([A-Z]+)\d+"/.exec(thuoc)?.[1] ?? "A");
      const kieu = /t="([^"]*)"/.exec(thuoc)?.[1];
      const than = c[2] ?? "";
      let gt = "";
      if (kieu === "inlineStr") gt = [...than.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map((t) => giaiThucThe(t[1]!)).join("");
      else {
        const v = /<v>([\s\S]*?)<\/v>/.exec(than)?.[1];
        if (v !== undefined) gt = kieu === "s" ? (chung[Number(v)] ?? "") : giaiThucThe(v);
      }
      while (o.length < cot) o.push("");
      o[cot] = gt;
    }
    dong.push(o);
  }
  return dong;
}

export type DongXaNguon = {
  maTinh: string;
  tenTinh: string;
  ma: string;
  ten: string;
  loai: string;
};

/** Đọc các phần tử TABLE của XML dịch vụ danh mục xã. */
export function docXmlDanhMucXa(xml: string): DongXaNguon[] {
  const lay = (khoi: string, the: string) => giaiThucThe(new RegExp(`<${the}>([\\s\\S]*?)</${the}>`).exec(khoi)?.[1] ?? "");
  return [...xml.matchAll(/<TABLE\b[^>]*>([\s\S]*?)<\/TABLE>/g)].map((m) => ({
    maTinh: lay(m[1]!, "MaTinh"),
    tenTinh: lay(m[1]!, "TenTinh"),
    ma: lay(m[1]!, "MaPhuongXa"),
    ten: lay(m[1]!, "TenPhuongXa"),
    loai: lay(m[1]!, "LoaiHinh"),
  }));
}
