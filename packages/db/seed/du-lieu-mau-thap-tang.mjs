// Bộ dữ liệu mẫu thứ hai (hàng 73): một khu thấp tầng khu → dãy → lô, nhà và đất ngoài khu định danh bằng địa chỉ chuẩn,
// bộ địa chỉ thử có đáp án, chủ nhà, hàng, lead, hai đầu chủ — sinh tất định từ một hạt giống, mọi bản ghi mang nhãn mẫu.
// ADR-0016 quyết định 1 (loại hình RESO), 3 (ba cách định danh căn), 5 (địa chỉ chuẩn). Tên đường luôn «Đường Mẫu N», số
// nhà sinh; tỉnh và phường lấy từ bảng trích don-vi-hanh-chinh-mau.mjs. Căn hộ (loại hình thứ tư) là căn của danh mục
// hàng 5, đọc từ mau/du-lieu-mau.json — hàng 5 sinh lại thì bộ này phải sinh lại (--kiem bắt).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DON_VI_HANH_CHINH, boDau } from "./don-vi-hanh-chinh-mau.mjs";
import { MIEN_EMAIL, NHAN, TEN_SAN, TIEN_TO_UPI, TRANG_THAI_MO, boSinh } from "./du-lieu-mau.mjs";

export const HAT_GIONG_THAP_TANG = 20261105;
export const TEN_KHU = "[Mẫu] Khu thấp tầng thử";
const GOC = path.dirname(fileURLToPath(import.meta.url));
export const DU_LIEU_HANG_5 = path.join(GOC, "mau", "du-lieu-mau.json");

const TINH = DON_VI_HANH_CHINH.tinh[0];
const hai = (n) => String(n).padStart(2, "0");
const soMau = (n) => `0900 000 ${String(n).padStart(3, "0")}`;
// Hàng 5 dùng số 001–042; bộ này đi tiếp từ 043.
const SO_DAU = 43;
const HUONG = ["Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Tây Bắc", "Đông Bắc", "Tây Nam"];
const GHI_CHU = ["Chủ cần bán nhanh", "Sổ hồng riêng", "Xem nhà cuối tuần", "Nhà trống, có chìa", "Gần chợ", ""];

/** Năm dãy của khu: nhãn riêng của sàn neo vào giá trị RESO (ADR-0016 quyết định 1). */
export const DAY = [
  { blockKey: "LK1", nhanSan: "Liền kề", sub: "Townhouse", so: 10, mt: [5, 4.5], sau: [20, 18], tang: 4, lo: 12 },
  { blockKey: "LK2", nhanSan: "Liền kề", sub: "Townhouse", so: 10, mt: [5, 4.5], sau: [20, 18], tang: 4, lo: 12 },
  { blockKey: "SH1", nhanSan: "Shophouse", sub: "Townhouse", so: 6, mt: [6], sau: [20], tang: 5, lo: 24 },
  { blockKey: "BT1", nhanSan: "Biệt thự", sub: "Single Family Residence", so: 8, mt: [10, 12], sau: [20, 25], tang: 3, lo: 12 },
  { blockKey: "DN1", nhanSan: "Đất nền", sub: "Unimproved Land", so: 8, mt: [5, 6], sau: [20, 18], tang: 0, lo: 12 },
];
export const PROPERTY_TYPE = { Townhouse: "Residential", "Single Family Residence": "Residential", "Unimproved Land": "Land", Condominium: "Residential" };

