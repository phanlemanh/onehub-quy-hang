// Rào route công khai (hàng 35, luật đợt 39 — nhánh «H-5» thu khỏi hàng 31): đọc danh sách route THẬT đã đăng ký trên app
// Hono, không đoán từ chữ trong mã. Route dưới `/api/v1/public/` nào không có tệp `*.ro-ri.test.ts` dưới `packages/api/src`
// nêu đúng đường của nó (chuỗi đường Hono, vd `/api/v1/public/shares/:code`) thì rào trả route ấy.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const TIEN_TO_CONG_KHAI = "/api/v1/public/";

type CoRoute = { routes: readonly { method: string; path: string }[] };

/** Route công khai đã đăng ký (bỏ trùng và route trung gian `ALL`). */
export function routeCongKhai(app: CoRoute): { method: string; path: string }[] {
  const thay = new Set<string>();
  const ra: { method: string; path: string }[] = [];
  for (const r of app.routes) {
    if (!r.path.startsWith(TIEN_TO_CONG_KHAI) || r.method === "ALL") continue;
    const k = `${r.method} ${r.path}`;
    if (thay.has(k)) continue;
    thay.add(k);
    ra.push({ method: r.method, path: r.path });
  }
  return ra;
}

function tepRoRi(goc: string): string[] {
  const ra: string[] = [];
  const di = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) di(p);
      else if (/\.ro-ri\.test\.ts$/.test(e.name)) ra.push(p);
    }
  };
  di(goc);
  return ra;
}

/** Route công khai chưa có bài rò rỉ nêu đúng đường; `gocSrc` là thư mục `packages/api/src`. */
export function timRouteThieuKiem(app: CoRoute, gocSrc: string): { method: string; path: string }[] {
  const chu = tepRoRi(gocSrc).map((t) => readFileSync(t, "utf8"));
  return routeCongKhai(app).filter((r) => !chu.some((c) => c.includes(`"${r.path}"`) || c.includes(`\`${r.path}\``)));
}
