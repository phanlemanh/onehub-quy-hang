/**
 * Bộ thử của lõi nhập (Kiến trúc «Nhập dữ liệu» §9, ADR-0011 quyết định 7): hai file mẫu của hàng 5 đọc từ đĩa và sáu file
 * bẩn sinh TẤT ĐỊNH từ `du-lieu-mau.json` — cùng tệp ra cùng từng byte. Mỗi file kèm đáp án: dòng tiêu đề, đích từng cột,
 * giá trị đúng từng ô, và mỗi lỗi cấy một nhãn (giá trị đúng hay «phải hỏi người»).
 *
 * Đáp án lấy từ DỮ LIỆU MẪU qua bảng `DUNG` dưới đây — không gọi mã đang kiểm (`src/import`): bộ sinh không nhập gì từ đó
 * ngoài kiểu (bài «bộ thử: bộ sinh không nhập mã đang kiểm» quét chữ). Chỉ dữ liệu mẫu: tên mang «[Mẫu]», số dạng
 * `0900 000 0xx`, email ở miền `.test`, số giấy tờ toàn số 0 đầu.
 */
import { readFileSync } from "node:fs";
import type { CatalogData } from "../../src/catalog/types";
import type { Grid } from "../../src/import/grid";
import type { Cell } from "../../src/import/transforms";
import type { PlanTarget } from "../../src/import/plan";
import { docXlsx } from "./doc-xlsx";

type Value = string | number | null;

type Hang = { ma: string; maCan: string; trangThai: string; gia: number; dieuKienPhi: string; dauChu: string; chuNha: string; ghiChu: string; nhan: string };
type Can = { unitNumber: string; floor: number; livingArea: number; bedroomsTotal: number; directionFaces: string; stack: string };
type DuLieuMau = {
  nhan: string;
  nguoi: { khoa: string; ten: string }[];
  chuNha: { ma: string; ten: string; soDienThoai: string }[];
  lead: { ten: string; soDienThoai: string }[];
  hang: Hang[];
  danhMuc: { subdivisions: { subdivisionName: string; buildings: { buildingName: string; buildingKey: string; units: Can[] }[] }[] };
};

const tep = (rel: string) => new URL(rel, import.meta.url);
export const DU_LIEU_MAU_URL = tep("../../../db/seed/mau/du-lieu-mau.json");
export const MAU_URL = { "mau-a": tep("../../../db/seed/mau/mau-a.xlsx"), "mau-b": tep("../../../db/seed/mau/mau-b.xlsx") };

export function docDuLieuMau(): DuLieuMau {
  return JSON.parse(readFileSync(DU_LIEU_MAU_URL, "utf8")) as DuLieuMau;
}

/** Hôm nay của bộ thử — cố định để số nền tính lại ra cùng kết quả. */
export const HOM_NAY = "2026-11-03";

export type LoiCay = { dong: number; cot: number; nhan: string; value?: Value; ask?: true };
export type DapAn = {
  headerRow: number;
  targets: PlanTarget[];
  /** Số dòng gốc (trong lưới) của từng dòng dữ liệu, theo thứ tự. */
  dong: number[];
  /** Giá trị đúng của từng ô, ở dạng chuẩn: dong × cột. */
  dung: Value[][];
  loiCay: LoiCay[];
  /** Mọi chuỗi không được có trong hồ sơ cột của file (nguồn và dữ liệu cá nhân, đủ các dạng). */
  camLo: string[];
};
export type TepThu = { ten: string; grid?: Grid; bytes?: Uint8Array; dapAn: DapAn };

// ── Ngữ cảnh từ dữ liệu mẫu ─────────────────────────────────────────────────────────────────────────────────────────

type Ctx = { d: DuLieuMau; can: (h: Hang) => Can & { toa: string; toaKhoa: string; duAn: string }; chu: (h: Hang) => { ten: string; soDienThoai: string }; nguoi: (h: Hang) => string };
function nguCanh(d: DuLieuMau): Ctx {
  const can = new Map<string, Can & { toa: string; toaKhoa: string; duAn: string }>();
  for (const p of d.danhMuc.subdivisions) for (const b of p.buildings) for (const u of b.units) can.set(u.unitNumber, { ...u, toa: b.buildingName, toaKhoa: b.buildingKey, duAn: p.subdivisionName });
  const chu = new Map(d.chuNha.map((c) => [c.ma, c]));
  const nguoi = new Map(d.nguoi.map((n) => [n.khoa, n.ten]));
  return { d, can: (h) => can.get(h.maCan)!, chu: (h) => chu.get(h.chuNha)!, nguoi: (h) => nguoi.get(h.dauChu)! };
}

