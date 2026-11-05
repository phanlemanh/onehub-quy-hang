/**
 * Nhãn mặc định của thực đơn chia lead (hàng 48) — chỗ có tên duy nhất ở lõi cho tới khi có sổ từ vựng (hàng 90, ADR-0023);
 * màn chỉ nhập, không viết bảng nhãn riêng (`.claude/rules/thiet-ke-doi-chieu.md`). Chữ theo `CONTEXT.md` dòng «Cách chia»
 * và «Lời báo». `Record` theo thực đơn: thêm một cách chia mà thiếu nhãn thì kiểm kiểu đỏ.
 */
import type { AlertAudience, RoutingStrategyKey } from "./index";

export type NhanCachChia = { nhan: string; giaiThich: string };

/** Năm cách chia: nhãn và một câu nói lead mới về tay ai. */
export const ROUTING_STRATEGY_NHAN: Readonly<Record<RoutingStrategyKey, NhanCachChia>> = {
  zone_round_robin: { nhan: "Theo vùng, lần lượt", giaiThich: "Lead về lần lượt từng đầu chủ phụ trách toà của căn." },
  company_round_robin: { nhan: "Lần lượt toàn sàn", giaiThich: "Lead về lần lượt từng đầu chủ của sàn, không xét toà." },
  zone_least_open: { nhan: "Theo vùng, ít lead đang mở", giaiThich: "Lead về đầu chủ phụ trách toà đang có ít lead chưa gọi nhất." },
  open_pool: { nhan: "Kho chung", giaiThich: "Lead chờ trong kho chung; đầu chủ phụ trách toà tự bấm nhận." },
  manual: { nhan: "Trưởng nhóm chia tay", giaiThich: "Lead chờ trưởng nhóm giao cho một đầu chủ." },
};

/** Người đọc lời báo của sàn (chưa chia được, quá hạn nhận, quá hạn gọi). */
export const ALERT_AUDIENCE_NHAN: Readonly<Record<AlertAudience, string>> = {
  team_lead: "Trưởng nhóm",
  team_lead_and_admin: "Trưởng nhóm và quản trị sàn",
};
