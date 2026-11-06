/**
 * Danh mục đơn vị hành chính cho bộ đọc địa chỉ (hàng 75, ADR-0016 quyết định 5; đủ cấp xã ở hàng danh-muc-xa-day-du).
 * Địa giới hai cấp từ 1/7/2025: tỉnh, thành → xã, phường, đặc khu. Dữ liệu công, không phải địa chỉ của ai. Bộ đọc chỉ
 * dùng dữ liệu ở đây — thêm đơn vị là thêm dòng, không đổi hàm đọc, không đổi khoá đã ra (khoá dựng trên mã).
 *
 * Nguồn (Cổng Phạm vi hàng danh-muc-xa-day-du, Hỏi-1 duyệt 06/11): Cục Thống kê. Ba bảng trong `du-lieu/` sinh bằng máy
 * từ hai tệp nguồn chép nguyên trong `nguon/` (`nguon/sinh-danh-muc.ts`); không sửa tay bảng — sửa nguồn hay bảng sửa
 * của bộ sinh rồi sinh lại. 34 tỉnh giữ trong mã, mã và tên đối chiếu với tệp nguồn.
 */
import XA from "./du-lieu/xa.json" with { type: "json" };
import XA_CU from "./du-lieu/xa-cu.json" with { type: "json" };
import TINH_CU from "./du-lieu/tinh-cu.json" with { type: "json" };

export type PhanDanhMuc = "tinh" | "xa" | "xaCu" | "tinhCu";

export type NguonDanhMuc = {
  /** Phần của danh mục mà nguồn này chống lưng. */
  phan: PhanDanhMuc;
  /** Văn bản quy định (số hiệu). */
  vanBan: string;
  /** Nơi máy đã đọc dữ liệu. */
  docQua: string;
  /** Ngày đọc, ISO. */
  ngayDoc: string;
  /** Danh mục đúng tại ngày này, ISO. */
  ngayThamChieu?: string;
  /** Tệp nguồn đã chép trong `nguon/`, nếu có. */
  tep?: string;
  /** Băm sha256 của tệp nguồn. */
  sha256?: string;
  /** Điều chưa kiểm của nguồn, nếu có. */
  ghiChu?: string;
};

export type DonViCapTinh = {
  /** Mã hai chữ số theo Quyết định 19/2025/QĐ-TTg. */
  ma: string;
  /** Tên chính thức, như «Thành phố Hồ Chí Minh». */
  ten: string;
  loai: "Tỉnh" | "Thành phố";
  /** Tên gọi khác người hay gõ (ngoài tên chính thức, tên bỏ loại, «TP <tên>»). */
  tenGoiKhac: readonly string[];
};

export type DonViCapXa = {
  /** Mã năm chữ số theo Quyết định 19/2025/QĐ-TTg. */
  ma: string;
  maTinh: string;
  /** Tên không kèm loại, như «Sài Gòn». */
  ten: string;
  loai: "Phường" | "Xã" | "Đặc khu";
};

export type DonViCapXaCu = {
  /** Mã năm chữ số trước sắp xếp. */
  ma?: string;
  ten: string;
  /** null khi nguồn không ghi loại. */
  loai: "Phường" | "Xã" | "Thị trấn" | null;
  /** Quận, huyện, thị xã, thành phố cũ chứa nó, như «Quận 1». */
  huyenCu: string;
  /** Tỉnh MỚI chứa các xã nhận nó. */
  maTinh: string;
  /** Mã tỉnh cũ (trước sắp xếp). */
  maTinhCu?: string;
  /** Mã các xã mới nhận nó (toàn bộ hay một phần). Từ hai mã = bị tách. */
  vao: readonly string[];
  /** Cách nhập vào từng xã của `vao`, cùng thứ tự. */
  cach?: readonly ("toan-bo" | "mot-phan")[];
};

export type DonViCapTinhCu = {
  /** Mã hai chữ số trước sắp xếp. */
  ma: string;
  /** Tên chính thức cũ, như «Tỉnh Hà Giang». */
  ten: string;
  /** Mã các tỉnh mới nhận nó. */
  vao: readonly string[];
};

