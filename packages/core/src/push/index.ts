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

/** Tiêu đề thông báo quay số (hàng 30) — mặc định của sàn, dời vào sổ từ vựng khi hàng 90 xong. */
export const PUSH_DIAL_TITLE = "Gọi chủ nhà";

/** Đường mở trang quay số trên điện thoại ở đúng lead. */
export const dialUrl = (leadId: string) => `/units/call/dial?lead=${encodeURIComponent(leadId)}`;

/**
 * Thông báo quay số (hàng 30): đầu chủ bấm ở chế độ cuộc gọi trên máy tính, điện thoại của chính mình nhận «Gọi chủ nhà» ·
 * «<Toà> · <nhu cầu>», chạm mở trang quay số. Tham số chỉ ba khoá — số, tên chủ, giá, mã căn không đi vào đây (bất biến 2).
 */
export function noiDungQuaySo(lead: { leadId: string; buildingName: string; need: Need }): PushPayload {
  return {
    title: PUSH_DIAL_TITLE,
    body: `${lead.buildingName} · ${NEED_LABELS[lead.need]}`,
    url: dialUrl(lead.leadId),
    tag: `quay-so:${lead.leadId}`,
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

/**
 * Máy của các dịch vụ đẩy đã biết (hồ sơ va-thong-bao-lead): Google (Chrome, Edge Android, Opera, Samsung), Mozilla
 * (Firefox), Apple (Safari, iPhone đã cài) và Microsoft (Edge trên Windows, máy `wns2-<vùng>.notify.windows.com`). Máy chủ chỉ
 * gửi tới các máy này — KHÔNG phải dữ liệu của sàn: cho sàn hay người dùng thêm máy là mở lại lỗ máy chủ tự gọi tới địa chỉ lạ.
 */
export const PUSH_SERVICE_HOSTS = {
  exact: ["fcm.googleapis.com", "updates.push.services.mozilla.com", "web.push.apple.com"],
  suffix: [".notify.windows.com"],
} as const;

/** Địa chỉ đăng ký có phải của dịch vụ đẩy đã biết: https, cổng mặc định, không tên/mật khẩu, máy khớp danh sách. */
export function laDichVuDay(endpoint: string): boolean {
  let u: URL;
  try {
    u = new URL(endpoint);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" || u.username || u.password || (u.port !== "" && u.port !== "443")) return false;
  const may = u.hostname.toLowerCase();
  return (
    (PUSH_SERVICE_HOSTS.exact as readonly string[]).includes(may) ||
    PUSH_SERVICE_HOSTS.suffix.some((d) => may.endsWith(d) && may.length > d.length)
  );
}

/** Giữ chỗ một dòng chờ gửi: `app.push_outbox_claim` không nhận lại dòng giữ chưa quá một phút (migration 018). */
export const PUSH_CLAIM_HOLD_MS = 60_000;

/**
 * Thời hạn gửi — mặc định của sàn (sẽ vào sổ điểm biến thiên): một lần gửi tối đa 5 giây; lối giao lead gửi tối đa 8 giây
 * (người nhập đang chờ) rồi để phần còn lại cho nhịp chia; nhịp chia tối đa 40 giây cho mọi sàn. Mọi ngân sách cộng một lần
 * gửi phải dưới giữ chỗ một phút — dòng đang gửi không bao giờ bị nhịp sau nhận lại.
 */
export const PUSH_SEND = { timeoutMs: 5_000, deliverBudgetMs: 8_000, tickBudgetMs: 40_000 } as const;
