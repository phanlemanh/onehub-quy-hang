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