const chiSo = (s: string) => s.replace(/\D/g, "");
const TRANG_THAI_DU: Record<string, string> = { Incomplete: "Chưa đủ để rao", Active: "Đang bán", Pending: "Đang giao dịch", Closed: "Đã bán", Hold: "Tạm ngừng", Withdrawn: "Ngừng hẳn" };
const TRANG_THAI_TAT: Record<string, string> = { Incomplete: "Chưa đủ", Active: "Đang bán", Pending: "Đang GD", Closed: "Đã bán", Hold: "Tạm ngừng", Withdrawn: "Ngừng" };
const phiChuan = (h: Hang) => (h.dieuKienPhi === "bao_phi" ? "included" : "excluded");
const ty = (h: Hang) => Math.round(h.gia / 1e7) / 100;

/** Ngày xác nhận của dòng i (dữ liệu mẫu không có ngày): một bảng viết tay theo chỉ số, mọi ngày trước HOM_NAY. */
export function ngayDung(i: number): string {
  const thang = 1 + ((i * 5) % 10);
  const ngay = 1 + ((i * 7) % 28);
  return `2026-${String(thang).padStart(2, "0")}-${String(ngay).padStart(2, "0")}`;
}

/**
 * Giá trị đúng của một đích trên một hàng — BẢNG GHÉP TAY «đích → cách lấy từ dữ liệu mẫu». `keep_as_note` lấy chữ
 * nguyên văn của ô (ghi chú giữ nguyên), `ignore_with_reason` không ghi gì.
 */
function dung(t: PlanTarget, h: Hang, i: number, c: Ctx, chuNguyenVan: Cell): Value {
  const u = c.can(h);
  switch (t) {
    case "unitNumber":
      return h.maCan;
    case "buildingName":
      return u.toa;
    case "subdivisionName":
      return u.duAn;
    case "floor":
      return u.floor;
    case "livingArea":
      return u.livingArea;
    case "bedroomsTotal":
      return u.bedroomsTotal;
    case "directionFaces":
      return u.directionFaces;
    case "listPrice":
      return h.gia;
    case "feeInclusion":
      return phiChuan(h);
    case "standardStatus":
      return h.trangThai;
    case "ownerName":
      return c.chu(h).ten;
    case "ownerPhone":
      return chiSo(c.chu(h).soDienThoai);
    case "listAgentName":
      return c.nguoi(h);
    case "privateRemarks":
      return h.ghiChu || null;
    case "confirmedDate":
      return ngayDung(i);
    case "ignore_with_reason":
      return null;
    default:
      return chuNguyenVan === null ? null : String(chuNguyenVan).trim();
  }
}

/** Danh sách cấm của một file: tên và số mọi chủ nhà, mọi lead (số ở ba dạng: nguyên văn, chuẩn 0…, lõi 9 chữ số cuối). */
function camCoBan(d: DuLieuMau): string[] {
  const out: string[] = [];
  for (const p of [...d.chuNha, ...d.lead]) {
    out.push(p.ten, p.soDienThoai, chiSo(p.soDienThoai), chiSo(p.soDienThoai).slice(-9));
  }
  return [...new Set(out)];
}

function dapAnTu(grid: Grid, headerRow: number, soTang: number, targets: PlanTarget[], c: Ctx, dongGoc: number[], loiCay: LoiCay[], camLo: string[], dungRieng?: (k: number, cot: number) => Value | undefined): DapAn {
  const dungO = dongGoc.map((r, k) =>
    targets.map((t, cot) => {
      const rieng = dungRieng?.(k, cot);
      return rieng !== undefined ? rieng : dung(t, c.d.hang[k]!, k, c, grid[r]?.[cot] ?? null);
    }),
  );
  void soTang;
  return { headerRow, targets, dong: dongGoc, dung: dungO, loiCay, camLo };
}

const tuDen = (a: number, n: number) => Array.from({ length: n }, (_, i) => a + i);

// ── Hai file mẫu ────────────────────────────────────────────────────────────────────────────────────────────────────

