// Dòng phụ dưới giá bao phí ở hồ sơ căn (hàng 49, AC-7, luật 13): giá ấy tính theo định nghĩa bao phí ngày nào, các khoản
// và giá về tay theo đúng định nghĩa đã đóng trên giá — không theo định nghĩa hiện hành của sàn. Thuần.
import { tinhVeTay, tuDau, vietGia, type DauPhi, type MaKhoan } from "@quy-hang/core/pricing";

/** Nhãn ngắn của ba khoản cho một dòng chữ nhỏ; nhãn đầy đủ là `NHAN_KHOAN` của lõi. */
const NHAN_NGAN: Readonly<Record<MaKhoan, string>> = { thue_tncn: "Thuế TNCN", le_phi_truoc_ba: "Trước bạ", moi_gioi: "Môi giới" };

const NGAY = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
const ngayDu = (iso: string) => {
  const p = Object.fromEntries(NGAY.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}/${p.year}`;
};
const phanTram = (phanVan: number) => `${String(phanVan / 100).replace(".", ",")}%`;

/** «Tính theo định nghĩa ngày 06/11/2026: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 1% — về tay 2,895 tỷ»; `null` khi không dấu. */
export function dongDinhNghia(gia: number | null, dau: Pick<DauPhi, "includedItems" | "rates" | "computedAt"> | null): string | null {
  if (gia === null || !dau) return null;
  const dn = tuDau(dau);
  const khoan = dn.khoan.map((ma) => `${NHAN_NGAN[ma]} ${phanTram(dn.tiLe[ma])}`).join(" · ");
  const veTay = tinhVeTay(gia, "included", dn.tiLe, dn.khoan).veTay;
  return `Tính theo định nghĩa ngày ${ngayDu(dau.computedAt)}: ${khoan} — về tay ${vietGia(veTay)}`;
}
