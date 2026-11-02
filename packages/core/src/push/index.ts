/**
 * Thông báo lead (hàng 26, ADR-0025). Thông báo hiện trên màn hình khoá và đi qua dịch vụ đẩy của Apple, Google — nội
 * dung chỉ mang toà, nhu cầu và đường mở; không số, không tên chủ, không giá, không mã căn (bất biến 2). Lõi dựng nội dung
 * từ một danh sách khoá viết trước; lối gửi của máy chủ không thêm khoá nào. Nhập qua `@quy-hang/core/push`.
 */
import { NEED_LABELS, type Need } from "../dedupe";
import type { AlertKind } from "../routing";

/** Bốn khoá duy nhất của một thông báo — service worker đọc đúng bốn khoá này. */
export const PUSH_PAYLOAD_KEYS = ["title", "body", "url", "tag"] as const;
export type PushPayload = { title: string; body: string; url: string; tag: string };

/** Tiêu đề thông báo lead — mặc định của sàn, dời vào sổ từ vựng khi hàng 90 xong. */
export const PUSH_LEAD_TITLE = "Lead mới";

/** Nhãn loại lời báo cho trưởng nhóm — mặc định của sàn, dời vào sổ từ vựng khi hàng 90 xong. */
export const PUSH_ALERT_LABELS: Readonly<Record<AlertKind, string>> = {
  unrouted: "Lead chưa chia được",
  accept_overdue: "Lead quá hạn nhận",
  first_call_overdue: "Lead quá hạn gọi lần đầu",
};

/**
 * Gửi lại thông báo lỗi tạm — mặc định của sàn (sẽ vào sổ điểm biến thiên): tối đa ba lần, trong 15 phút kể từ lúc ghi
 * (bằng hạn nhận mặc định của ADR-0017). Quá hạn thì thông báo không còn ích — đầu chủ đã thấy lead ở Hôm nay hoặc lời báo
 * đã lên trưởng nhóm.
 */
export const PUSH_RETRY = { maxAttempts: 3, windowMinutes: 15 } as const;

/** Đường mở Hôm nay ở đúng lead. */
export const leadUrl = (leadId: string) => `/today?lead=${encodeURIComponent(leadId)}`;

/** Thông báo cho đầu chủ khi lead về mình: «Lead mới» · «<Toà> · <nhu cầu>», mở đúng lead. */
export function noiDungLead(lead: { leadId: string; buildingName: string; need: Need }): PushPayload {
  return {
    title: PUSH_LEAD_TITLE,
    body: `${lead.buildingName} · ${NEED_LABELS[lead.need]}`,
    url: leadUrl(lead.leadId),
    tag: `lead:${lead.leadId}`,
  };
}

/** Thông báo cho trưởng nhóm khi nhịp chia ghi một lời báo mới: loại lời báo · toà, mở Hôm nay (màn lời báo là hàng 42). */
export function noiDungLoiBao(alert: { leadId: string; kind: AlertKind; buildingName: string }): PushPayload {
  return {
    title: PUSH_ALERT_LABELS[alert.kind],
    body: alert.buildingName,
    url: "/today",
    tag: `alert:${alert.kind}:${alert.leadId}`,
  };
}