/** Đích đúng của từng cột theo NGHĨA của bộ ghi hàng 5 (`packages/db/seed/mau-file.mjs`). */
export const DICH_MAU_A: PlanTarget[] = ["unitNumber", "buildingName", "livingArea", "bedroomsTotal", "directionFaces", "listPrice", "feeInclusion", "standardStatus", "ownerName", "ownerPhone", "listAgentName", "privateRemarks", "keep_as_note"];
export const DICH_MAU_B: PlanTarget[] = ["ignore_with_reason", "standardStatus", "subdivisionName", "buildingName", "floor", "unitNumber", "livingArea", "bedroomsTotal", "directionFaces", "listPrice", "feeInclusion", "listAgentName", "ownerName", "ownerPhone", "privateRemarks", "keep_as_note"];

function mau(ten: "mau-a" | "mau-b", c: Ctx): TepThu {
  const grid = docXlsx(readFileSync(MAU_URL[ten]));
  const dich = ten === "mau-a" ? DICH_MAU_A : DICH_MAU_B;
  return { ten, grid, dapAn: dapAnTu(grid, 0, 1, dich, c, tuDen(1, c.d.hang.length), [], camCoBan(c.d)) };
}

// ── ban-tieu-de: tiêu đề ở dòng 4, hai tầng có ô gộp, dòng trống giữa bảng, dòng tổng cuối ─────────────────────────────

function banTieuDe(c: Ctx): TepThu {
  const dich: PlanTarget[] = ["ignore_with_reason", "unitNumber", "buildingName", "livingArea", "bedroomsTotal", "listPrice", "feeInclusion", "standardStatus", "ownerName", "ownerPhone", "listAgentName", "privateRemarks"];
  const grid: Grid = [
    ["BẢNG HÀNG THÁNG 10/2026 — [Mẫu] Sàn thử"],
    ["Đầu chủ tự cập nhật"],
    [],
    ["STT", "Thông tin căn", null, null, null, "Giá", null, "Tình trạng", "Liên hệ chủ", null, "NV phụ trách", "Ghi chú"],
    [null, "Mã", "Toà", "S thông thuỷ", "Ph.ngủ", "Chào (tỷ)", "Phí", null, "Tên", "SĐT", null, null],
  ];
  const dongGoc: number[] = [];
  const loiCay: LoiCay[] = [];
  c.d.hang.forEach((h, i) => {
    if (i === 20) grid.push([]);
    const u = c.can(h);
    let dt: Cell = u.livingArea;
    let pn: Cell = `${u.bedroomsTotal}PN`;
    if (i % 10 === 3) {
      dt = `${String(u.livingArea).replace(".", ",")} m2`;
      loiCay.push({ dong: i, cot: 3, nhan: "diện tích có đơn vị và dấu phẩy", value: u.livingArea });
    }
    if (i % 10 === 7) {
      pn = `${u.bedroomsTotal}PN+1`;
      loiCay.push({ dong: i, cot: 4, nhan: "phòng ngủ «+1»", value: u.bedroomsTotal });
    }
    dongGoc.push(grid.length);
    grid.push([i + 1, h.maCan, u.toa, dt, pn, ty(h), h.dieuKienPhi === "bao_phi" ? "BP" : "KBP", TRANG_THAI_DU[h.trangThai]!, c.chu(h).ten, c.chu(h).soDienThoai, c.nguoi(h), h.ghiChu || null]);
  });
  grid.push(["Tổng cộng", c.d.hang.length]);
  return { ten: "ban-tieu-de", grid, dapAn: dapAnTu(grid, 3, 2, dich, c, dongGoc, loiCay, camCoBan(c.d)) };
}

// ── ban-gia: giá đủ kiểu, giá kèm phí, dải giá, «TL», giá về tay ────────────────────────────────────────────────────────

