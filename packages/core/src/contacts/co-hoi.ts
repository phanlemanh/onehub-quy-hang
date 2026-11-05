import type { LeadState } from "../dedupe/lead-stage";
import type { StandardStatus } from "../listing/status";

// Cơ hội (ADR-0021 sửa đổi 05/11, ba lớp theo KW): việc với một liên hệ — phía chủ là bản ghi lead, phía khách là nhu cầu
// khách. Pha theo năm pha cố định của KW Opportunity; «closed_out» là cơ hội đã đóng mà không chốt. Nhãn mặc định ở một chỗ
// (hàng 103, Hỏi-2); sàn đổi tên khi có sổ từ vựng (hàng 90).

export const PHA = ["cultivate", "appointment", "active", "under_contract", "closed", "closed_out"] as const;
export type Pha = (typeof PHA)[number];

export const PHA_NHAN: Readonly<Record<Pha, string>> = {
  cultivate: "Mới",
  appointment: "Đã gọi",
  active: "Đang chào",
  under_contract: "Đang giao dịch",
  closed: "Đã chốt",
  closed_out: "Đã đóng",
};

/** Pha của cơ hội phía chủ: trước Lên bảng đọc nấc lead; sau Lên bảng đọc trạng thái hàng. */
export function phaLead(stage: LeadState, listingStatus: StandardStatus | null): Pha {
  if (stage === "on_board") {
    if (listingStatus === "Pending") return "under_contract";
    if (listingStatus === "Closed") return "closed";
    if (listingStatus === "Withdrawn") return "closed_out";
    return "active";
  }
  if (stage === "called") return "appointment";
  if (stage === "sent" || stage === "accepted") return "cultivate";
  return "closed_out";
}

/** Pha của cơ hội phía khách (nhu cầu khách); lịch xem khi dựng sẽ là appointment. */
export function phaNhuCau(closed: boolean): Pha {
  return closed ? "closed_out" : "cultivate";
}

/** Cơ hội còn tính ở số «cơ hội mở» (AC-1): mọi pha khác «Đã đóng». */
export function laMo(p: Pha): boolean {
  return p !== "closed_out";
}
