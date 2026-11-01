/**
 * Sửa hàng loạt (hàng 16): xét một lô căn đã tích trước khi ghi. Thuần — không React: thanh hành động, hộp hỏi lại và bài
 * kiểm cùng đọc. Mỗi căn một sự kiện (không có API ghi lô); căn không đổi được không ghi và được kể tên trước khi ghi.
 */
import { checkTransition, type StandardStatus, type WithdrawnReason } from "@quy-hang/core/listing";
import type { HangSua, Lenh } from "../cell-edit/lenh";
import { STATUS_LABEL } from "../cot";

export type KhongDoi = { id: string; maCan: string; lyDo: string };
export type XetLo = { doiDuoc: HangSua[]; khongDoi: KhongDoi[] };

/** Nấc đích của «Đổi trạng thái» hàng loạt — không có Đã bán: mỗi căn cần giá chốt riêng. */
export const NAC_DICH: readonly StandardStatus[] = ["Incomplete", "Active", "Pending", "Hold", "Withdrawn"];

export const DA_O_NAC = "đã ở nấc này";
export const CHON_LY_DO = "chọn lý do ngừng";
export const CAN_DA_DONG = "căn đã đóng";
export const khongChuyenTu = (tu: StandardStatus) => `không chuyển được từ ${STATUS_LABEL[tu]}`;

const NHAN_THIEU: Record<string, string> = {
  listPrice: "giá",
  feeInclusion: "điều kiện phí",
  legalStatus: "pháp lý",
  occupantType: "tình trạng sử dụng",
  closePrice: "giá chốt",
  withdrawnReason: "lý do ngừng",
};

const maCan = (h: HangSua) => h.unitNumber ?? "—";

/** Đổi trạng thái cả lô: mỗi căn rơi đúng một ngăn, theo bảng chuyển và điều kiện của lõi (ADR-0008). */
export function xetDoiTrangThai(hang: readonly HangSua[], to: StandardStatus, them: { lyDo?: WithdrawnReason } = {}): XetLo {
  const kq: XetLo = { doiDuoc: [], khongDoi: [] };
  for (const h of hang) {
    let lyDo: string | null = null;
    if (h.standardStatus === to) lyDo = DA_O_NAC;
    else if (to === "Withdrawn" && !them.lyDo) lyDo = CHON_LY_DO;
    else {
      const c = checkTransition(h.standardStatus, to, { ...h, withdrawnReason: them.lyDo });
      if (!c.ok) lyDo = c.kind === "invalid-transition" ? khongChuyenTu(h.standardStatus) : `thiếu ${c.missing.map((m) => NHAN_THIEU[m]).join(", ")}`;
    }
    if (lyDo) kq.khongDoi.push({ id: h.id, maCan: maCan(h), lyDo });
    else kq.doiDuoc.push(h);
  }
  return kq;
}

/** Nấc menu đưa ra: có ít nhất một căn của lô chuyển được (lý do ngừng chọn sau, nên coi như đã có). */
export function nacMenu(hang: readonly HangSua[]): StandardStatus[] {
  return NAC_DICH.filter((to) => xetDoiTrangThai(hang, to, { lyDo: "unreachable" }).doiDuoc.length > 0);
}

export function lenhTrangThai(to: StandardStatus, lyDo?: WithdrawnReason): Lenh {
  return { type: "status_changed", payload: to === "Withdrawn" ? { to, withdrawnReason: lyDo } : { to } };
}

/** «Còn / giữ giá» — sự kiện xác nhận với chủ nhà của lõi, không có sự kiện ngược. */
export const LENH_DA_GOI = { type: "owner_confirmed", payload: {} } as const;

/** Đánh dấu đã gọi cả lô: căn ở nấc cuối không còn chào bán, làm tươi nó là dữ liệu sai. */
export function xetDaGoi(hang: readonly HangSua[]): XetLo {
  const kq: XetLo = { doiDuoc: [], khongDoi: [] };
  for (const h of hang) {
    if (h.standardStatus === "Closed" || h.standardStatus === "Withdrawn") kq.khongDoi.push({ id: h.id, maCan: maCan(h), lyDo: CAN_DA_DONG });
    else kq.doiDuoc.push(h);
  }
  return kq;
}

/** Số căn đã tích mà bộ lọc đang ẩn (luật 4: căn đang chọn đi theo người khi đổi cách xem). */
export function demLocAn(tich: Iterable<string>, dangHien: Iterable<string>): number {
  const hien = new Set(dangHien);
  let n = 0;
  for (const id of tich) if (!hien.has(id)) n++;
  return n;
}

/** Lô của thao tác: mọi căn đã tích, kể cả căn đang bị lọc ẩn. */
export function hangCuaLo<T extends { id: string }>(tich: ReadonlySet<string>, moiHang: readonly T[]): T[] {
  return moiHang.filter((h) => tich.has(h.id));
}

export type LoaiLo = "trang-thai" | "da-goi";

/** Sau khi ghi: chữ thông báo theo số căn ghi được thật, căn nào bỏ tích, căn nào còn tích. */
export function gomKetQua(loai: LoaiLo, ghi: readonly { id: string; ok: boolean }[], khongDoi: readonly KhongDoi[]): { thongBao: string; boTich: string[]; conTich: string[] } {
  const duoc = ghi.filter((g) => g.ok).map((g) => g.id);
  const hong = ghi.filter((g) => !g.ok).map((g) => g.id);
  const dau = loai === "trang-thai" ? `Đã đổi trạng thái ${duoc.length} căn` : `Đã đánh dấu đã gọi ${duoc.length} căn`;
  return { thongBao: hong.length ? `${dau} · ${hong.length} căn chưa ghi được` : dau, boTich: duoc, conTich: [...hong, ...khongDoi.map((k) => k.id)] };
}