function banGia(c: Ctx): TepThu {
  const dich: PlanTarget[] = ["unitNumber", "buildingName", "listPrice", "feeInclusion", "standardStatus"];
  const grid: Grid = [["Mã căn", "Toà", "Giá (tỷ)", "Phí CN", "TT"]];
  const loiCay: LoiCay[] = [];
  c.d.hang.forEach((h, i) => {
    const t = ty(h);
    const [nguyen, le = ""] = String(t).split(".");
    let gia: Cell = t;
    let phi: Cell = h.dieuKienPhi === "bao_phi" ? "BP" : "KBP";
    const cay = (nhan: string, v: Partial<LoiCay>) => loiCay.push({ dong: i, cot: 2, nhan, ...v });
    switch (i % 10) {
      case 1:
        gia = String(t).replace(".", ",");
        cay("dấu phẩy thập phân", { value: h.gia });
        break;
      case 2:
        gia = `${nguyen} tỷ ${le.padEnd(3, "0")}`;
        cay("«4 tỷ 650»", { value: h.gia });
        break;
      case 3:
        gia = `${h.gia / 1e6}tr`;
        cay("đơn vị triệu trong cột tỷ", { value: h.gia });
        break;
      case 4:
        gia = `${t} ${phi}`;
        phi = null;
        cay("giá kèm điều kiện phí trong một ô", { value: h.gia });
        loiCay.push({ dong: i, cot: 3, nhan: "điều kiện phí nằm ở ô giá", value: phiChuan(h) });
        break;
      case 5:
        gia = `${(t - 0.1).toFixed(1)}–${(t + 0.1).toFixed(1)}`;
        cay("dải giá", { ask: true });
        break;
      case 6:
        gia = "TL";
        cay("giá thương lượng", { ask: true });
        break;
      case 7:
        gia = `thu về ${(t - 0.2).toFixed(1)}`;
        cay("giá về tay chủ", { ask: true });
        break;
      case 8:
        if (h.dieuKienPhi === "bao_phi") {
          phi = "bao sang tên";
          loiCay.push({ dong: i, cot: 3, nhan: "«bao sang tên»", value: "included" });
        } else {
          phi = "chưa phí";
          loiCay.push({ dong: i, cot: 3, nhan: "«chưa phí»", value: "excluded" });
        }
        break;
    }
    grid.push([h.maCan, c.can(h).toa, gia, phi, TRANG_THAI_TAT[h.trangThai]!]);
  });
  return { ten: "ban-gia", grid, dapAn: dapAnTu(grid, 0, 1, dich, c, tuDen(1, c.d.hang.length), loiCay, camCoBan(c.d)) };
}

// ── ban-ma-can: mã viết đủ kiểu, mã chưa có trong danh mục, mã trùng trong file, toà lệch danh mục ────────────────────

function banMaCan(c: Ctx): TepThu {
  const dich: PlanTarget[] = ["ignore_with_reason", "unitNumber", "buildingName", "floor", "livingArea", "bedroomsTotal", "directionFaces", "listPrice", "feeInclusion", "standardStatus"];
  const grid: Grid = [["STT", "Mã căn", "Toà", "Tầng", "DT", "PN", "Hướng", "Giá chào (VNĐ)", "Điều kiện phí", "Trạng thái"]];
  const loiCay: LoiCay[] = [];
  c.d.hang.forEach((h, i) => {
    const u = c.can(h);
    let ma: Cell = h.maCan;
    let toa: Cell = u.toa;
    const cay = (cot: number, nhan: string, v: Partial<LoiCay>) => loiCay.push({ dong: i, cot, nhan, ...v });
    switch (i % 10) {
      case 1:
        ma = `${u.toaKhoa.toLowerCase()}${u.floor}-${u.stack}`;
        cay(1, "mã chữ thường, tầng không số 0", { value: h.maCan });
        break;
      case 2:
        ma = `${u.toaKhoa} ${String(u.floor).padStart(2, "0")} ${u.stack}`;
        cay(1, "mã ngăn bằng cách", { value: h.maCan });
        break;
      case 3:
        ma = `${u.toaKhoa}${String(u.floor).padStart(2, "0")}${u.stack}`;
        cay(1, "mã viết liền", { value: h.maCan });
        break;
      case 4:
        ma = `${u.toaKhoa}-16.${u.stack}`;
        cay(1, "mã chưa có trong danh mục", { ask: true });
        break;
      case 5:
        toa = u.toaKhoa;
        cay(2, "toà ghi khoá thay tên", { value: u.toa });
        break;
      case 6:
        toa = u.toaKhoa === "A" ? "Toà B" : "Toà A";
        cay(2, "toà lệch danh mục", { ask: true });
        break;
    }
    if (i === 38) {
      ma = c.d.hang[0]!.maCan;
      cay(1, "mã trùng với dòng đầu", { ask: true });
    }
    grid.push([i + 1, ma, toa, u.floor, u.livingArea, u.bedroomsTotal, u.directionFaces, h.gia, h.dieuKienPhi === "bao_phi" ? "Đã gồm phí" : "Chưa gồm phí", TRANG_THAI_DU[h.trangThai]!]);
  });
  return { ten: "ban-ma-can", grid, dapAn: dapAnTu(grid, 0, 1, dich, c, tuDen(1, c.d.hang.length), loiCay, camCoBan(c.d)) };
}

