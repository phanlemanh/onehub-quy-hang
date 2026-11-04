import { navigationFor } from "@quy-hang/core";
import { hocCachGoi, isStandardField, normalizeValue, type AppliedRow, type Cell, type ImportContext, type ImportPlan, type PlanTarget, type StandardField } from "@quy-hang/core/import";

import { apLai, coTheTiepGhep, doiDich, type Ong } from "./duong-ong";

/**
 * Trạng thái năm bước của màn Nhập Excel (hàng man-nhap-excel) — hàm thuần, màn React chỉ giữ và hiện. Luật: quyền theo
 * bảng vai của lõi; Trưởng nhóm chọn một đầu chủ cho cả tệp (Hỏi-2, Cổng Phạm vi 04/11); sửa ô là đổi giá trị thô rồi áp
 * lại kế hoạch; đổi gì sau bản xem thử thì bỏ bản xem thử — nút ghi chỉ mở trên đúng các dòng đã xem thử.
 *
 * Khuôn thế hệ (dừng-vá S4 lượt 2, chủ kho chọn «Đổi khuôn»): mọi thao tác đổi dữ liệu của lần nhập tăng `the`; mọi việc chờ
 * máy (đọc tệp, xem thử, ghi) ghi lại `the` lúc gửi đi và kết quả chỉ được nhận khi `the` hiện tại còn bằng số ấy.
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
  /** Thế hệ của dữ liệu lần nhập — tăng ở mọi thao tác đổi; kết quả chờ máy mang thế hệ lúc gửi. */
  the: number;
  /** Số ô cùng chữ đổi theo lần sửa ô vừa rồi (hàng 67, Hỏi-2) — null khi lần sửa chỉ đổi một ô. */
  soOTheo: number | null;
};

export type GoiDong = { row: number; cells: Cell[]; agentUserId?: string; skip?: boolean };

export const coQuyen = (vai: readonly string[]) => navigationFor(vai).actions.includes("import");
/** Trưởng nhóm nhập hộ: phải chọn đầu chủ giữ căn cho cả tệp. */
export const canChonDauChu = (vai: readonly string[]) => vai.includes("team_lead");

export function taoTrangThai(vai: readonly string[]): TrangThaiNhap {
  return { vai, buoc: 1, tep: null, ong: null, dauChu: null, bo: new Set(), xemThu: null, the: 0, soOTheo: null };
}

/** Mọi thao tác đổi dữ liệu của lần nhập đi qua đây: tăng thế hệ và bỏ bản xem thử. */
const doi = (s: TrangThaiNhap, patch: Partial<TrangThaiNhap>): TrangThaiNhap => ({ ...s, soOTheo: null, ...patch, xemThu: null, the: s.the + 1 });

export function napTep(s: TrangThaiNhap, tep: TepChon, ong: Ong): TrangThaiNhap {
  return doi(s, { tep, ong, bo: new Set(), buoc: 1 });
}

/** Người chọn tệp (hay trang tính) mới: thế hệ mới — kết quả đọc của tệp trước về muộn bị bỏ. */
export const batDauDoc = (s: TrangThaiNhap): TrangThaiNhap => doi(s, {});

/** Nhận kết quả đọc tệp chỉ khi không có thao tác nào sau lúc bắt đầu đọc. */
export const nhanTep = (hienTai: TrangThaiNhap, theLucDoc: number, tep: TepChon, ong: Ong): TrangThaiNhap =>
  hienTai.the === theLucDoc ? napTep(hienTai, tep, ong) : hienTai;

export const chonDauChu = (s: TrangThaiNhap, userId: string | null): TrangThaiNhap => doi(s, { dauChu: userId });

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
  return doi(s, { ong: doiDich(s.ong, cot, dich, ctx) });
}

/** Sửa một ô: đổi giá trị thô của ô trong bảng rồi áp lại kế hoạch. */
/**
 * Sửa một ô ở bước xem trước. Ô «cần người» ở cột lớp danh mục hay hàng chia sẻ được, sửa thành giá trị lõi nhận: thêm cặp
 * «nguyên văn → giá trị» vào bảng quy đổi của cột trong kế hoạch — mọi ô cùng chữ của cột đổi theo, lần nhập sau nhớ (hàng
 * 67, Hỏi-2). Cột nguồn, tên người, chữ tự do, chưa rõ: chỉ đổi ô ấy, kế hoạch không đổi (ADR-0011 quyết định 6).
 */
