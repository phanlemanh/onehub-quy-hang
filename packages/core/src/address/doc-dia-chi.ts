/**
 * Đọc một địa chỉ Việt Nam gõ kiểu nào cũng được ra địa chỉ chuẩn và khoá địa chỉ (hàng 75, ADR-0016 quyết định 5).
 * Tên phường cũ ra xã mới; phường cũ bị tách thì cần người chọn, không đoán; đọc không chắc phần nào thì nói phần ấy.
 * Thuần và tất định: chỉ dùng danh mục truyền vào, không gọi dịch vụ ngoài.
 */
import { DANH_MUC_DON_VI_HANH_CHINH, type DanhMucDonViHanhChinh } from "./danh-muc";
import { docDiaChiVoi } from "./doc-dia-chi-loi";

export type PhanDiaChi = "stateOrProvince" | "wardName" | "streetName" | "streetNumber";

export type UngVienXa = { ma: string; ten: string; maTinh: string; tenTinh: string };

export type XaDaDoc = { ma: string; ten: string; tuTenCu?: string };

export type XaCanChon = {
  canNguoiChon: true;
  /** Chữ tên xã đã đọc. */
  chu: string;
  /** Tên phường cũ khi chữ đọc ra phường cũ. */
  tenCu?: string;
  ungVien: UngVienXa[];
};

export type KetQuaDiaChi = {
  /** Chữ người gõ, giữ nguyên (RESO `UnparsedAddress`). */
  unparsedAddress: string;
  /** Tỉnh mới; `tuTenCu` là tên tỉnh cũ (trước sắp xếp 2025) mà người đã gõ. */
  stateOrProvince: { ma: string; ten: string; tuTenCu?: string } | null;
  wardName: XaDaDoc | XaCanChon | null;
  /** Tên đường như người gõ, đã gọn khoảng trắng (RESO `StreetName`). */
  streetName: string | null;
  /** Số nhà chuẩn, dãy số từ đường chính vào (RESO `StreetNumber`). */
  streetNumber: string | null;
  thieu: PhanDiaChi[];
  chuaCoTrongDanhMuc: { phan: "stateOrProvince" | "wardName"; chu: string }[];
  khoa: string | null;
  trangThai: "chuan" | "can-nguoi-chon" | "thieu";
};

/** Đọc một địa chỉ. `danhMuc` mặc định là danh mục của lõi. */
export function docDiaChi(chu: string, danhMuc: DanhMucDonViHanhChinh = DANH_MUC_DON_VI_HANH_CHINH): KetQuaDiaChi {
  return docDiaChiVoi(chu, danhMuc, LUAT_DAY_DU);
}

const LUAT_DAY_DU = { trongTinh: true, nhanHuyenTP: true } as const;
