/**
 * Kiểu dùng chung của bộ đồng bộ trên máy (hàng 13, ADR-0006). Bộ đồng bộ nhận hàm gọi API và kho trên máy từ ngoài, nên
 * mọi phần thuần kiểm được bằng `node:test`; trình duyệt thay kho bằng IndexedDB và hàm gọi bằng `fetch` cùng gốc.
 */
import type { EventType, ListingEvent, ListingState } from "@quy-hang/core/listing";

/** Hàng như `GET /api/v1/listings` trả: bản tính + độ tươi, mức đủ, nấc của trục ai thấy hàng. Không có trường nguồn. */
export type ListingView = { id: string } & ListingState & {
    freshness?: unknown;
    completeness?: unknown;
    visibility?: "Private" | "Company";
  };

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
};

/** Ngăn của một sàn trong kho trên máy của một người. */
export type Ngan = {
  /** `null` = chưa từng kéo về. */
  listings: ListingView[] | null;
  history: Record<string, ListingEvent[]>;
  queue: PendingOp[];
  review: NeedsReview[];
  lastPullAt: string | null;
  lastAttempt: "ok" | "mang" | null;
  nextSeq: number;
};

export const nganTrong = (): Ngan => ({ listings: null, history: {}, queue: [], review: [], lastPullAt: null, lastAttempt: null, nextSeq: 1 });

/** Hàm gọi API. Ném lỗi = mất mạng; còn lại trả mã HTTP và thân đã đọc JSON. */
export type Goi = (method: "GET" | "POST", path: string, body?: unknown) => Promise<{ status: number; body: unknown }>;

/** Người đang dùng bộ đồng bộ. */
export type Me = { userId: string; roles: string[] };
