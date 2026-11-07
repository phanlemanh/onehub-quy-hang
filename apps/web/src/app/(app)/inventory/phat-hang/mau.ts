// Mẫu của sàn trong hộp Xuất bảng hàng (hàng mau-bang-hang-va-bai): Bảng hàng đọc mẫu MỘT lần lúc mở hộp
// (`../mau-xuat-san.ts` — hộp không gọi mạng nào ngoài sổ xuất); đổi mẫu khi hộp đang mở không làm đổi hộp ấy. Đọc mẫu bảng
// lỗi thì chỉ còn «Góc nhìn đang mở» kèm câu báo; xuất vẫn được.
import type { CotBangHang, MauBai, MauBang } from "@quy-hang/core/export";

export const GOC_NHIN = "Góc nhìn đang mở";
export const CAU_LOI_MAU = "Chưa đọc được mẫu của sàn — đang theo góc nhìn đang mở";

/** `mauBang: null` = đọc lỗi. */
export type MauXuatSan = { mauBang: MauBang[] | null; mauBai: MauBai };

/** Lựa chọn của ô «Cột theo»: `null` là góc nhìn đang mở, rồi các mẫu theo thứ tự của sàn. */
export function luaChonCotTheo(mau: MauXuatSan): { id: string | null; nhan: string }[] {
  return [{ id: null, nhan: GOC_NHIN }, ...(mau.mauBang ?? []).map((m) => ({ id: m.id, nhan: m.name }))];
}

/** Cột của mẫu đã chọn; `undefined` = theo góc nhìn (không chọn, hay id không còn). */
export function cotCuaMau(mau: MauXuatSan, chon: string | null): readonly CotBangHang[] | undefined {
  return chon === null ? undefined : mau.mauBang?.find((m) => m.id === chon)?.columns;
}
