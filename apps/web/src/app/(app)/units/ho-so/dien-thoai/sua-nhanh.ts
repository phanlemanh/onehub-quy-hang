// Đổi giá, đổi trạng thái nhanh trên hồ sơ căn điện thoại (hàng 40 doi-gia-nhanh): phần thuần của hai ngăn. Luật sửa giá
// không viết lần hai — dùng đúng bộ dựng lệnh của ô Bảng hàng (`inventory/cell-edit/lenh.ts`), luật hỏi lại (`canHoiLai`)
// và khoá giá căn đã bán (`kiemDoiGia`) của lõi. Lần ghi đi qua bộ đồng bộ (`chayLuuO`) như ô Bảng hàng.
import { kiemDoiGia, LY_DO_DOI_GIA_DA_BAN, type StandardStatus, type WithdrawnReason } from "@quy-hang/core/listing";
import { type FeeInclusion } from "@quy-hang/core/pricing";
import type { NhanTrangThai } from "@quy-hang/core/statuses";
import { chayLuuO, dungLenhGia, dungLenhTrangThai, luaChonTrangThai, type GhiFn, type HangSua, type Lenh, type LuaChonTrangThai } from "../../../inventory/cell-edit/lenh";

/** Kết cục một lần bấm «Lưu» của ngăn: lỗi nói trong ngăn · hỏi lại trước khi ghi · ghi ngay. */
export type BuocLuu =
  | { kind: "loi"; chu: string }
  | { kind: "hoi-lai"; lenh: Lenh; phanTram: number | null; doiPhi: boolean; hieuLa: string | null }
  | { kind: "ghi"; lenh: Lenh };

/** Khối Giá có mở sửa không: căn Đã bán thì không, kèm lý do của lõi (AC-3). */
export function khoaGia(hang: Pick<HangSua, "standardStatus">): string | null {
  return kiemDoiGia(hang) ? LY_DO_DOI_GIA_DA_BAN : null;
}

/** «Lưu» của ngăn Đổi giá (AC-2, AC-3). */
export function buocDoiGia(hang: HangSua, chu: string, phi: FeeInclusion | null): BuocLuu {
  const khoa = khoaGia(hang);
  if (khoa) return { kind: "loi", chu: khoa };
  const kq = dungLenhGia(hang, chu, phi);
  if (!kq.ok) return { kind: "loi", chu: "loi" in kq ? kq.loi : "Không đổi được giá" };
  if (kq.hoiLai?.hoi) return { kind: "hoi-lai", lenh: kq.lenh, phanTram: kq.hoiLai.phanTram, doiPhi: kq.hoiLai.doiPhi, hieuLa: kq.hieuLa };
  return { kind: "ghi", lenh: kq.lenh };
}

/** Phần kèm của nấc đích (giá chốt, ngày bán, lý do ngừng). */
export type ThemNac = { giaChot?: string; ngayBan?: string; lyDo?: WithdrawnReason };

/** Nấc nào cần phần kèm trước khi lưu. */
export const canPhanKem = (to: StandardStatus): boolean => to === "Closed" || to === "Withdrawn";

/** Các lựa chọn của ngăn Đổi trạng thái: đúng thực đơn của ô Bảng hàng (bảng chuyển, nhãn của sàn, cờ «Sẵn sàng bán»). */
export function cacNac(hang: HangSua, nhan: readonly NhanTrangThai[] | undefined, sanSang: boolean): LuaChonTrangThai[] {
  return luaChonTrangThai(hang, nhan, sanSang);
}

/** «Lưu» của ngăn Đổi trạng thái (AC-4): lý do của lõi khi trái luật hay thiếu phần kèm. */
export function buocDoiTrangThai(hang: HangSua, lc: LuaChonTrangThai, them: ThemNac, sanSang: boolean): BuocLuu {
  const kq = dungLenhTrangThai(hang, lc.to, { ...them, label: lc.label }, sanSang);
  if (!kq.ok) return { kind: "loi", chu: "loi" in kq ? kq.loi : "Không đổi được trạng thái" };
  return { kind: "ghi", lenh: kq.lenh };
}

/** Ghi một lệnh qua bộ đồng bộ; lỗi (cả lỗi của lõi trên máy) thành chữ nói trong ngăn. */
export async function ghiLenh(sua: GhiFn, hang: Pick<HangSua, "id" | "unitNumber">, lenh: Lenh, coSo: number | undefined): Promise<{ ok: true } | { ok: false; chu: string }> {
  const nhan = lenh.type === "price_changed" ? `giá ${hang.unitNumber ?? ""}`.trim() : `trạng thái ${hang.unitNumber ?? ""}`.trim();
  const kq = await chayLuuO(sua, hang.id, lenh, coSo, nhan);
  return kq.ok ? { ok: true } : { ok: false, chu: kq.chu };
}
