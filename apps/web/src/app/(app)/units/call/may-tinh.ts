/**
 * Máy tính giá bao phí ↔ về tay của chế độ cuộc gọi (hàng 28, AC-4). Thuần — màn và bài kiểm cùng đọc. Sửa ô nào thì ô
 * kia tính lại bằng lõi (`tinhVeTay`, `giaBaoPhiTuVeTay`); định nghĩa bao phí là định nghĩa hiện hành của sàn (hàng 49 —
 * khoản sàn tắt không trừ), đầu chủ chỉ sửa phần trăm môi giới cho lần tính. Máy tính không ghi gì vào hồ sơ.
 */
import {
  DINH_NGHIA_MAC_DINH,
  docGia,
  giaBaoPhiTuVeTay,
  NHAN_KHOAN,
  tinhVeTay,
  vietGia,
  type FeeInclusion,
  KHOAN_BAO_PHI,
  type DinhNghiaBaoPhi,
  type KhoanPhi,
  type TiLeBaoPhi,
} from "@quy-hang/core/pricing";

/** Cơ sở của lần tính: bảng tỉ lệ (cả ba khoản) hay định nghĩa của sàn có tập khoản. */
export type CoSo = TiLeBaoPhi | DinhNghiaBaoPhi;
const dinhNghia = (c: CoSo): DinhNghiaBaoPhi => ("khoan" in c ? (c as DinhNghiaBaoPhi) : { khoan: KHOAN_BAO_PHI, tiLe: c as TiLeBaoPhi });

export type MayTinh = {
  chuGia: string;
  phi: FeeInclusion;
  chuVeTay: string;
  /** Phần trăm môi giới như người gõ: «1», «1,5». */
  chuMoiGioi: string;
  /** Lần tính hợp lệ gần nhất — chữ chưa hiểu không xoá nó. */
  ketQua: { gia: number; veTay: number; khoan: KhoanPhi[] } | null;
  /** Câu báo dưới ô đang sai; `null` khi mọi ô hiểu được. */
  loi: { o: "gia" | "ve-tay" | "moi-gioi"; chu: string } | null;
};

export type DoiMayTinh = { o: "gia"; chu: string } | { o: "ve-tay"; chu: string } | { o: "phi"; phi: FeeInclusion } | { o: "moi-gioi"; chu: string };

export const TI_LE_MAC_DINH_CHU = "Tỉ lệ mặc định của sàn";
export const nhanKhoan = (k: KhoanPhi) => NHAN_KHOAN[k.ma];

/** «1» · «0,5» — phần vạn viết thành phần trăm, dấu phẩy thập phân. */
export const vietPhanTramTiLe = (phanVan: number) => String(phanVan / 100).replace(".", ",");

/** «1,5» → 150 phần vạn; 0–10%, bước 0,1. */
export function docPhanTram(chu: string): number | null {
  const m = /^(\d{1,2})(?:[.,](\d))?$/.exec(chu.trim());
  if (!m) return null;
  const pv = Number(m[1]) * 100 + Number(m[2] ?? 0) * 10;
  return pv <= 1000 ? pv : null;
}

const chuaHieuGia = (chu: string) => `Chưa hiểu «${chu.trim()}» — gõ như 2,75 tỷ hoặc 950 triệu`;

function tiLeCua(s: MayTinh, coSo: CoSo): TiLeBaoPhi | null {
  const mg = docPhanTram(s.chuMoiGioi);
  return mg === null ? null : { ...dinhNghia(coSo).tiLe, moi_gioi: mg };
}

function tinhTuGia(s: MayTinh, gia: number, coSo: CoSo): MayTinh {
  const tiLe = tiLeCua(s, coSo);
  if (!tiLe) return { ...s, loi: { o: "moi-gioi", chu: "Môi giới từ 0 tới 10%, bước 0,1" } };
  const { veTay, khoan } = tinhVeTay(gia, s.phi, tiLe, dinhNghia(coSo).khoan);
  return { ...s, chuVeTay: vietGia(veTay), ketQua: { gia, veTay, khoan }, loi: null };
}

/** Máy tính mở với một giá (của hồ sơ, hay của lead); chưa giá thì trống. */
export function mayTinhDau(gia: number | null, phi: FeeInclusion | null, coSo: CoSo = DINH_NGHIA_MAC_DINH): MayTinh {
  const s: MayTinh = { chuGia: gia === null ? "" : vietGia(gia), phi: phi ?? "included", chuVeTay: "", chuMoiGioi: vietPhanTramTiLe(dinhNghia(coSo).tiLe.moi_gioi), ketQua: null, loi: null };
  return gia === null ? s : tinhTuGia(s, gia, coSo);
}

export function doiMayTinh(s: MayTinh, d: DoiMayTinh, coSo: CoSo = DINH_NGHIA_MAC_DINH): MayTinh {
  if (d.o === "phi" || d.o === "moi-gioi") {
    const moi = d.o === "phi" ? { ...s, phi: d.phi } : { ...s, chuMoiGioi: d.chu };
    if (d.o === "moi-gioi" && docPhanTram(d.chu) === null) return { ...moi, loi: { o: "moi-gioi", chu: "Môi giới từ 0 tới 10%, bước 0,1" } };
    const gia = docGia(moi.chuGia);
    return gia.ok ? tinhTuGia(moi, gia.dong, coSo) : { ...moi, loi: moi.chuGia.trim() ? { o: "gia", chu: chuaHieuGia(moi.chuGia) } : null };
  }
  if (d.o === "gia") {
    const kq = docGia(d.chu);
    if (!kq.ok) return { ...s, chuGia: d.chu, loi: d.chu.trim() ? { o: "gia", chu: chuaHieuGia(d.chu) } : null };
    return tinhTuGia({ ...s, chuGia: d.chu }, kq.dong, coSo);
  }
  const kq = docGia(d.chu);
  if (!kq.ok) return { ...s, chuVeTay: d.chu, loi: d.chu.trim() ? { o: "ve-tay", chu: chuaHieuGia(d.chu) } : null };
  const tiLe = tiLeCua(s, coSo);
  if (!tiLe) return { ...s, chuVeTay: d.chu, loi: { o: "moi-gioi", chu: "Môi giới từ 0 tới 10%, bước 0,1" } };
  const tap = dinhNghia(coSo).khoan;
  const gia = s.phi === "included" ? giaBaoPhiTuVeTay(kq.dong, tiLe, tap) : kq.dong;
  const { veTay, khoan } = tinhVeTay(gia, s.phi, tiLe, tap);
  return { ...s, chuGia: vietGia(gia), chuVeTay: d.chu, ketQua: { gia, veTay, khoan }, loi: null };
}
