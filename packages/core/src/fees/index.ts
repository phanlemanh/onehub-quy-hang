/**
 * Định nghĩa «bao phí» của sàn (hàng 49, luật 12 và 13): khoản nào tính vào giá bao phí và tỉ lệ từng khoản. Thuần — đọc
 * từ cấu hình đã giải (`giaiCauHinh`) hay từ dấu định nghĩa mà cơ sở dữ liệu đóng lên mỗi giá bao phí (migration 050,
 * bảng `listing_price_fee_basis`). Mã khoản của sổ (`fee.inclusion`) và của lõi giá (`KHOAN_BAO_PHI`) đổi qua một bảng.
 */
import { CAU_HINH_SAN_MAC_DINH, laySo, type CauHinhSan } from "../config/giai";
import { KHOAN_BAO_PHI, type MaKhoan, type TiLeBaoPhi } from "../pricing/ve-tay";

/** Mã khoản ở sổ điểm `fee.inclusion` và ở dấu định nghĩa. */
export const MA_SO_KHOAN = ["personalIncomeTax", "registrationFee", "brokerageFee"] as const;
export type MaSoKhoan = (typeof MA_SO_KHOAN)[number];

/** Mã sổ → mã lõi. */
export const KHOAN_CUA_MA_SO: Readonly<Record<MaSoKhoan, MaKhoan>> = {
  personalIncomeTax: "thue_tncn",
  registrationFee: "le_phi_truoc_ba",
  brokerageFee: "moi_gioi",
};

/** Mã lõi → khoá tỉ lệ ở sổ điểm (#9–#11). */
export const KHOA_TI_LE: Readonly<Record<MaKhoan, string>> = {
  thue_tncn: "fee.personal_income_tax_pct",
  le_phi_truoc_ba: "fee.registration_fee_pct",
  moi_gioi: "fee.brokerage_pct",
};

const MA_SO_CUA: Readonly<Record<MaKhoan, MaSoKhoan>> = { thue_tncn: "personalIncomeTax", le_phi_truoc_ba: "registrationFee", moi_gioi: "brokerageFee" };

export type DinhNghiaBaoPhi = {
  /** Khoản tính vào giá bao phí, theo thứ tự `KHOAN_BAO_PHI`. */
  khoan: readonly MaKhoan[];
  /** Tỉ lệ cả ba khoản, phần vạn — khoản ngoài định nghĩa vẫn mang tỉ lệ đang đặt. */
  tiLe: TiLeBaoPhi;
};

/** Dấu định nghĩa như cơ sở dữ liệu lưu và lối đọc trả: mã sổ, phần vạn theo mã sổ. */
export type DauPhi = { includedItems: readonly string[]; rates: Readonly<Record<string, number>>; computedAt: string };

const phanVan = (phanTram: number) => Math.round(phanTram * 100);

/** Định nghĩa hiện hành của sàn từ cấu hình đã giải. */
export function dinhNghiaBaoPhi(cauHinh: CauHinhSan): DinhNghiaBaoPhi {
  const tap = cauHinh["fee.inclusion"];
  const coTap = Array.isArray(tap) ? (tap as unknown[]) : [];
  const khoan = KHOAN_BAO_PHI.filter((ma) => coTap.includes(MA_SO_CUA[ma]));
  const tiLe = Object.fromEntries(KHOAN_BAO_PHI.map((ma) => [ma, phanVan(laySo(cauHinh, KHOA_TI_LE[ma]))])) as TiLeBaoPhi;
  return { khoan, tiLe };
}

/** Mặc định sản phẩm: cả ba khoản, 200 · 50 · 100. */
export const DINH_NGHIA_MAC_DINH: DinhNghiaBaoPhi = dinhNghiaBaoPhi(CAU_HINH_SAN_MAC_DINH);

/** Định nghĩa đã đóng trên một giá. Mã lạ bị bỏ; tỉ lệ vắng là 0. */
export function tuDau(dau: Pick<DauPhi, "includedItems" | "rates">): DinhNghiaBaoPhi {
  const khoan = KHOAN_BAO_PHI.filter((ma) => dau.includedItems.includes(MA_SO_CUA[ma]));
  const tiLe = Object.fromEntries(KHOAN_BAO_PHI.map((ma) => [ma, Number(dau.rates[MA_SO_CUA[ma]] ?? 0)])) as TiLeBaoPhi;
  return { khoan, tiLe };
}