export function suaO(s: TrangThaiNhap, source: number, cot: number, raw: string, ctx: ImportContext): TrangThaiNhap {
  if (!s.ong) return s;
  const o = s.ong;
  const gocDong = o.table.rows.find((r) => r.source === source);
  const goc = gocDong?.cells[cot] ?? null;
  const col = o.plan.columns[cot];
  const oDong = o.dong.find((d) => d.source === source)?.cells[cot];
  const lop = o.lop[cot]?.cls;
  const moi = raw.trim();
  if (col && typeof goc === "string" && goc.trim() && moi && oDong?.mark === "needs_person" && hocCachGoi(lop, col.target) && isStandardField(col.target)) {
    const nhan = normalizeValue(col.target, moi, { ...ctx, transform: col.transform });
    if (nhan.mark === "keep" || nhan.mark === "fixed") {
      const khoa = goc.trim();
      const columns = o.plan.columns.map((c, i) => (i === cot ? { ...c, valueMap: { ...(c.valueMap ?? {}), [khoa]: moi } } : c));
      // Ô được sửa mang chữ mới như mọi lần sửa; ô cùng chữ còn lại đọc qua bảng quy đổi.
      const rows = o.table.rows.map((r) => (r.source !== source ? r : { ...r, cells: r.cells.map((c, i) => (i === cot ? moi : c)) }));
      const ong = apLai({ ...o.table, rows }, o.lop, o.profile, { ...o.plan, columns }, ctx);
      const k = o.table.rows.filter((r) => r.source !== source && typeof r.cells[cot] === "string" && (r.cells[cot] as string).trim() === khoa).length;
      return doi(s, { ong, soOTheo: k });
    }
  }
  const rows = o.table.rows.map((r) => (r.source !== source ? r : { ...r, cells: r.cells.map((c, i) => (i === cot ? (raw.trim() === "" ? null : raw) : c)) }));
  return doi(s, { ong: apLai({ ...o.table, rows }, o.lop, o.profile, o.plan, ctx) });
}

export function boDong(s: TrangThaiNhap, source: number, bo = true): TrangThaiNhap {
  const set = new Set(s.bo);
  if (bo) set.add(source);
  else set.delete(source);
  return doi(s, { bo: set });
}

export const daXemThu = (s: TrangThaiNhap, xemThu: XemThu): TrangThaiNhap => ({ ...s, xemThu });
/** Nhận bản xem thử về muộn chỉ khi không có thao tác đổi nào sau lúc gửi đi (thế hệ còn khớp) — người đổi đích cột, sửa ô,
 *  bỏ dòng hay đổi đầu chủ trong lúc chờ thì bỏ kết quả ấy (nút ghi chỉ mở trên đúng các dòng đã xem thử). */
export const nhanXemThu = (hienTai: TrangThaiNhap, theLucGui: number, xemThu: XemThu): TrangThaiNhap =>
  hienTai.the === theLucGui ? daXemThu(hienTai, xemThu) : hienTai;

export const sangBuoc = (s: TrangThaiNhap, buoc: number): TrangThaiNhap => ({ ...s, buoc });

/** Thanh bước bấm được khi máy chủ không chạy gì — như nút Quay lại (Ngoài-3 Màn Nhập Excel). */
export const coTheChonBuoc = (chay: { dangDoc: boolean; dangXemThu: boolean; dangGhi: boolean }): boolean => !chay.dangDoc && !chay.dangXemThu && !chay.dangGhi;

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

/** Giá trị đã chuẩn của một trường trên dòng — cùng cách đọc của đường ghi máy chủ (hàng 65a). Ô mã căn lõi đánh dấu trùng
 *  trong tệp (`by: "duplicate"`) bị xoá giá trị; máy chủ áp từng dòng riêng nên vẫn thấy mã ấy — màn chuẩn lại ô bằng chính
 *  phép của cột để máy chủ xét trùng trên cả tệp. */
function giaTri(dong: AppliedRow, field: StandardField, plan: ImportPlan, ctx: ImportContext): string | null {
  const o = dong.cells.find((c) => c.target === field);
  if (o && o.by === "duplicate") {
    const cot = plan.columns.find((c) => c.target === field);
    const kq = normalizeValue(field, o.raw, { ...ctx, transform: cot?.transform });
    return "value" in kq && kq.value !== null && kq.value !== undefined ? String(kq.value) : null;
  }
  if (o && (o.mark === "keep" || o.mark === "fixed")) return o.value === null || o.value === undefined ? null : String(o.value);
  const e = dong.extra[field];
  return e === undefined || e === null ? null : String(e);
}

/** Toà và mã căn của mọi dòng (lớp danh mục) — máy chủ xét trùng trên cả tệp, không theo gói. */
export function canCuaTep(s: TrangThaiNhap): { row: number; buildingName: string | null; unitNumber: string | null }[] {
  const o = s.ong;
  if (!o) return [];
  return o.dong.map((d) => ({ row: d.source, buildingName: giaTri(d, "buildingName", o.plan, o.ctx), unitNumber: giaTri(d, "unitNumber", o.plan, o.ctx) }));
}
