// Trang nhóm môi giới (hàng 44): phần thân chỉ người nhận `nhom_moi_gioi` có — cột, ô đã định dạng, định nghĩa «Bao phí» của
// sàn và mức chia của bộ. Mọi ô dựng từ bản ra `banRaNgoai` (bất biến 4); bảng trang, tệp Excel và ảnh cùng đọc `cot` và `dong`
// của phần này, nên «đúng những cột ấy» là một nguồn. Mức chia vắng HẲN khi sàn ẩn hay bộ không có mức — giao diện không
// tự ẩn.
import { chuCuaO, COT_BANG_HANG, cotRa, type CotBangHang } from "../export/cot";
import { nhanGiaTri, nhanTruong, type TuVung } from "../labels";
import type { CanRaNgoai, CauHinhRa, KhoaRa } from "../redaction";

/** Tập đóng của điểm #8 `fee.inclusion` (sổ điểm biến thiên), theo thứ tự hiện. */
export const KHOAN_PHI = ["personalIncomeTax", "registrationFee", "brokerageFee"] as const;
export type KhoanPhi = (typeof KHOAN_PHI)[number];

/** Nhãn mặc định của từng khoản — nghĩa do lõi giữ (ADR-0022). */
export const NHAN_KHOAN_PHI: Readonly<Record<KhoanPhi, string>> = {
  personalIncomeTax: "thuế thu nhập cá nhân",
  registrationFee: "lệ phí trước bạ",
  brokerageFee: "phí môi giới",
};

export const laKhoanPhi = (x: unknown): x is KhoanPhi => typeof x === "string" && (KHOAN_PHI as readonly string[]).includes(x);

/** Cột của trang môi giới: mọi cột của bảng hàng theo thứ tự bảng, giao với khoá ra của nhóm môi giới (Hỏi-2: cố định). */
export const COT_TRANG_MOI_GIOI: readonly CotBangHang[] = Object.keys(COT_BANG_HANG) as CotBangHang[];

export type CotTrang = { khoa: KhoaRa; nhan: string };
export type DinhNghiaPhi = { ten: string; khoan: string[] };

/** Phần thân riêng của trang nhóm môi giới. `mucChia` là số phần trăm, vắng khi ẩn hay không có. */
export type PhanMoiGioi = { cot: CotTrang[]; dong: string[][]; dinhNghiaPhi: DinhNghiaPhi; mucChia?: number };

/** Điều Lần gửi mang lúc gửi (migration 048). `null` = không có (Lần gửi trước 048 hay để trống). */
export type LuuTrenLanGui = { mucChia: number | null; feeInclusion: readonly string[] | null };
/** Cấu hình hiện tại của sàn gửi mà trang môi giới đọc. */
export type CauHinhTrangMoiGioi = { anMucChia: boolean; feeInclusion: readonly string[] };

export function phanMoiGioi(o: {
  ban: readonly CanRaNgoai[];
  cauHinhRa: CauHinhRa;
  tuVung: TuVung;
  luu: LuuTrenLanGui;
  san: CauHinhTrangMoiGioi;
}): PhanMoiGioi {
  const { ra } = cotRa(COT_TRANG_MOI_GIOI, "nhom_moi_gioi", o.cauHinhRa);
  const cot = ra.map((c) => ({ khoa: c.khoa, nhan: nhanTruong(o.tuVung, c.khoa, c.nhan) }));
  const dong = o.ban.map((b) => ra.map((c) => chuCuaO(b, c.khoa, o.tuVung)));
  // Bản chụp lúc gửi thắng (điểm #8 hiệu lực «mới»); Lần gửi trước 048 đọc cấu hình hiện tại.
  const tap = (o.luu.feeInclusion ?? o.san.feeInclusion).filter(laKhoanPhi);
  const dinhNghiaPhi = { ten: nhanGiaTri(o.tuVung, "feeInclusion", "included", "Bao phí"), khoan: KHOAN_PHI.filter((k) => tap.includes(k)).map((k) => NHAN_KHOAN_PHI[k]) };
  const phan: PhanMoiGioi = { cot, dong, dinhNghiaPhi };
  if (!o.san.anMucChia && o.luu.mucChia !== null) phan.mucChia = o.luu.mucChia;
  return phan;
}

/** Câu định nghĩa một dòng: «Bao phí: giá đã gồm thuế thu nhập cá nhân, phí môi giới». */
export function cauDinhNghiaPhi(d: DinhNghiaPhi): string {
  return `${d.ten}: giá đã gồm ${d.khoan.join(", ")}`;
}

/** Câu mức chia: «Mức chia: 40%». */
export function cauMucChia(muc: number): string {
  return `Mức chia: ${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(muc)}%`;
}
