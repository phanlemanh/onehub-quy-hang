/**
 * Mức đủ thông tin (luật 16): phần đã có trên danh sách hỏi — chính là danh sách hỏi của màn cuộc gọi. Năm mục mô tả
 * căn, ngang nhau (Hỏi-4, duyệt ở Cổng Phạm vi); ảnh vào danh sách khi có kho ảnh.
 */
import type { ListingState } from "./fold";

export const COMPLETENESS_ITEMS = ["price", "furnished", "legalStatus", "financing", "occupantType"] as const;
export type CompletenessItem = (typeof COMPLETENESS_ITEMS)[number];

export type Completeness = { filled: number; total: number; missing: CompletenessItem[] };

const co = (v: unknown) => v !== null && v !== undefined && v !== "";

export function completeness(s: Pick<ListingState, "listPrice" | "feeInclusion" | "furnished" | "legalStatus" | "financing" | "occupantType">): Completeness {
  const coMuc: Record<CompletenessItem, boolean> = {
    // Giá thiếu điều kiện phí là thiếu giá (luật 7: giá luôn đi cùng điều kiện phí).
    price: co(s.listPrice) && co(s.feeInclusion),
    furnished: co(s.furnished),
    legalStatus: co(s.legalStatus),
    financing: co(s.financing),
    occupantType: co(s.occupantType),
  };
  const missing = COMPLETENESS_ITEMS.filter((m) => !coMuc[m]);
  return { filled: COMPLETENESS_ITEMS.length - missing.length, total: COMPLETENESS_ITEMS.length, missing };
}
