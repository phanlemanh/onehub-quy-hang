// Rào route công khai (hàng 35, luật đợt 39; Ngoài-8 hàng 35 làm lại ở hàng 36): đọc danh sách route THẬT đã đăng ký trên
// app Hono. Mỗi route dưới `/api/v1/public/` phải có một bài rò rỉ khai bằng `khaiBaiRoRi(method, path, chay)` trong một tệp
// `*.ro-ri.test.ts`, và bài ấy phải GỌI route trên app mà rào dựng cho nó — nhắc chuỗi đường trong chú thích không được tính.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { NguonCongKhai } from "./store";

export const TIEN_TO_CONG_KHAI = "/api/v1/public/";

type CoRoute = { routes: readonly { method: string; path: string }[] };
export type Route = { method: string; path: string };
/** Gọi app mà rào dựng với nguồn đã cho; rào ghi lại mọi lời gọi để biết bài có chạm route không. */
export type GoiApp = (url: string, init?: RequestInit) => Promise<Response>;
export type MoApp = (nguon: NguonCongKhai) => GoiApp;
export type BaiRoRi = Route & { chay: (moApp: MoApp) => Promise<void> };

const SO_BAI: BaiRoRi[] = [];

/** Khai bài rò rỉ cho một route công khai; `chay` nhận `moApp` và phải gọi chính route ấy qua app đó. */
export function khaiBaiRoRi(method: string, path: string, chay: BaiRoRi["chay"]): void {
  SO_BAI.push({ method, path, chay });
}

export const baiDaKhai = (): readonly BaiRoRi[] => SO_BAI;

/** Route công khai đã đăng ký (bỏ trùng và route trung gian `ALL`). */
export function routeCongKhai(app: CoRoute): Route[] {
  const thay = new Set<string>();
  const ra: Route[] = [];
  for (const r of app.routes) {
    if (!r.path.startsWith(TIEN_TO_CONG_KHAI) || r.method === "ALL") continue;
    const k = `${r.method} ${r.path}`;
    if (thay.has(k)) continue;
    thay.add(k);
    ra.push({ method: r.method, path: r.path });
  }
  return ra;
}

/** Nạp mọi tệp `*.ro-ri.test.ts` dưới `gocSrc` để chúng khai bài vào sổ. */
export async function napTepRoRi(gocSrc: string): Promise<string[]> {
  const ra: string[] = [];
  const di = (d: string) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) di(p);
      else if (/\.ro-ri\.test\.ts$/.test(e.name)) ra.push(p);
    }
  };
  di(gocSrc);
  for (const t of ra) await import(pathToFileURL(t).href);
  return ra;
}

const khuon = (path: string) => new RegExp(`^${path.replace(/:[^/]+/g, "[^/]+")}$`);

export type RouteHong = Route & { ly_do: string };

/**
 * Route công khai của `app` chưa có bài chạy được: không có bài khai, bài không gọi route, hay bài đỏ. `dungApp` dựng app
 * thật với một nguồn; rào bọc nó để ghi lời gọi.
 */
export async function timRouteThieuKiem(app: CoRoute, dungApp: (nguon: NguonCongKhai) => { request: (url: string, init?: RequestInit) => Response | Promise<Response> }, bai: readonly BaiRoRi[] = baiDaKhai()): Promise<RouteHong[]> {
  const hong: RouteHong[] = [];
  for (const r of routeCongKhai(app)) {
    const cua = bai.filter((b) => b.method === r.method && b.path === r.path);
    if (cua.length === 0) {
      hong.push({ ...r, ly_do: "không có bài khai" });
      continue;
    }
    for (const b of cua) {
      const goi: Route[] = [];
      const moApp: MoApp = (nguon) => {
        const a = dungApp(nguon);
        return (url, init) => {
          goi.push({ method: (init?.method ?? "GET").toUpperCase(), path: new URL(url, "http://rao.local").pathname });
          return Promise.resolve(a.request(url, init));
        };
      };
      try {
        await b.chay(moApp);
      } catch (e) {
        hong.push({ ...r, ly_do: `bài đỏ: ${(e as Error).message}` });
        continue;
      }
      if (!goi.some((g) => g.method === r.method && khuon(r.path).test(g.path))) hong.push({ ...r, ly_do: "bài không gọi route" });
    }
  }
  return hong;
}
