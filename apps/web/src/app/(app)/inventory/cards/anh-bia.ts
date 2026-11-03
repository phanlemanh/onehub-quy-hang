/**
 * Ảnh bìa của thẻ (hàng 32). Kho trên máy không chở ảnh: thẻ hỏi danh sách ảnh của căn ở API (hàng 18) khi tới gần màn,
 * lấy ảnh đầu của `anhRaNgoai` của lõi — chỉ ảnh được ra khỏi sàn (ngăn Gửi được), bìa đầu — và mở bản nhỏ qua đường
 * của API (API kiểm quyền). Mỗi căn hỏi một lần mỗi trang; lỗi hay mất mạng ra `null` (ô ảnh trống), không ném; mất mạng thì không nhớ kết quả.
 */
import { anhRaNgoai, type UnitPhoto } from "@quy-hang/core/photos";

const BASE = "/api/v1/units/photos";

export function taoNguonAnhBia(f: typeof fetch = (...a) => fetch(...a), o: { chon?: (ds: UnitPhoto[]) => UnitPhoto[] } = {}) {
  const chon = o.chon ?? ((ds: UnitPhoto[]) => anhRaNgoai(ds));
  const nho = new Map<string, Promise<string | null>>();

  async function hoi(toa: string, ma: string): Promise<string | null> {
    const r = await f(`${BASE}?${new URLSearchParams({ toa, ma })}`, { cache: "no-store" });
    if (!r.ok) return null;
    const than = (await r.json()) as { anh?: UnitPhoto[] };
    const bia = chon(than.anh ?? [])[0];
    return bia ? `${BASE}/${encodeURIComponent(bia.id)}/thumb` : null;
  }

  return {
    /** Đường ảnh bìa, hay `null` khi căn chưa mã, không ảnh được gửi, hay không tải được. */
    anhBia(toa: string, ma: string | null): Promise<string | null> {
      if (!ma) return Promise.resolve(null);
      const khoa = `${toa}\u0000${ma}`;
      let p = nho.get(khoa);
      if (!p) {
        p = hoi(toa, ma).catch(() => {
          // Mất mạng: không nhớ, lần sau (có mạng lại) hỏi lại.
          nho.delete(khoa);
          return null;
        });
        nho.set(khoa, p);
      }
      return p;
    },
  };
}
