/**
 * Màn Gửi (hàng 34) — phần thuần: dựng bản vào của luật ẩn từ kho trên máy, căn nào gửi được, khi nào nút Gửi mở, và bộ
 * điều phối một lần bấm Gửi (một Lần gửi rồi một lần mở bảng chia sẻ của máy — bất biến 3: máy không gửi gì hộ người).
 * Mạng, bảng chia sẻ, bộ nhớ tạm và ảnh truyền vào từ ngoài, nên mọi nhánh kiểm được bằng `node:test`.
 */
import type { CatalogUnitData } from "@quy-hang/core";
import type { ProspectNeed } from "@quy-hang/core/contacts";
import { CALL_BACK_AFTER_DAYS, freshness } from "@quy-hang/core/listing";
import type { UnitPhoto } from "@quy-hang/core/photos";
import type { AnhRa, CanNoiBo, CanRaNgoai, NguoiNhan } from "@quy-hang/core/redaction";
import { chonAnhChiaSe, ganLink, laMucChia, thanKhachMoi, thanLanGui } from "@quy-hang/core/sharing";
import type { ListingView } from "@/lib/sync/types";

/** Luật sản phẩm 25: căn chưa xác nhận từ ngưỡng «cần gọi lại» của lõi mang nhắc — nhắc, không chặn. */
export const NGAY_NHAC_XAC_NHAN = CALL_BACK_AFTER_DAYS;
export const NHAC_XAC_NHAN = "Gọi xác nhận trước";
export const LOI_TAO_LINK = "Chưa tạo được link — thử lại";