/** Căn ngoài khu: bảng viết tay để chắc đủ mặt đường, hẻm hai và ba cấp, và các cặp gần trùng. */
const NGOAI_KHU = [
  ["NK-01", "Townhouse", "Sài Gòn", 1, "45"],
  ["NK-02", "Townhouse", "Sài Gòn", 1, "45A"],
  ["NK-03", "Townhouse", "Sài Gòn", 1, "45/12"],
  ["NK-04", "Single Family Residence", "Sài Gòn", 1, "45/12/3"],
  ["NK-05", "Unimproved Land", "Tân Định", 2, "120/7"],
  ["NK-06", "Townhouse", "Tân Định", 2, "88"],
  ["NK-07", "Single Family Residence", "Tân Định", 2, "88/5/2"],
  ["NK-08", "Townhouse", "Bến Thành", 3, "17"],
  ["NK-09", "Unimproved Land", "Bến Thành", 3, "17/9"],
  ["NK-10", "Townhouse", "Bến Thành", 4, "203/14"],
  ["NK-11", "Single Family Residence", "Cầu Ông Lãnh", 5, "61"],
  ["NK-12", "Townhouse", "Cầu Ông Lãnh", 5, "61/3/8"],
  ["NK-13", "Unimproved Land", "Cầu Ông Lãnh", 6, "9B"],
  ["NK-14", "Townhouse", "Cầu Ông Lãnh", 6, "150/22"],
];

/** Tám kiểu viết của bộ địa chỉ thử (AC-5). */
export const KIEU_VIET = ["phuong-moi", "phuong-cu-gop", "phuong-cu-tach", "hem-gach", "hem-chu", "hem-xe-hoi", "viet-tat-khong-dau", "thieu-so-nha"];
/** Bảy ca lead (AC-7). */
export const CA_LEAD = ["biet-lo", "chi-biet-day", "ngoai-khu-du", "ngoai-khu-thieu-so", "trung-lo-mo", "trung-nha-ngoai-khu-mo", "trung-so-chu"];

/** Trường theo loại hình — giá trị `null` ở trường loại hình không dùng (bảng của lõi, ADR-0016 quyết định 2). */
function truongLoaiHinh(r, sub, mt, sau, tang) {
  const lot = Math.round(mt * sau * 10) / 10;
  if (sub === "Unimproved Land") {
    return { livingArea: null, bedroomsTotal: null, directionFaces: null, lotSizeArea: lot, storiesTotal: null, frontageLength: mt, accessRoadWidth: [8, 12, 16][r.nguyen(3)] };
  }
  const san = sub === "Single Family Residence" ? 0.5 : 0.9;
  return {
    livingArea: Math.round(lot * san * tang),
    bedroomsTotal: sub === "Single Family Residence" ? 5 : Math.max(3, tang),
    directionFaces: HUONG[r.nguyen(HUONG.length)],
    lotSizeArea: lot,
    storiesTotal: tang,
    frontageLength: mt,
    accessRoadWidth: [8, 12, 16][r.nguyen(3)],
  };
}

/** Địa chỉ chuẩn một dòng — cũng là giá trị đúng của ô địa chỉ trong file bẩn. */
export const diaChiChuan = (d) => `${d.streetNumber} ${d.streetName}, Phường ${d.wardName}, ${d.stateOrProvince}`;

/** Cách viết số nhà kiểu chữ: «45/12/3» → «số 3 hẻm 45/12»; trả null khi không có hẻm. */
function hemChu(so, chu) {
  const p = so.split("/");
  if (p.length < 2) return null;
  return `số ${p.at(-1)} ${chu} ${p.slice(0, -1).join("/")}`;
}

function phuongCu(moi, tach) {
  return TINH.phuongCu.find((c) => c.vao.includes(moi) && (tach ? c.vao.length > 1 : c.vao.length === 1));
}

