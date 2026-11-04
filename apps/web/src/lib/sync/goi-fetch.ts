/**
 * Hàm gọi API của trình duyệt: `fetch` cùng gốc, cookie phiên và cookie sàn đi theo. Lỗi mạng ném ra = mất mạng. Mọi lời
 * gọi mang đầu `x-quy-hang-device` — loại máy đọc lúc gọi (thiet-bi.ts, Hỏi-2).
 */
import { thietBiCuaMay, type ThietBi } from "./thiet-bi";
import type { Goi } from "./types";

/** Dựng hàm gọi; bài kiểm tiêm `fetch` và thiết bị, trình duyệt dùng mặc định. */
export function taoGoiFetch(o: { fetch?: typeof fetch; thietBi?: () => ThietBi } = {}): Goi {
  return async (method, path, body) => {
    const f = o.fetch ?? globalThis.fetch;
    const r = await f(path, {
      method,
      credentials: "same-origin",
      headers: { "content-type": "application/json", "x-quy-hang-device": (o.thietBi ?? thietBiCuaMay)() },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: r.status, body: await r.json().catch(() => null) };
  };
}

export const goiFetch: Goi = taoGoiFetch();
