// Đọc thân trang khách qua route công khai của API (hàng 35) — trong cùng tiến trình, không lưu đệm (giá và trạng thái sống).
import type { ThanTrangKhach } from "@quy-hang/core/sharing";

export type GoiApi = (url: string, init: RequestInit) => Response | Promise<Response>;

/** Thân route: bản ra của lõi + mã hàng cùng thứ tự để báo «Quan tâm» đúng căn. */
export type ThanTrang = ThanTrangKhach & { listingIds: string[] };

export async function docThan(code: string, goi: GoiApi): Promise<ThanTrang | null> {
  const r = await goi(`http://quy-hang.local/api/v1/public/shares/${encodeURIComponent(code)}`, { cache: "no-store" });
  if (!r.ok) return null;
  return (await r.json()) as ThanTrang;
}