export type DanhMucDonViHanhChinh = {
  nguon: readonly NguonDanhMuc[];
  /** Ngày chép danh mục vào kho, ISO. */
  ngay: string;
  /** Câu nói rõ đã chép những gì. */
  phamVi: string;
  tinh: readonly DonViCapTinh[];
  xa: readonly DonViCapXa[];
  xaCu: readonly DonViCapXaCu[];
  tinhCu: readonly DonViCapTinhCu[];
};

const T = (ma: string, ten: string, tenGoiKhac: readonly string[] = []): DonViCapTinh => ({
  ma,
  ten,
  loai: ten.startsWith("Thành phố") ? "Thành phố" : "Tỉnh",
  tenGoiKhac,
});

const CUC_THONG_KE = "https://danhmuchanhchinh.nso.gov.vn";

export const DANH_MUC_DON_VI_HANH_CHINH: DanhMucDonViHanhChinh = {
  nguon: [
    {
      phan: "tinh",
      vanBan: "Quyết định 19/2025/QĐ-TTg ban hành Bảng danh mục và mã số các đơn vị hành chính Việt Nam, Phụ lục I",
      docQua: `${CUC_THONG_KE}/DMDVHC.asmx (DanhMucPhuongXa, cột MaTinh, TenTinh)`,
      ngayDoc: "2026-11-06",
      ngayThamChieu: "2026-11-06",
      tep: "danh-muc-xa-06-11-2026.xml",
      sha256: "0ff480b1febabf7d3ea2e2dede4af923fc79427a1c967043d541ce0dc4925013",
      ghiChu: "mã 34 tỉnh khớp bản chép hàng 75 (thuviennhadat.vn); ba tên 22, 24, 75 nay là thành phố",
    },
    {
      phan: "xa",
      vanBan: "Quyết định 19/2025/QĐ-TTg, Phụ lục II (mã xã năm chữ số), cập nhật tới ngày tham chiếu",
      docQua: `${CUC_THONG_KE}/DMDVHC.asmx (DanhMucPhuongXa, cả nước, DenNgay 06/11/2026)`,
      ngayDoc: "2026-11-06",
      ngayThamChieu: "2026-11-06",
      tep: "danh-muc-xa-06-11-2026.xml",
      sha256: "0ff480b1febabf7d3ea2e2dede4af923fc79427a1c967043d541ce0dc4925013",
    },
    {
      phan: "xaCu",
      vanBan:
        "Bảng chuyển đổi đơn vị hành chính mới – cũ của Cục Thống kê theo các nghị quyết sắp xếp đơn vị hành chính cấp xã " +
        "năm 2025 của Ủy ban Thường vụ Quốc hội (TP.HCM: Nghị quyết 1685/NQ-UBTVQH15)",
      docQua: `${CUC_THONG_KE}/TAPTIN/BangChuyendoiĐVHCmoi_cu_final.xlsx (sheet «Tổng hợp_không merge»)`,
      ngayDoc: "2026-11-06",
      ngayThamChieu: "2025-07-01",
      tep: "bang-chuyen-doi-moi-cu.xlsx",
      sha256: "213966723785859dedd7c88965d6f12f8c3c508c91796e003804cf60a1054fc2",
      ghiChu: "tệp sửa lần cuối 23/10/2025; lỗi đã biết sửa bằng bảng SUA_NGUON của bộ sinh",
    },
    {
      phan: "tinhCu",
      vanBan: "Bảng chuyển đổi đơn vị hành chính mới – cũ của Cục Thống kê (cột tỉnh cũ, tỉnh mới)",
      docQua: `${CUC_THONG_KE}/TAPTIN/BangChuyendoiĐVHCmoi_cu_final.xlsx (sheet «Tổng hợp_không merge»)`,
      ngayDoc: "2026-11-06",
      ngayThamChieu: "2025-07-01",
      tep: "bang-chuyen-doi-moi-cu.xlsx",
      sha256: "213966723785859dedd7c88965d6f12f8c3c508c91796e003804cf60a1054fc2",
    },
  ],
  ngay: "2026-11-06",
  phamVi:
    "Đủ 34 tỉnh, thành và 3.321 xã, phường, đặc khu tại ngày 06/11/2026; mọi xã cũ có mã trước sắp xếp 2025 và 63 tỉnh " +
    "cũ, trỏ sang đơn vị mới theo bảng chuyển đổi của Cục Thống kê.",
  tinh: [
    T("01", "Thành phố Hà Nội"),
    T("04", "Tỉnh Cao Bằng"),
    T("08", "Tỉnh Tuyên Quang"),
    T("11", "Tỉnh Điện Biên"),
    T("12", "Tỉnh Lai Châu"),
    T("14", "Tỉnh Sơn La"),
    T("15", "Tỉnh Lào Cai"),
    T("19", "Tỉnh Thái Nguyên"),
    T("20", "Tỉnh Lạng Sơn"),
    T("22", "Thành phố Quảng Ninh"),
    T("24", "Thành phố Bắc Ninh"),
    T("25", "Tỉnh Phú Thọ"),
    T("31", "Thành phố Hải Phòng"),
    T("33", "Tỉnh Hưng Yên"),
    T("37", "Tỉnh Ninh Bình"),
    T("38", "Tỉnh Thanh Hóa"),
    T("40", "Tỉnh Nghệ An"),
    T("42", "Tỉnh Hà Tĩnh"),
    T("44", "Tỉnh Quảng Trị"),
    T("46", "Thành phố Huế"),
    T("48", "Thành phố Đà Nẵng"),
    T("51", "Tỉnh Quảng Ngãi"),
    T("52", "Tỉnh Gia Lai"),
    T("56", "Tỉnh Khánh Hòa"),
    T("66", "Tỉnh Đắk Lắk"),
    T("68", "Tỉnh Lâm Đồng"),
    T("75", "Thành phố Đồng Nai"),
    // «Sài Gòn» cố ý không là tên gọi khác: nay là tên một phường.
    T("79", "Thành phố Hồ Chí Minh", ["TP.HCM", "TPHCM", "TP HCM", "HCM", "TP. HCM", "Tp.HCM"]),
    T("80", "Tỉnh Tây Ninh"),
    T("82", "Tỉnh Đồng Tháp"),
    T("86", "Tỉnh Vĩnh Long"),
    T("91", "Tỉnh An Giang"),
    T("92", "Thành phố Cần Thơ"),
    T("96", "Tỉnh Cà Mau"),
  ],
  xa: XA as readonly DonViCapXa[],
  xaCu: XA_CU as readonly DonViCapXaCu[],
  tinhCu: TINH_CU as readonly DonViCapTinhCu[],
};

