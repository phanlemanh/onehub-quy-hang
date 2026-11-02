/**
 * Gấp dãy sự kiện thành bản tính của hàng (Kiến trúc §1: số trên màn là bản tính ra từ sự kiện). Bảng `listings` chỉ
 * chứa đúng những gì hàm này trả — xoá trắng bảng rồi gấp lại ra đúng bảng cũ (AC-8).
 */
import type { DetailField, ListingEvent } from "./events";
import type { StandardStatus } from "./status";

export type ListingState = {
  buildingName: string;
  unitNumber: string | null;
  standardStatus: StandardStatus;
  listPrice: number | null;
  feeInclusion: string | null;
  furnished: string | null;
  legalStatus: string | null;
  financing: string | null;
  occupantType: string | null;
  closePrice: number | null;
  /** YYYY-MM-DD. */
  closeDate: string | null;
  withdrawnReason: string | null;
  /** ISO 8601 của lần xác nhận gần nhất với chủ nhà; chưa từng xác nhận là `null`. */
  lastConfirmedAt: string | null;
  /** = `seq` của sự kiện cuối. */
  version: number;
};

export function foldListing(events: readonly ListingEvent[]): ListingState {
  const ds = [...events].sort((a, b) => a.seq - b.seq);
  const dau = ds[0];
  if (!dau || dau.type !== "created") throw new Error("dãy sự kiện phải mở đầu bằng created");
  const s: ListingState = {
    buildingName: String(dau.payload.buildingName),
    unitNumber: (dau.payload.unitNumber as string | undefined) ?? null,
    standardStatus: "Incomplete",
    listPrice: null,
    feeInclusion: null,
    furnished: null,
    legalStatus: null,
    financing: null,
    occupantType: null,
    closePrice: null,
    closeDate: null,
    withdrawnReason: null,
    lastConfirmedAt: null,
    version: 0,
  };
  return ds.reduce(stepListing, s);
}

/**
 * Một bước gấp: trạng thái sau khi áp thêm một sự kiện. Thuần — trả bản mới, không đổi đầu vào. `foldListing` là chuỗi các
 * bước này; bộ đồng bộ trên máy dùng nó để gấp sự kiện tạm lên bản kéo về (hàng 13) mà không chép luật gấp.
 */
export function stepListing(state: ListingState, e: ListingEvent): ListingState {
  const s: ListingState = { ...state };
  const p = e.payload;
  switch (e.type) {
    case "details_changed":
      for (const [k, v] of Object.entries(p)) s[k as DetailField] = (v as string | null) ?? null;
      break;
    case "price_changed":
      s.listPrice = p.listPrice as number;
      s.feeInclusion = p.feeInclusion as string;
      break;
    case "status_changed":
      s.standardStatus = p.to as StandardStatus;
      // Đổi trạng thái không xoá dữ liệu: hàng đã bán giữ giá chốt và ngày bán (Tham chiếu §5).
      if (p.to === "Closed") {
        s.closePrice = p.closePrice as number;
        s.closeDate = (p.closeDate as string | undefined) ?? e.occurredAt.slice(0, 10);
      }
      if (p.to === "Withdrawn") s.withdrawnReason = p.withdrawnReason as string;
      break;
    case "unit_number_assigned":
      s.unitNumber = p.unitNumber as string;
      break;
    default:
      break;
  }
  if (e.confirmedWithOwner && (!s.lastConfirmedAt || e.occurredAt > s.lastConfirmedAt)) s.lastConfirmedAt = e.occurredAt;
  s.version = e.seq;
  return s;
}

