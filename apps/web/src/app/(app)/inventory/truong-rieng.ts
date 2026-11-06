/**
 * Cột trường riêng của Bảng hàng (hàng 47): mỗi trường của hàng còn sống của sàn là một cột «chọn» đứng sau các cột chuẩn.
 * Mã cột `custom:<mã trường>`; giá trị ở dòng là chữ thô của giá trị lưu ("true" · "false" · mã lựa chọn), chữ hiện đọc qua
 * bộ trường của sàn (`TuVung.truongRieng`). Bộ trường `null` = chưa tải (ngoại tuyến, đọc lỗi): không dựng cột, không đụng
 * góc nhìn đã lưu — khác bộ rỗng. Thuần — không React.
 */
import { chuGiaTri, truongCuaDoiTuong, type TruongRieng } from "@quy-hang/core/custom-fields";

export const TIEN_TO_COT_RIENG = "custom:";
export type CotRiengId = `custom:${string}`;
export const laCotRieng = (id: unknown): id is CotRiengId => typeof id === "string" && id.startsWith(TIEN_TO_COT_RIENG) && id.length > TIEN_TO_COT_RIENG.length;
export const maCuaCot = (id: CotRiengId) => id.slice(TIEN_TO_COT_RIENG.length);
export const cotCuaMa = (ma: string): CotRiengId => `${TIEN_TO_COT_RIENG}${ma}`;

/** Bộ trường của sàn ở Bảng hàng: `null` = chưa tải. */
export type BoTruongBang = readonly TruongRieng[] | null | undefined;

export type CotRieng = { id: CotRiengId; label: string; kind: "chon"; size: number; filterHint: string; truong: TruongRieng };

/** Cột của các trường của hàng còn sống, theo thứ tự bộ. Chưa tải → không cột nào. */
export function cotTruongRieng(bo: BoTruongBang): CotRieng[] {
  if (!bo) return [];
  return truongCuaDoiTuong(bo, "listing").map((t) => ({ id: cotCuaMa(t.code), label: t.label, kind: "chon", size: 140, filterHint: "Chọn giá trị", truong: t }));
}

export const truongCuaCot = (id: CotRiengId, bo: BoTruongBang) => (bo ?? []).find((t) => t.code === maCuaCot(id) && t.target === "listing");

/** Giá trị lưu → chữ thô ở dòng. */
export const thoCuaGiaTri = (v: unknown): string | undefined => (typeof v === "boolean" ? String(v) : typeof v === "string" ? v : undefined);
/** Chữ thô ở dòng → giá trị lưu. */
export const giaTriCuaTho = (t: Pick<TruongRieng, "kind">, tho: string): boolean | string => (t.kind === "bool" ? tho === "true" : tho);

/** Các ô custom của một dòng, dựng từ `custom` của bản hàng. */
export function oRiengCuaHang(custom: Readonly<Record<string, unknown>> | null | undefined): Record<CotRiengId, string> {
  const ra: Record<CotRiengId, string> = {};
  for (const [ma, v] of Object.entries(custom ?? {})) {
    const tho = thoCuaGiaTri(v);
    if (tho !== undefined) ra[cotCuaMa(ma)] = tho;
  }
  return ra;
}

/** Chữ hiện của ô: «Có» · «Không» · chữ lựa chọn; trường đã bỏ, chưa tải hay mã lựa chọn không còn → «». */
export function chuOTruongRieng(tho: string | undefined, id: CotRiengId, bo: BoTruongBang): string {
  const t = truongCuaCot(id, bo);
  if (!t || tho === undefined) return "";
  return chuGiaTri(t, giaTriCuaTho(t, tho));
}

/** Lựa chọn của trình sửa ô: các giá trị của trường, rồi «Bỏ trống» (`null`). */
export function luaChonSua(t: TruongRieng): { value: boolean | string | null; label: string }[] {
  const ds: { value: boolean | string | null; label: string }[] =
    t.kind === "bool" ? [{ value: true, label: "Có" }, { value: false, label: "Không" }] : t.options.map((o) => ({ value: o.code, label: o.label }));
  return [...ds, { value: null, label: "Bỏ trống" }];
}

/** Lệnh của trình sửa ô. */
export const lenhTruongRieng = (ma: string, v: boolean | string | null) => ({ type: "custom_changed" as const, payload: { [ma]: v } });

/**
 * Cột và lọc custom của một góc nhìn đã lưu: bộ chưa tải → giữ nguyên; chỉ bỏ id của trường có trong bộ mà đã bỏ (hay
 * không còn trong bộ đã tải đủ).
 */
export function giuCotRieng<T extends { cot: readonly string[]; loc: Readonly<Record<string, string | undefined>> }>(cx: T, bo: BoTruongBang): T {
  if (!bo) return cx;
  const song = new Set(truongCuaDoiTuong(bo, "listing").map((t) => cotCuaMa(t.code)));
  const giu = (id: string) => !laCotRieng(id) || song.has(id);
  return { ...cx, cot: cx.cot.filter(giu), loc: Object.fromEntries(Object.entries(cx.loc).filter(([k]) => giu(k))) };
}
