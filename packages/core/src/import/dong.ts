/**
 * Quyết một dòng của lần nhập (hàng 65a, Kiến trúc «Nhập dữ liệu» §6): thuần, tất định — xem thử và ghi hỏi CÙNG hàm này,
 * nên con số xem thử bằng con số ghi. Máy chủ chỉ gom dữ kiện (hàng mở trên căn, ai giữ, người gửi đọc được không) rồi
 * làm đúng hành động lõi trả. Chữ lý do sống ở MỘT chỗ — `LY_DO_DONG_NHAP` — màn Nhập Excel (hàng man-nhap-excel) đọc nó.
 */
import { fold } from "./dictionaries";

export const IMPORT_ROW_ACTIONS = ["create", "update", "supplement", "skip"] as const;
export type ImportRowAction = (typeof IMPORT_ROW_ACTIONS)[number];

/** Hàng mở trên căn của dòng, nhìn từ người gửi: không có · người giữ hiệu lực giữ · người khác giữ (đọc được) · không đọc được. */
export type OpenListingFact = "none" | "held_by_effective_agent" | "held_by_other" | "unreadable";

export type ImportRowFacts = {
  /** Người bỏ dòng ở màn xem trước. */
  skippedByPerson: boolean;
  /** Còn ô chặn hay cần người ở toà, mã căn, giá chào. */
  blockedCell: boolean;
  /** Số dòng (của file) của lần đầu căn này xuất hiện, khi dòng này là lần sau; `null` khi là lần đầu. */
  duplicateOfRow: number | null;
  /** Trạng thái theo file, đã chuẩn hoá; `null` khi không có cột hay ô trống. */
  fileStatus: string | null;
  /** Đầu chủ giữ căn của dòng hợp lệ — người gửi là Đầu chủ, hay `agentUserId` là Đầu chủ cùng sàn khi Trưởng nhóm gửi. */
  agentValid: boolean;
  openListing: OpenListingFact;
};

export const LY_DO_DONG_NHAP = {
  boDong: "bạn bỏ dòng này",
  oChan: "còn ô cần bạn xem ở toà, mã căn hay giá chào",
  daBan: "file ghi đã bán — không nhập",
  ngung: "file ghi ngừng hẳn — không nhập",
  chuaDauChu: "chưa có đầu chủ giữ căn",
  capNhat: "căn đã có hàng bạn giữ — cập nhật hàng ấy",
  tinBoSung: "căn đã có hàng mở — gửi tin bổ sung cho đầu chủ giữ căn",
  khongDoc: "căn đã có hàng của người khác trong sàn",
  tao: "căn mới",
} as const;

/** «trùng dòng <n> trong file» — tiền tố là hằng, số dòng là của file. */
export const LY_DO_TRUNG_DONG = "trùng dòng";
export const lyDoTrung = (dong: number) => `${LY_DO_TRUNG_DONG} ${dong} trong file`;

export type ImportRowDecision = { action: ImportRowAction; reason: string };

/** Thứ tự xét đúng bảng thiết kế: bỏ dòng → ô chặn → trùng → đã bán/ngừng → đầu chủ → hàng mở. */
export function quyetDongNhap(f: ImportRowFacts): ImportRowDecision {
  const bo = (reason: string): ImportRowDecision => ({ action: "skip", reason });
  if (f.skippedByPerson) return bo(LY_DO_DONG_NHAP.boDong);
  if (f.blockedCell) return bo(LY_DO_DONG_NHAP.oChan);
  if (f.duplicateOfRow !== null) return bo(lyDoTrung(f.duplicateOfRow));
  if (f.fileStatus === "Closed") return bo(LY_DO_DONG_NHAP.daBan);
  if (f.fileStatus === "Withdrawn") return bo(LY_DO_DONG_NHAP.ngung);
  if (!f.agentValid) return bo(LY_DO_DONG_NHAP.chuaDauChu);
  switch (f.openListing) {
    case "held_by_effective_agent":
      return { action: "update", reason: LY_DO_DONG_NHAP.capNhat };
    case "held_by_other":
      return { action: "supplement", reason: LY_DO_DONG_NHAP.tinBoSung };
    case "unreadable":
      return { action: "supplement", reason: LY_DO_DONG_NHAP.khongDoc };
    default:
      return { action: "create", reason: LY_DO_DONG_NHAP.tao };
  }
}

/** Khoá căn để xét trùng trong file: toà + mã căn đã chuẩn hoá, gấp dấu và khoảng trắng. Thiếu một vế thì không có khoá. */
export function khoaCan(buildingName: string | null | undefined, unitNumber: string | null | undefined): string | null {
  if (!buildingName || !unitNumber) return null;
  return `${fold(buildingName)}|${fold(unitNumber).replace(/[\s.-]+/g, "")}`;
}

/**
 * Dòng đầu của mỗi căn trên CẢ file (không theo gói): số dòng → số dòng của lần đầu, chỉ cho dòng lặp. Tính một lần lúc mở
 * lần nhập, nên gói nào — xem thử hay ghi — cũng thấy cùng một «trùng dòng <n>».
 */
export function dongDauMoiCan(dong: readonly { row: number; key: string | null }[]): Map<number, number> {
  const dau = new Map<string, number>();
  const trung = new Map<number, number>();
  for (const { row, key } of [...dong].sort((a, b) => a.row - b.row)) {
    if (key === null) continue;
    const truoc = dau.get(key);
    if (truoc === undefined) dau.set(key, row);
    else trung.set(row, truoc);
  }
  return trung;
}

/** Mốc ngày xác nhận sớm nhất, tính bằng năm trước hôm nay (Kiến trúc §6 «mặc định 2 năm»; sàn chỉnh ở hàng 82). */
export const MOC_XAC_NHAN_NAM = 2;

/** Ngày xác nhận trong file (YYYY-MM-DD) dùng được không: không sau hôm nay, không trước mốc. `null` là dùng được. */
export function kiemNgayXacNhan(ngay: string, today: string): string | null {
  if (ngay > today) return `ngày ${ngay} sau hôm nay`;
  const moc = `${Number(today.slice(0, 4)) - MOC_XAC_NHAN_NAM}${today.slice(4)}`;
  if (ngay < moc) return `ngày ${ngay} trước mốc ${MOC_XAC_NHAN_NAM} năm (${moc}) — cần bạn xem`;
  return null;
}
