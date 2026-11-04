import { decodeText, parseCsv, type Cell, type Grid } from "@quy-hang/core/import";

/**
 * Bộ đọc tệp của màn Nhập Excel (hàng man-nhap-excel): byte của tệp người chọn → LƯỚI mà lõi nhập đọc (`readTable`). Chạy
 * trên trình duyệt, tệp không lên máy chủ (Kiến trúc «Nhập dữ liệu» §1). xlsx đọc bằng `exceljs` nạp lười; csv bằng
 * `decodeText` + `parseCsv` của lõi. Ô gộp: ô chính giữ chữ, ô phụ trống — đúng khuôn lõi nhận tiêu đề hai tầng.
 */

/** Cỡ tối đa một tệp và số dòng tối đa một lần nhập (Hỏi-5, Cổng Phạm vi 04/11). */
export const CO_TOI_DA = 10 * 1024 * 1024;
export const DONG_TOI_DA = 5000;

export type TepDoc = { loai: "xlsx" | "csv"; trang: string[]; trangChon: string | null; grid: Grid };
export type LoiDoc = { loi: string };

export const LOI_DOC = {
  xls: "Tệp .xls (Excel đời cũ) chưa đọc được. Mở tệp bằng Excel, chọn Lưu thành → .xlsx rồi chọn lại.",
  loai: "Chỉ nhận tệp .xlsx hay .csv.",
  co: "Tệp lớn hơn 10 MB. Chia tệp thành nhiều phần rồi nhập từng phần.",
  dong: "Tệp có hơn 5.000 dòng. Chia tệp thành nhiều phần rồi nhập từng phần.",
  hong: "Không đọc được tệp này — tệp có thể hỏng hay không đúng loại.",
  rong: "Tệp chưa có dòng nào.",
  trang: "Không có trang tính này trong tệp.",
} as const;

const CHU_KY_OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const CHU_KY_ZIP = [0x50, 0x4b, 0x03, 0x04];
const batDau = (b: Uint8Array, ky: number[]) => ky.every((x, i) => b[i] === x);
const duoi = (ten: string) => ten.toLowerCase().split(".").pop() ?? "";

/** Một giá trị ô của exceljs → ô của lõi. Bảy dạng: số, chữ, ngày, đúng/sai, công thức (kết quả lưu sẵn), chữ định dạng,
 *  liên kết; ô lỗi và ô trống → null. */
export function oTuExcel(v: unknown): Cell {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") return v.normalize("NFC");
  if (typeof v === "boolean") return v ? "Có" : "Không";
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if ("error" in o) return null;
    if ("formula" in o || "sharedFormula" in o) return oTuExcel(o.result);
    if (Array.isArray(o.richText)) return (o.richText as { text?: unknown }[]).map((r) => String(r.text ?? "")).join("").normalize("NFC");
    if ("hyperlink" in o) return oTuExcel(o.text);
    if ("text" in o) return oTuExcel(o.text);
  }
  return null;
}

async function docXlsx(bytes: Uint8Array, trang?: string): Promise<TepDoc | LoiDoc> {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
  } catch {
    return { loi: LOI_DOC.hong };
  }
  const ten = wb.worksheets.map((w) => w.name);
  if (ten.length === 0) return { loi: LOI_DOC.rong };
  const ws = trang === undefined ? wb.worksheets[0]! : wb.getWorksheet(trang);
  if (!ws) return { loi: LOI_DOC.trang };
  if (ws.rowCount > DONG_TOI_DA + 15) return { loi: LOI_DOC.dong };
  const grid: Grid = [];
  ws.eachRow({ includeEmpty: true }, (row, so) => {
    const dong: Cell[] = [];
    row.eachCell({ includeEmpty: true }, (cell, cot) => {
      // Ô phụ của vùng gộp mang giá trị ô chính trong exceljs; lõi nhận ô gộp là ô chính có chữ, ô phụ trống.
      const phu = cell.isMerged && cell.master.address !== cell.address;
      while (dong.length < cot - 1) dong.push(null);
      dong[cot - 1] = phu ? null : oTuExcel(cell.value);
    });
    while (grid.length < so - 1) grid.push([]);
    grid[so - 1] = dong;
  });
  return { loai: "xlsx", trang: ten, trangChon: ws.name, grid };
}

/** Đọc một tệp người chọn. Lỗi trả `{loi}` bằng chữ cho người, không ném. */
export async function docTep(tenTep: string, bytes: Uint8Array, trang?: string): Promise<TepDoc | LoiDoc> {
  const d = duoi(tenTep);
  if (d === "xls" || batDau(bytes, CHU_KY_OLE)) return { loi: LOI_DOC.xls };
  if (d !== "xlsx" && d !== "csv") return { loi: LOI_DOC.loai };
  if (bytes.byteLength > CO_TOI_DA) return { loi: LOI_DOC.co };
  let kq: TepDoc | LoiDoc;
  if (d === "xlsx") {
    if (!batDau(bytes, CHU_KY_ZIP)) return { loi: LOI_DOC.hong };
    kq = await docXlsx(bytes, trang);
  } else {
    kq = { loai: "csv", trang: [], trangChon: null, grid: parseCsv(decodeText(bytes)) };
  }
  if ("loi" in kq) return kq;
  const coChu = kq.grid.filter((r) => r.some((c) => c !== null && String(c).trim() !== ""));
  if (coChu.length === 0) return { loi: LOI_DOC.rong };
  // Dòng tiêu đề không tính vào trần.
  if (coChu.length - 1 > DONG_TOI_DA) return { loi: LOI_DOC.dong };
  return kq;
}

/** Băm SHA-256 của tệp (hex) — máy chủ chỉ nhận băm, không nhận tệp. */
export async function bamTep(bytes: Uint8Array): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
