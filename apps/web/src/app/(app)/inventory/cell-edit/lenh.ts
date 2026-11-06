/**
 * Dựng lệnh từ trình sửa trên ô (hàng 15). Thuần — không React: trình sửa, hoàn tác và bài kiểm cùng đọc. Mỗi lệnh là một
 * sự kiện của lõi (luật 8); giá luôn đi cùng điều kiện phí (luật 7) vì mọi đường đều dựng `price_changed` đủ hai khoá.
 */
import { missingFor, NHAN_DIEU_KIEN, nhanDieuKien, TRANSITIONS, type EventType, type StandardStatus, type WithdrawnReason } from "@quy-hang/core/listing";
import { canHoiLai, docGia, vietGia, type FeeInclusion, type HoiLai } from "@quy-hang/core/pricing";
import { duocLamVoiHang, LY_DO_DUA_LEN_DANG_BAN, type Viewer } from "@quy-hang/core/access";
import { nhanGiaTri, type TuVung } from "@quy-hang/core/labels";
import { nhanCuaCan, nhanCuaNeo, type NhanTrangThai } from "@quy-hang/core/statuses";
import { FEE_LABEL, STATUS_LABEL } from "../cot";
import type { LoiTrenMay } from "@/lib/sync/ap-tren-may";
import { hoanTacDuoc } from "./hoan-tac";

/** Phần của một dòng Bảng hàng mà trình sửa cần. */
export type HangSua = {
  id: string;
  unitNumber: string | null;
  listPrice: number | null;
  feeInclusion: string | null;
  standardStatus: StandardStatus;
  /** Mã nhãn trạng thái riêng căn đang mang (hàng 46); vắng hay `null` = nhãn mặc định. */
  statusLabel?: string | null;
  legalStatus: string | null;
  occupantType: string | null;
};

export type Lenh =
  | { type: "price_changed"; payload: { listPrice: number; feeInclusion: FeeInclusion } }
  | {
      type: "status_changed";
      /** `label`: mã nhãn riêng của nấc đích (hàng 46); `null` = về nhãn mặc định; vắng = nhãn mặc định (như trước hàng 46). */
      payload: { to: StandardStatus; label?: string | null; closePrice?: number; closeDate?: string; withdrawnReason?: WithdrawnReason };
    };

export type KetQuaLenh =
  | { ok: true; lenh: Lenh; hieuLa: string | null; hoiLai: HoiLai | null; khongHoanTac: boolean }
  | { ok: false; loi: string }
  | { ok: false; moTrinhSuaGia: true };

export const XAC_NHAN = "Tính là vừa xác nhận với chủ nhà";
export const chuaHieu = (chu: string) => `Chưa hiểu «${chu.trim()}» — gõ như 4,65 tỷ hoặc 950 triệu`;
export const CHON_PHI = "Chọn Bao phí hay Không bao phí";

const laPhi = (v: unknown): v is FeeInclusion => v === "included" || v === "excluded";

/**
 * Mọi chỗ trình sửa hiện giá viết bằng `vietGia` — đúng từng đồng (va-sua-tren-o). Tham số `viet` chỉ để đối chứng đỏ
 * của bài kiểm thay bộ viết; mã chạy không truyền.
 */
type VietGia = (dong: number) => string;

/** Máy nói lại giá (luật 7) bằng đúng chữ của cột Phí: «Hiểu là: 4,8 tỷ, không bao phí». */
const docLai = (dong: number, phi: FeeInclusion, viet: VietGia = vietGia) => `Hiểu là: ${viet(dong)}, ${phi === "included" ? "bao phí" : "không bao phí"}`;

/** Dòng «Hiểu là: …» sống dưới ô Giá; null khi chưa hiểu hay chưa chọn phí. */
export function hieuLaGia(chu: string, phi: FeeInclusion | null, viet: VietGia = vietGia): string | null {
  const kq = docGia(chu);
  if (!kq.ok || !phi) return null;
  return docLai(kq.dong, phi, viet);
}

/** Dòng «Hiểu là: giá chốt …» dưới ô Giá chốt; null khi chưa hiểu. */
export function hieuLaGiaChot(chu: string, viet: VietGia = vietGia): string | null {
  const kq = docGia(chu);
  return kq.ok ? `Hiểu là: giá chốt ${viet(kq.dong)}` : null;
}

