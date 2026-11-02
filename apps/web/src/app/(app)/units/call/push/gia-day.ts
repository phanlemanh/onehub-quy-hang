/**
 * Giá đáy chủ từng nói · nội bộ (hàng 29, AC-3; bất biến 2): đọc thẳng `GET /api/v1/listings/{id}/owner` — lõi trả
 * `{visible:false}` cho người không thấy nguồn. Không ghi vào kho trên máy hay bộ nhớ trình duyệt. Thuần.
 */
import { tinhVeTay, vietGia, type FeeInclusion } from "@quy-hang/core/pricing";
import type { Goi } from "@/lib/sync/types";

export type GiaDay = { kind: "co"; dong: number } | { kind: "chua" } | { kind: "an" } | { kind: "loi" };

export async function docGiaDay(goi: Goi, hangId: string): Promise<GiaDay> {
  try {
    const r = await goi("GET", `/api/v1/listings/${encodeURIComponent(hangId)}/owner`);
    const b = r.body as { visible?: boolean; floorPrice?: number | null } | null;
    // Không thấy nguồn (200 visible:false), không có quyền (403) hay không thấy căn (404) → ẩn khối; lỗi khác (401, 5xx) → báo
    // chưa tải được, để người có quyền không lầm là căn không có giá đáy.
    if (r.status === 403 || r.status === 404 || (r.status === 200 && b?.visible === false)) return { kind: "an" };
    if (r.status !== 200 || !b || b.visible !== true) return { kind: "loi" };
    return typeof b.floorPrice === "number" ? { kind: "co", dong: b.floorPrice } : { kind: "chua" };
  } catch {
    return { kind: "loi" };
  }
}

export type KhoiGiaDay = { kind: "an" } | { kind: "chu"; chinh: string; phu: string | null };

/** Chữ của khối theo kết quả đọc và giá hiện tại của hồ sơ (so trên giá về tay, luật 12). */
export function khoiGiaDay(gd: GiaDay, gia: { listPrice: number | null; feeInclusion: FeeInclusion | null }): KhoiGiaDay {
  if (gd.kind === "an") return { kind: "an" };
  if (gd.kind === "loi") return { kind: "chu", chinh: "Chưa tải được giá đáy", phu: null };
  if (gd.kind === "chua") return { kind: "chu", chinh: "Chưa ghi giá đáy", phu: null };
  if (gia.listPrice === null || !gia.feeInclusion) return { kind: "chu", chinh: vietGia(gd.dong), phu: null };
  const veTay = tinhVeTay(gia.listPrice, gia.feeInclusion).veTay;
  const lech = Math.round((Math.abs(veTay - gd.dong) * 1000) / veTay) / 10;
  const so = String(lech).replace(".", ",");
  const phu = gd.dong < veTay ? `thấp hơn giá về tay hiện tại ${so}%` : gd.dong > veTay ? `cao hơn giá về tay hiện tại ${so}%` : "bằng giá về tay hiện tại";
  return { kind: "chu", chinh: vietGia(gd.dong), phu };
}