/** Các cách viết của một căn ngoài khu, mỗi cách kèm kiểu và đáp án (dựng từ địa chỉ chuẩn của căn, không từ chuỗi). */
function cachViet(can) {
  const a = can.diaChi;
  const chuan = { stateOrProvince: a.stateOrProvince, wardName: a.wardName, streetName: a.streetName, streetNumber: a.streetNumber, thieu: [] };
  const cuGop = phuongCu(a.wardName, false);
  const cuTach = phuongCu(a.wardName, true);
  const n = a.streetName.replace("Đường Mẫu ", "");
  const ds = [
    { kieu: ["phuong-moi", ...(a.streetNumber.includes("/") ? ["hem-gach"] : [])], chu: diaChiChuan(a), dapAn: chuan },
    { kieu: ["phuong-cu-gop"], chu: `${a.streetNumber} ${a.streetName}, P. ${cuGop.ten}, Q.1, TP.HCM`, dapAn: chuan },
    {
      kieu: ["phuong-cu-tach"],
      chu: `${a.streetNumber} ${a.streetName}, Phường ${cuTach.ten}, Quận 1, TP. Hồ Chí Minh`,
      dapAn: { ...chuan, wardName: { canNguoiChon: true, ungVien: [...cuTach.vao] } },
    },
    { kieu: ["viet-tat-khong-dau"], chu: `${a.streetNumber} Duong Mau ${n}, P. ${boDau(a.wardName)}, TP HCM`, dapAn: chuan },
    { kieu: ["thieu-so-nha"], chu: `${a.streetName}, Phường ${a.wardName}, TPHCM`, dapAn: { ...chuan, streetNumber: null, thieu: ["streetNumber"] } },
  ];
  const hc = hemChu(a.streetNumber, "hẻm");
  if (hc) ds.push({ kieu: ["hem-chu"], chu: `${hc} ${a.streetName}, Phường ${a.wardName}, TP.HCM`, dapAn: chuan });
  const hx = hemChu(a.streetNumber, "HXH");
  if (hx) ds.push({ kieu: ["hem-xe-hoi"], chu: `${hx.replace(" HXH", ", HXH")}, ${a.streetName}, P. ${a.wardName}, TPHCM`, dapAn: chuan });
  return ds.map((x) => ({ ...x, canDich: can.ma, nhan: NHAN }));
}