// ── ban-ngay-trang-thai: ngày lẫn định dạng, số ngày Excel, thiếu năm; trạng thái chữ tự do; hướng viết tắt ────────────

const NGAY_EXCEL_GOC = Date.UTC(1899, 11, 30);
const soNgayExcel = (iso: string) => Math.round((Date.parse(`${iso}T00:00:00Z`) - NGAY_EXCEL_GOC) / 86_400_000);
const vietTat: Record<string, string> = { "Đông Nam": "ĐN", "Đông Bắc": "ĐB", "Tây Nam": "TN", "Tây Bắc": "TB", Nam: "N", Bắc: "B", Đông: "Đ", Tây: "T" };

function banNgayTrangThai(c: Ctx): TepThu {
  const dich: PlanTarget[] = ["unitNumber", "buildingName", "directionFaces", "listPrice", "feeInclusion", "standardStatus", "confirmedDate"];
  const grid: Grid = [["Mã căn", "Toà", "Hướng", "Giá (tỷ)", "Phí CN", "Trạng thái", "Ngày cập nhật"]];
  const loiCay: LoiCay[] = [];
  const TRANG_THAI_LA: Record<string, string> = { Pending: "cọc", Active: "dang ban", Closed: "đã chốt", Withdrawn: "dừng bán", Hold: "tạm dừng", Incomplete: "chưa đủ tin" };
  c.d.hang.forEach((h, i) => {
    const u = c.can(h);
    const iso = ngayDung(i);
    const [y, m, d] = iso.split("-");
    let ngay: Cell = `${d}/${m}/${y}`;
    let tt: Cell = TRANG_THAI_DU[h.trangThai]!;
    let huong: Cell = u.directionFaces;
    const cay = (cot: number, nhan: string, v: Partial<LoiCay>) => loiCay.push({ dong: i, cot, nhan, ...v });
    if (i % 8 === 1) {
      ngay = soNgayExcel(iso);
      cay(6, "số ngày Excel", { value: iso });
    } else if (i % 8 === 2) {
      ngay = iso;
      cay(6, "ngày ISO", { value: iso });
    } else if (i % 8 === 3) {
      ngay = `${Number(d)}/${Number(m)}`;
      cay(6, "ngày thiếu năm", { ask: true });
    }
    if (i % 6 === 1) {
      tt = TRANG_THAI_LA[h.trangThai]!;
      cay(5, `trạng thái chữ tự do «${tt}»`, { value: h.trangThai });
    } else if (i % 6 === 4) {
      tt = "chờ sổ";
      cay(5, "trạng thái lạ", { ask: true });
    }
    if (i % 5 === 2) {
      huong = vietTat[u.directionFaces]!;
      cay(2, "hướng viết tắt", { value: u.directionFaces });
    } else if (i % 5 === 3) {
      huong = u.directionFaces.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
      cay(2, "hướng không dấu", { value: u.directionFaces });
    }
    grid.push([h.maCan, u.toa, huong, ty(h), h.dieuKienPhi === "bao_phi" ? "BP" : "KBP", tt, ngay]);
  });
  return { ten: "ban-ngay-trang-thai", grid, dapAn: dapAnTu(grid, 0, 1, dich, c, tuDen(1, c.d.hang.length), loiCay, camCoBan(c.d)) };
}

// ── ban-nguon-giau: số chủ trong ghi chú, cột «Liên hệ» chứa số +84, tên chủ trong cột Toà, email, số giấy tờ ───────────

