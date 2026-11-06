// Phần thuần của Cài đặt › Sàn › Trang môi giới (hàng 44): đọc hai điểm #15, #16 từ GET /api/v1/company/settings, kiểm ô và
// dựng thân PATCH. Máy chủ vẫn kiểm khoảng (sổ điểm biến thiên) — đây chỉ để báo sớm dưới ô.
import { laMucChia } from "@quy-hang/core/sharing";

export const KHOA_MUC = "broker_page.commission_split_pct";
export const KHOA_AN = "broker_page.hide_commission_split";

export type CaiDatMoiGioi = { muc: number | null; an: boolean };

export const CHU_CAI_DAT = {
  tieuDe: "Trang môi giới",
  moTa: "Mức chia mặc định khi gửi bộ căn cho nhóm môi giới sàn khác; người gửi sửa được theo từng bộ.",
  loiDoc: "Chưa đọc được cài đặt trang môi giới",
  loiMuc: "Mức chia từ 0 đến 100, tối đa hai chữ số lẻ",
  daLuu: "Đã lưu cài đặt trang môi giới",
  chuaLuu: "Chưa lưu được",
} as const;

export function docCaiDat(body: unknown): CaiDatMoiGioi {
  const items = (body as { items?: { key: string; value: unknown }[] } | null)?.items ?? [];
  const lay = (k: string) => items.find((x) => x.key === k)?.value;
  const muc = lay(KHOA_MUC);
  return { muc: typeof muc === "number" ? muc : null, an: lay(KHOA_AN) === true };
}

/** Ô mức chia → số, null (trống) hay "sai". */
export function docO(chu: string): number | null | "sai" {
  const t = chu.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return laMucChia(n) ? n : "sai";
}

export function thanLuu(muc: number | null, an: boolean): Record<string, unknown> {
  return { [KHOA_MUC]: muc, [KHOA_AN]: an };
}