/** Kiểm khuôn danh mục; trả danh sách lỗi (rỗng = lành). */
export function kiemDanhMuc(dm: DanhMucDonViHanhChinh): string[] {
  const loi: string[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const phan of ["tinh", "xa", "xaCu", "tinhCu"] as const) {
    const ns = (dm.nguon ?? []).filter((n) => n.phan === phan);
    if (ns.length === 0) loi.push(`danh mục thiếu nguồn: ${phan}`);
    for (const n of ns) {
      if (!n.vanBan?.trim()) loi.push(`danh mục thiếu nguồn: ${phan} không có văn bản`);
      if (!iso.test(n.ngayDoc ?? "")) loi.push(`danh mục thiếu ngày đọc: ${phan}`);
      if (!iso.test(n.ngayThamChieu ?? "")) loi.push(`danh mục thiếu ngày tham chiếu: ${phan}`);
      if (n.tep !== undefined && !/^[0-9a-f]{64}$/.test(n.sha256 ?? "")) loi.push(`danh mục thiếu băm nguồn: ${phan}`);
    }
  }
  if (!iso.test(dm.ngay ?? "")) loi.push("danh mục thiếu ngày");
  if (!dm.phamVi?.trim()) loi.push("danh mục thiếu phạm vi");
  const maTinh = new Set<string>();
  for (const t of dm.tinh) {
    if (!/^\d{2}$/.test(t.ma)) loi.push(`mã tỉnh sai khuôn: ${t.ma}`);
    if (maTinh.has(t.ma)) loi.push(`mã tỉnh trùng: ${t.ma}`);
    maTinh.add(t.ma);
  }
  const maXa = new Set<string>();
  for (const x of dm.xa) {
    if (!/^\d{5}$/.test(x.ma)) loi.push(`mã xã sai khuôn: ${x.ma}`);
    if (maXa.has(x.ma)) loi.push(`mã xã trùng: ${x.ma}`);
    maXa.add(x.ma);
    if (!maTinh.has(x.maTinh)) loi.push(`xã trỏ tỉnh không có: ${x.ten}`);
  }
  const maCu = new Set<string>();
  for (const c of dm.xaCu) {
    if (c.ma !== undefined) {
      if (!/^\d{5}$/.test(c.ma)) loi.push(`mã xã cũ sai khuôn: ${c.ma}`);
      if (maCu.has(c.ma)) loi.push(`mã xã cũ trùng: ${c.ma}`);
      maCu.add(c.ma);
    }
    if (c.vao.length === 0) loi.push(`phường cũ không vào xã nào: ${c.ten}`);
    for (const m of c.vao) if (!maXa.has(m)) loi.push(`phường cũ trỏ xã mới không có: ${c.ten} → ${m}`);
    if (!maTinh.has(c.maTinh)) loi.push(`phường cũ trỏ tỉnh không có: ${c.ten}`);
  }
  for (const t of dm.tinhCu ?? []) {
    if (!/^\d{2}$/.test(t.ma)) loi.push(`mã tỉnh cũ sai khuôn: ${t.ma}`);
    if (t.vao.length === 0) loi.push(`tỉnh cũ không vào tỉnh nào: ${t.ten}`);
    for (const m of t.vao) if (!maTinh.has(m)) loi.push(`tỉnh cũ trỏ tỉnh mới không có: ${t.ten} → ${m}`);
  }
  return loi;
}

