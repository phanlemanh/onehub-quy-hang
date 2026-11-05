import type { CotMau, Grid, ImportContext } from "@quy-hang/core/import";
import { chayOng, cotTheoMau, type Ong } from "./duong-ong";
import { laLoi, type LoiGoi } from "./goi-api";

/**
 * Mẫu đã nhớ trên màn Nhập (Ngoài-5 hàng 67, AC-11 hàng 66): người chọn tệp trước khi mẫu tải xong thì màn chờ mẫu rồi mới
 * ghép, báo «Đang tải mẫu đã nhớ…»; tải lỗi thì ghép theo từ điển và báo rõ — không lặng lẽ ghép theo từ điển.
 */
export type MauDaNho = { kind: "dang-tai" } | { kind: "co"; mau: CotMau[] } | { kind: "loi" };

export const DANG_TAI_MAU = "Đang tải mẫu đã nhớ…";
export const LOI_MAU = "Không đọc được mẫu đã nhớ";

/** Chờ lời hứa đọc mẫu; không bao giờ ném — lỗi mạng hay lỗi máy chủ đều thành `loi`. */
export async function choMau(hua: Promise<CotMau[] | LoiGoi>): Promise<MauDaNho> {
  try {
    const r = await hua;
    return laLoi(r) ? { kind: "loi" } : { kind: "co", mau: r };
  } catch {
    return { kind: "loi" };
  }
}

/** Ghép tệp khi mẫu đã có: chờ mẫu rồi chạy đường ống với mẫu (lỗi thì với từ điển). */
export async function ghepKhiCoMau(grid: Grid, ctx: ImportContext, hua: Promise<CotMau[] | LoiGoi>): Promise<{ ong: Ong; mau: MauDaNho }> {
  const mau = await choMau(hua);
  return { ong: chayOng(grid, ctx, mau.kind === "co" ? mau.mau : []), mau };
}

/** Dải báo của bước Ghép cột (hay lúc đang chờ mẫu). */
export function daiBaoMau(m: MauDaNho, ong: Ong | null): { title: string } | null {
  if (m.kind === "dang-tai") return { title: DANG_TAI_MAU };
  if (m.kind === "loi") return { title: LOI_MAU };
  const theo = ong ? cotTheoMau(ong).length : 0;
  return ong && theo ? { title: `Ghép theo mẫu đã nhớ — ${theo}/${ong.table.headers.length} cột` } : null;
}