/** Căn đang chọn đi theo người sang màn Gửi: `?can=<id>,<id>` theo thứ tự chọn. */
export function docCanChon(q: string | null): string[] {
  const ds = (q ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  return [...new Set(ds)];
}

export type NguoiGui = { companyName: string; senderName: string };

/**
 * Bản vào của luật ẩn từ một hàng của kho trên máy, dòng danh mục của căn và ảnh của căn. Kho trên máy không có trường
 * nguồn (hàng 13) — các khoá nguồn để rỗng; luật ẩn ở lõi quyết định khoá nào ra.
 */
export function canNoiBoTu(l: ListingView, u: CatalogUnitData | undefined, nguoi: NguoiGui, photos: readonly UnitPhoto[]): CanNoiBo {
  return {
    // Hàng không toà (can-ngoai-khu): chỉ tên khu ra ngoài, không dãy, không địa chỉ — luật ẩn theo loại hình là hàng 80.
    buildingName: l.buildingName ?? l.subdivisionName ?? "Căn ngoài khu",
    livingArea: u?.livingArea ?? null,
    bedroomsTotal: u?.bedroomsTotal ?? null,
    directionFaces: u?.directionFaces ?? null,
    propertyType: u?.propertyType ?? null,
    propertySubType: u?.propertySubType ?? null,
    unitNumber: l.unitNumber,
    upi: u?.upi ?? null,
    stack: u?.stack ?? null,
    floor: u?.floor ?? null,
    // Danh mục chưa có số tầng toà: trang khách không có nấc tầng (ngoài vòng).
    buildingFloorsTotal: null,
    standardStatus: l.standardStatus,
    listPrice: l.listPrice,
    feeInclusion: l.feeInclusion,
    furnished: l.furnished,
    legalStatus: l.legalStatus,
    financing: l.financing,
    occupantType: l.occupantType,
    lastConfirmedAt: l.lastConfirmedAt,
    companyName: nguoi.companyName,
    senderName: nguoi.senderName,
    photos,
    closePrice: l.closePrice,
    closeDate: l.closeDate,
    withdrawnReason: l.withdrawnReason,
    version: l.version,
    holderUserId: l.listAgentKey ?? null,
    holderName: null,
    customFields: {},
    ownerName: null,
    ownerPhone: null,
    floorPrice: null,
    titleDeedPhoto: null,
    contacts: [],
  };
}

const LY_DO_LOAI: Readonly<Record<string, string>> = {
  Pending: "Đang giao dịch — không gửi mới được",
  Closed: "Đã bán",
  Hold: "Tạm ngừng",
  Withdrawn: "Ngừng hẳn",
  Incomplete: "Chưa đủ để rao",
};
export const LY_DO_KHONG_CO = "Không còn trên Bảng hàng";

export type CanGui = { id: string; l: ListingView; nhac: boolean };
export type CanLoai = { id: string; lyDo: string };

/** Căn đang chọn → căn gửi được (giữ thứ tự, kèm nhắc) và căn bị loại kèm lý do. Chỉ «Đang bán» gửi được. */
export function phanLoaiCan(ids: readonly string[], tim: (id: string) => ListingView | undefined, today: string): { gui: CanGui[]; loai: CanLoai[] } {
  const gui: CanGui[] = [];
  const loai: CanLoai[] = [];
  for (const id of ids) {
    const l = tim(id);
    if (!l) loai.push({ id, lyDo: LY_DO_KHONG_CO });
    else if (l.standardStatus !== "Active") loai.push({ id, lyDo: LY_DO_LOAI[l.standardStatus] ?? l.standardStatus });
    else {
      const f = freshness(l.lastConfirmedAt, today);
      gui.push({ id, l, nhac: !f.confirmed || f.ageDays >= NGAY_NHAC_XAC_NHAN });
    }
  }
  return { gui, loai };
}

export type TrangThaiNut = { mang: boolean; nguoiNhan: NguoiNhan | null; khachId: string | null; soCan: number; dangTao: boolean };

/** Nút Gửi mở hay tắt, và chữ trên nút. */
export function nutGui(t: TrangThaiNut): { mo: boolean; chu: string } {
  if (!t.mang) return { mo: false, chu: "Gửi cần mạng" };
  if (!t.nguoiNhan || (t.nguoiNhan === "khach_rieng" && !t.khachId)) return { mo: false, chu: "Chọn người nhận" };
  if (t.soCan === 0) return { mo: false, chu: "Không còn căn gửi được" };
  if (t.dangTao) return { mo: false, chu: "Đang tạo link…" };
  return { mo: true, chu: "Gửi" };
}

/** Khoá của tin soạn sẵn: người nhận, khách, căn theo thứ tự. */
export const khoaTin = (nguoiNhan: NguoiNhan | null, khachId: string | null, ids: readonly string[]) => `${nguoiNhan ?? ""}|${khachId ?? ""}|${ids.join(",")}`;

/**
 * Tin đang dùng: tin người sửa tay chỉ giữ khi khoá không đổi; đổi người nhận, khách hay căn thì tin dựng lại từ bản ra của
 * đúng người nhận — tin sửa cho nhóm môi giới (có mã căn) không đi sang khách riêng (bất biến 4, AC-6).
 */
export function tinDangDung(sua: { khoa: string; tin: string } | null, khoa: string, tuDong: string): string {
  return sua && sua.khoa === khoa ? sua.tin : tuDong;
}

/** Tên tệp ảnh trong gói chia sẻ — theo vị trí, không mang mã căn hay mã ảnh. */
export const tenTepAnh = (i: number) => `can-${i + 1}.jpg`;

/** Gói đưa vào bảng chia sẻ: tin có link (không trường `url` — Zalo trên iPhone bỏ tin khi có cả hai, hàng 3) và ảnh kèm. */
export function goiChiaSe(tin: string, link: string, ban: readonly CanRaNgoai[]): { text: string; anh: { anh: AnhRa; ten: string }[] } {
  return { text: ganLink(tin, link), anh: chonAnhChiaSe(ban).map((anh, i) => ({ anh, ten: tenTepAnh(i) })) };
}

/** Hàm gọi API cùng gốc: trả mã và thân; ném = mất mạng. */
export type GoiApi = (method: "GET" | "POST", path: string, body?: unknown) => Promise<{ status: number; body: unknown }>;
export type BangChiaSe = { share: (d: { text: string; files?: File[] }) => Promise<void>; canShare?: (d: { files: File[] }) => boolean };

export type KetKhachMoi = { ok: true; id: string; ten: string } | { ok: false; loi: Partial<Record<"ten" | "so" | "need" | "chung", string>> };

export type KetGui =
  | { kieu: "da-mo-bang"; code: string }
  | { kieu: "huy"; code: string }
  | { kieu: "da-chep"; code: string; text: string }
  | { kieu: "hien-tin"; code: string; text: string }
  | { kieu: "loi"; chu: string }
  | { kieu: "bo-qua" };

const TRUONG: Record<string, "ten" | "so" | "need"> = { displayName: "ten", phone: "so", need: "need" };

/**
 * Bộ điều phối của màn Gửi. Một lần bấm Gửi: khoá tới khi xong — bấm thêm trong lúc ấy bỏ qua; đúng một lời tạo Lần gửi;
 * rồi đúng một lần mở bảng chia sẻ (ảnh khi máy nhận tệp, không thì chỉ tin). Không bảng chia sẻ hay bảng báo lỗi khác
 * huỷ → chép tin; chép không được → hiện tin để chép tay. Người huỷ bảng chia sẻ không phải lỗi; Lần gửi vẫn ghi.
 */
export function taoBoGui(dep: {
  goi: GoiApi;
  goc: string;
  bang?: BangChiaSe | null;
  chep?: ((text: string) => Promise<void>) | null;
  layAnh: (anh: AnhRa, ten: string) => Promise<File | null>;
}) {
  let dangTao = false;
  return {
    dangTao: () => dangTao,

    async khachMoi(o: { ten: string; so: string; need: ProspectNeed }): Promise<KetKhachMoi> {
      const t = thanKhachMoi(o);
      if (!t.ok) return { ok: false, loi: Object.fromEntries(t.errors.map((e) => [TRUONG[e.path] ?? "chung", e.reason])) };
      try {
        const r = await dep.goi("POST", "/api/v1/prospects", t.than);
        if (r.status !== 201) return { ok: false, loi: { chung: r.status === 403 ? "Chỉ đầu khách lưu được khách" : "Chưa lưu được khách — thử lại" } };
        return { ok: true, id: (r.body as { id: string }).id, ten: t.than.displayName };
      } catch {
        return { ok: false, loi: { chung: "Lưu khách cần mạng" } };
      }
    },

    async gui(o: { nguoiNhan: NguoiNhan; prospectId: string | null; listingIds: readonly string[]; tin: string; ban: readonly CanRaNgoai[]; mucChia?: number | null }): Promise<KetGui> {
      if (dangTao) return { kieu: "bo-qua" };
      const than = thanLanGui(o);
      if (!than.ok) return { kieu: "loi", chu: LOI_TAO_LINK };
      dangTao = true;
      try {
        let code: string;
        try {
          const r = await dep.goi("POST", "/api/v1/shares", than.than);
          if (r.status !== 201) return { kieu: "loi", chu: LOI_TAO_LINK };
          code = (r.body as { code: string }).code;
        } catch {
          return { kieu: "loi", chu: LOI_TAO_LINK };
        }
        const goi = goiChiaSe(o.tin, `${dep.goc}/s/${code}`, o.ban);
        if (dep.bang) {
          const files = (await Promise.all(goi.anh.map((a) => dep.layAnh(a.anh, a.ten).catch(() => null)))).filter((f): f is File => f !== null);
          const coTep = files.length > 0 && (dep.bang.canShare?.({ files }) ?? false);
          try {
            await dep.bang.share(coTep ? { text: goi.text, files } : { text: goi.text });
            return { kieu: "da-mo-bang", code };
          } catch (e) {
            if ((e as { name?: string })?.name === "AbortError") return { kieu: "huy", code };
          }
        }
        if (dep.chep) {
          try {
            await dep.chep(goi.text);
            return { kieu: "da-chep", code, text: goi.text };
          } catch {
            // rơi xuống: hiện tin để chép tay
          }
        }
        return { kieu: "hien-tin", code, text: goi.text };
      } finally {
        dangTao = false;
      }
    },
  };
}

/** Mức chia mặc định của sàn (điểm #15) từ thân `GET /api/v1/company/settings`; trống hay đọc lỗi → null. Hàng 44. */
export function mucChiaMacDinh(body: unknown): number | null {
  const items = (body as { items?: { key: string; value: unknown }[] } | null)?.items ?? [];
  const v = items.find((x) => x.key === "broker_page.commission_split_pct")?.value;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Mức chia của bộ từ ô «Mức chia (%)»: chưa chạm ô (null) → mặc định của sàn; ô trống → không có mức; số dấu phẩy hay dấu
 * chấm → số. Chữ không đọc được → "sai" (nút gửi khoá, báo dưới ô). Hàng 44.
 */
export function mucChiaGui(nhap: string | null, macDinh: number | null): number | null | "sai" {
  // Mặc định của sàn cũng qua cùng luật: một mặc định lệch luật báo dưới ô thay vì làm hỏng lần gửi.
  if (nhap === null) return macDinh === null || laMucChia(macDinh) ? macDinh : "sai";
  const t = nhap.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return laMucChia(n) ? n : "sai";
}
export const LOI_MUC_CHIA = "Mức chia từ 0 đến 100, tối đa hai chữ số lẻ";

