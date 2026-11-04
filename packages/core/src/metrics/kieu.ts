/**
 * Kiểu của bảng số đo hai tuần thử (hàng 52, Tham chiếu §11). Đầu vào không khoá nào thuộc lớp `source`: sự kiện của hàng có
 * khuôn chặt từ chối khoá chủ nhà, dữ kiện lead không có cột số. Đầu ra chỉ có số đếm, tỉ lệ và thời lượng.
 */
import type { CatalogData } from "../catalog/types";
import type { LeadStageFacts } from "../dedupe/lead-stage";
import type { ListingEvent } from "../listing/events";
import type { StandardStatus } from "../listing/status";

/** Một hàng: dãy sự kiện đủ của nó, như `listing_events` giữ. */
export type HangVao = { id: string; events: readonly ListingEvent[] };

/**
 * Một lead: dữ kiện nấc (cột của `leads` cộng mốc lên bảng), lúc nhập, mã căn đã gõ ở ô nhận lead (vắng là `null`) và lead
 * gửi lại của nó (`resubmitted_lead_id`, vắng là `null`) — mối nối của chuỗi gửi lại (luật 37).
 */
export type LeadVao = LeadStageFacts & { id: string; createdAt: string; unitNumber: string | null; resubmittedLeadId: string | null };

/** Một lượt mất mạng bộ đồng bộ trên máy gửi về: từ lúc mất tới lúc có mạng lại, kèm số thao tác chờ gửi trong lượt. */
export type LuotMatMang = { device: "desktop" | "mobile"; startedAt: string; endedAt: string; queuedOps: number };

/** Một lần xuất bảng hàng (hàng 43), như bảng `exports` giữ: chỉ lúc xuất — không kèm bộ lọc, kênh hay nội dung. */
export type LanXuat = { createdAt: string };

export type DauVaoSoDo = {
  /** ISO 8601 — kỳ đo nửa mở `[tu, den)`. */
  tu: string;
  den: string;
  hang: readonly HangVao[];
  lead: readonly LeadVao[];
  danhMuc: CatalogData;
  /** N của «xác nhận trong N ngày»; vắng là `CALL_BACK_AFTER_DAYS` (luật 18). */
  soNgayXacNhan?: number;
  /** Ngưỡng ngày của nhóm «Nên gọi điều chỉnh giá»; vắng là `QUEUE_DEFAULT_DAYS.priceAdjustment`. */
  nguongDieuChinhGia?: number;
  /** Lượt mất mạng của sàn, như `offline_sessions` giữ; vắng là rỗng. */
  matMang?: readonly LuotMatMang[];
  /** Lần xuất bảng hàng của sàn (hàng 43); vắng là rỗng — như `matMang`, nguồn đã có thì kỳ không có lần nào ra 0. */
  lanXuat?: readonly LanXuat[];
};

export const METRIC_CODES = [
  "confirmed_within_n_days",
  "top_completeness",
  "unit_code_autofill",
  "inquiry_to_send",
  "lead_to_first_call",
  "lead_to_ready",
  "duplicate_leads_blocked",
  "price_adjustment_calls",
  "sheet_publishes",
  "customer_link_opens",
  "customer_interest",
  "actions_by_device_role",
  "mobile_offline",
] as const;
export type MetricCode = (typeof METRIC_CODES)[number];

export type TuMau = { tu: number; mau: number };

export type GiaTriSoDo =
  | { kieu: "ti-le"; tu: number; mau: number; phanTram: number | null; theoTrangThai: Partial<Record<StandardStatus, TuMau>>; chiTiet: Record<string, number> }
  | { kieu: "dem"; so: number; chiTiet: Record<string, number> }
  | { kieu: "thoi-luong"; donVi: "phut" | "ngay"; n: number; trungVi: number | null; giaTri: number[]; chua: number; chiTiet: { chuaChia: number; daChia: number; traLai: number } };

type DauDong = { ma: MetricCode; dongThamChieu: string; traLoi: string };

export type DongSoDo = DauDong & ({ trangThai: "do-duoc" } & GiaTriSoDo | { trangThai: "chua-co-su-kien"; thieu: string });
