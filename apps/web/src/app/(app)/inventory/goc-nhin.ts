/**
 * Góc nhìn của tôi (hàng 14, Tham chiếu §4 «Góc nhìn»): bộ lọc + cột hiện và thứ tự + sắp xếp + cách nhóm, có tên. Lưu
 * trên máy theo người và sàn — góc nhìn ở máy chủ và góc nhìn của đội cần bảng mới, để hàng sau. Chỉ chứa điều kiện lọc
 * trên trường không nguồn, nên không xoá khi đăng xuất. Kho nhận từ ngoài để kiểm bằng `node:test`.
 */
import { COT_MAC_DINH, COT_THEO_ID, type CotId } from "./cot";
import type { BoLocCot, QuySap } from "./loc";
import { CACH_NHOM, NHOM_MAC_DINH, type CachNhom } from "./nhom";

export type CachXem = { loc: BoLocCot; cot: CotId[]; sap: QuySap; nhom: CachNhom };
export type GocNhin = CachXem & { id: string; ten: string; luc: string };

export const CACH_XEM_MAC_DINH: CachXem = { loc: {}, cot: [...COT_MAC_DINH], sap: [], nhom: NHOM_MAC_DINH };
export const TEN_TOI_DA = 60;

/** Kho chữ tối giản — `localStorage` trên trình duyệt, `Map` trong bài kiểm. */
export type KhoChu = { getItem(k: string): string | null; setItem(k: string, v: string): void };

const PHIEN_BAN = 1;
export const khoaGocNhin = (nguoi: string, san: string) => `qh:goc-nhin:v${PHIEN_BAN}:${nguoi}:${san}`;

const laCot = (x: unknown): x is CotId => typeof x === "string" && COT_THEO_ID.has(x as CotId);

function docCachXem(x: Record<string, unknown>): CachXem | null {
  const { loc, cot, sap, nhom } = x;
  if (!loc || typeof loc !== "object" || !Array.isArray(cot) || !Array.isArray(sap)) return null;
  if (!CACH_NHOM.some((c) => c.value === nhom)) return null;
  const locSach: BoLocCot = {};
  for (const [k, v] of Object.entries(loc)) if (laCot(k) && typeof v === "string" && v) locSach[k] = v;
  return {
    loc: locSach,
    cot: cot.filter(laCot),
    sap: sap.filter((q): q is QuySap[number] => !!q && typeof q === "object" && laCot(q.id) && typeof q.desc === "boolean"),
    nhom: nhom as CachNhom,
  };
}

/** Bản ghi hỏng hay phiên bản lạ đọc ra rỗng, không ném. */
export function docGocNhin(kho: KhoChu, nguoi: string, san: string): GocNhin[] {
  let raw: unknown;
  try {
    raw = JSON.parse(kho.getItem(khoaGocNhin(nguoi, san)) ?? "null");
  } catch {
    return [];
  }
  if (!raw || typeof raw !== "object" || (raw as { v?: unknown }).v !== PHIEN_BAN) return [];
  const ds = (raw as { ds?: unknown }).ds;
  if (!Array.isArray(ds)) return [];
  return ds.flatMap((g: Record<string, unknown>) => {
    const cx = g && typeof g === "object" ? docCachXem(g) : null;
    return cx && typeof g.id === "string" && typeof g.ten === "string" ? [{ ...cx, id: g.id, ten: g.ten, luc: String(g.luc ?? "") }] : [];
  });
}

function ghi(kho: KhoChu, nguoi: string, san: string, ds: GocNhin[]) {
  kho.setItem(khoaGocNhin(nguoi, san), JSON.stringify({ v: PHIEN_BAN, ds }));
}

/** Lý do tên không dùng được, hay `null` khi dùng được. `boQua` là id của góc nhìn đang đổi tên. */
export function kiemTen(ds: readonly GocNhin[], ten: string, boQua?: string): string | null {
  const t = ten.trim();
  if (!t) return "Đặt tên cho góc nhìn";
  if (t.length > TEN_TOI_DA) return `Tên dài tối đa ${TEN_TOI_DA} ký tự`;
  if (ds.some((g) => g.id !== boQua && g.ten.trim().toLowerCase() === t.toLowerCase())) return "Đã có góc nhìn tên này";
  return null;
}

type KetQua = { ok: true; gocNhin: GocNhin } | { ok: false; lyDo: string };

export function luuMoi(kho: KhoChu, nguoi: string, san: string, ten: string, cx: CachXem, id: string, luc: string): KetQua {
  const ds = docGocNhin(kho, nguoi, san);
  const lyDo = kiemTen(ds, ten);
  if (lyDo) return { ok: false, lyDo };
  const g: GocNhin = { ...cx, id, ten: ten.trim(), luc };
  ghi(kho, nguoi, san, [...ds, g]);
  return { ok: true, gocNhin: g };
}

export function luuDe(kho: KhoChu, nguoi: string, san: string, id: string, cx: CachXem, luc: string): boolean {
  const ds = docGocNhin(kho, nguoi, san);
  if (!ds.some((g) => g.id === id)) return false;
  ghi(kho, nguoi, san, ds.map((g) => (g.id === id ? { ...g, ...cx, luc } : g)));
  return true;
}

export function doiTen(kho: KhoChu, nguoi: string, san: string, id: string, ten: string): KetQua {
  const ds = docGocNhin(kho, nguoi, san);
  const cu = ds.find((g) => g.id === id);
  if (!cu) return { ok: false, lyDo: "Góc nhìn này không còn" };
  const lyDo = kiemTen(ds, ten, id);
  if (lyDo) return { ok: false, lyDo };
  const g = { ...cu, ten: ten.trim() };
  ghi(kho, nguoi, san, ds.map((x) => (x.id === id ? g : x)));
  return { ok: true, gocNhin: g };
}

export function xoa(kho: KhoChu, nguoi: string, san: string, id: string) {
  ghi(kho, nguoi, san, docGocNhin(kho, nguoi, san).filter((g) => g.id !== id));
}

/** Cách xem hiện tại có khác góc nhìn đã lưu không — so bốn phần, bỏ ô lọc rỗng. */
export function daDoi(a: CachXem, b: CachXem): boolean {
  const sach = (l: BoLocCot) => Object.entries(l).filter(([, v]) => v).sort(([x], [y]) => x.localeCompare(y));
  return (
    JSON.stringify(sach(a.loc)) !== JSON.stringify(sach(b.loc)) ||
    a.cot.join() !== b.cot.join() ||
    JSON.stringify(a.sap) !== JSON.stringify(b.sap) ||
    a.nhom !== b.nhom
  );
}