/** @param {{ hatGiong?: number, hang5?: any }} [p] */
export function sinhDuLieuThapTang({ hatGiong = HAT_GIONG_THAP_TANG, hang5 = JSON.parse(readFileSync(DU_LIEU_HANG_5, "utf8")) } = {}) {
  const r = boSinh(hatGiong);

  const vung = [
    { ten: "Khu thấp tầng", nhan: NHAN },
    { ten: "Nhà ngoài khu", nhan: NHAN },
  ];
  const nguoi = [
    { khoa: "dau-chu-thap-tang", ten: "[Mẫu] Đầu chủ thấp tầng", vai: ["listing_agent"], khu: ["Khu thấp tầng"] },
    { khoa: "dau-chu-nha-le", ten: "[Mẫu] Đầu chủ nhà lẻ", vai: ["listing_agent"], khu: ["Nhà ngoài khu"] },
  ].map((n) => ({ ...n, email: `${n.khoa}@${MIEN_EMAIL}`, nhan: NHAN }));

  // Khu → dãy → lô. Cấp hai mang blockKey / blockName (ADR-0016 quyết định 3); CatalogFeed chưa có cấp này (LH11).
  const khu = {
    subdivisionKey: "mau-khu-thap-tang",
    subdivisionName: TEN_KHU,
    complexName: null,
    blocks: DAY.map((day) => ({
      blockKey: day.blockKey,
      blockName: `Dãy ${day.blockKey}`,
      nhanSan: day.nhanSan,
      units: Array.from({ length: day.so }, (_, i) => {
        const ma = `${day.blockKey}-${hai(i + 1)}`;
        const mt = day.mt[i % day.mt.length];
        const sau = day.sau[i % day.sau.length];
        return {
          upi: `${TIEN_TO_UPI}${ma}`,
          unitNumber: ma,
          stack: null,
          floor: null,
          propertyType: PROPERTY_TYPE[day.sub],
          propertySubType: day.sub,
          ...truongLoaiHinh(r, day.sub, mt, sau, day.tang),
          accessRoadWidth: day.lo,
        };
      }),
    })),
    nhan: NHAN,
  };
  const danhMucThapTang = { provider: "[Mẫu] Nguồn danh mục thử", measuredAt: "2026-11-05T00:00:00+07:00", subdivisions: [khu] };
  const moiLo = khu.blocks.flatMap((b) => b.units);

  const canNgoaiKhu = NGOAI_KHU.map(([ma, sub, phuong, duong, so]) => {
    const mt = sub === "Single Family Residence" ? 8 : 4;
    const sau = sub === "Unimproved Land" ? 15 : 16;
    return {
      ma,
      propertyType: PROPERTY_TYPE[sub],
      propertySubType: sub,
      ...truongLoaiHinh(r, sub, mt, sau, sub === "Single Family Residence" ? 3 : 4),
      diaChi: { stateOrProvince: TINH.ten, wardName: phuong, streetName: `Đường Mẫu ${duong}`, streetNumber: so },
      nhan: NHAN,
    };
  });

  // Căn hộ: bốn căn của danh mục hàng 5 không có hàng nào ở hàng 5.
  const canHo5 = hang5.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units));
  const daCoHang = new Set(hang5.hang.map((h) => h.upi));
  const canHo = r.tron(canHo5.filter((u) => !daCoHang.has(u.upi))).slice(0, 4).sort((a, b) => (a.unitNumber < b.unitNumber ? -1 : 1));

  // Hàng: 24 lô, 10 căn ngoài khu, 4 căn hộ; mỗi căn một hàng.
  const loChon = r.tron(moiLo).slice(0, 24).sort((a, b) => (a.unitNumber < b.unitNumber ? -1 : 1));
  const nkChon = r.tron(canNgoaiKhu).slice(0, 10).sort((a, b) => (a.ma < b.ma ? -1 : 1));
  const nhom = [
    { dauChu: "dau-chu-thap-tang", can: loChon.map((u) => ({ loai: "lo", maCan: u.unitNumber, upi: u.upi, sub: u.propertySubType, dt: u.lotSizeArea })) },
    { dauChu: "dau-chu-nha-le", can: nkChon.map((u) => ({ loai: "ngoai-khu", maCan: u.ma, upi: null, sub: u.propertySubType, dt: u.lotSizeArea })) },
    ...["A", "B"].map((toa) => ({
      dauChu: toa === "A" ? "dau-chu-1" : "dau-chu-2",
      can: canHo.filter((u) => u.unitNumber.startsWith(`${toa}-`)).map((u) => ({ loai: "can-ho", maCan: u.unitNumber, upi: u.upi, sub: "Condominium", dt: u.livingArea })),
    })),
  ];
  const PHAN_BO = { Active: 12, Incomplete: 6, Pending: 5, Hold: 5, Closed: 5, Withdrawn: 5 };
  const trangThai = r.tron(Object.entries(PHAN_BO).flatMap(([t, n]) => Array(n).fill(t)));
  const chuNha = [];
  const hang = [];
  for (const g of nhom) {
    const doi = Math.floor(g.can.length / 4); // số chủ có hai căn trong nhóm — cùng một đầu chủ
    const chuNhom = [];
    g.can.forEach((c, j) => {
      const k = j < 2 * doi ? Math.floor(j / 2) : j - doi;
      if (!chuNhom[k]) {
        const so = SO_DAU + chuNha.length;
        const chu = { ma: `CNT-${hai(chuNha.length + 1)}`, ten: `[Mẫu] Chủ nhà thấp tầng ${hai(chuNha.length + 1)}`, soDienThoai: soMau(so), dauChu: g.dauChu, nhan: NHAN };
        chuNhom[k] = chu;
        chuNha.push(chu);
      }
      const giaM2 = c.sub === "Condominium" ? 45 + r.nguyen(31) : c.sub === "Unimproved Land" ? 80 + r.nguyen(71) : 120 + r.nguyen(131);
      hang.push({
        ma: "",
        loai: c.loai,
        maCan: c.maCan,
        upi: c.upi,
        propertySubType: c.sub,
        trangThai: trangThai[hang.length],
        gia: Math.max(1, Math.round((c.dt * giaM2) / 100)) * 100 * 1_000_000,
        dieuKienPhi: r.nguyen(2) === 0 ? "bao_phi" : "khong_bao_phi",
        dauChu: g.dauChu,
        chuNha: chuNhom[k].ma,
        ghiChu: GHI_CHU[r.nguyen(GHI_CHU.length)],
        nhan: NHAN,
      });
    });
  }
  hang.forEach((h, i) => (h.ma = `HT-${hai(i + 1)}`));

  const diaChiThu = canNgoaiKhu.flatMap(cachViet).map((x, i) => ({ ma: `DC-${String(i + 1).padStart(3, "0")}`, ...x }));

  // Lead viết trước theo bảy ca, mỗi ca kèm đáp án.
  const mo = (h) => TRANG_THAI_MO.includes(h.trangThai);
  const loMo = hang.find((h) => h.loai === "lo" && mo(h));
  const nkMo = hang.find((h) => h.loai === "ngoai-khu" && mo(h));
  const loTrong = moiLo.find((u) => !hang.some((h) => h.maCan === u.unitNumber));
  const nkTrong = canNgoaiKhu.find((u) => !hang.some((h) => h.maCan === u.ma));
  const vietCua = (ma, kieu) => diaChiThu.find((x) => x.canDich === ma && x.kieu.includes(kieu));
  const nkMoCan = canNgoaiKhu.find((u) => u.ma === nkMo.maCan);
  const leadTho = [
    { ca: "biet-lo", maLo: loTrong.unitNumber, dapAn: { can: loTrong.unitNumber } },
    { ca: "chi-biet-day", day: "BT1", dapAn: { can: null, day: "BT1" } },
    { ca: "ngoai-khu-du", diaChi: vietCua(nkTrong.ma, "phuong-moi").chu, dapAn: { can: nkTrong.ma } },
    {
      ca: "ngoai-khu-thieu-so",
      diaChi: `${nkTrong.diaChi.streetName}, P. ${nkTrong.diaChi.wardName}`,
      dapAn: { can: null, streetName: nkTrong.diaChi.streetName, wardName: nkTrong.diaChi.wardName, thieu: ["streetNumber"] },
    },
    { ca: "trung-lo-mo", maLo: loMo.maCan, dapAn: { can: loMo.maCan, trungHangMo: loMo.ma } },
    { ca: "trung-nha-ngoai-khu-mo", diaChi: vietCua(nkMoCan.ma, "phuong-cu-gop").chu, dapAn: { can: nkMoCan.ma, trungHangMo: nkMo.ma } },
    { ca: "trung-so-chu", day: "LK2", trungSo: chuNha[0].ma, dapAn: { can: null, day: "LK2", trungChuNha: chuNha[0].ma } },
  ];
  const lead = leadTho.map(({ trungSo, ...l }, i) => ({
    ma: `LT-${hai(i + 1)}`,
    ten: `[Mẫu] Chủ nhà mới thấp tầng ${hai(i + 1)}`,
    soDienThoai: trungSo ? chuNha.find((c) => c.ma === trungSo).soDienThoai : soMau(SO_DAU + chuNha.length + i),
    ...l,
    nhan: NHAN,
  }));

  return {
    phienBan: 1,
    hatGiong,
    nhan: NHAN,
    san: { ten: TEN_SAN, nhan: NHAN },
    donViHanhChinh: { nguon: DON_VI_HANH_CHINH.nguon, ngay: DON_VI_HANH_CHINH.ngay },
    nguoi,
    vung,
    danhMucThapTang,
    canNgoaiKhu,
    chuNha,
    hang,
    lead,
    diaChiThu,
  };
}
