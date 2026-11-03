/**
 * Rào cửa ra (hàng 31, luật 23): mỗi trang hay route có URL của một cửa ra phải có bài kiểm rò rỉ của riêng nó — một tệp
 * `*.ro-ri.test.ts(x)` gọi `canMoi` và `timRoRi` trên mã nguồn trang. URL suy từ cây `apps/web/src/app`. Route API công
 * khai không thuộc rào này: hàng 35 dựng rào ấy trên danh sách route đã đăng ký của app API (đoán URL từ chữ trong mã luôn
 * sót một kiểu khai). Rào đọc cây thư mục nên chỉ bài kiểm nhập tệp này; mã chạy trên trình duyệt không nhập nó (không
 * có trong `index.ts`).
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

/** Thư mục `tep` hay một thư mục cha tới `gocApp` có tệp kiểm đạt. */
function coKiem(tep: string, gocApp: string, thuMucCoKiem: ReadonlySet<string>): boolean {
  let d = tep.slice(0, tep.lastIndexOf(sep));
  while (d.length >= gocApp.length) {
    if (thuMucCoKiem.has(d)) return true;
    d = d.slice(0, d.lastIndexOf(sep));
  }
  return false;
}

const thuMucKiem = (tep: readonly string[]) =>
  new Set(tep.filter((p) => TEP_KIEM.test(p) && tepKiemDat(p)).map((p) => p.slice(0, p.lastIndexOf(sep))));

/**
 * Trang cửa ra chưa có bài kiểm rò rỉ đạt, đọc ở `<goc>/apps/web/src/app`. Một trang đạt khi thư mục của nó, hay một thư
 * mục cha tới gốc app, có tệp kiểm đạt.
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
  return thieu;
}
