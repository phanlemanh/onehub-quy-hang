/**
 * Dòng mức đủ ở đầu danh sách hỏi (hàng 28, AC-8): tính bằng `completeness` của lõi trên bản trên máy (bản máy chủ gấp
 * các thao tác chờ) — không đọc trường mức đủ của lần kéo, để dòng đổi ngay sau mỗi lần ghi, kể cả khi mất mạng.
 */
import { completeness, DANH_SACH_HOI, type ListingState } from "@quy-hang/core/listing";

export type DongMucDu = { filled: number; total: number; chu: string; conThieu: string };

export const DA_DU = "Đã đủ năm mục";

export function dongMucDu(can: Pick<ListingState, "listPrice" | "feeInclusion" | "furnished" | "legalStatus" | "financing" | "occupantType"> | null): DongMucDu {
  const c = completeness(can ?? { listPrice: null, feeInclusion: null, furnished: null, legalStatus: null, financing: null, occupantType: null });
  const nhan = c.missing.map((m) => DANH_SACH_HOI.find((h) => h.ma === m)!.nhan.toLowerCase());
  return { filled: c.filled, total: c.total, chu: `Mức đủ ${c.filled}/${c.total}`, conThieu: nhan.length ? `Còn thiếu: ${nhan.join(", ")}` : DA_DU };
}
