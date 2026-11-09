/**
 * Phần thuần của Hôm nay theo vai và Hôm nay của trưởng nhóm (hàng 42): xếp vùng theo vai, sáu trạng thái của màn trưởng
 * nhóm (bảng ST-hntn-* của thiết kế), ba ô số và bảng theo đầu chủ. Không gọi mạng, không đọc đồng hồ — màn truyền vào.
 */
import { CAU_HINH_SAN_MAC_DINH } from "@quy-hang/core/config";
import { hangCuTheoNguoi, tongCanGoiLai, type CanHangCu, type DongHangCu } from "@quy-hang/core/today";

import type { DauChuCuaSan, DongLeadTruongNhom } from "../today/nguon";

// ——— Sáu trạng thái ———

export type TrangThaiTruongNhom = "dang-tai" | "mac-dinh" | "trong" | "loi" | "mat-mang" | "giao-loi";

export type VaoTrangThai = {
  dangTai: boolean;
  loiTai: boolean;
  matMang: boolean;
  /** Lần đọc cuối của hàng đợi; `null` khi chưa đọc được lần nào. */
  hangDoi: readonly DongLeadTruongNhom[] | null;
  /** Câu lỗi giao lại theo mã lead — dòng ở lại, câu hiện dưới dòng. */
  loiGiao: Readonly<Record<string, string>>;
};

export type RaTrangThai = {
  trangThai: TrangThaiTruongNhom;
  /** Chữ chính của trạng thái, đúng bảng ST-hntn-* (giao-loi: câu lỗi máy chủ của dòng). */
  chu: string;
  /** Nút «Giao lại» bấm được — tắt khi mất mạng và khi đang tải. */
  choGiao: boolean;
};

export const CHU_TRANG_THAI = {
  "dang-tai": "Đang tải",
  "mac-dinh": "Lead quá hạn và ngoại lệ",
  trong: "Không lead nào quá hạn",
  loi: "Không tải được lead quá hạn",
  "mat-mang": "Đang mất mạng",
} as const;

/** Dòng có người giữ mà chưa biết tên: đọc danh sách lỗi hay chưa đặt tên. */
export const CHU_CHUA_RO_TEN = "Chưa rõ tên";

/** Một vùng một báo lỗi: hai nguồn cùng hỏng thì câu của hàng đợi. */
export function baoLoiDoi(loi: { hangDoi: boolean; dauChu: boolean }): string | null {
  if (loi.hangDoi) return CHU_TRANG_THAI.loi;
  return loi.dauChu ? "Không tải được tên đầu chủ" : null;
}

/** Câu dưới «Đang mất mạng»: có số thì nói là lần đọc cuối, chưa có số thì nói máy sẽ tự đọc lại. */
export const moTaMatMang = (hangDoi: readonly DongLeadTruongNhom[] | null) => (hangDoi ? "Số là lần đọc cuối." : "Máy sẽ tự đọc lại khi có mạng.");

/** Chữ trong ô tròn của một đầu chủ; chưa biết tên thì gạch, không lấy chữ của câu thay. */
export function kyHieuDauChu(ten: string): string {
  if (ten === CHU_CHUA_RO_TEN) return "—";
  return ten.replace(/[[\]]/g, "").trim().split(/\s+/).pop()?.slice(0, 2).toUpperCase() || "—";
}

/** Bảng theo người rỗng (ST-hntn-trong). */
export const CHU_CHUA_CO_CAN = "Chưa có căn nào";
/** Dòng dưới bảng theo người (gate1, Hỏi-5). */
export const CHU_PHAM_VI = "Chỉ tính căn toàn sàn";
/** Khổ dưới `md` (ADR-0024). */
export const CHU_DIEN_THOAI = "Hôm nay của trưởng nhóm mở trên máy tính";