/** Khuôn bảng trích của hàng 73 (`packages/db/seed/don-vi-hanh-chinh-mau.mjs`). */
export type BangTrichHang73 = {
  tinh: readonly {
    ten: string;
    phuongMoi: readonly string[];
    phuongCu: readonly { ten: string; quan: string; vao: readonly string[] }[];
  }[];
};

/** Đối chiếu bảng trích của hàng 73 với danh mục lõi; trả danh sách lỗi (rỗng = khớp). */
export function doiChieuBangTrich(dm: DanhMucDonViHanhChinh, trich: BangTrichHang73): string[] {
  const loi: string[] = [];
  for (const t of trich.tinh) {
    const tinh = dm.tinh.find((x) => x.ten === t.ten);
    if (!tinh) {
      loi.push(`bảng trích hàng 73 lệch danh mục lõi: tỉnh ${t.ten}`);
      continue;
    }
    const tenXa = (ma: string) => dm.xa.find((x) => x.ma === ma)?.ten;
    for (const p of t.phuongMoi) {
      if (!dm.xa.some((x) => x.maTinh === tinh.ma && x.ten === p)) {
        loi.push(`bảng trích hàng 73 lệch danh mục lõi: ${p}`);
      }
    }
    for (const c of t.phuongCu) {
      const cu = dm.xaCu.find((x) => x.maTinh === tinh.ma && x.ten === c.ten && x.huyenCu === c.quan);
      const tapLoi = cu ? [...new Set(cu.vao.map(tenXa))].sort().join("|") : null;
      const tapTrich = [...new Set(c.vao)].sort().join("|");
      if (tapLoi !== tapTrich) loi.push(`bảng trích hàng 73 lệch danh mục lõi: ${c.ten}`);
    }
  }
  return loi;
}
