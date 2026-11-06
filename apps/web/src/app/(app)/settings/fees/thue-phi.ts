// Phần thuần của mục Thuế phí trong Cài đặt sàn (hàng 49): ba dòng khoản, công tắc «Tính vào giá bao phí», tỉ lệ, chữ
// nguồn, kiểm trước khi lưu, ví dụ về tay. Màn chỉ dựng những gì các hàm này trả — bài kiểm gọi thẳng chúng. Luật giá trị
// là `kiemGiaTri` của lõi, cùng luật máy chủ dùng (hàng 82); nhãn khoản là `NHAN_KHOAN` của lõi giá.
import { giaiCauHinh, kiemGiaTri } from "@quy-hang/core/config";
import { dinhNghiaBaoPhi, KHOA_TI_LE, KHOAN_BAO_PHI, NHAN_KHOAN, tinhVeTay, vietGia, type MaKhoan } from "@quy-hang/core/pricing";

import { chuNguon, type BanCauHinh } from "../lead-routing/luat";

const MA_SO: Readonly<Record<MaKhoan, string>> = { thue_tncn: "personalIncomeTax", le_phi_truoc_ba: "registrationFee", moi_gioi: "brokerageFee" };
/** Hỏi-1 (Cổng Phạm vi 06/11): thuế và lệ phí giữ đúng số luật — chỉ môi giới sửa được. */
export const KHOAN_SUA_DUOC: readonly MaKhoan[] = ["moi_gioi"];
export const THEO_LUAT = "theo luật";

export type GiaTriPhi = { inclusion: string[]; moiGioi: number | null };
export type DongThuePhi = {
  ma: MaKhoan;
  ten: string;
  bat: boolean;
  /** «2%», «0,5%», «1,5%». */
  tiLeChu: string;
  suaDuoc: boolean;
  nguon: string;
};

/** «1,5%» — phần trăm, dấu phẩy thập phân. */
export const vietPhanTram = (pt: number) => `${String(pt).replace(".", ",")}%`;

/** Giá trị đang áp của hai điểm màn sửa từ phản hồi của lối chung; vắng thì mặc định của sổ. */
export function giaTriPhi(ban: BanCauHinh): GiaTriPhi {
  const { cauHinh } = giaiCauHinh(ban.items.filter((x) => x.key.startsWith("fee.")).map((x) => ({ key: x.key, value: x.value })));
  return { inclusion: [...(cauHinh["fee.inclusion"] as string[])], moiGioi: cauHinh["fee.brokerage_pct"] as number };
}

const tiLePhanTram = (ban: BanCauHinh, ma: MaKhoan, nhap: GiaTriPhi): number => {
  if (ma === "moi_gioi" && nhap.moiGioi !== null) return nhap.moiGioi;
  const { cauHinh } = giaiCauHinh(ban.items.filter((x) => x.key === KHOA_TI_LE[ma]).map((x) => ({ key: x.key, value: x.value })));
  return cauHinh[KHOA_TI_LE[ma]] as number;
};

/** Ba dòng theo thứ tự Thuế thu nhập cá nhân · Lệ phí trước bạ · Môi giới. */
export function dongThuePhi(ban: BanCauHinh, nhap: GiaTriPhi, tenNguoi: ReadonlyMap<string, string> | null): DongThuePhi[] {
  return KHOAN_BAO_PHI.map((ma) => {
    const suaDuoc = KHOAN_SUA_DUOC.includes(ma);
    // Nguồn của dòng: điểm tỉ lệ cho khoản sửa được, điểm định nghĩa cho khoản theo luật (chỉ công tắc đổi được).
    const khoaNguon = suaDuoc ? KHOA_TI_LE[ma] : "fee.inclusion";
    return {
      ma,
      ten: NHAN_KHOAN[ma],
      bat: nhap.inclusion.includes(MA_SO[ma]),
      tiLeChu: vietPhanTram(tiLePhanTram(ban, ma, nhap)),
      suaDuoc,
      nguon: chuNguon(
        ban.items.find((x) => x.key === khoaNguon),
        tenNguoi,
      ),
    };
  });
}

/** Bật/tắt một khoản — giữ thứ tự của sổ. */
export function doiCongTac(nhap: GiaTriPhi, ma: MaKhoan, bat: boolean): GiaTriPhi {
  const tap = new Set(nhap.inclusion);
  if (bat) tap.add(MA_SO[ma]);
  else tap.delete(MA_SO[ma]);
  return { ...nhap, inclusion: KHOAN_BAO_PHI.map((m) => MA_SO[m]).filter((m) => tap.has(m)) };
}

export const LOI_MOI_GIOI = "Môi giới từ 0 tới 5%, bước 0,1";
export const LOI_CONG_TAC = "Bao phí cần ít nhất một khoản";

export type LenhLuu = { than: Record<string, unknown> } | { loi: { o: "moi_gioi" | "cong-tac"; chu: string } } | { khongDoi: true };

/** Thân PATCH chỉ gồm khoá đã đổi; giá trị sai → lỗi gắn dòng, không gửi. */
export function lenhLuu(truoc: GiaTriPhi, sau: GiaTriPhi): LenhLuu {
  const than: Record<string, unknown> = {};
  if (JSON.stringify(sau.inclusion) !== JSON.stringify(truoc.inclusion)) {
    if (!kiemGiaTri("fee.inclusion", sau.inclusion, {}).ok) return { loi: { o: "cong-tac", chu: LOI_CONG_TAC } };
    than["fee.inclusion"] = sau.inclusion;
  }
  if (sau.moiGioi !== truoc.moiGioi) {
    const mg = sau.moiGioi;
    const dungBuoc = mg !== null && Math.abs(Math.round(mg * 10) - mg * 10) < 1e-9;
    if (mg === null || !dungBuoc || !kiemGiaTri("fee.brokerage_pct", mg, {}).ok) return { loi: { o: "moi_gioi", chu: LOI_MOI_GIOI } };
    than["fee.brokerage_pct"] = Math.round(mg * 10) / 10;
  }
  return Object.keys(than).length ? { than } : { khongDoi: true };
}

export const THONG_BAO_LUU = "Đã lưu · áp cho giá ghi từ bây giờ";
export const CAU_PHAM_VI = "Áp cho giá ghi từ bây giờ — giá đã lưu giữ định nghĩa lúc tính";

/** Ví dụ sống dưới bảng: «Giá bao phí 3 tỷ → về tay 2,895 tỷ», tính bằng lõi với định nghĩa đang sửa. */
export function viDu(nhap: GiaTriPhi): string | null {
  if (nhap.moiGioi === null || !nhap.inclusion.length) return null;
  const { cauHinh } = giaiCauHinh([
    { key: "fee.inclusion", value: nhap.inclusion },
    { key: "fee.brokerage_pct", value: nhap.moiGioi },
  ]);
  const dn = dinhNghiaBaoPhi(cauHinh);
  const gia = 3_000_000_000;
  return `Giá bao phí ${vietGia(gia)} → về tay ${vietGia(tinhVeTay(gia, "included", dn.tiLe, dn.khoan).veTay)}`;
}