/** Một trạng thái từ nguồn của màn. Mất mạng thắng mọi trạng thái khác: số giữ lần đọc cuối, nút giao tắt. */
export function trangThaiTruongNhom(v: VaoTrangThai): RaTrangThai {
  if (v.matMang) return { trangThai: "mat-mang", chu: CHU_TRANG_THAI["mat-mang"], choGiao: false };
  if (v.dangTai) return { trangThai: "dang-tai", chu: CHU_TRANG_THAI["dang-tai"], choGiao: false };
  if (v.loiTai || v.hangDoi === null) return { trangThai: "loi", chu: CHU_TRANG_THAI.loi, choGiao: true };
  const loi = v.hangDoi.map((d) => v.loiGiao[d.leadId]).find(Boolean);
  if (loi) return { trangThai: "giao-loi", chu: loi, choGiao: true };
  if (v.hangDoi.length === 0) return { trangThai: "trong", chu: CHU_TRANG_THAI.trong, choGiao: true };
  return { trangThai: "mac-dinh", chu: CHU_TRANG_THAI["mac-dinh"], choGiao: true };
}

// ——— Ba ô số ———

/** «Lead quá hạn» = lead đã về người mà quá hạn nhận hay gọi; «Ngoại lệ» = lead chưa chia được (gate1, Hỏi-1). */
export function baO(hangDoi: readonly DongLeadTruongNhom[]) {
  return {
    leadQuaHan: hangDoi.filter((d) => d.kind === "accept_overdue" || d.kind === "first_call_overdue").length,
    ngoaiLe: hangDoi.filter((d) => d.kind === "unrouted").length,
  };
}

/** Căn của kho trên máy để đếm hàng cũ — trường RESO như `ListingView`; căn «Chỉ tôi» không tính (căn toàn sàn). */
export type CanTrenMay = Partial<CanHangCu> & Pick<CanHangCu, "standardStatus"> & { visibility?: "Private" | "Company" };

/** Bảng hàng cũ theo người và ô «Hàng cũ» = tổng cần gọi lại của mọi dòng, kể cả dòng chưa có người giữ. */
export function hangCuTrenMay(can: readonly CanTrenMay[], homNay: string, cauHinh = CAU_HINH_SAN_MAC_DINH) {
  const dong = hangCuTheoNguoi(
    can.filter((c) => c.visibility !== "Private").map((c) => ({ standardStatus: c.standardStatus, listAgentKey: c.listAgentKey ?? null, lastConfirmedAt: c.lastConfirmedAt ?? null })),
    homNay,
    cauHinh,
  );
  return { dong, hangCu: tongCanGoiLai(dong) };
}

export type DongTheoNguoi = DongHangCu & { ten: string; nghi: boolean };

/** Tên người giữ khớp danh sách đầu chủ theo mã; không có trong danh sách thì mã ngắn; dòng `null` là «Chưa có người giữ». */
export function dongTheoNguoi(dong: readonly DongHangCu[], dauChu: readonly DauChuCuaSan[]): DongTheoNguoi[] {
  const theoMa = new Map(dauChu.map((d) => [d.userId, d]));
  return dong.map((d) => {
    const n = d.userId ? theoMa.get(d.userId) : undefined;
    return { ...d, ten: d.userId === null ? "Chưa có người giữ" : (n?.displayName || CHU_CHUA_RO_TEN), nghi: n?.onLeave ?? false };
  });
}

/** «Quá hạn 2 giờ 5 phút» từ mốc hạn tới bây giờ. */
export function chuQuaHan(dueAt: string, bayGio: string): string {
  const phut = Math.max(0, Math.floor((Date.parse(bayGio) - Date.parse(dueAt)) / 60_000));
  const g = Math.floor(phut / 60);
  const p = phut % 60;
  return g === 0 ? `${p} phút` : p === 0 ? `${g} giờ` : `${g} giờ ${p} phút`;
}

/** Ngày hôm nay theo giờ Việt Nam, YYYY-MM-DD — lõi hàng cũ không đọc đồng hồ. */
export const ngayVN = (bayGio: string) => new Date(Date.parse(bayGio) + 7 * 3_600_000).toISOString().slice(0, 10);
