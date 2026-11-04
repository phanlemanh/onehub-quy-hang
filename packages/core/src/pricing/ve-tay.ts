/**
 * Giá chủ nhận về tay (hàng 28, luật 12): giá bao phí trừ ba khoản thuế phí tính trên chính giá ấy; giá không bao phí là
 * giá về tay. Tỉ lệ viết bằng phần vạn để mọi phép tính là số nguyên đồng — không số thực, không lệch một đồng.
 */
import { macDinhSo } from "../config/giai";
import type { FeeInclusion } from "./types";

export const KHOAN_BAO_PHI = ["thue_tncn", "le_phi_truoc_ba", "moi_gioi"] as const;
export type MaKhoan = (typeof KHOAN_BAO_PHI)[number];
/** Phần vạn: 200 = 2%. */
export type TiLeBaoPhi = Record<MaKhoan, number>;

/**
 * Mặc định của sàn (Hỏi-3, Cổng Phạm vi 02/11): thuế thu nhập cá nhân 2%, lệ phí trước bạ 0,5%, môi giới 1%. Ba khoá
 * `fee.*` (#9–#11) ở Sổ điểm biến thiên — quản trị sàn đặt ở hàng 49; tới lúc ấy mọi màn đọc hằng này.
 */
const phanVan = (khoa: string) => Math.round(macDinhSo(khoa) * 100);
export const TI_LE_BAO_PHI_MAC_DINH: TiLeBaoPhi = {
  thue_tncn: phanVan("fee.personal_income_tax_pct"),
  le_phi_truoc_ba: phanVan("fee.registration_fee_pct"),
  moi_gioi: phanVan("fee.brokerage_pct"),
};

/** Nhãn mặc định của ba khoản — một chỗ có tên tới khi có sổ từ vựng (hàng 90). */
export const NHAN_KHOAN: Record<MaKhoan, string> = {
  thue_tncn: "Thuế thu nhập cá nhân",
  le_phi_truoc_ba: "Lệ phí trước bạ",
  moi_gioi: "Môi giới",
};

const PHAN_VAN = 10_000;

export type KhoanPhi = { ma: MaKhoan; tiLe: number; dong: number };
export type VeTay = { veTay: number; khoan: KhoanPhi[] };

/** Làm tròn nửa lên tới đồng của giá × tỉ lệ / 10 000, bằng số nguyên. */
const khoanCua = (gia: number, tiLe: number) => Math.floor((gia * tiLe + PHAN_VAN / 2) / PHAN_VAN);

export function tinhVeTay(gia: number, dieuKien: FeeInclusion, tiLe: TiLeBaoPhi = TI_LE_BAO_PHI_MAC_DINH): VeTay {
  if (dieuKien === "excluded") return { veTay: gia, khoan: [] };
  const khoan = KHOAN_BAO_PHI.map((ma) => ({ ma, tiLe: tiLe[ma], dong: khoanCua(gia, tiLe[ma]) }));
  return { veTay: gia - khoan.reduce((t, k) => t + k.dong, 0), khoan };
}

/**
 * Giá bao phí nhỏ nhất mà về tay không thấp hơn `veTay`. Ba lần làm tròn làm về tay không tăng đều theo giá, nên không
 * chia ngược: bắt đầu từ cận dưới chắc chắn (mỗi khoản lệch tối đa nửa đồng) rồi dò lên.
 */
export function giaBaoPhiTuVeTay(veTay: number, tiLe: TiLeBaoPhi = TI_LE_BAO_PHI_MAC_DINH): number {
  const tong = KHOAN_BAO_PHI.reduce((t, ma) => t + tiLe[ma], 0);
  if (tong >= PHAN_VAN) throw new Error("tổng tỉ lệ phải dưới 100%");
  let g = Math.max(0, Math.floor(((veTay - KHOAN_BAO_PHI.length) * PHAN_VAN) / (PHAN_VAN - tong)) - 1);
  while (tinhVeTay(g, "included", tiLe).veTay < veTay) g++;
  return g;
}
