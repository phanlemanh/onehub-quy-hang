/**
 * Kết quả cuộc gọi ép giá (hàng 29, AC-4, AC-7; Tham chiếu §5 một bộ bốn kết quả): phím H · G · B · K, và ba lối hỏi tiếp
 * của «Đã cọc / bán…» thành lệnh đổi trạng thái theo bảng chuyển của lõi. Thuần — màn và bài kiểm cùng đọc.
 */
import { checkTransition, type StandardStatus } from "@quy-hang/core/listing";
import { docGia } from "@quy-hang/core/pricing";
import { STATUS_LABEL } from "../../../inventory/cot";
import type { ChoTro, Phim } from "../phim";

export const KET_QUA = [
  { ma: "ha-gia", phim: "H", nhan: "Hạ giá" },
  { ma: "giu-gia", phim: "G", nhan: "Giữ giá" },
  { ma: "ban", phim: "B", nhan: "Đã cọc / bán…" },
  { ma: "khong-nghe", phim: "K", nhan: "Không nghe máy" },
] as const;
export type KetQua = (typeof KET_QUA)[number]["ma"];

export const BA_LOI = [
  { ma: "da-coc", nhan: "Đã cọc", to: "Pending" },
  { ma: "san-ban", nhan: "Sàn mình bán", to: "Closed" },
  { ma: "chu-ban-noi-khac", nhan: "Chủ bán nơi khác", to: "Withdrawn" },
] as const;
export type LoiBan = (typeof BA_LOI)[number]["ma"];

export type LenhKetQua = { kind: "chon"; kq: KetQua } | { kind: "bo" } | { kind: "loi-ban"; loi: LoiBan } | { kind: "ve-hom-nay" };

/** Phím của khối kết quả; `null` = để bàn phím của danh sách hỏi xử. Con trỏ ở ô chữ: chỉ Ctrl+Enter. */
export function xuLyPhimKetQua(p: Phim, cho: ChoTro, dangChon: KetQua | null): LenhKetQua | null {
  if ((p.ctrlKey || p.metaKey) && p.key === "Enter") return { kind: "ve-hom-nay" };
  if (cho !== "khong" || p.ctrlKey || p.metaKey || p.altKey) return null;
  if (p.key === "Escape" && dangChon) return { kind: "bo" };
  if (dangChon === "ban" && /^[1-9]$/.test(p.key)) {
    const l = BA_LOI[Number(p.key) - 1];
    return l ? { kind: "loi-ban", loi: l.ma } : null;
  }
  const k = KET_QUA.find((x) => x.phim === p.key.toUpperCase());
  return k ? { kind: "chon", kq: k.ma } : null;
}

export type LenhTrangThai = { to: "Pending" } | { to: "Closed"; closePrice: number; closeDate: string } | { to: "Withdrawn"; withdrawnReason: "sold_elsewhere" };

/** Ngày hôm nay theo giờ máy, YYYY-MM-DD. */
export function homNay(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Lối có mở theo bảng chuyển của lõi không; không mở thì kèm lý do bằng chữ. */
export function loiMo(tu: StandardStatus, loi: LoiBan): { mo: true } | { mo: false; lyDo: string } {
  const to = BA_LOI.find((l) => l.ma === loi)!.to;
  const kq = checkTransition(tu, to, { closePrice: 1, withdrawnReason: "sold_elsewhere" });
  return kq.ok || kq.kind === "missing-requirement" ? { mo: true } : { mo: false, lyDo: `${STATUS_LABEL[tu]} không chuyển sang ${STATUS_LABEL[to]}` };
}

export function lenhBan(tu: StandardStatus, loi: LoiBan, them: { giaChot?: string; ngay?: string } = {}, bayGio = new Date()): { ok: true; payload: LenhTrangThai } | { ok: false; loi: string } {
  const mo = loiMo(tu, loi);
  if (!mo.mo) return { ok: false, loi: mo.lyDo };
  if (loi === "da-coc") return { ok: true, payload: { to: "Pending" } };
  if (loi === "chu-ban-noi-khac") return { ok: true, payload: { to: "Withdrawn", withdrawnReason: "sold_elsewhere" } };
  if (!them.giaChot?.trim()) return { ok: false, loi: "Cần giá chốt" };
  const g = docGia(them.giaChot);
  if (!g.ok) return { ok: false, loi: `Chưa hiểu «${them.giaChot.trim()}» — gõ như 2,75 tỷ hoặc 950 triệu` };
  return { ok: true, payload: { to: "Closed", closePrice: g.dong, closeDate: them.ngay || homNay(bayGio) } };
}
