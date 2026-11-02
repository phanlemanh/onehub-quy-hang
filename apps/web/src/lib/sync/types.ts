/**
 * Kiểu dùng chung của bộ đồng bộ trên máy (hàng 13, ADR-0006). Bộ đồng bộ nhận hàm gọi API và kho trên máy từ ngoài, nên
 * mọi phần thuần kiểm được bằng `node:test`; trình duyệt thay kho bằng IndexedDB và hàm gọi bằng `fetch` cùng gốc.
 */
import type { EventType, ListingEvent, ListingState } from "@quy-hang/core/listing";
import type { BoNhom, LanDoi } from "@quy-hang/core/today";

/**
 * Hàng như `GET /api/v1/listings` trả: bản tính + độ tươi, mức đủ, nấc của trục ai thấy hàng, người giữ và lần đổi giá,
 * đổi trạng thái gần nhất (hàng 22, RESO `ListAgentKey`, `PriceChangeTimestamp`, `StatusChangeTimestamp`). Không có
 * trường nguồn. Năm trường của hàng 22 tuỳ chọn: kho trên máy từ trước hàng 22 chưa có chúng tới lần kéo kế.
 */
export type ListingView = { id: string } & ListingState & {
    freshness?: unknown;
    completeness?: unknown;
    visibility?: "Private" | "Company";
    listAgentKey?: string | null;
    priceChangeTimestamp?: string | null;
    statusChangeTimestamp?: string | null;
    lastPriceChange?: LanDoi | null;
    lastStatusChange?: LanDoi | null;
  };

/** Lần đọc bộ nhóm Hôm nay thành công gần nhất của sàn (`GET /api/v1/company/settings/queue`, hàng 22). */
export type BoNhomDaLuu = { groups: BoNhom; source: "default" | "company"; savedAt: string };

/** Một lần sửa đã ghi trên máy, chưa được máy chủ nhận («thao tác chờ»). */
export type PendingOp = {
  opId: string;
  listingId: string;
  type: EventType;
  payload: Record<string, unknown>;
  /** Phiên bản của căn mà thao tác dựa lên — nối chuỗi theo căn. */
  expectedVersion: number;
  clientSeq: number;
  createdAt: string;
};

/** Căn có thao tác chờ mà máy chủ không nhận — chờ người chọn lối. */
export type NeedsReview = {
  listingId: string;
  kind: "dung-nhau" | "da-coc" | "da-ban" | "tu-choi";
  mine: PendingOp[];
  server?: { value: ListingView; byUserId: string; byRoles: string[]; at: string };
  reason?: string;
  /** Gắn mã căn bị từ chối vì căn đã có hàng đang mở khác: mã hàng ấy, để mở liên kết «Mở hàng kia» (ADR-0026). */
  conflictListingId?: string;
};

/**
 * Kết cục lượt gửi/kéo gần nhất (hàng 61): mất mạng (lời gọi ném lỗi) · hết phiên (401) · máy chủ trục trặc (5xx) · bản
 * tải về bị từ chối (lưới chặn nguồn, 4xx khác khi kéo). Lỗi kho trên máy không ghi được vào kho nên không nằm ở đây.
 */
export type LanThu = "ok" | "mang" | "phien" | "may-chu" | "tu-choi";

/** Ngăn của một sàn trong kho trên máy của một người. */
export type Ngan = {
  /** `null` = chưa từng kéo về. */
  listings: ListingView[] | null;
  history: Record<string, ListingEvent[]>;
  queue: PendingOp[];
  review: NeedsReview[];
  lastPullAt: string | null;
  lastAttempt: LanThu | null;
  nextSeq: number;
  /** Bộ nhóm Hôm nay đã lưu — mất mạng hay lỗi đọc thì màn chia theo bộ này. Ngăn cũ chưa có khoá này đọc là `null`. */
  queueSet?: BoNhomDaLuu | null;
};

export const nganTrong = (): Ngan => ({ listings: null, history: {}, queue: [], review: [], lastPullAt: null, lastAttempt: null, nextSeq: 1, queueSet: null });

/** Hàm gọi API. Ném lỗi = mất mạng; còn lại trả mã HTTP và thân đã đọc JSON. */
export type Goi = (method: "GET" | "POST", path: string, body?: unknown) => Promise<{ status: number; body: unknown }>;

/** Người đang dùng bộ đồng bộ. */
export type Me = { userId: string; roles: string[] };
