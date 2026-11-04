import { navigationFor } from "@quy-hang/core";
import type { AppliedRow, Cell, ImportContext, PlanTarget, StandardField } from "@quy-hang/core/import";

import { apLai, coTheTiepGhep, doiDich, type Ong } from "./duong-ong";

/**
 * Trạng thái năm bước của màn Nhập Excel (hàng man-nhap-excel) — hàm thuần, màn React chỉ giữ và hiện. Luật: quyền theo
 * bảng vai của lõi; Trưởng nhóm chọn một đầu chủ cho cả tệp (Hỏi-2, Cổng Phạm vi 04/11); sửa ô là đổi giá trị thô rồi áp
 * lại kế hoạch; đổi gì sau bản xem thử thì bỏ bản xem thử — nút ghi chỉ mở trên đúng các dòng đã xem thử.
 */

export const BUOC = [
  { so: 1, ten: "Tải tệp", moTa: "Chọn tệp .xlsx hay .csv." },
  { so: 2, ten: "Ghép cột", moTa: "Ghép cột trong tệp vào trường của căn." },
  { so: 3, ten: "Xem trước", moTa: "Từng ô sẽ ghi gì — sửa ô, bỏ dòng." },
  { so: 4, ten: "Trùng", moTa: "Từng dòng thành gì trên Quỹ hàng." },
  { so: 5, ten: "Tóm tắt", moTa: "Ghi vào Quỹ hàng." },
] as const;

export type HanhDong = "create" | "update" | "supplement" | "skip";
export type KetQuaDong = { row: number; action: HanhDong; reason: string; listingId?: string };
export type TongKet = Record<HanhDong, number>;
export type XemThu = { importId: string; rows: KetQuaDong[]; summary: TongKet };

export type TepChon = { ten: string; bam: string; loai: "xlsx" | "csv"; trang: string | null };

export type TrangThaiNhap = {
  vai: readonly string[];
  buoc: number;
  tep: TepChon | null;
  ong: Ong | null;
  /** Đầu chủ được chọn khi người nhập là Trưởng nhóm. */
  dauChu: string | null;
  bo: ReadonlySet<number>;
  xemThu: XemThu | null;
};

export type GoiDong = { row: number; cells: Cell[]; agentUserId?: string; skip?: boolean };

export const coQuyen = (vai: readonly string[]) => navigationFor(vai).actions.includes("import");
/** Trưởng nhóm nhập hộ: phải chọn đầu chủ giữ căn cho cả tệp. */
export const canChonDauChu = (vai: readonly string[]) => vai.includes("team_lead");

export function taoTrangThai(vai: readonly string[]): TrangThaiNhap {
  return { vai, buoc: 1, tep: null, ong: null, dauChu: null, bo: new Set(), xemThu: null };
}

export function napTep(s: TrangThaiNhap, tep: TepChon, ong: Ong): TrangThaiNhap {
  return { ...s, tep, ong, bo: new Set(), xemThu: null, buoc: 1 };
}

export const chonDauChu = (s: TrangThaiNhap, userId: string | null): TrangThaiNhap => ({ ...s, dauChu: userId, xemThu: null });

/** Bước hiện tại cho bấm Tiếp không. */
export function coTheTiep(s: TrangThaiNhap): boolean {
  if (!coQuyen(s.vai)) return false;
  switch (s.buoc) {
    case 1:
      return s.ong !== null && s.ong.table.rows.length > 0 && (!canChonDauChu(s.vai) || s.dauChu !== null);
    case 2:
      return s.ong !== null && coTheTiepGhep(s.ong);
    case 3:
      return s.ong !== null && s.ong.table.rows.some((r) => !s.bo.has(r.source));
    case 4:
      return coTheGhi(s);
    default:
      return false;
  }
}

/** Nút ghi mở khi đã có bản xem thử của đúng trạng thái này và có ít nhất một dòng sẽ ghi. */
export function coTheGhi(s: TrangThaiNhap): boolean {
  if (!s.xemThu) return false;
  const t = s.xemThu.summary;
  return t.create + t.update + t.supplement > 0;
}

export function doiDichCot(s: TrangThaiNhap, cot: number, dich: PlanTarget, ctx: ImportContext): TrangThaiNhap {
  if (!s.ong) return s;
  return { ...s, ong: doiDich(s.ong, cot, dich, ctx), xemThu: null };
}

/** Sửa một ô: đổi giá trị thô của ô trong bảng rồi áp lại kế hoạch. */
export function suaO(s: TrangThaiNhap, source: number, cot: number, raw: string, ctx: ImportContext): TrangThaiNhap {
  if (!s.ong) return s;
  const o = s.ong;
  const rows = o.table.rows.map((r) => (r.source !== source ? r : { ...r, cells: r.cells.map((c, i) => (i === cot ? (raw.trim() === "" ? null : raw) : c)) }));
  return { ...s, ong: apLai({ ...o.table, rows }, o.lop, o.profile, o.plan, ctx), xemThu: null };
}

export function boDong(s: TrangThaiNhap, source: number, bo = true): TrangThaiNhap {
  const set = new Set(s.bo);
  if (bo) set.add(source);
  else set.delete(source);
  return { ...s, bo: set, xemThu: null };
}

export const daXemThu = (s: TrangThaiNhap, xemThu: XemThu): TrangThaiNhap => ({ ...s, xemThu });
export const sangBuoc = (s: TrangThaiNhap, buoc: number): TrangThaiNhap => ({ ...s, buoc });

/** Các dòng gửi máy chủ: ô thô (đã sửa) theo đúng thứ tự tiêu đề; dòng bỏ mang `skip`; Trưởng nhóm gắn đầu chủ. */
export function goiDong(s: TrangThaiNhap): GoiDong[] {
  if (!s.ong) return [];
  const n = s.ong.table.headers.length;
  const dauChu = canChonDauChu(s.vai) && s.dauChu ? { agentUserId: s.dauChu } : {};
  return s.ong.table.rows.map((r) => ({
    row: r.source,
    cells: Array.from({ length: n }, (_, i) => r.cells[i] ?? null),
    ...dauChu,
    ...(s.bo.has(r.source) ? { skip: true } : {}),
  }));
}

/** Giá trị đã chuẩn của một trường trên dòng — cùng cách đọc của đường ghi máy chủ (hàng 65a). */
function giaTri(dong: AppliedRow, field: StandardField): string | null {
  const o = dong.cells.find((c) => c.target === field);
  if (o && (o.mark === "keep" || o.mark === "fixed")) return o.value === null || o.value === undefined ? null : String(o.value);
  const e = dong.extra[field];
  return e === undefined || e === null ? null : String(e);
}

/** Toà và mã căn của mọi dòng (lớp danh mục) — máy chủ xét trùng trên cả tệp, không theo gói. */
export function canCuaTep(s: TrangThaiNhap): { row: number; buildingName: string | null; unitNumber: string | null }[] {
  return (s.ong?.dong ?? []).map((d) => ({ row: d.source, buildingName: giaTri(d, "buildingName"), unitNumber: giaTri(d, "unitNumber") }));
}
