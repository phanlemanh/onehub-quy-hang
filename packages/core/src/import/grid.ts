/**
 * Từ byte tới bảng (Kiến trúc «Nhập dữ liệu» §1, §4 «bẩn ngoài ô»): giải mã csv (UTF-8 có hay không BOM, Windows-1258 của
 * Excel tiếng Việt cũ), tách ô, rồi tìm dòng tiêu đề — kể cả khi nó không ở dòng đầu, khi tiêu đề hai tầng có ô gộp — và
 * bỏ dòng trống, dòng tổng. Tệp xlsx/xls do bộ đọc file của hàng 65 đưa về cùng LƯỚI này.
 */
import { fold } from "./dictionaries";
import { lookupHeader } from "./headers";
import type { Cell } from "./transforms";

export type Grid = Cell[][];

export type TableRow = { /** Số dòng trong lưới gốc (0-based) — màn xem trước và báo cáo chỉ đúng dòng của file. */ source: number; cells: Cell[] };

export type Table = {
  /** Dòng tiêu đề (0-based); tiêu đề hai tầng thì là tầng trên. */
  headerRow: number;
  headerRows: 1 | 2;
  headers: string[];
  rows: TableRow[];
  skipped: { source: number; reason: "blank" | "total" }[];
};

/** Byte của một tệp csv → chữ NFC. BOM UTF-8 / UTF-16 trước; không BOM thì UTF-8 chặt, hỏng thì Windows-1258. */
export function decodeText(bytes: Uint8Array): string {
  let s: string;
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) s = new TextDecoder("utf-8").decode(bytes.subarray(3));
  else if (bytes[0] === 0xff && bytes[1] === 0xfe) s = new TextDecoder("utf-16le").decode(bytes.subarray(2));
  else if (bytes[0] === 0xfe && bytes[1] === 0xff) s = new TextDecoder("utf-16be").decode(bytes.subarray(2));
  else {
    try {
      s = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      s = new TextDecoder("windows-1258").decode(bytes);
    }
  }
  return s.normalize("NFC");
}

/** Chữ csv → lưới. Dấu ngăn tự nhận ở dòng đầu (`,` `;` tab, ngoài ngoặc kép); ô trống → null. */
export function parseCsv(text: string): Grid {
  const dauDong = text.split(/\r?\n/, 1)[0] ?? "";
  const dem = (c: string) => dauDong.replace(/"[^"]*"/g, "").split(c).length - 1;
  const ngan = [",", ";", "\t"].reduce((a, b) => (dem(b) > dem(a) ? b : a), ",");
  const out: Grid = [];
  let dong: Cell[] = [];
  let o = "";
  let trongNgoac = false;
  let coNgoac = false;
  const dayO = () => {
    dong.push(o === "" && !coNgoac ? null : o);
    o = "";
    coNgoac = false;
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (trongNgoac) {
      if (c === '"' && text[i + 1] === '"') {
        o += '"';
        i++;
      } else if (c === '"') trongNgoac = false;
      else o += c;
    } else if (c === '"') {
      trongNgoac = true;
      coNgoac = true;
    } else if (c === ngan) dayO();
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      dayO();
      out.push(dong);
      dong = [];
    } else o += c;
  }
  if (o !== "" || coNgoac || dong.length > 0) {
    dayO();
    out.push(dong);
  }
  return out;
}

const rong = (c: Cell | undefined) => c === null || c === undefined || (typeof c === "string" && c.trim() === "");
const laChu = (c: Cell | undefined): c is string => typeof c === "string" && c.trim() !== "";
const SO_DONG_TIM = 15;

function diemTieuDe(dong: readonly Cell[]): number {
  return dong.filter((c) => laChu(c) && lookupHeader(c) !== null).length;
}

/** Hai dòng (trên, dưới) là tiêu đề hai tầng: trên có ≥ 2 ô chữ, mọi ô không trống của cả hai là chữ, và dưới có ô chữ đứng dưới ô trống của trên. */
function haiTang(tren: readonly Cell[] | undefined, duoi: readonly Cell[] | undefined): boolean {
  if (!tren || !duoi) return false;
  const conTren = tren.filter((c) => !rong(c));
  const conDuoi = duoi.filter((c) => !rong(c));
  if (conTren.length < 2 || conDuoi.length === 0) return false;
  if (!conTren.every(laChu) || !conDuoi.every(laChu)) return false;
  return duoi.some((c, i) => laChu(c) && rong(tren[i]));
}

const LA_DONG_TONG = /^(tong|tong cong|cong|total|sum)\b/;

/** Lưới → bảng: tìm dòng tiêu đề trong 15 dòng đầu, ghép hai tầng, bỏ dòng trống và dòng tổng. */
export function readTable(grid: Grid): Table {
  const soDong = Math.min(grid.length, SO_DONG_TIM);
  let tot = -1;
  let diemTot = 1;
  for (let r = 0; r < soDong; r++) {
    const d = diemTieuDe(grid[r] ?? []);
    if (d > diemTot) [tot, diemTot] = [r, d];
  }
  if (tot < 0) {
    // Không tiêu đề nào trong từ điển: dòng đầu có ≥ 2 ô chữ và không ô số.
    tot = grid.findIndex((d, r) => r < soDong && d.filter(laChu).length >= 2 && d.every((c) => rong(c) || laChu(c)));
    if (tot < 0) tot = 0;
  }
  let tren = tot;
  let tang: 1 | 2 = 1;
  if (tot > 0 && haiTang(grid[tot - 1], grid[tot])) [tren, tang] = [tot - 1, 2];
  else if (haiTang(grid[tot], grid[tot + 1])) tang = 2;

  const dauDuLieu = tren + tang;
  const rongNhat = Math.max(0, ...grid.slice(tren).map((d) => d.reduce<number>((m, c, i) => (rong(c) ? m : i + 1), 0)));
  const headers: string[] = [];
  const cha = grid[tren] ?? [];
  const con = tang === 2 ? (grid[tren + 1] ?? []) : [];
  let nhom = "";
  for (let i = 0; i < rongNhat; i++) {
    const [oCha, oCon] = [cha[i], con[i]];
    const p = laChu(oCha) ? oCha.trim() : "";
    const ch = laChu(oCon) ? oCon.trim() : "";
    if (tang === 2 && ch) {
      if (p) nhom = p;
      headers.push(nhom ? `${nhom} / ${ch}` : ch);
    } else {
      nhom = p ? "" : nhom;
      headers.push(p || ch || `(cột ${i + 1})`);
    }
  }
  const rows: TableRow[] = [];
  const skipped: Table["skipped"] = [];
  for (let r = dauDuLieu; r < grid.length; r++) {
    const d = grid[r] ?? [];
    const cells = Array.from({ length: rongNhat }, (_, i) => (rong(d[i]) ? null : d[i]!));
    if (cells.every((c) => c === null)) {
      skipped.push({ source: r, reason: "blank" });
      continue;
    }
    const dau = cells.find((c) => c !== null);
    if (typeof dau === "string" && LA_DONG_TONG.test(fold(dau))) {
      skipped.push({ source: r, reason: "total" });
      continue;
    }
    rows.push({ source: r, cells });
  }
  return { headerRow: tren, headerRows: tang, headers, rows, skipped };
}
