// App API thật cho bài rò rỉ của rào route: route công khai đọc qua nguồn bài truyền vào, nên pool ở đây là pool CẤM — chạm
// vào là ném (bài cũng chứng route không đọc cơ sở dữ liệu ngoài nguồn). Phiên giả. Không phải tệp test — rào và bài cùng
// dựng app từ đây.
import type pg from "pg";
import { createApi } from "../app";
import type { NguonCongKhai } from "./store";

const poolCam = new Proxy({} as pg.Pool, {
  get(_t, k) {
    if (k === "then") return undefined;
    throw new Error(`bài rò rỉ chạm pool (${String(k)}) — route công khai phải đọc qua nguồn`);
  },
});

export function dungAppThu(nguon?: NguonCongKhai) {
  return createApi({
    appPool: poolCam,
    identityPool: poolCam,
    auth: { handler: () => new Response(), api: {} } as never,
    ...(nguon ? { nguonCongKhai: nguon } : {}),
  });
}
