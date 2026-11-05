// File bảng hàng thấp tầng bẩn (hàng 73) kèm đáp án, theo khuôn bộ thử của hàng 64: dòng tiêu đề · đích từng cột · giá trị
// đúng từng ô · lỗi cấy mang nhãn (giá trị đúng hay «phải hỏi người»). Mỗi cột có một cách ghi sạch (`ghi`); lỗi cấy là ô
// lệch khỏi cách ghi sạch theo luật chỉ số dòng — không ngẫu nhiên. Giá trị đúng lấy từ bộ dữ liệu; bài kiểm tính lại
// chúng từ bộ dữ liệu bằng bảng riêng, không gọi tệp này.
import { diaChiChuan } from "./du-lieu-mau-thap-tang.mjs";
import { ghiXlsx } from "./xlsx.mjs";

export const TEN_TEP_BAN = "bang-hang-thap-tang.xlsx";
export const TEN_SHEET_BAN = "Bảng hàng thấp tầng";
export const DONG_TIEU_DE = 2;

/** Tám nhãn lỗi cấy (AC-6). */
export const NHAN_LOI = ["loai-hinh-nhan-san", "ma-lo-lech-dang", "dien-tich-nhan", "so-tang-chu", "gia-ty", "gia-thoa-thuan", "so-dien-thoai-dang-khac", "dia-chi-phuong-cu"];

const LOAI_SACH = { Townhouse: "Nhà phố", "Single Family Residence": "Biệt thự", "Unimproved Land": "Đất", Condominium: "Căn hộ" };
const TRANG_THAI = { Incomplete: "Chưa đủ để rao", Active: "Đang bán", Pending: "Đang giao dịch", Closed: "Đã bán", Hold: "Tạm ngừng", Withdrawn: "Ngừng hẳn" };
const soChu = (x) => String(x).replace(".", ",");

/** Ngữ cảnh: tra căn (lô, căn ngoài khu, căn hộ hàng 5) và chủ nhà theo mã. */
function nguCanh(d, hang5) {
  const can = new Map();
  for (const b of d.danhMucThapTang.subdivisions[0].blocks) for (const u of b.units) can.set(u.unitNumber, { ...u, nhanSan: b.nhanSan });
  for (const u of d.canNgoaiKhu) can.set(u.ma, u);
  for (const p of hang5.danhMuc.subdivisions) for (const b of p.buildings) for (const u of b.units) can.set(u.unitNumber, u);
  const chu = new Map(d.chuNha.map((c) => [c.ma, c]));
  return { can: (h) => can.get(h.maCan), chu: (h) => chu.get(h.chuNha) };
}

/**
 * Cột: tiêu đề, đích (tên trường RESO hay đích của bộ nhập), giá trị đúng, và cách ghi ô (có thể cấy lỗi).
 * `o(h, c, i, dung)` trả `{ gt }` (ô sạch) hoặc `{ gt, nhan, value?, ask? }` (lỗi cấy).
 */
