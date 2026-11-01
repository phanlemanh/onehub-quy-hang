/**
 * Dựng lệnh từ trình sửa trên ô (hàng 15). Thuần — không React: trình sửa, hoàn tác và bài kiểm cùng đọc. Mỗi lệnh là một
 * sự kiện của lõi (luật 8); giá luôn đi cùng điều kiện phí (luật 7) vì mọi đường đều dựng `price_changed` đủ hai khoá.
 */
import { missingFor, TRANSITIONS, type Requirement, type StandardStatus, type WithdrawnReason } from "@quy-hang/core/listing";
import { hoanTacDuoc } from "./hoan-tac";
import { canHoiLai, docGia, vietGia, type FeeInclusion, type HoiLai } from "@quy-hang/core/pricing";

/** Phần của một dòng Bảng hàng mà trình sửa cần. */
export type HangSua = {
  id: string;
  unitNumber: string | null;
  listPrice: number | null;
  feeInclusion: string | null;
  standardStatus: StandardStatus;
  legalStatus: string | null;
  occupantType: string | null;
};

export type Lenh =
  | { type: "price_changed"; payload: { listPrice: number; feeInclusion: FeeInclusion } }
  | { type: "status_changed"; payload: { to: StandardStatus; closePrice?: number; closeDate?: string; withdrawnReason?: WithdrawnReason } };

export type KetQuaLenh =
  | { ok: true; lenh: Lenh; hieuLa: string | null; hoiLai: HoiLai | null; khongHoanTac: boolean }
  | { ok: false; loi: string }
  | { ok: false; moTrinhSuaGia: true };

export const XAC_NHAN = "Tính là vừa xác nhận với chủ nhà";
export const chuaHieu = (chu: string) => `Chưa hiểu «${chu.trim()}» — gõ như 4,65 tỷ hoặc 950 triệu`;
export const CHON_PHI = "Chọn Bao phí hay Không bao phí";

const laPhi = (v: unknown): v is FeeInclusion => v === "included" || v === "excluded";

/** Máy nói lại giá (luật 7) bằng đúng chữ của cột Phí: «Hiểu là: 4,8 tỷ, không bao phí». */
const docLai = (dong: number, phi: FeeInclusion) => `Hiểu là: ${vietGia(dong)}, ${phi === "included" ? "bao phí" : "không bao phí"}`;

/** Dòng «Hiểu là: …» sống dưới ô Giá; null khi chưa hiểu hay chưa chọn phí. */
export function hieuLaGia(chu: string, phi: FeeInclusion | null): string | null {
  const kq = docGia(chu);
  if (!kq.ok || !phi) return null;
  return docLai(kq.dong, phi);
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

/** Các nấc trình sửa Trạng thái đưa ra: đúng bảng chuyển ADR-0008 từ trạng thái hiện tại. */
export function nacTrangThai(tu: StandardStatus): readonly StandardStatus[] {
  return TRANSITIONS[tu];
}

const NHAN_THIEU: Record<Requirement, string> = {
  listPrice: "giá",
  feeInclusion: "điều kiện phí",
  legalStatus: "pháp lý",
  occupantType: "tình trạng sử dụng",
  closePrice: "giá chốt",
  withdrawnReason: "lý do ngừng",
};

export type ThemTrangThai = { giaChot?: string; ngayBan?: string; lyDo?: WithdrawnReason };

/** Ngày hôm nay theo giờ máy, YYYY-MM-DD — mặc định của ngày bán. */
export function homNay(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Trình sửa Trạng thái: nấc đã chọn (+ giá chốt, ngày, lý do khi nấc đòi) → một lệnh đổi trạng thái. */
export function dungLenhTrangThai(hang: HangSua, to: StandardStatus, them: ThemTrangThai = {}): KetQuaLenh {
  if (!nacTrangThai(hang.standardStatus).includes(to)) return { ok: false, loi: "Không chuyển được sang nấc này" };
  let closePrice: number | undefined;
  let hieuLa: string | null = null;
  if (to === "Closed" && them.giaChot !== undefined && them.giaChot.trim() !== "") {
    const kq = docGia(them.giaChot);
    if (!kq.ok) return { ok: false, loi: chuaHieu(them.giaChot) };
    closePrice = kq.dong;
    hieuLa = `Hiểu là: giá chốt ${vietGia(kq.dong)}`;
  }
  const thieu = missingFor(to, { ...hang, closePrice, withdrawnReason: them.lyDo });
  if (thieu.length) {
    const ten = thieu.map((k) => NHAN_THIEU[k]).join(", ");
    return { ok: false, loi: to === "Active" ? `Chưa lên Đang bán được: thiếu ${ten}` : `Cần ${ten}` };
  }
  const payload: Extract<Lenh, { type: "status_changed" }>["payload"] = { to };
  if (to === "Closed") {
    payload.closePrice = closePrice;
    payload.closeDate = them.ngayBan || homNay();
  }
  if (to === "Withdrawn") payload.withdrawnReason = them.lyDo;
  const lenh: Lenh = { type: "status_changed", payload };
  return { ok: true, lenh, hieuLa, hoiLai: null, khongHoanTac: !hoanTacDuoc(hang, lenh) };
}
