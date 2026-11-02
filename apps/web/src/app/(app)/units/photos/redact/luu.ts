/**
 * Lưu bản che (hàng 19): tải bản che lên như một ảnh mới ở ngăn Gửi được rồi mới chuyển bản gốc sang Nội bộ (Hỏi-1) — tải
 * lỗi thì không chuyển gì. Ảnh Nội bộ không che được: bản che của ảnh sổ sẽ đưa phần còn lại ra ngoài (bất biến 2).
 */
import type { Compartment, UnitPhoto } from "@quy-hang/core/photos";
import type { SuaAnh } from "../muc-anh";
import type { TepSanSang } from "../tai-len";

export type BanChe = { file: File; thumb: Blob; width: number; height: number };
export type NguonLuu = { them(tep: TepSanSang, ngan: Compartment): Promise<void>; sua(id: string, s: SuaAnh): Promise<void> };
export type KetQuaLuu = { ok: true } | { ok: false; loi: string };

export const CHI_ANH_GUI_DUOC = "Chỉ che được ảnh ở ngăn Gửi được";
export const TAI_LOI = "Chưa lưu được bản che — thử lại";
export const GOC_CHUA_SANG = "Đã lưu bản che, nhưng bản gốc chưa sang Nội bộ — chuyển tay ở menu ảnh";

export async function luuBanChe(goc: Pick<UnitPhoto, "id" | "compartment" | "takenAt">, ban: BanChe, nguon: NguonLuu): Promise<KetQuaLuu> {
  if (goc.compartment !== "shareable") return { ok: false, loi: CHI_ANH_GUI_DUOC };
  try {
    await nguon.them({ ok: true, file: ban.file, type: "image/webp", takenAt: goc.takenAt, thumb: ban.thumb, width: ban.width, height: ban.height }, "shareable");
  } catch {
    return { ok: false, loi: TAI_LOI };
  }
  try {
    await nguon.sua(goc.id, { compartment: "internal" });
  } catch {
    return { ok: false, loi: GOC_CHUA_SANG };
  }
  return { ok: true };
}
