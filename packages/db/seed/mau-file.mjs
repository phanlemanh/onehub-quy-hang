// Hai mẫu file bảng hàng để thử nhập Excel. Tiêu đề soạn từ từ vựng Tham chiếu §4, §5, §7 vì kho chưa có file thật
// (Hỏi-1, T-10); có file thật thì thay bảng cột ở đây rồi sinh lại. Mỗi cột là một tiêu đề và một hàm chiếu từ hàng —
// bài kiểm dùng chính bảng này để so từng ô của tệp đọc lại.
import { ghiXlsx } from "./xlsx.mjs";

// Nhãn trạng thái theo Tham chiếu §5.
const TRANG_THAI_DAY_DU = {
  Incomplete: "Chưa đủ để rao",
  Active: "Đang bán",
  Pending: "Đang giao dịch",
  Closed: "Đã bán",
  Hold: "Tạm ngừng",
  Withdrawn: "Ngừng hẳn",
};
const TRANG_THAI_TAT = {
  Incomplete: "Chưa đủ",
  Active: "Đang bán",
  Pending: "Đang GD",
  Closed: "Đã bán",
  Hold: "Tạm ngừng",
  Withdrawn: "Ngừng",
};

/** Ngữ cảnh chiếu: tra căn, chủ nhà, người theo mã. */
export function taoNguCanh(d) {
  const can = new Map(d.danhMuc.subdivisions.flatMap((p) => p.buildings.flatMap((b) => b.units.map((u) => [u.unitNumber, { ...u, toa: b.buildingName, duAn: p.subdivisionName }]))));
  const chu = new Map(d.chuNha.map((c) => [c.ma, c]));
  const nguoi = new Map(d.nguoi.map((n) => [n.khoa, n]));
  return { can: (h) => can.get(h.maCan), chu: (h) => chu.get(h.chuNha), nguoi: (h) => nguoi.get(h.dauChu) };
}

/**
 * @typedef {{ tieuDe: string, dienThoai?: boolean, lay: (h: any, c: ReturnType<typeof taoNguCanh>, i: number) => string | number | null }} Cot
 * @typedef {{ khoa: string, tenTep: string, tenSheet: string, cot: Cot[] }} MauFile
 */

/** Mẫu A «Sheet đầu chủ»: tiêu đề viết tắt, giá tỷ, BP/KBP. @type {MauFile} */
export const MAU_A = {
  khoa: "a",
  tenTep: "mau-a.xlsx",
  tenSheet: "Sheet đầu chủ",
  cot: [
    { tieuDe: "Mã căn", lay: (h) => h.maCan },
    { tieuDe: "Toà", lay: (h, c) => c.can(h).toa },
    { tieuDe: "DT", lay: (h, c) => c.can(h).livingArea },
    { tieuDe: "PN", lay: (h, c) => c.can(h).bedroomsTotal },
    { tieuDe: "Hướng", lay: (h, c) => c.can(h).directionFaces },
    { tieuDe: "Giá (tỷ)", lay: (h) => Math.round(h.gia / 1e7) / 100 },
    { tieuDe: "Phí CN", lay: (h) => (h.dieuKienPhi === "bao_phi" ? "BP" : "KBP") },
    { tieuDe: "TT", lay: (h) => TRANG_THAI_TAT[h.trangThai] },
    { tieuDe: "Chủ nhà", lay: (h, c) => c.chu(h).ten },
    { tieuDe: "SĐT chủ", dienThoai: true, lay: (h, c) => c.chu(h).soDienThoai },
    { tieuDe: "Đầu chủ", lay: (h, c) => c.nguoi(h).ten },
    { tieuDe: "Ghi chú", lay: (h) => h.ghiChu || null },
    { tieuDe: "Nhãn", lay: (h) => h.nhan },
  ],
};

/** Mẫu B «file đầy đủ»: tiêu đề đủ chữ, giá đồng, Đã gồm phí/Chưa gồm phí, cột khác thứ tự. @type {MauFile} */
export const MAU_B = {
  khoa: "b",
  tenTep: "mau-b.xlsx",
  tenSheet: "Bảng hàng",
  cot: [
    { tieuDe: "STT", lay: (_h, _c, i) => i + 1 },
    { tieuDe: "Trạng thái", lay: (h) => TRANG_THAI_DAY_DU[h.trangThai] },
    { tieuDe: "Dự án", lay: (h, c) => c.can(h).duAn },
    { tieuDe: "Toà", lay: (h, c) => c.can(h).toa },
    { tieuDe: "Tầng", lay: (h, c) => c.can(h).floor },
    { tieuDe: "Mã căn", lay: (h) => h.maCan },
    { tieuDe: "Diện tích (m²)", lay: (h, c) => c.can(h).livingArea },
    { tieuDe: "Số phòng ngủ", lay: (h, c) => c.can(h).bedroomsTotal },
    { tieuDe: "Hướng ban công", lay: (h, c) => c.can(h).directionFaces },
    { tieuDe: "Giá chào (VNĐ)", lay: (h) => h.gia },
    { tieuDe: "Điều kiện phí", lay: (h) => (h.dieuKienPhi === "bao_phi" ? "Đã gồm phí" : "Chưa gồm phí") },
    { tieuDe: "Người phụ trách", lay: (h, c) => c.nguoi(h).ten },
    { tieuDe: "Tên chủ nhà", lay: (h, c) => c.chu(h).ten },
    { tieuDe: "Số điện thoại chủ nhà", dienThoai: true, lay: (h, c) => c.chu(h).soDienThoai },
    { tieuDe: "Ghi chú", lay: (h) => h.ghiChu || null },
    { tieuDe: "Nhãn", lay: (h) => h.nhan },
  ],
};

export const MAU_FILE = [MAU_A, MAU_B];

/** Dòng của một mẫu: tiêu đề rồi một dòng mỗi hàng, theo thứ tự mã hàng. */
export function dongMau(mau, d) {
  const c = taoNguCanh(d);
  return [mau.cot.map((x) => x.tieuDe), ...d.hang.map((h, i) => mau.cot.map((x) => x.lay(h, c, i) ?? null))];
}

/** @returns {Buffer} */
export const ghiMau = (mau, d) => ghiXlsx({ tenSheet: mau.tenSheet, dong: dongMau(mau, d) });
