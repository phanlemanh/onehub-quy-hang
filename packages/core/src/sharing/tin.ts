/**
 * Tin soạn sẵn, ảnh kèm và thân lời gọi của màn Gửi (hàng 34). Mọi chữ của tin dựng từ bản ra (`banRaNgoai` của
 * `../redaction`), không từ dữ liệu nội bộ — bất biến 4. Mẫu tin và trần ảnh là mặc định dựng sẵn ở một chỗ có tên (Hỏi-3);
 * sàn chỉnh khi có màn Cài đặt sàn. Thân «Khách mới» và «Gửi» dựng ở đây để màn Gửi và bài kiểm API dùng cùng một hàm.
 */
import { validateProspectInput, type ProspectNeed } from "../contacts/prospects";
import type { PayloadError } from "../listing/events";
import type { AnhRa, CanRaNgoai } from "../redaction/ban-ra";
import type { NguoiNhan } from "../redaction/cua-ra";
import { loiSach, type LoiMauBai } from "../export/mau-san";
import { validateShareInput, type ShareInput } from "./index";

/** Chỗ của link trong tin — màn thay bằng `<gốc>/s/<mã>` sau khi Lần gửi tạo xong (link nằm trong thân tin, hàng 3). */
export const CHO_LINK = "[link]";

/** Trần tệp ảnh của một lần mở bảng chia sẻ — một ảnh bìa mỗi căn (Hỏi-3). */
export const TRAN_ANH_CHIA_SE = 10;

export const NHAN_TANG: Readonly<Record<"high" | "low", string>> = { high: "Tầng cao", low: "Tầng thấp" };
const PHI: Readonly<Record<string, string>> = { included: "bao phí", excluded: "không bao phí" };

const TY = 1_000_000_000;
const SO_2 = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });
const SO_NGUYEN = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

/** «3,25 tỷ» · «950 triệu» · «Giá liên hệ». */
export function giaTin(dong: number | null | undefined): string {
  if (dong === null || dong === undefined) return "Giá liên hệ";
  if (dong >= TY) return `${SO_2.format(dong / TY)} tỷ`;
  return `${SO_NGUYEN.format(Math.round(dong / 1_000_000))} triệu`;
}

/** Tên căn khách thấy: mã căn khi bản ra có, không thì toà và nấc tầng (khách riêng). */
export function tenCanRa(b: CanRaNgoai): string {
  if (b.unitNumber) return b.buildingName ? `${b.buildingName} · ${b.unitNumber}` : b.unitNumber;
  return [b.buildingName, b.floorBand ? NHAN_TANG[b.floorBand] : null].filter(Boolean).join(" · ");
}

/** «68,5 m² · 2 PN · Đông Nam». */
export function thongSoRa(b: CanRaNgoai): string {
  return [
    b.livingArea != null ? `${SO_2.format(b.livingArea)} m²` : null,
    b.bedroomsTotal != null ? (b.bedroomsTotal === 0 ? "Studio" : `${b.bedroomsTotal} PN`) : null,
    b.directionFaces ?? null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Mẫu tin mặc định: lời chào theo người nhận, mỗi căn một dòng, rồi chỗ link. Khách riêng chào theo tên khách người gửi
 * đã lưu; nhóm môi giới chào chung. Sàn có mẫu bài Zalo thì lời mở đầu đứng sau lời chào, lời kết sau dòng link.
 */
export function soanTin(o: { ban: readonly CanRaNgoai[]; nguoiNhan: NguoiNhan; tenKhach?: string | null; mauZalo?: LoiMauBai }): string {
  const chao = o.nguoiNhan === "khach_rieng" ? `Chào anh/chị ${o.tenKhach?.trim() || "ạ"},` : "Gửi các anh chị trong nhóm,";
  const dong = o.ban.map((b, i) => {
    const phi = b.feeInclusion ? PHI[b.feeInclusion] : undefined;
    const gia = `${giaTin(b.listPrice)}${phi ? ` (${phi})` : ""}`;
    return `${i + 1}. ${[tenCanRa(b), thongSoRa(b), gia].filter(Boolean).join(" — ")}`;
  });
  // Mẫu bài Zalo của sàn (#27, hàng mau-bang-hang-va-bai): lời mở đầu sau lời chào, lời kết sau dòng link; lời rỗng bị bỏ.
  const dau = loiSach(o.mauZalo?.opening);
  const cuoi = loiSach(o.mauZalo?.closing);
  return [chao, dau, `Em gửi ${o.ban.length} căn đang bán:`, ...dong, `Xem ảnh và chi tiết: ${CHO_LINK}`, cuoi].filter((s) => s !== "").join("\n");
}

/** Đặt link vào tin: thay chỗ link; người đã xoá chỗ ấy thì thêm link ở dòng cuối — tin gửi đi luôn có link đúng một lần. */
export function ganLink(tin: string, link: string): string {
  if (tin.includes(CHO_LINK)) return tin.split(CHO_LINK).join(link);
  if (tin.includes(link)) return tin;
  return `${tin.trimEnd()}\n${link}`;
}

/** Ảnh kèm bảng chia sẻ: ảnh đầu (bìa) của mỗi căn theo thứ tự gửi, tối đa `TRAN_ANH_CHIA_SE`. */
export function chonAnhChiaSe(ban: readonly CanRaNgoai[]): AnhRa[] {
  const ra: AnhRa[] = [];
  for (const b of ban) {
    const bia = b.photos?.[0];
    if (bia) ra.push(bia);
    if (ra.length === TRAN_ANH_CHIA_SE) break;
  }
  return ra;
}

export type KetThan<T> = { ok: true; than: T } | { ok: false; errors: PayloadError[] };

export type ThanKhachMoi = { displayName: string; phone: string; need: ProspectNeed; criteria: Record<string, never> };

/** Thân `POST /api/v1/prospects` của «Khách mới»: tên, số, loại giao dịch — qua đúng khuôn của API (hàng 86). */
export function thanKhachMoi(o: { ten: string; so: string; need: ProspectNeed }): KetThan<ThanKhachMoi> {
  const v = validateProspectInput({ displayName: o.ten, phone: o.so, need: o.need, criteria: {} });
  if (!v.ok) return v;
  return { ok: true, than: { displayName: v.value.displayName, phone: v.value.phone, need: v.value.need, criteria: {} } };
}

/** Thân `POST /api/v1/shares`: khách riêng gắn nhu cầu khách, nhóm môi giới không; căn theo thứ tự chọn. */
export function thanLanGui(o: { nguoiNhan: NguoiNhan; prospectId: string | null; listingIds: readonly string[]; mucChia?: number | null }): KetThan<ShareInput> {
  const than: ShareInput = {
    audience: o.nguoiNhan === "khach_rieng" ? ("client" as const) : ("agents" as const),
    prospectId: o.nguoiNhan === "khach_rieng" ? o.prospectId : null,
    listingIds: [...o.listingIds],
  };
  // Hàng 44: mức chia chỉ đi với nhóm môi giới; để trống thì thân không mang khoá.
  if (o.nguoiNhan === "nhom_moi_gioi" && o.mucChia != null) than.commissionSplitPct = o.mucChia;
  const v = validateShareInput(than);
  return v.ok ? { ok: true, than } : v;
}
