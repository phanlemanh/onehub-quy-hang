/**
 * Rào cửa ra (hàng 31, luật 23): mỗi trang hay route có URL của một cửa ra phải có bài kiểm rò rỉ của riêng nó — một tệp
 * `*.ro-ri.test.ts(x)` gọi `canMoi` và `timRoRi` trên mã nguồn trang. Trang web: URL suy từ cây `apps/web/src/app`. Route
 * API: kho khai đường đầy đủ trong mã (`path: "/api/v1/…"` của các tệp `routes.ts`), nên rào đọc chính đường khai ấy. Rào
 * đọc cây thư mục nên chỉ bài kiểm nhập tệp này; mã chạy trên trình duyệt không nhập nó (không có trong `index.ts`).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { TIEN_TO_CUA_RA } from "./cua-ra";

const TRANG = /^(page|route)\.(tsx?|jsx?)$/;
const TEP_KIEM = /\.ro-ri\.test\.tsx?$/;

/** Đường tương đối từ gốc app (`apps/web/src/app`) → URL: bỏ nhóm route `(…)` và tên tệp trang. */
export function urlCuaTrang(duongTuGoc: string): string {
  const doan = duongTuGoc.split(/[\\/]/).filter((d) => d && !TRANG.test(d) && !/^\(.*\)$/.test(d));
  return `/${doan.join("/")}`;
}

/** Đường API khai trong một tệp mã: chuỗi bắt đầu `/api/v1/` đứng sau `path:` hay làm đối số đầu của `.get(`, `.post(`… */
export function duongApiKhai(ma: string): string[] {
  const ra = new Set<string>();
  for (const m of ma.matchAll(/(?:\bpath\s*:\s*|\.(?:get|post|put|patch|delete|all|on|route)\(\s*)["'`](\/api\/v1\/[^"'`]*)["'`]/g)) ra.add(m[1]!);
  return [...ra];
}

const laCuaRa = (url: string) => TIEN_TO_CUA_RA.some((t) => url === t.replace(/\/$/, "") || url.startsWith(t));

function duyet(thuMuc: string): string[] {
  if (!existsSync(thuMuc)) return [];
  const ra: string[] = [];
  for (const ten of readdirSync(thuMuc)) {
    const p = join(thuMuc, ten);
    if (statSync(p).isDirectory()) ra.push(...duyet(p));
    else ra.push(p);
  }
  return ra;
}

/**
 * Trang chỗ giữ của vỏ ứng dụng (chỉ nhập và dựng `Placeholder`) chưa cầm dữ liệu nào nên chưa phải cửa ra mở; hàng dựng
 * trang thật thay nó, và từ lúc ấy rào bắt.
 */
const laChoGiu = (p: string) => {
  const ma = readFileSync(p, "utf8");
  // Mọi kiểu nhập: một dòng, nhiều dòng, nhập chỉ để chạy (`import "x"`), nhập động, require.
  const nhap = [...ma.matchAll(/\bimport\s*["']([^"']+)["']|\bimport\s+[^;"']*?\bfrom\s*["']([^"']+)["']|\b(?:import|require)\s*\(\s*["']([^"']+)["']/g)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
  return /<Placeholder\b/.test(ma) && nhap.length > 0 && nhap.every((n) => n === "@/components/shell/placeholder");
};

/** Tệp kiểm đạt khi gọi cả `canMoi` và `timRoRi` — tệp rỗng hay chỉ có tên không tính. */
const tepKiemDat = (p: string) => {
  const ma = readFileSync(p, "utf8");
  return /\bcanMoi\s*\(/.test(ma) && /\btimRoRi\s*\(/.test(ma);
};

/** Thư mục `tep` hay một thư mục cha tới `gocNhanh` có tệp kiểm đạt. */
function coKiem(tep: string, gocNhanh: string, thuMucCoKiem: ReadonlySet<string>): boolean {
  let d = tep.slice(0, tep.lastIndexOf(sep));
  while (d.length >= gocNhanh.length) {
    if (thuMucCoKiem.has(d)) return true;
    d = d.slice(0, d.lastIndexOf(sep));
  }
  return false;
}

const thuMucKiem = (tep: readonly string[]) =>
  new Set(tep.filter((p) => TEP_KIEM.test(p) && tepKiemDat(p)).map((p) => p.slice(0, p.lastIndexOf(sep))));

/**
 * Cửa ra chưa có bài kiểm rò rỉ đạt. Trang web đọc ở `<goc>/apps/web/src/app`; route API đọc mọi tệp mã dưới
 * `<goc>/packages/api/src` khai đường bắt đầu bằng một tiền tố cửa ra. Một cửa ra đạt khi thư mục của tệp, hay một thư mục
 * cha tới gốc của nhánh, có tệp kiểm đạt.
 */
export function timCuaRaThieuKiem(goc: string): { url: string; tep: string }[] {
  const thieu: { url: string; tep: string }[] = [];
  const gocWeb = join(goc, "apps", "web", "src", "app");
  const tepWeb = duyet(gocWeb);
  const kiemWeb = thuMucKiem(tepWeb);
  for (const p of tepWeb) {
    if (!TRANG.test(p.slice(p.lastIndexOf(sep) + 1))) continue;
    const url = urlCuaTrang(relative(gocWeb, p));
    if (!laCuaRa(url) || laChoGiu(p)) continue;
    if (!coKiem(p, gocWeb, kiemWeb)) thieu.push({ url, tep: relative(goc, p) });
  }
  const gocApi = join(goc, "packages", "api", "src");
  const tepApi = duyet(gocApi);
  const kiemApi = thuMucKiem(tepApi);
  for (const p of tepApi) {
    if (!/\.(ts|tsx|js|mjs)$/.test(p) || /\.test\.[cm]?[jt]sx?$/.test(p)) continue;
    for (const url of duongApiKhai(readFileSync(p, "utf8"))) {
      if (laCuaRa(url) && !coKiem(p, gocApi, kiemApi)) thieu.push({ url, tep: relative(goc, p) });
    }
  }
  return thieu;
}
