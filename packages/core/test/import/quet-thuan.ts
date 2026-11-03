/**
 * Bộ quét «lõi nhập không I/O, không AI» (AC-10): lõi chạy như nhau ở trình duyệt và máy chủ, nên mã dưới
 * `src/import` chỉ nhập đường tương đối trong `packages/core/src`, không gọi mạng, không đọc môi trường, không đọc giờ máy.
 */
import { posix } from "node:path";

export type ViPham = { tep: string; loi: string };

const LUAT: [RegExp, string][] = [
  [/\bimport\s*\(/, "nhập động"],
  [/\brequire\s*\(/, "require"],
  [/\bfetch\s*\(/, "gọi mạng (fetch)"],
  [/\bprocess\s*\./, "đọc process"],
  [/\bDate\.now\s*\(/, "đọc giờ máy (Date.now)"],
  [/\bnew\s+Date\s*\(\s*\)/, "đọc giờ máy (new Date())"],
  [/\bnew\s+Date\b(?!\s*\()/, "đọc giờ máy (new Date)"],
];

/** Quét một tệp mã. `duong` là đường của tệp tính từ `packages/core/src` (vd `import/plan.ts`). */
export function quetThuan(duong: string, chu: string): ViPham[] {
  const out: ViPham[] = [];
  for (const m of chu.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm)) {
    const dich = (m[1] ?? m[2])!;
    if (!dich.startsWith(".")) out.push({ tep: duong, loi: `nhập «${dich}» — chỉ nhận đường tương đối trong packages/core/src` });
    else if (posix.normalize(posix.join(posix.dirname(duong), dich)).startsWith("..")) out.push({ tep: duong, loi: `nhập «${dich}» ra ngoài packages/core/src` });
  }
  for (const [re, ten] of LUAT) if (re.test(chu)) out.push({ tep: duong, loi: ten });
  return out;
}
