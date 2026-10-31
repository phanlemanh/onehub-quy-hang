/** Hàm gọi API của trình duyệt: `fetch` cùng gốc, cookie phiên và cookie sàn đi theo. Lỗi mạng ném ra = mất mạng. */
import type { Goi } from "./types";

export const goiFetch: Goi = async (method, path, body) => {
  const r = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
};
