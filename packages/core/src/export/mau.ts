/**
 * Mẫu xuất bảng hàng (hàng 43, design §3 bước 1): năm mẫu dựng sẵn ở lõi — sàn tự chỉnh mẫu ở Cài đặt sàn là hàng sau
 * (mục 50). Bài và ảnh tối đa 30 căn; Excel, PDF không giới hạn. Mã mẫu cũng là giá trị cột `format` của bảng `exports`.
 */
import type { NguoiNhan } from "../redaction/cua-ra";

export const MA_MAU_XUAT = ["post_zalo", "post_facebook", "xlsx", "png", "pdf"] as const;
export type MauXuat = (typeof MA_MAU_XUAT)[number];

/** Bài chép vào bộ nhớ tạm · tệp tải về máy. */
export type LoaiDauRa = "bai" | "tep";

export type DinhNghiaMau = { ma: MauXuat; nhan: string; loai: LoaiDauRa; duoi: string; coTran: boolean };

/** Thứ tự là thứ tự thẻ ở bước 1 của hộp thoại. */
export const MAU_XUAT: readonly DinhNghiaMau[] = [
  { ma: "post_zalo", nhan: "Bài Zalo", loai: "bai", duoi: "txt", coTran: true },
  { ma: "post_facebook", nhan: "Bài Facebook", loai: "bai", duoi: "txt", coTran: true },
  { ma: "xlsx", nhan: "Excel", loai: "tep", duoi: "xlsx", coTran: false },
  { ma: "png", nhan: "Ảnh", loai: "tep", duoi: "png", coTran: true },
  { ma: "pdf", nhan: "PDF", loai: "tep", duoi: "pdf", coTran: false },
];
const THEO_MA = new Map(MAU_XUAT.map((m) => [m.ma, m]));

export function dinhNghiaMau(mau: MauXuat): DinhNghiaMau {
  const m = THEO_MA.get(mau);
  if (!m) throw new Error(`mẫu xuất lạ: ${String(mau)}`);
  return m;
}

/**
 * Trần căn của bài và ảnh — bằng `MAX_SHARE_LISTINGS` của `../sharing` (bài kiểm ghim hai số bằng nhau). Không nhập
 * thẳng vì `../sharing` dùng `node:crypto`, còn mô-đun này chạy cả trong trình duyệt.
 */
export const TRAN_BAI_ANH = 30;
export const LOI_QUA_TRAN = "Quá 30 căn — dùng Excel hay PDF";

/** Hỏi-1: xuất bảng hàng chủ yếu cho đội và sàn bạn. */
export const NGUOI_NHAN_MAC_DINH: NguoiNhan = "nhom_moi_gioi";

export type TrangThaiMau = { khoa: false; loi: null } | { khoa: true; loi: string };

/** Bài Zalo, Bài Facebook, Ảnh khoá khi quá 30 căn; Excel, PDF không bao giờ khoá. */
export function mauBiKhoa(mau: MauXuat, soCan: number): TrangThaiMau {
  return dinhNghiaMau(mau).coTran && soCan > TRAN_BAI_ANH ? { khoa: true, loi: LOI_QUA_TRAN } : { khoa: false, loi: null };
}

/** Số căn mỗi trang PDF. */
export const CAN_MOI_TRANG = 25;

/** Số trang của bản PDF theo số căn — ít nhất một trang. */
export function chiaTrang(soCan: number, moiTrang: number = CAN_MOI_TRANG): number {
  if (!Number.isInteger(moiTrang) || moiTrang <= 0) throw new Error("số căn mỗi trang phải là số nguyên dương");
  return Math.max(1, Math.ceil(Math.max(0, soCan) / moiTrang));
}

/** Cắt dòng thành từng trang theo `chiaTrang`. */
export function chiaTheoTrang<T>(dong: readonly T[], moiTrang: number = CAN_MOI_TRANG): T[][] {
  const soTrang = chiaTrang(dong.length, moiTrang);
  return Array.from({ length: soTrang }, (_, i) => dong.slice(i * moiTrang, (i + 1) * moiTrang));
}

/** `bang-hang-YYYY-MM-DD.<đuôi>`; `ngay` là `YYYY-MM-DD` hay chuỗi ISO bắt đầu bằng ngày ấy (lõi không đọc đồng hồ). */
export function tenTep(mau: MauXuat, ngay: string): string {
  const d = ngay.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw new Error(`ngày không đúng dạng YYYY-MM-DD: ${ngay}`);
  return `bang-hang-${d}.${dinhNghiaMau(mau).duoi}`;
}