/** Chữ điền sẵn ô gõ Giá: giá hiện tại viết đủ — Enter không gõ gì thì đọc lại đúng số cũ, không đổi giá. */
export function chuDienSan(hang: Pick<HangSua, "listPrice">, viet: VietGia = vietGia): string {
  return hang.listPrice === null ? "" : viet(hang.listPrice);
}

/** Dòng «cũ → mới» của hộp hỏi lại. */
export function moTaThayDoi(
  hang: Pick<HangSua, "listPrice" | "feeInclusion" | "standardStatus" | "statusLabel">,
  lenh: Lenh,
  viet: VietGia = vietGia,
  /** Cách gọi riêng của sàn (hàng 45) cho chữ phí. */
  tv?: TuVung | null,
): string {
  if (lenh.type === "price_changed") {
    const phi = (v: string | null | undefined) => (v ? nhanGiaTri(tv, "feeInclusion", v, FEE_LABEL[v] ?? v) : "—");
    const cu = hang.listPrice === null ? "chưa có giá" : `${viet(hang.listPrice)}, ${phi(hang.feeInclusion)}`;
    return `${cu} → ${viet(lenh.payload.listPrice)}, ${phi(lenh.payload.feeInclusion)}`;
  }
  const nhan = tv?.trangThai;
  return `${nhanCuaCan(nhan, hang.standardStatus, hang.statusLabel)} → ${nhanCuaCan(nhan, lenh.payload.to, lenh.payload.label)}`;
}

/** Trình sửa Giá: chữ đã gõ + điều kiện phí đang chọn → một lệnh đổi giá. */
export function dungLenhGia(hang: HangSua, chu: string, phi: FeeInclusion | null): KetQuaLenh {
  const kq = docGia(chu);
  if (!kq.ok) return { ok: false, loi: chuaHieu(chu) };
  if (!phi) return { ok: false, loi: CHON_PHI };
  const lenh: Lenh = { type: "price_changed", payload: { listPrice: kq.dong, feeInclusion: phi } };
  const cu = { listPrice: hang.listPrice, feeInclusion: laPhi(hang.feeInclusion) ? hang.feeInclusion : null };
  return { ok: true, lenh, hieuLa: docLai(kq.dong, phi), hoiLai: canHoiLai(cu, lenh.payload), khongHoanTac: !hoanTacDuoc(hang, lenh) };
}

/** Trình sửa Phí: giữ giá, đổi điều kiện. Hàng chưa có giá thì mở trình sửa Giá (không có phí trơn). */
export function dungLenhPhi(hang: HangSua, phi: FeeInclusion): KetQuaLenh {
  if (hang.listPrice === null) return { ok: false, moTrinhSuaGia: true };
  const lenh: Lenh = { type: "price_changed", payload: { listPrice: hang.listPrice, feeInclusion: phi } };
  const cu = { listPrice: hang.listPrice, feeInclusion: laPhi(hang.feeInclusion) ? hang.feeInclusion : null };
  return { ok: true, lenh, hieuLa: docLai(hang.listPrice, phi), hoiLai: canHoiLai(cu, lenh.payload), khongHoanTac: !hoanTacDuoc(hang, lenh) };
}

/**
 * Các nấc trình sửa Trạng thái đưa ra: bảng chuyển ADR-0008 từ trạng thái hiện tại, bỏ «Đang bán» khi người xem không đủ cờ
 * «Sẵn sàng bán» (bảng quyền của hàng, bang-quyen-theo-vai). Cờ bắt buộc — không mặc định — để kiểm kiểu bắt chỗ gọi quên.
 */
export function nacTrangThai(tu: StandardStatus, duaLenDangBan: boolean): readonly StandardStatus[] {
  return duaLenDangBan ? TRANSITIONS[tu] : TRANSITIONS[tu].filter((s) => s !== "Active");
}

/** Cờ «đưa lên Đang bán» của trình sửa: người đang đăng nhập và người giữ căn của dòng, đọc từ bảng quyền của lõi. */
export function coDuaLenDangBan(me: Viewer, listAgentKey: string | null | undefined): boolean {
  return duocLamVoiHang(me, "dua_len_dang_ban", listAgentKey ?? null);
}

/** Một lựa chọn của thực đơn Trạng thái: nấc đích, mã nhãn (`null` = nhãn mặc định) và chữ hiện. */
export type LuaChonTrangThai = { to: StandardStatus; label: string | null; chu: string };