const COT = [
  { tieuDe: "STT", dich: "rowIndex", dung: (_h, _c, i) => i + 1 },
  {
    tieuDe: "Loại",
    dich: "propertySubType",
    dung: (h) => h.propertySubType,
    o: (h, c, _i, v) => {
      const u = c.can(h);
      if (h.loai === "lo" && u.nhanSan !== "Biệt thự") return { gt: u.nhanSan, nhan: "loai-hinh-nhan-san", value: v };
      if (h.loai === "ngoai-khu" && v === "Unimproved Land") return { gt: "Đất thổ cư", nhan: "loai-hinh-nhan-san", value: v };
      return { gt: LOAI_SACH[v] };
    },
  },
  {
    tieuDe: "Mã lô / mã căn",
    dich: "unitNumber",
    dung: (h) => (h.loai === "ngoai-khu" ? null : h.maCan),
    o: (h, _c, i, v) => {
      if (h.loai !== "lo") return { gt: v };
      if (i % 4 === 1) return { gt: v.toLowerCase().replace("-", " "), nhan: "ma-lo-lech-dang", value: v };
      if (i % 4 === 3) return { gt: v.replace("-", "."), nhan: "ma-lo-lech-dang", value: v };
      return { gt: v };
    },
  },
  {
    tieuDe: "Địa chỉ",
    dich: "unparsedAddress",
    dung: (h, c) => (h.loai === "ngoai-khu" ? diaChiChuan(c.can(h).diaChi) : null),
    o: (h, _c, _i, v, d, j) => {
      if (h.loai !== "ngoai-khu") return { gt: null };
      const viet = (kieu) => d.diaChiThu.find((x) => x.canDich === h.maCan && x.kieu.includes(kieu)).chu;
      if (j % 3 === 1) return { gt: viet("phuong-cu-gop"), nhan: "dia-chi-phuong-cu", value: v };
      if (j % 3 === 2) return { gt: viet("phuong-cu-tach"), nhan: "dia-chi-phuong-cu", ask: true };
      return { gt: v };
    },
  },
  {
    tieuDe: "DT đất",
    dich: "lotSizeArea",
    dung: (h, c) => c.can(h).lotSizeArea ?? null,
    o: (h, c, i, v) => {
      if (v === null) return { gt: null };
      const mt = c.can(h).frontageLength;
      if (i % 3 === 0) return { gt: `${soChu(mt)}x${soChu(Math.round((v / mt) * 10) / 10)}`, nhan: "dien-tich-nhan", value: v };
      if (i % 3 === 1) return { gt: `${soChu(v)}m2`, nhan: "dien-tich-nhan", value: v };
      return { gt: v };
    },
  },
  { tieuDe: "DTSD", dich: "livingArea", dung: (h, c) => c.can(h).livingArea ?? null },
  {
    tieuDe: "Số tầng",
    dich: "storiesTotal",
    dung: (h, c) => (h.loai === "can-ho" ? null : (c.can(h).storiesTotal ?? null)),
    o: (_h, _c, i, v) => {
      if (v === null) return { gt: null };
      if (i % 3 === 0) return { gt: `1 trệt ${v - 1} lầu`, nhan: "so-tang-chu", value: v };
      if (i % 3 === 1) return { gt: `${v}T`, nhan: "so-tang-chu", value: v };
      return { gt: v };
    },
  },
  { tieuDe: "MT (m)", dich: "frontageLength", dung: (h, c) => c.can(h).frontageLength ?? null },
  { tieuDe: "Lộ giới (m)", dich: "accessRoadWidth", dung: (h, c) => c.can(h).accessRoadWidth ?? null },
  { tieuDe: "Hướng", dich: "directionFaces", dung: (h, c) => c.can(h).directionFaces ?? null },
  {
    tieuDe: "Giá",
    dich: "listPrice",
    dung: (h) => h.gia,
    o: (_h, _c, i, v) => {
      if (i % 7 === 6) return { gt: "Thỏa thuận", nhan: "gia-thoa-thuan", ask: true };
      if (i % 5 === 0) return { gt: `${soChu(v / 1e9)} tỷ`, nhan: "gia-ty", value: v };
      if (i % 5 === 2) return { gt: `${v / 1e9} ty`, nhan: "gia-ty", value: v };
      return { gt: v };
    },
  },
  { tieuDe: "Trạng thái", dich: "standardStatus", dung: (h) => h.trangThai, o: (_h, _c, _i, v) => ({ gt: TRANG_THAI[v] }) },
  { tieuDe: "Chủ nhà", dich: "ownerName", dung: (h, c) => c.chu(h).ten },
  {
    tieuDe: "SĐT",
    dich: "ownerPhone",
    dung: (h, c) => c.chu(h).soDienThoai,
    o: (_h, _c, i, v) => {
      const chiSo = v.replace(/\D/g, "");
      if (i % 4 === 0) return { gt: `${chiSo.slice(0, 4)}.${chiSo.slice(4, 7)}.${chiSo.slice(7)}`, nhan: "so-dien-thoai-dang-khac", value: v };
      if (i % 4 === 1) return { gt: `+84 ${v.slice(1)}`, nhan: "so-dien-thoai-dang-khac", value: v };
      if (i % 4 === 2) return { gt: chiSo, nhan: "so-dien-thoai-dang-khac", value: v };
      return { gt: v };
    },
  },
  { tieuDe: "Ghi chú", dich: "note", dung: (h) => h.ghiChu || null },
  { tieuDe: "Nhãn", dich: "label", dung: (h) => h.nhan },
];

/**
 * Lưới của file (dòng tiêu đề sàn, dòng trống, tiêu đề cột, rồi một dòng mỗi hàng) và đáp án.
 * @returns {{ luoi: (string|number|null)[][], dapAn: any }}
 */
export function dungFileBan(d, hang5) {
  const c = nguCanh(d, hang5);
  const luoi = [["[Mẫu] BẢNG HÀNG THẤP TẦNG — SÀN THỬ"], [], COT.map((x) => x.tieuDe)];
  const dung = [];
  const loiCay = [];
  let j = 0; // đếm dòng ngoài khu — luật cấy lỗi địa chỉ theo thứ tự của riêng chúng
  d.hang.forEach((h, i) => {
    const dong = DONG_TIEU_DE + 1 + i;
    const giaTri = COT.map((x) => x.dung(h, c, i));
    const o = COT.map((x, k) => (x.o ? x.o(h, c, i, giaTri[k], d, j) : { gt: giaTri[k] }));
    if (h.loai === "ngoai-khu") j++;
    o.forEach((x, k) => {
      if (x.nhan) loiCay.push({ dong, cot: k, nhan: x.nhan, ...(x.ask ? { ask: true } : { value: x.value }) });
    });
    luoi.push(o.map((x) => x.gt ?? null));
    dung.push(giaTri);
  });
  return {
    luoi,
    dapAn: {
      tep: TEN_TEP_BAN,
      headerRow: DONG_TIEU_DE,
      cot: COT.map((x) => ({ tieuDe: x.tieuDe, dich: x.dich })),
      dong: d.hang.map((_h, i) => DONG_TIEU_DE + 1 + i),
      canCuaDong: d.hang.map((h) => h.maCan),
      dung,
      loiCay,
      nhan: d.nhan,
    },
  };
}

/** @returns {Buffer} */
export const ghiFileBan = (luoi) => ghiXlsx({ tenSheet: TEN_SHEET_BAN, dong: luoi });
