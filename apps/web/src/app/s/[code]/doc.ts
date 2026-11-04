// Đọc thân trang khách qua route công khai của API (hàng 35) — trong cùng tiến trình, không lưu đệm (giá và trạng thái sống).
import type { ThanTrangKhach } from "@quy-hang/core/sharing";

export type GoiApi = (url: string, init: RequestInit) => Response | Promise<Response>;

/** Thân route: bản ra của lõi + mã hàng cùng thứ tự để báo «Quan tâm» đúng căn. */
export type ThanTrang = ThanTrangKhach & { listingIds: string[] };

/**
 * Chỉ 404 là link không còn mở được (null). Lỗi máy chủ hay lỗi mạng NÉM — trang báo «thử lại sau», không báo nhầm là link
 * đã tắt (Ngoài-4 hàng 35).
 */
export async function docThan(code: string, goi: GoiApi): Promise<ThanTrang | null> {
  const r = await goi(`http://quy-hang.local/api/v1/public/shares/${encodeURIComponent(code)}`, { cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`route đọc trang khách trả ${r.status}`);
  return (await r.json()) as ThanTrang;
}

export type KetQuaDoc = { kieu: "mo"; than: ThanTrang } | { kieu: "khong-con" } | { kieu: "loi-tam" };

export async function docTrang(code: string, goi: GoiApi): Promise<KetQuaDoc> {
  try {
    const than = await docThan(code, goi);
    return than ? { kieu: "mo", than } : { kieu: "khong-con" };
  } catch {
    return { kieu: "loi-tam" };
  }
}
