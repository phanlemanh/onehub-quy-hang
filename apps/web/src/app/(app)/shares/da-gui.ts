// Phần thuần của Đã gửi (hàng 36): nhãn «vừa đổi», đường gửi căn thay, bộ tắt link. Không React.
import { giaTin } from "@quy-hang/core/sharing";

export type VuaDoi = { price: { from: number | null; to: number | null } } | { status: { to: string } } | null;
export type LanGuiTom = { id: string; audience: "client" | "agents"; recipient: string; listingCount: number; covers: string[]; createdAt: string; disabledAt: string | null; opens: number; interests: number; lastOpenedAt: string | null; mine: boolean };
export type CanTrongLink = { id: string; name: string; listPrice: number | null; standardStatus: string; interest: number; changed: VuaDoi; suggestions: { id: string; name: string; listPrice: number | null }[] };
export type LanGuiChiTiet = LanGuiTom & { listings: CanTrongLink[] };

export const NHAN_TRANG_THAI: Readonly<Record<string, string>> = { Pending: "Đã có người đặt cọc", Hold: "Tạm ngưng", Closed: "Không còn", Withdrawn: "Không còn", Incomplete: "Không còn", Active: "Đang bán lại" };

/** Nhãn «Vừa đổi» của một căn trong link; không đổi → null. */
export function nhanVuaDoi(changed: VuaDoi): string | null {
  if (!changed) return null;
  if ("status" in changed) return NHAN_TRANG_THAI[changed.status.to] ?? "Vừa đổi trạng thái";
  return `Vừa đổi giá: ${giaTin(changed.price.from)} → ${giaTin(changed.price.to)}`;
}

/** «Gợi ý căn thay» mở luồng Gửi với căn ấy — người vẫn tự bấm gửi (bất biến 3). */
export const hrefCanThay = (id: string) => `/shares/new?can=${encodeURIComponent(id)}`;

export const ANH = (id: string) => `/api/v1/units/photos/${id}/thumb`;

export type Goi = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number }>;
export type TrangThaiTat = "mo" | "dang" | "da-tat" | "loi";

/** Tắt link: hỏi xác nhận trước; 200 hay 409 (đã tắt) → «Đã tắt»; lỗi khác → «loi», bấm lại được. */
export function taoTatLink(dep: { goi: Goi; xacNhan: () => boolean; id: string; doi: (t: TrangThaiTat) => void }) {
  let tt: TrangThaiTat = "mo";
  const dat = (t: TrangThaiTat) => {
    tt = t;
    dep.doi(t);
  };
  return async () => {
    if (tt === "dang" || tt === "da-tat") return;
    if (!dep.xacNhan()) return;
    dat("dang");
    try {
      const r = await dep.goi(`/api/v1/shares/${dep.id}/disable`, { method: "POST", cache: "no-store" });
      dat(r.ok || r.status === 409 ? "da-tat" : "loi");
    } catch {
      dat("loi");
    }
  };
}

/** `?lan=<id>` mở thẳng một Lần gửi (từ Hôm nay, hàng 37): chỉ nhận mã dạng uuid; sai dạng hay vắng → null. */
export function docLanTuThamSo(q: string | null): string | null {
  return q && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q) ? q : null;
}

export type TrangThaiChiTiet = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; ct: LanGuiChiTiet };
export type GoiDoc = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/** Tải chi tiết một Lần gửi: 200 → mở; mọi mã khác (404, 5xx) và mất mạng → lỗi kèm thử lại (Ngoài-3 hàng 36). */
export async function taiChiTiet(goi: GoiDoc, id: string): Promise<TrangThaiChiTiet> {
  try {
    const r = await goi(`/api/v1/shares/${encodeURIComponent(id)}`, { cache: "no-store" });
    return r.ok ? { kieu: "xong", ct: (await r.json()) as LanGuiChiTiet } : { kieu: "loi" };
  } catch {
    return { kieu: "loi" };
  }
}

export const thoiGian = (iso: string) => new Date(iso).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
