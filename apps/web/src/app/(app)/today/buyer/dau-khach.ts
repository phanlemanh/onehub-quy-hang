// Phần thuần của vùng «Đầu khách» ở Hôm nay (hàng 37): đích chạm, nhóm theo ngày Việt Nam, chữ của từng tin. Không React,
// không đọc đồng hồ — vùng truyền ngày hôm nay vào.
import { giaTin } from "@quy-hang/core/sharing";
import { LECH_GIO_VN, NHAN_TIN, type TinDauKhach } from "@quy-hang/core/today";

import { NHAN_TRANG_THAI } from "../../shares/da-gui";

export type { TinDauKhach };
export { NHAN_TIN };

/** Tin phản ứng và vừa đổi mở chi tiết Lần gửi ở Đã gửi; căn mới mở luồng Gửi với căn ấy — người vẫn tự bấm gửi (bất biến 3). */
export function hrefTin(t: TinDauKhach): string {
  if (t.kind === "new_match") return `/shares/new?can=${encodeURIComponent(t.listing.id)}`;
  return `/shares?lan=${encodeURIComponent(t.share.id)}`;
}

const THU = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const truNgay = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);

/** Nhãn nhóm ngày: «Hôm nay», «Hôm qua», rồi «Thứ Hai 2/11». */
export function nhanNgay(day: string, homNay: string): string {
  if (day === homNay) return "Hôm nay";
  if (day === truNgay(homNay, 1)) return "Hôm qua";
  const d = new Date(`${day}T00:00:00Z`);
  return `${THU[d.getUTCDay()]} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

/** Tin (đã xếp mới trước) gom theo ngày Việt Nam, giữ thứ tự. */
export function nhomTheoNgay(ds: readonly TinDauKhach[], homNay: string): { day: string; nhan: string; tin: TinDauKhach[] }[] {
  const ra: { day: string; nhan: string; tin: TinDauKhach[] }[] = [];
  for (const t of ds) {
    const cuoi = ra.at(-1);
    if (cuoi?.day === t.day) cuoi.tin.push(t);
    else ra.push({ day: t.day, nhan: nhanNgay(t.day, homNay), tin: [t] });
  }
  return ra;
}

/** Giờ Việt Nam «HH:MM» của một mốc ISO. */
export function gioVN(iso: string): string {
  return new Date(Date.parse(iso) + LECH_GIO_VN * 3_600_000).toISOString().slice(11, 16);
}

/** Ngày Việt Nam hôm nay theo một mốc. */
export const homNayVN = (bay: Date) => new Date(bay.getTime() + LECH_GIO_VN * 3_600_000).toISOString().slice(0, 10);

/** Ba dòng chữ của một tin: tiêu đề, dòng phụ (giờ · …), chi tiết. */
export function chuTin(t: TinDauKhach): { tieuDe: string; phu: string; chiTiet: string } {
  const gio = gioVN(t.at);
  if (t.kind === "reaction")
    return {
      tieuDe: t.share.recipient,
      phu: gio,
      chiTiet: `${t.opens} mở · ${t.interested.length ? `quan tâm: ${t.interested.map((c) => c.name).join(", ")}` : "chưa quan tâm căn nào"}`,
    };
  if (t.kind === "changed")
    return {
      tieuDe: t.listing.name,
      phu: `${gio} · Trong link gửi ${t.share.recipient}`,
      chiTiet: "status" in t.changed ? (NHAN_TRANG_THAI[t.changed.status.to] ?? "Vừa đổi trạng thái") : `Giá ${giaTin(t.changed.price.from)} → ${giaTin(t.changed.price.to)}`,
    };
  return {
    tieuDe: t.listing.name,
    phu: `${gio} · ${t.listPrice != null ? giaTin(t.listPrice) : "Giá liên hệ"}`,
    chiTiet: `Khớp bộ gửi ${t.shares.map((s) => s.recipient).join(", ")}`,
  };
}

export const CHU = {
  trong: "Chưa có gì mới trong 7 ngày",
  trongMoTa: "Khách mở link, căn đã gửi đổi giá hay căn mới khớp bộ đã gửi sẽ hiện ở đây.",
  guiCan: "Gửi căn",
  loi: "Chưa tải được — thử lại",
  thuLai: "Thử lại",
} as const;
