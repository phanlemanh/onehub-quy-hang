/**
 * Mức đủ thông tin (luật 16): năm mục mô tả căn, ngang nhau (Hỏi-4, duyệt ở Cổng Phạm vi) — chính là danh sách hỏi của màn
 * cuộc gọi. Hàng anh-khong-chan-ban (Tham chiếu §12, 06/11): ảnh thành một mục của mức đủ khi bên gọi biết số ảnh thật
 * (`photosCount`, RESO `PhotosCount`); mục ảnh đủ khi có ít nhất một ảnh thật (Hỏi-1) và KHÔNG vào danh sách hỏi — ảnh không
 * hỏi được qua điện thoại.
 */
import type { ListingState } from "./fold";

export const COMPLETENESS_ITEMS = ["price", "furnished", "legalStatus", "financing", "occupantType"] as const;
/** Mục ảnh — chỉ có mặt khi bên gọi truyền số ảnh thật. */
export const PHOTO_ITEM = "photos" as const;
export type CompletenessItem = (typeof COMPLETENESS_ITEMS)[number] | typeof PHOTO_ITEM;

export type Completeness = { filled: number; total: number; missing: CompletenessItem[] };
/** Số ảnh thật gửi được của căn (không mẫu, chưa gỡ, ngăn Gửi được) — máy chủ đếm, bản xem hàng mang về. */
export type AnhCan = { photosCount: number };

const co = (v: unknown) => v !== null && v !== undefined && v !== "";

export function completeness(
  s: Pick<ListingState, "listPrice" | "feeInclusion" | "furnished" | "legalStatus" | "financing" | "occupantType">,
  anh?: AnhCan,
): Completeness {
  const coMuc: Record<(typeof COMPLETENESS_ITEMS)[number], boolean> = {
    // Giá thiếu điều kiện phí là thiếu giá (luật 7: giá luôn đi cùng điều kiện phí).
    price: co(s.listPrice) && co(s.feeInclusion),
    furnished: co(s.furnished),
    legalStatus: co(s.legalStatus),
    financing: co(s.financing),
    occupantType: co(s.occupantType),
  };
  const missing: CompletenessItem[] = COMPLETENESS_ITEMS.filter((m) => !coMuc[m]);
  if (!anh) return { filled: COMPLETENESS_ITEMS.length - missing.length, total: COMPLETENESS_ITEMS.length, missing };
  if (!(anh.photosCount >= 1)) missing.push(PHOTO_ITEM);
  const total = COMPLETENESS_ITEMS.length + 1;
  return { filled: total - missing.length, total, missing };
}
