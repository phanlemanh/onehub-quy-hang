/**
 * Sự kiện của hàng — chỉ thêm, không sửa (Tham chiếu §4). Mỗi loại một khuôn payload CHẶT: khoá lạ ở bất kỳ cấp nào bị
 * từ chối, nên thông tin chủ nhà (lớp `source`) không có đường vào bảng sự kiện (bất biến 2, AC-10).
 */
import { kiemMaCan } from "./gan-ma-can";
import { isStandardStatus, MA_NHAN_TRANG_THAI_RE, WITHDRAWN_REASONS } from "./status";

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
  // Giá trị trường riêng của sàn (hàng 47, ADR-0018 quyết định 8): khoá là mã trường, giá trị có / không, mã lựa chọn hay
  // `null` (xoá). Mã có trong bộ trường của sàn hay không là việc của lệnh (`kiemGiaTriTruong`), khuôn chỉ kiểm hình.
  "custom_changed",
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
/** Mã căn ngoài khu của sàn (uuid). */
const maCanNgoaiKhu: Kiem = (v) => (typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v) ? null : "cần mã căn ngoài khu");
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
  // Ba cách gọi căn (ADR-0016 quyết định 3, hàng can-ngoai-khu): có toà · lô (khu + dãy + lô) · ngoài khu. Khoá nào bắt
  // buộc tuỳ dạng — `kiemDangCreated` xét sau khuôn.
  created: {
    buildingName: [false, chu],
    unitNumber: [false, maCan],
    subdivisionName: [false, chu],
    blockName: [false, chu],
    offCompoundUnitId: [false, maCanNgoaiKhu],
  },
  details_changed: Object.fromEntries(DETAIL_FIELDS.map((k) => [k, [false, chuHayXoa]])),
  price_changed: { listPrice: [true, tien], feeInclusion: [true, motTrong(FEE_INCLUSIONS)] },
  status_changed: {
    to: [true, (v) => (isStandardStatus(v) ? null : "cần trạng thái chuẩn")],
    closePrice: [false, tien],
    closeDate: [false, ngay],
    withdrawnReason: [false, motTrong(WITHDRAWN_REASONS)],
    // Nhãn riêng của sàn neo vào `to` (hàng 46): mã nhãn, hay `null` = nhãn mặc định. Mã có trong bộ nhãn của sàn hay không
    // là việc của lệnh (`kiemNhanSuKien`), khuôn chỉ kiểm hình mã.
    label: [false, (v) => (v === null || (typeof v === "string" && MA_NHAN_TRANG_THAI_RE.test(v)) ? null : "cần mã nhãn trạng thái hay null")],
  },
  owner_confirmed: { confirmedAt: [false, ngay] },
  unit_number_assigned: { unitNumber: [true, maCan] },
  voided: {},
  custom_changed: {},
};

const MA_TRUONG_RIENG_RE = /^[a-z][a-z0-9_]{0,31}$/;

/** Khuôn `custom_changed`: object phẳng, ≥1 khoá khuôn mã; giá trị `boolean`, chuỗi khuôn mã hay `null`. */
function kiemTruongRiengPayload(payload: Record<string, unknown>): PayloadError[] {
  const out: PayloadError[] = [];
  const khoa = Object.keys(payload);
  if (khoa.length === 0) return [{ path: "payload", reason: "không có trường nào đổi" }];
  for (const k of khoa) {
    const v = payload[k];
    if ((SOURCE_KEYS as readonly string[]).includes(k)) out.push({ path: k, reason: "thông tin chủ nhà không vào hàng" });
    else if (!MA_TRUONG_RIENG_RE.test(k)) out.push({ path: k, reason: "cần mã trường riêng" });
    if (v !== null && typeof v === "object") {
      out.push({ path: k, reason: "không nhận khối lồng" });
      khoaLong(v, k, out);
    } else if (!(v === null || typeof v === "boolean" || (typeof v === "string" && MA_TRUONG_RIENG_RE.test(v)))) {
      out.push({ path: k, reason: "cần có / không, mã lựa chọn hay null" });
    }
  }
  return out;
}

export type PayloadError = { path: string; reason: string };

/** Ba cách gọi căn của sự kiện tạo hàng. */
export type DangDinhDanh = "toa" | "lo" | "ngoai-khu";
export const LY_DO_MOT_DANG = "chỉ một cách gọi căn: toà, lô (khu, dãy, lô) hay căn ngoài khu";
export const LY_DO_CAN_DANG = "cần một cách gọi căn: buildingName, blockName hay offCompoundUnitId";

/** Dạng định danh của payload `created`: theo khoá có mặt; `null` khi không có dạng nào, mảng khi trộn. */
export function dangDinhDanh(p: Record<string, unknown>): DangDinhDanh | null | DangDinhDanh[] {
  const co = (k: string) => k in p;
  const dang: DangDinhDanh[] = [];
  if (co("buildingName")) dang.push("toa");
  if (co("subdivisionName") || co("blockName")) dang.push("lo");
  if (co("offCompoundUnitId")) dang.push("ngoai-khu");
  return dang.length === 0 ? null : dang.length === 1 ? dang[0]! : dang;
}

/** Luật dạng của `created`: đúng một dạng; lô đủ khu, dãy, lô; căn ngoài khu không mang mã căn. */
function kiemDangCreated(p: Record<string, unknown>): PayloadError[] {
  const d = dangDinhDanh(p);
  if (d === null) return [{ path: "payload", reason: LY_DO_CAN_DANG }];
  if (Array.isArray(d)) return [{ path: "payload", reason: LY_DO_MOT_DANG }];
  if (d === "lo") return (["subdivisionName", "blockName", "unitNumber"] as const).filter((k) => !(k in p)).map((k) => ({ path: k, reason: "thiếu" }));
  if (d === "ngoai-khu" && "unitNumber" in p) return [{ path: "unitNumber", reason: "căn ngoài khu không mang mã căn — " + LY_DO_MOT_DANG }];
  return [];
}

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
  if (type === "custom_changed") return kiemTruongRiengPayload(payload as Record<string, unknown>);
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
  if (type === "created") out.push(...kiemDangCreated(payload as Record<string, unknown>));
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
