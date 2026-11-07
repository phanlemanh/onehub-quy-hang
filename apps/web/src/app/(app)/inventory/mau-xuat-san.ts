// Đọc mẫu của sàn cho hộp Xuất bảng hàng (hàng mau-bang-hang-va-bai) — gọi lúc mở hộp ở Bảng hàng; hộp chỉ nhận kết quả.
import { docMauBai, docMauBang } from "@quy-hang/core/export";
import type { MauXuatSan } from "./phat-hang/mau";

export type GoiDoc = (duong: string) => Promise<{ status: number; body: unknown }>;
const templatesCua = (body: unknown): unknown => (body !== null && typeof body === "object" && "templates" in body ? (body as { templates: unknown }).templates : null);

/** Đọc hai loại mẫu của sàn; lỗi một loại không chặn loại kia. */
export async function docMauXuat(goi: GoiDoc): Promise<MauXuatSan> {
  const [bang, bai] = await Promise.all([goi("/api/v1/company/templates/export").catch(() => null), goi("/api/v1/company/templates/posts").catch(() => null)]);
  return {
    mauBang: bang && bang.status === 200 ? docMauBang(templatesCua(bang.body)).ds : null,
    mauBai: bai && bai.status === 200 ? docMauBai(templatesCua(bai.body)).mau : {},
  };
}


/**
 * Mở hộp Xuất kèm mẫu: đọc mẫu đúng MỘT lần (hai lời gọi, mỗi loại một) rồi gắn bản chụp vào dữ liệu mở hộp. Hộp chỉ đọc
 * `mo.mauSan` — mẫu đổi ở máy chủ khi hộp đang mở không tới hộp ấy; lần mở sau đọc lại.
 */
export async function moHopVoiMau<T extends object>(coDinh: T, goi: GoiDoc): Promise<T & { mauSan: MauXuatSan }> {
  return { ...coDinh, mauSan: structuredClone(await docMauXuat(goi)) };
}