/**
 * Thực đơn trình sửa Trạng thái (hàng 46): mỗi nấc đích theo bảng chuyển liệt nhãn mặc định rồi các nhãn riêng neo vào nấc
 * ấy. Nấc hiện tại có nhãn riêng thì đứng đầu các lựa chọn cùng nấc (đổi nhãn tại chỗ), trừ nhãn căn đang mang. Mã căn
 * mang mà bộ nhãn không còn thì không thành lựa chọn nào. Người không đủ cờ «Sẵn sàng bán» (bang-quyen-theo-vai) không thấy
 * nấc Đang bán, kể cả đổi nhãn tại chỗ trong Đang bán — như máy chủ. Cờ bắt buộc, như `nacTrangThai`.
 */
export function luaChonTrangThai(
  hang: Pick<HangSua, "standardStatus" | "statusLabel">,
  nhan: readonly NhanTrangThai[] | undefined,
  duaLenDangBan: boolean,
): LuaChonTrangThai[] {
  const boNhan = nhan ?? [];
  const cuaNac = (s: StandardStatus): LuaChonTrangThai[] => [
    { to: s, label: null, chu: STATUS_LABEL[s] },
    ...nhanCuaNeo(boNhan, s).map((n) => ({ to: s, label: n.ma, chu: n.label })),
  ];
  const tu = hang.standardStatus;
  const dangMang = hang.statusLabel ?? null;
  const doiTaiCho = nhanCuaNeo(boNhan, tu).length > 0 && (tu !== "Active" || duaLenDangBan);
  const taiCho = doiTaiCho ? cuaNac(tu).filter((l) => l.label !== dangMang) : [];
  return [...taiCho, ...nacTrangThai(tu, duaLenDangBan).flatMap(cuaNac)];
}

/** Lựa chọn đổi nhãn tại chỗ (cùng nấc với căn) — không cần bảng chuyển. */
export const laDoiNhanTaiCho = (hang: Pick<HangSua, "standardStatus">, l: Pick<LuaChonTrangThai, "to">) => l.to === hang.standardStatus;

const NHAN_THIEU = NHAN_DIEU_KIEN;

export const nhanThieu = nhanDieuKien;

/** Câu báo khi máy không áp được lần sửa (trình sửa ô) — điều thiếu đi qua bảng nhãn của lõi. */
/** Lỗi của một lần ghi như màn thấy: lỗi của bộ đồng bộ, hay lỗi bất ngờ mà `ghiAnToan` bắt được (va-duong-loi-hoan-tac). */
export type LoiGhi = LoiTrenMay | { kind: "bat-ngo" };

export const LOI_BAT_NGO = "Lỗi bất ngờ — chưa lưu được, thử lại";

/**
 * Bọc hàm ghi của bộ đồng bộ: lỗi ném ra (không phải lỗi kho đã biết) thành `{ ok: false, loi: { kind: "bat-ngo" } }`, để
 * lần ghi sau khi ô sửa đã đóng không bao giờ mất lặng qua `void` (Known limits Ngoài-3 của va-sua-tren-o).
 */
export function ghiAnToan<A extends unknown[], T>(sua: (...a: A) => Promise<T>): (...a: A) => Promise<T | { ok: false; loi: { kind: "bat-ngo" } }> {
  return async (...a) => {
    try {
      return await sua(...a);
    } catch {
      return { ok: false, loi: { kind: "bat-ngo" } };
    }
  };
}

/** Kết cục một lần ghi như màn thấy, và hàm ghi đã bọc `ghiAnToan` mà các hàm điều phối nhận. */
export type KetQuaGhi = { ok: true; op: { expectedVersion: number } } | { ok: false; loi: LoiGhi };
export type GhiFn = (listingId: string, type: EventType, payload: Record<string, unknown>, coSo?: number) => Promise<KetQuaGhi>;

/** Lưu một lần sửa trên ô khi ô đã đóng: lỗi nào cũng thành chữ nêu căn, không lỗi nào ném ra. */
export async function chayLuuO(sua: GhiFn, id: string, lenh: Lenh, coSo: number | undefined, nhan: string): Promise<{ ok: true; phienBanSau: number } | { ok: false; chu: string }> {
  const kq = await sua(id, lenh.type, lenh.payload, coSo);
  return kq.ok ? { ok: true, phienBanSau: kq.op.expectedVersion + 1 } : { ok: false, chu: `${moTaLoi(kq.loi)} — ${nhan}` };
}