function banNguonGiau(c: Ctx): TepThu {
  const dich: PlanTarget[] = ["unitNumber", "buildingName", "listPrice", "feeInclusion", "standardStatus", "ownerName", "ownerPhone", "keep_as_note", "keep_as_note", "privateRemarks"];
  const grid: Grid = [["Mã căn", "Toà", "Giá (tỷ)", "Phí CN", "TT", "Chủ nhà", "Liên hệ", "Email", "Số GT", "Ghi chú"]];
  const loiCay: LoiCay[] = [];
  const cam = camCoBan(c.d);
  const ghiChu: Value[] = [];
  c.d.hang.forEach((h, i) => {
    const u = c.can(h);
    const chu = c.chu(h);
    const so = chiSo(chu.soDienThoai);
    const lienHe = `+84 ${so.slice(1, 4)} ${so.slice(4, 7)} ${so.slice(7)}`;
    const email = `chu${so.slice(-3)}@mau.quy-hang.test`;
    const giayTo = `000000000${so.slice(-3)}`;
    cam.push(lienHe, email, email.toLowerCase(), giayTo);
    let toa: Cell = u.toa;
    let note: Cell = h.ghiChu || null;
    if (i % 4 === 0) {
      note = `${h.ghiChu || "Gọi"} — chủ ${chu.ten} ${chu.soDienThoai}`;
    }
    if (i % 13 === 5) {
      toa = chu.ten;
      loiCay.push({ dong: i, cot: 1, nhan: "tên chủ trong cột Toà", ask: true });
    }
    ghiChu.push(note === null ? null : String(note));
    grid.push([h.maCan, toa, ty(h), h.dieuKienPhi === "bao_phi" ? "BP" : "KBP", TRANG_THAI_TAT[h.trangThai]!, chu.ten, lienHe, email, giayTo, note]);
  });
  const da = dapAnTu(grid, 0, 1, dich, c, tuDen(1, c.d.hang.length), loiCay, [...new Set(cam)], (k, cot) => (cot === 9 ? ghiChu[k] : undefined));
  return { ten: "ban-nguon-giau", grid, dapAn: da };
}

// ── ban-csv: cùng dữ liệu mau-a, csv UTF-8 có BOM và csv Windows-1258 ─────────────────────────────────────────────────

const cp1258 = (() => {
  const m = new Map<string, number>();
  const dec = new TextDecoder("windows-1258");
  for (let b = 0; b < 256; b++) {
    const ch = dec.decode(new Uint8Array([b]));
    if (ch !== "�" && !m.has(ch)) m.set(ch, b);
  }
  return m;
})();

/** Mã hoá Windows-1258: ký tự có sẵn trong bảng thì một byte; còn lại tách thành chữ gốc (có sẵn) + dấu thanh tổ hợp. */
export function maHoaCp1258(s: string): Uint8Array {
  const out: number[] = [];
  for (const ch of s.normalize("NFC")) {
    const b = cp1258.get(ch);
    if (b !== undefined) {
      out.push(b);
      continue;
    }
    // Chữ gốc ghép với MỘT dấu phụ (mũ, trăng, móc) thành ký tự có sẵn; dấu thanh còn lại là byte tổ hợp.
    const [goc, ...dau] = [...ch.normalize("NFD")];
    let xong = false;
    for (const thu of [null, ...dau]) {
      const ghep = (thu === null ? goc! : goc! + thu).normalize("NFC");
      const con = dau.filter((x) => x !== thu);
      if (cp1258.has(ghep) && con.every((x) => cp1258.has(x))) {
        out.push(cp1258.get(ghep)!, ...con.map((x) => cp1258.get(x)!));
        xong = true;
        break;
      }
    }
    if (!xong) throw new Error(`cp1258: không mã hoá được «${ch}»`);
  }
  return new Uint8Array(out);
}

function csvCua(grid: Grid): string {
  const o = (c: Cell) => {
    if (c === null) return "";
    const s = String(c);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return grid.map((d) => d.map(o).join(",")).join("\r\n") + "\r\n";
}

function banCsv(mauA: TepThu): TepThu[] {
  const chu = csvCua(mauA.grid!);
  const utf8 = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(chu)]);
  return [
    { ten: "ban-csv-utf8", bytes: utf8, dapAn: mauA.dapAn },
    { ten: "ban-csv", bytes: maHoaCp1258(chu), dapAn: mauA.dapAn },
  ];
}

/** Trọn bộ thử, theo thứ tự cố định. */
export function sinhBoThu(d: DuLieuMau = docDuLieuMau()): TepThu[] {
  const c = nguCanh(d);
  const a = mau("mau-a", c);
  return [a, mau("mau-b", c), banTieuDe(c), banGia(c), banMaCan(c), banNgayTrangThai(c), banNguonGiau(c), ...banCsv(a)];
}

/** Danh mục mẫu cho ngữ cảnh nhập. */
export function danhMucMau(d: DuLieuMau = docDuLieuMau()): CatalogData {
  return d.danhMuc as unknown as CatalogData;
}
