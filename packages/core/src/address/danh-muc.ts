/**
 * Danh mục đơn vị hành chính cho bộ đọc địa chỉ (hàng 75, ADR-0016 quyết định 5). Địa giới hai cấp từ 1/7/2025: tỉnh,
 * thành → xã, phường, đặc khu. Dữ liệu công, không phải địa chỉ của ai. Bộ đọc chỉ dùng dữ liệu ở đây — thêm đơn vị là
 * thêm dòng, không đổi hàm đọc, không đổi khoá đã ra (khoá dựng trên mã).
 *
 * Phạm vi đã chép (Cổng Phạm vi hàng 75, Hỏi-1 và Hỏi-2 duyệt theo khuyến nghị 05/11): đủ 34 tỉnh, thành; cấp xã chỉ phần
 * trích TP.HCM của hàng 73. Danh mục cấp xã đầy đủ và tên tỉnh cũ là một hàng dữ liệu riêng, đối chiếu lại mọi mã trước
 * khi hàng 76 lưu khoá.
 */

export type NguonDanhMuc = {
  /** Phần của danh mục mà nguồn này chống lưng. */
  phan: "tinh" | "xa" | "xaCu";
  /** Văn bản quy định (số hiệu). */
  vanBan: string;
  /** Nơi máy đã đọc dữ liệu. */
  docQua: string;
  /** Ngày đọc, ISO. */
  ngayDoc: string;
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
  ten: string;
  loai: "Phường" | "Xã" | "Thị trấn";
  /** Quận, huyện, thị xã cũ chứa nó, như «Quận 1». */
  huyenCu: string;
  maTinh: string;
  /** Mã các xã mới nhận nó (toàn bộ hay một phần). Từ hai mã = bị tách. */
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
};

const T = (ma: string, ten: string, tenGoiKhac: readonly string[] = []): DonViCapTinh => ({
  ma,
  ten,
  loai: ten.startsWith("Thành phố") ? "Thành phố" : "Tỉnh",
  tenGoiKhac,
});

export const DANH_MUC_DON_VI_HANH_CHINH: DanhMucDonViHanhChinh = {
  nguon: [
    {
      phan: "tinh",
      vanBan: "Quyết định 19/2025/QĐ-TTg ban hành Bảng danh mục và mã số các đơn vị hành chính Việt Nam, Phụ lục I",
      docQua: "https://thuviennhadat.vn/phap-luat/danh-muc-va-ma-so-34-tinh-thanh-viet-nam-tu-01-7-2025-690649.html",
      ngayDoc: "2026-11-05",
    },
    {
      phan: "xa",
      vanBan: "Quyết định 19/2025/QĐ-TTg, Phụ lục II (mã xã năm chữ số)",
      docQua:
        "Hộp thông tin trang Wikipedia tiếng Việt từng phường (Sài Gòn, Tân Định, Bến Thành, Cầu Ông Lãnh), trang dẫn " +
        "danh mục của Tổng cục Thống kê",
      ngayDoc: "2026-11-05",
      ghiChu: "chưa đối chiếu Phụ lục II — hàng danh mục đầy đủ đối chiếu lại trước khi hàng 76 lưu khoá",
    },
    {
      phan: "xaCu",
      vanBan: "Nghị quyết 1685/NQ-UBTVQH15 ngày 16/6/2025 về sắp xếp đơn vị hành chính cấp xã của Thành phố Hồ Chí Minh",
      docQua: "Trang Wikipedia tiếng Việt «Quận 1» và trang từng phường mới (như bảng trích của hàng 73)",
      ngayDoc: "2026-11-05",
      ghiChu: "chưa đọc văn bản gốc",
    },
  ],
  ngay: "2026-11-05",
  phamVi:
    "Đủ 34 tỉnh, thành. Cấp xã: chỉ phần trích TP.HCM của hàng 73 — bốn phường mới Sài Gòn, Tân Định, Bến Thành, Cầu Ông " +
    "Lãnh và mười phường cũ Quận 1. Chưa có 3.321 xã, bảng tên cũ → mới cả nước, tên tỉnh cũ (hàng dữ liệu riêng).",
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
    T("22", "Tỉnh Quảng Ninh"),
    T("24", "Tỉnh Bắc Ninh"),
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
    T("75", "Tỉnh Đồng Nai"),
    // «Sài Gòn» cố ý không là tên gọi khác: nay là tên một phường.
    T("79", "Thành phố Hồ Chí Minh", ["TP.HCM", "TPHCM", "TP HCM", "HCM", "TP. HCM", "Tp.HCM"]),
    T("80", "Tỉnh Tây Ninh"),
    T("82", "Tỉnh Đồng Tháp"),
    T("86", "Tỉnh Vĩnh Long"),
    T("91", "Tỉnh An Giang"),
    T("92", "Thành phố Cần Thơ"),
    T("96", "Tỉnh Cà Mau"),
  ],
  xa: [
    { ma: "26737", maTinh: "79", ten: "Tân Định", loai: "Phường" },
    { ma: "26740", maTinh: "79", ten: "Sài Gòn", loai: "Phường" },
    { ma: "26743", maTinh: "79", ten: "Bến Thành", loai: "Phường" },
    { ma: "26758", maTinh: "79", ten: "Cầu Ông Lãnh", loai: "Phường" },
  ],
  xaCu: [
    { ten: "Bến Nghé", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26740"] },
    { ten: "Đa Kao", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26740", "26737"] },
    { ten: "Nguyễn Thái Bình", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26743", "26740"] },
    { ten: "Tân Định", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26737"] },
    { ten: "Bến Thành", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26743"] },
    { ten: "Phạm Ngũ Lão", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26743"] },
    { ten: "Cầu Ông Lãnh", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26743", "26758"] },
    { ten: "Cầu Kho", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26758"] },
    { ten: "Cô Giang", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26758"] },
    { ten: "Nguyễn Cư Trinh", loai: "Phường", huyenCu: "Quận 1", maTinh: "79", vao: ["26758"] },
  ],
};

/** Kiểm khuôn danh mục; trả danh sách lỗi (rỗng = lành). */
export function kiemDanhMuc(dm: DanhMucDonViHanhChinh): string[] {
  const loi: string[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const phan of ["tinh", "xa", "xaCu"] as const) {
    const ns = (dm.nguon ?? []).filter((n) => n.phan === phan);
    if (ns.length === 0) loi.push(`danh mục thiếu nguồn: ${phan}`);
    for (const n of ns) {
      if (!n.vanBan?.trim()) loi.push(`danh mục thiếu nguồn: ${phan} không có văn bản`);
      if (!iso.test(n.ngayDoc ?? "")) loi.push(`danh mục thiếu ngày đọc: ${phan}`);
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
  for (const c of dm.xaCu) {
    if (c.vao.length === 0) loi.push(`phường cũ không vào xã nào: ${c.ten}`);
    for (const m of c.vao) if (!maXa.has(m)) loi.push(`phường cũ trỏ xã mới không có: ${c.ten} → ${m}`);
    if (!maTinh.has(c.maTinh)) loi.push(`phường cũ trỏ tỉnh không có: ${c.ten}`);
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
