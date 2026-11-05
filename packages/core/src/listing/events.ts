/**
 * Sự kiện của hàng — chỉ thêm, không sửa (Tham chiếu §4). Mỗi loại một khuôn payload CHẶT: khoá lạ ở bất kỳ cấp nào bị
 * từ chối, nên thông tin chủ nhà (lớp `source`) không có đường vào bảng sự kiện (bất biến 2, AC-10).
 */
import { kiemMaCan } from "./gan-ma-can";
import { isStandardStatus, WITHDRAWN_REASONS } from "./status";

export const EVENT_TYPES = [
  "created",
  "details_changed",
  "price_changed",
  "status_changed",
  "owner_confirmed",
  // Gắn mã căn cho hàng tạo khi mới biết toà (ADR-0026) — một lần, chỉ khi hàng chưa có mã.
  "unit_number_assigned",
  // Gỡ hàng do lần nhập tạo khi hoàn tác cả lần nhập (ADR-0011 quyết định 8): cờ khi gấp, không phải trạng thái thứ bảy;
  // chỉ đường hoàn tác lần nhập ghi được.
  "voided",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const FEE_INCLUSIONS = ["included", "excluded"] as const;

/** Bốn phần của lần rao ngoài giá — chữ tự do của sàn, xoá trắng bằng `null`. */
export const DETAIL_FIELDS = ["furnished", "legalStatus", "financing", "occupantType"] as const;
export type DetailField = (typeof DETAIL_FIELDS)[number];

/** Khoá thuộc lớp `source` — tên hay gặp; khuôn chặt đã từ chối mọi khoá lạ, danh sách này để báo lỗi gọi đúng tên. */
export const SOURCE_KEYS = ["ownerName", "ownerPhone", "floorPrice", "titleDeedPhoto"] as const;

type Kiem = (v: unknown) => string | null;
const chu: Kiem = (v) => (typeof v === "string" && v.trim().length > 0 && v.length <= 200 ? null : "cần chữ, 1–200 ký tự");
/** Mã căn: chữ như mọi trường chữ, và có ít nhất một chữ hay số để so căn được (`kiemMaCan`). */
const maCan: Kiem = (v) => chu(v) ?? kiemMaCan(v as string);
const chuHayXoa: Kiem = (v) => (v === null ? null : chu(v));
const tien: Kiem = (v) => (typeof v === "number" && Number.isSafeInteger(v) && v > 0 ? null : "cần số đồng nguyên dương");
export const NGAY_SAI_DANG = "cần ngày YYYY-MM-DD";
export const NGAY_KHONG_CO_THAT = "ngày không có thật";
/**
 * Ngày theo lịch Gregorian, không dùng `Date.parse`: nó tự cuộn ngày lố sang tháng sau (30/2 thành 2/3), để ngày không
 * có thật qua được rồi cơ sở dữ liệu báo lỗi hệ thống (hàng 57). Lịch không có năm 0.
 */
const ngay: Kiem = (v) => {
  const m = typeof v === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(v) : null;
  if (!m) return NGAY_SAI_DANG;
  const [nam, thang, ngayTrongThang] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const nhuan = (nam % 4 === 0 && nam % 100 !== 0) || nam % 400 === 0;
  const soNgay = [31, nhuan ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][thang - 1];
  return nam >= 1 && soNgay !== undefined && ngayTrongThang >= 1 && ngayTrongThang <= soNgay ? null : NGAY_KHONG_CO_THAT;
};
const motTrong = (ds: readonly string[]): Kiem => (v) => (typeof v === "string" && ds.includes(v) ? null : `cần một trong: ${ds.join(", ")}`);

/** Khuôn từng loại: khoá → [bắt buộc, cách kiểm]. */
const KHUON: Record<EventType, Record<string, [boolean, Kiem]>> = {
  created: { buildingName: [true, chu], unitNumber: [false, maCan] },
  details_changed: Object.fromEntries(DETAIL_FIELDS.map((k) => [k, [false, chuHayXoa]])),
  price_changed: { listPrice: [true, tien], feeInclusion: [true, motTrong(FEE_INCLUSIONS)] },
  status_changed: {
    to: [true, (v) => (isStandardStatus(v) ? null : "cần trạng thái chuẩn")],
    closePrice: [false, tien],
    closeDate: [false, ngay],
    withdrawnReason: [false, motTrong(WITHDRAWN_REASONS)],
  },
  owner_confirmed: { confirmedAt: [false, ngay] },
  unit_number_assigned: { unitNumber: [true, maCan] },
  voided: {},
};

export type PayloadError = { path: string; reason: string };

function khoaLong(v: unknown, path: string, out: PayloadError[]) {
  if (v && typeof v === "object") {
    for (const k of Object.keys(v)) out.push({ path: `${path}.${k}`, reason: "khoá lạ" });
  }
}

/** Kiểm payload theo khuôn chặt của loại sự kiện. Rỗng là hợp lệ. `today` (YYYY-MM-DD, từ ngoài vào — lõi không đọc đồng hồ)
 * chặn ngày xác nhận sau hôm nay. */
export function validatePayload(type: unknown, payload: unknown, opts: { today?: string } = {}): PayloadError[] {
  if (typeof type !== "string" || !(EVENT_TYPES as readonly string[]).includes(type)) return [{ path: "type", reason: "loại sự kiện lạ" }];
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [{ path: "payload", reason: "cần một đối tượng" }];
  const khuon = KHUON[type as EventType];
  const out: PayloadError[] = [];
  for (const [k, v] of Object.entries(payload)) {
    const luat = khuon[k];
    if (!luat) {
      out.push({ path: k, reason: (SOURCE_KEYS as readonly string[]).includes(k) ? "thông tin chủ nhà không vào hàng" : "khoá lạ" });
      khoaLong(v, k, out);
      continue;
    }
    if (v !== null && typeof v === "object") {
      out.push({ path: k, reason: "không nhận khối lồng" });
      khoaLong(v, k, out);
      continue;
    }
    const loi = luat[1](v);
    if (loi) out.push({ path: k, reason: loi });
  }
  for (const [k, [batBuoc]] of Object.entries(khuon)) if (batBuoc && !(k in payload)) out.push({ path: k, reason: "thiếu" });
  if (type === "details_changed" && Object.keys(payload).length === 0) out.push({ path: "payload", reason: "không có phần nào đổi" });
  const xn = (payload as Record<string, unknown>).confirmedAt;
  if (type === "owner_confirmed" && opts.today && typeof xn === "string" && !out.length && xn > opts.today)
    out.push({ path: "confirmedAt", reason: "ngày xác nhận sau hôm nay" });
  return out;
}

/**
 * Lần sửa này có tính là vừa xác nhận với chủ nhà không (luật 9, luật 15): đổi giá, đổi trạng thái mặc định có;
 * «Còn / giữ giá» luôn có; đổi phần khác của lần rao và tạo hàng thì không. Người gửi lệnh tắt được ở hai loại đầu.
 */
export function confirmsWithOwner(type: EventType, requested?: boolean): boolean {
  if (type === "owner_confirmed") return true;
  if (type === "price_changed" || type === "status_changed") return requested ?? true;
  return false;
}

export type ListingEvent = {
  seq: number;
  type: EventType;
  payload: Record<string, unknown>;
  actorUserId: string;
  actorRoles: string[];
  confirmedWithOwner: boolean;
  /** ISO 8601. */
  occurredAt: string;
  /** Thiết bị của lời gọi ghi (máy tính hay điện thoại); `null` hay vắng là không rõ — sự kiện ghi trước khi có cột. */
  device?: "desktop" | "mobile" | null;
  /** Thao tác làm lúc mất mạng, gửi về khi có mạng lại; vắng là không. */
  madeOffline?: boolean;
};
