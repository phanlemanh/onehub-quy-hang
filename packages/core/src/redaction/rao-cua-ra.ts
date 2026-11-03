/**
 * Rào cửa ra (hàng 31, luật 23): mỗi trang hay route có URL của một cửa ra phải có bài kiểm rò rỉ của riêng nó — một tệp
 * `*.ro-ri.test.ts(x)` gọi `canMoi` và `timRoRi` trên mã nguồn trang. Rào đọc cây thư mục nên chỉ bài kiểm nhập tệp này;
 * mã chạy trên trình duyệt không nhập nó (không có trong `index.ts`).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { TIEN_TO_CUA_RA } from "./cua-ra";

const TRANG = /^(page|route)\.(tsx?|jsx?)$/;
const TEP_KIEM = /\.ro-ri\.test\.tsx?$/;

/** Đường tương đối từ gốc app (`apps/web/src/app`) hay gốc route công khai (`packages/api/src/public`) → URL. */
export function urlCuaTrang(duongTuGoc: string, goc: "web" | "api"): string {
  const doan = duongTuGoc.split(/[\\/]/).filter((d) => d && !TRANG.test(d) && !/^\(.*\)$/.test(d));
  const url = `/${doan.join("/")}`;
  return goc === "api" ? `/api/v1/public${url === "/" ? "" : url}` : url;
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
  const nhap = [...ma.matchAll(/^import .* from "([^"]+)";?$/gm)].map((m) => m[1]);
  return /<Placeholder\b/.test(ma) && nhap.length > 0 && nhap.every((n) => n === "@/components/shell/placeholder");
};

/** Tệp kiểm đạt khi gọi cả `canMoi` và `timRoRi` — tệp rỗng hay chỉ có tên không tính. */
const tepKiemDat = (p: string) => {
  const ma = readFileSync(p, "utf8");
  return /\bcanMoi\s*\(/.test(ma) && /\btimRoRi\s*\(/.test(ma);
};

/**
 * Trang cửa ra chưa có bài kiểm rò rỉ đạt, đọc ở `<goc>/apps/web/src/app` và `<goc>/packages/api/src/public`. Một trang
 * đạt khi thư mục của nó, hay một thư mục cha tới gốc của nhánh, có tệp kiểm đạt.
 */
export function timCuaRaThieuKiem(goc: string): { url: string; tep: string }[] {
  const thieu: { url: string; tep: string }[] = [];
  const nhanh: [string, "web" | "api"][] = [
    [join(goc, "apps", "web", "src", "app"), "web"],
    [join(goc, "packages", "api", "src", "public"), "api"],
  ];
  for (const [gocNhanh, loai] of nhanh) {
    const tep = duyet(gocNhanh);
    const thuMucCoKiem = new Set(tep.filter((p) => TEP_KIEM.test(p) && tepKiemDat(p)).map((p) => p.slice(0, p.lastIndexOf(sep))));
    for (const p of tep) {
      const ten = p.slice(p.lastIndexOf(sep) + 1);
      if (!TRANG.test(ten)) continue;
      const url = urlCuaTrang(relative(gocNhanh, p), loai);
      if (!laCuaRa(url) || laChoGiu(p)) continue;
      let d = p.slice(0, p.lastIndexOf(sep));
      let dat = false;
      while (d.length >= gocNhanh.length) {
        if (thuMucCoKiem.has(d)) {
          dat = true;
          break;
        }
        d = d.slice(0, d.lastIndexOf(sep));
      }
      if (!dat) thieu.push({ url, tep: relative(goc, p) });
    }
  }
  return thieu;
}
