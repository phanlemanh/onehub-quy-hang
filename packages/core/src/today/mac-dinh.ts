/**
 * Bộ nhóm mặc định của Hôm nay đầu chủ (hàng 22) — mặc định của sàn: sàn chưa đặt `queue.groups` thì nhận bộ này. Mã là
 * nghĩa (tiếng Anh, không đổi theo sàn); nhãn là tên gọi mặc định — sàn đổi tên trong bộ của mình. Khi sổ từ vựng
 * (hàng 90, ADR-0023) xong, nhãn dời vào sổ ấy.
 */
import { khoangCua, macDinhSo } from "../config/giai";
import type { BoNhom } from "./kieu";

/** Ngưỡng mặc định của sàn (luật 18): gọi điều chỉnh giá sau 10 ngày, gọi lại sau 14 ngày — số lấy từ sổ (#5, #4). */
export const QUEUE_DEFAULT_DAYS = {
  priceAdjustment: macDinhSo("queue.price_negotiation_after_days"),
  callBack: macDinhSo("queue.call_back_after_days"),
} as const;

/** Khoảng sàn được đặt (Hỏi-4): hai nhóm mặc định giữ khoảng của sổ (#5, #4), nhóm sàn tự tạo 1–90 ngày. */
export const QUEUE_DAY_RANGES = {
  price_adjustment: khoangCua("queue.price_negotiation_after_days"),
  call_back: khoangCua("queue.call_back_after_days"),
  khac: { min: 1, max: 90 },
} as const;

/** Khoá cũ của sổ điểm biến thiên #4, #5 — chỉnh ngưỡng bộ mặc định khi sàn chưa có bộ riêng. */
export const QUEUE_LEGACY_KEYS = {
  callBack: "queue.call_back_after_days",
  priceAdjustment: "queue.price_negotiation_after_days",
} as const;

/** Khoá bộ nhóm của sàn trong `company_settings`. */
export const QUEUE_GROUPS_KEY = "queue.groups";

/** Nhãn dài nhất sàn được đặt (như #18 `labels.field.*`). */
export const NHAN_TOI_DA = 40;

export function boMacDinh(nguong: { priceAdjustment: number; callBack: number } = QUEUE_DEFAULT_DAYS): BoNhom {
  return [
    {
      code: "new_lead",
      label: "Lead mới",
      subject: "lead",
      enabled: true,
      conditions: [{ kind: "lead_stage_in", in: ["sent", "accepted"] }],
      actions: ["accept", "first_call", "return"],
    },
    {
      code: "price_adjustment",
      label: "Nên gọi điều chỉnh giá",
      subject: "listing",
      enabled: true,
      conditions: [
        { kind: "status_in", in: ["Active"] },
        { kind: "days_since", anchor: "price_or_confirmed", days: nguong.priceAdjustment },
      ],
      actions: ["owner_confirmed", "open_record"],
    },
    {
      code: "call_back",
      label: "Cần gọi lại",
      subject: "listing",
      enabled: true,
      conditions: [{ kind: "days_since", anchor: "confirmed", days: nguong.callBack }],
      actions: ["owner_confirmed", "open_record"],
    },
    { code: "missing_info", label: "Thiếu thông tin", subject: "listing", enabled: true, conditions: [{ kind: "missing_info" }], actions: ["open_record"] },
    {
      code: "recent_change",
      label: "Mới đổi",
      subject: "listing",
      enabled: true,
      conditions: [{ kind: "changed_by_other", since: "yesterday" }],
      actions: ["owner_confirmed", "open_record"],
    },
  ];
}

export const BO_NHOM_MAC_DINH: BoNhom = boMacDinh();
