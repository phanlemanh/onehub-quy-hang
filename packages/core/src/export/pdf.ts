/**
 * Bộ ghi PDF tối giản của bản xuất (hàng 43, Hỏi-3): mỗi trang một ảnh JPEG (`DCTDecode`) do trang web vẽ bảng lên
 * canvas. Không thêm thư viện; chữ trong PDF là ảnh nên không chọn, không tìm được (ngoài phạm vi, chỉ khi đổi Hỏi-3).
 * Chạy được trong trình duyệt: chỉ `Uint8Array` và `TextEncoder`.
 */
import { noi } from "./xlsx";

/** Một trang: byte JPEG (RGB) và cỡ ảnh theo điểm ảnh. */
export type TrangJpeg = { bytes: Uint8Array; rong: number; cao: number };

/** Điểm ảnh CSS (96 dpi) → điểm PDF (72 dpi). */
const PX_SANG_PT = 0.75;
const so = (x: number) => String(Number(x.toFixed(2)));

export function ghiPdf(trang: readonly TrangJpeg[]): Uint8Array {
  if (trang.length === 0) throw new Error("PDF cần ít nhất một trang");
  const enc = new TextEncoder();
  const phan: Uint8Array[] = [];
  const viTri: number[] = [];
  let dai = 0;
  const them = (b: Uint8Array) => {
    phan.push(b);
    dai += b.length;
  };
  const chu = (s: string) => them(enc.encode(s));
  const doiTuong = (soDt: number, than: readonly (string | Uint8Array)[]) => {
    viTri[soDt] = dai;
    chu(`${soDt} 0 obj\n`);
    for (const t of than) {
      if (typeof t === "string") chu(t);
      else them(t);
    }
    chu("\nendobj\n");
  };

  chu("%PDF-1.4\n");
  them(Uint8Array.of(0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a)); // dòng nhị phân: báo tệp có byte ngoài ASCII

  // Đối tượng: 1 Catalog, 2 Pages, rồi mỗi trang i ba đối tượng — Page (3+3i), ảnh (4+3i), nội dung (5+3i).
  doiTuong(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  const kids = trang.map((_, i) => `${3 + 3 * i} 0 R`).join(" ");
  doiTuong(2, [`<< /Type /Pages /Kids [${kids}] /Count ${trang.length} >>`]);
  trang.forEach((t, i) => {
    if (!Number.isInteger(t.rong) || !Number.isInteger(t.cao) || t.rong <= 0 || t.cao <= 0) {
      throw new Error(`trang ${i + 1}: cỡ ảnh phải là số nguyên dương`);
    }
    if (t.bytes.length < 4 || t.bytes[0] !== 0xff || t.bytes[1] !== 0xd8) throw new Error(`trang ${i + 1}: không phải JPEG`);
    const [p, anh, nd] = [3 + 3 * i, 4 + 3 * i, 5 + 3 * i];
    const w = so(t.rong * PX_SANG_PT);
    const h = so(t.cao * PX_SANG_PT);
    doiTuong(p, [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${anh} 0 R >> >> /Contents ${nd} 0 R >>`,
    ]);
    doiTuong(anh, [
      `<< /Type /XObject /Subtype /Image /Width ${t.rong} /Height ${t.cao} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${t.bytes.length} >>\nstream\n`,
      t.bytes,
      "\nendstream",
    ]);
    const lenh = `q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`;
    doiTuong(nd, [`<< /Length ${lenh.length} >>\nstream\n${lenh}\nendstream`]);
  });

  const xref = dai;
  const tong = 3 + 3 * trang.length;
  let bang = `xref\n0 ${tong}\n0000000000 65535 f \n`;
  for (let i = 1; i < tong; i++) bang += `${String(viTri[i]).padStart(10, "0")} 00000 n \n`;
  chu(`${bang}trailer\n<< /Size ${tong} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return noi(phan);
}
