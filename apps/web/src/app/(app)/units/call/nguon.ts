/**
 * Lời gọi của chế độ cuộc gọi (hàng 28): đọc một lead của tôi theo mã (`GET /api/v1/leads/assigned/{leadId}`, bất kể nhóm
 * Hôm nay). Hồ sơ căn đọc và ghi qua bộ đồng bộ trên máy, không qua đây. Không lời gọi nào mang số chủ hay khoá nguồn.
 */
import type { FeeInclusion } from "@quy-hang/core/pricing";
import type { Goi } from "@/lib/sync/types";
import type { LeadGiao } from "../../today/nguon";

/** Lead như `GET /api/v1/leads/assigned/{leadId}` trả: dòng Hôm nay cộng giá số, điều kiện phí và hồ sơ căn của lead. */
export type LeadCuocGoi = LeadGiao & { listPrice: number; feeInclusion: FeeInclusion; listingId: string | null };

export type KetQuaLead = { kind: "co"; lead: LeadCuocGoi } | { kind: "khong-thay" } | { kind: "loi" };

export const KHONG_THAY_LEAD = "Không thấy lead này trong việc của bạn";
export const LOI_TAI_LEAD = "Chưa tải được lead — kiểm mạng rồi thử lại";

const LA_MA = /^[0-9a-f-]{36}$/i;

/** Mã lead hợp khuôn từ `?lead=`, sai khuôn là `null`. */
export const docMaLead = (v: string | null | undefined): string | null => (v && LA_MA.test(v) ? v : null);

export async function docLeadCuocGoi(goi: Goi, id: string): Promise<KetQuaLead> {
  try {
    const r = await goi("GET", `/api/v1/leads/assigned/${encodeURIComponent(id)}`);
    if (r.status === 200 && r.body && typeof r.body === "object") return { kind: "co", lead: r.body as LeadCuocGoi };
    // 403: vai không phải Đầu chủ — trang đã chặn trước; 404: lead không của tôi, đã bỏ hay đã trả lại.
    return r.status === 404 || r.status === 403 ? { kind: "khong-thay" } : { kind: "loi" };
  } catch {
    return { kind: "loi" };
  }
}
