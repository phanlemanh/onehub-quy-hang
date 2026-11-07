// Phần thuần của màn Từ điển (hàng 70): chữ của màn, trạng thái tải, chữ giá trị chuẩn, sức khoẻ lấy từ lõi.
import { sucKhoeTuDien, TRUONG_TU_DIEN, type DongCachGo, type SucKhoe, type TruongTuDien } from "@quy-hang/core/import";
import { TAP_DONG } from "@quy-hang/core/labels";
import { NHAN_TRANG_THAI_MAC_DINH } from "@quy-hang/core/statuses";

export type DongTuDien = DongCachGo & { id: string };
export type TrangThaiTuDien = { kieu: "dang-tai" } | { kieu: "loi" } | { kieu: "xong"; rows: DongTuDien[] };

export const CHU = {
  tieuDe: "Từ điển",
  moTa: "Cách gõ lạ người chọn gợi ý khi nhập file. Duyệt thì từ lần sau chữ ấy chuẩn hoá thẳng; không căn nào đã lưu bị đổi.",
  dangTai: "Đang tải từ điển…",
  loi: "Chưa đọc được từ điển",
  thuLai: "Thử lại",
  trong: "Chưa có cách gõ lạ nào — chọn gợi ý ở bước xem trước khi nhập file sẽ hiện ở đây",
  sucKhoe: "Sức khoẻ dữ liệu",
  duyet: "Duyệt",
  bo: "Bỏ",
  loiLuu: "Chưa lưu được — thử lại.",
} as const;

export const TEN_TRUONG: Readonly<Record<TruongTuDien, string>> = { standardStatus: "Trạng thái", feeInclusion: "Điều kiện phí", directionFaces: "Hướng" };
export const TEN_TRANG_THAI: Readonly<Record<DongCachGo["status"], string>> = { proposed: "Chờ duyệt", approved: "Đã duyệt", rejected: "Đã bỏ" };

/** Chữ của giá trị chuẩn trên màn. */
export function chuGiaTri(field: TruongTuDien, value: string): string {
  if (field === "standardStatus") return NHAN_TRANG_THAI_MAC_DINH[value as keyof typeof NHAN_TRANG_THAI_MAC_DINH] ?? value;
  if (field === "feeInclusion") return (TAP_DONG.feeInclusion as Record<string, string>)[value] ?? value;
  return value;
}

/** Sức khoẻ cả sàn (cộng ba trường) và từng trường — cùng hàm lõi máy chủ trả. */
export function sucKhoeMan(rows: readonly DongTuDien[]): { tong: SucKhoe; theoTruong: { field: TruongTuDien; s: SucKhoe }[] } {
  const t = sucKhoeTuDien(rows);
  const tong = { gap: 0, daNeo: 0, cho: 0, daBo: 0, lanChon: 0 };
  for (const f of TRUONG_TU_DIEN) for (const k of Object.keys(tong) as (keyof SucKhoe)[]) tong[k] += t[f][k];
  return { tong, theoTruong: TRUONG_TU_DIEN.map((field) => ({ field, s: t[field] })) };
}

/** Dòng theo trường, giữ thứ tự ba trường. */
export const nhomTheoTruong = (rows: readonly DongTuDien[]) => TRUONG_TU_DIEN.map((field) => ({ field, rows: rows.filter((r) => r.field === field) }));