/** Lỗi kho và lỗi bất ngờ có thể lành khi thử lại; lỗi của lõi thì không. */
export const thuLaiDuoc = (l: LoiGhi): boolean => l.kind === "kho" || l.kind === "bat-ngo";

export function moTaLoi(l: LoiGhi): string {
  if (l.kind === "bat-ngo") return LOI_BAT_NGO;
  if (l.kind === "missing-requirement") return `Thiếu ${l.missing.map(nhanThieu).join(", ")}`;
  if (l.kind === "invalid-transition") return l.reason;
  if (l.kind === "not-found") return "Không còn thấy hàng này";
  if (l.kind === "kho") return "Máy chưa lưu được lần sửa — thử lại";
  return "Lần sửa không hợp lệ";
}

/** `label`: mã nhãn riêng đã chọn (hàng 46); `null` = nhãn mặc định khi đổi nhãn tại chỗ; vắng = không gửi khoá nhãn. */
export type ThemTrangThai = { giaChot?: string; ngayBan?: string; lyDo?: WithdrawnReason; label?: string | null };

/** Ngày hôm nay theo giờ máy, YYYY-MM-DD — mặc định của ngày bán. */
export function homNay(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Trình sửa Trạng thái: nấc đã chọn (+ giá chốt, ngày, lý do khi nấc đòi) → một lệnh đổi trạng thái. */
export function dungLenhTrangThai(hang: HangSua, to: StandardStatus, them: ThemTrangThai, duaLenDangBan: boolean): KetQuaLenh {
  // Như nút đã ẩn: lệnh Đang bán dựng tay của người không đủ cờ bị từ chối trước khi gửi (máy chủ cũng từ chối, 403) —
  // kể cả đổi nhãn tại chỗ trong Đang bán, như máy chủ.
  if (to === "Active" && !duaLenDangBan) return { ok: false, loi: LY_DO_DUA_LEN_DANG_BAN };
  if (to === hang.standardStatus) {
    // Đổi nhãn tại chỗ (hàng 46): cùng trạng thái chuẩn, khác nhãn — bảng chuyển không xét, không đòi điều kiện của nấc.
    if (them.label === undefined || them.label === (hang.statusLabel ?? null)) return { ok: false, loi: "Không chuyển được sang nấc này" };
    const lenh: Lenh = { type: "status_changed", payload: { to, label: them.label } };
    return { ok: true, lenh, hieuLa: null, hoiLai: null, khongHoanTac: !hoanTacDuoc(hang, lenh) };
  }
  if (!nacTrangThai(hang.standardStatus, true).includes(to)) return { ok: false, loi: "Không chuyển được sang nấc này" };
  let closePrice: number | undefined;
  let hieuLa: string | null = null;
  if (to === "Closed" && them.giaChot !== undefined && them.giaChot.trim() !== "") {
    const kq = docGia(them.giaChot);
    if (!kq.ok) return { ok: false, loi: chuaHieu(them.giaChot) };
    closePrice = kq.dong;
    hieuLa = hieuLaGiaChot(them.giaChot);
  }
  const thieu = missingFor(to, { ...hang, closePrice, withdrawnReason: them.lyDo });
  if (thieu.length) {
    const ten = thieu.map((k) => NHAN_THIEU[k]).join(", ");
    return { ok: false, loi: to === "Active" ? `Chưa lên Đang bán được: thiếu ${ten}` : `Cần ${ten}` };
  }
  const payload: Extract<Lenh, { type: "status_changed" }>["payload"] = { to };
  // Nhãn riêng của nấc đích; nhãn mặc định không gửi khoá — lệnh giữ đúng hình trước hàng 46.
  if (them.label) payload.label = them.label;
  if (to === "Closed") {
    payload.closePrice = closePrice;
    payload.closeDate = them.ngayBan || homNay();
  }
  if (to === "Withdrawn") payload.withdrawnReason = them.lyDo;
  const lenh: Lenh = { type: "status_changed", payload };
  return { ok: true, lenh, hieuLa, hoiLai: null, khongHoanTac: !hoanTacDuoc(hang, lenh) };
}
