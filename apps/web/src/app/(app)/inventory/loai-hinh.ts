/**
 * Loại hình trên Bảng hàng (hàng 79, ADR-0016 quyết định 2): bộ cột và ô đọc từ bảng trường theo loại hình của lõi
 * (`PROPERTY_SUBTYPE_FIELDS`). «Trường không dùng của loại hình là không có, không phải ô trống» — ô ấy để trống, khác «—»
 * của trường dùng mà chưa có số; cột của trường mà không loại hình nào trong dòng đã lọc dùng thì không hiện. Thuần.
 */
import { PROPERTY_SUBTYPE_FIELDS } from "@quy-hang/core";
import { nhanGiaTri, TAP_DONG, type TuVung } from "@quy-hang/core/labels";

/** Loại hình RESO → nhãn mặc định (Tham chiếu §4: căn hộ, nhà phố, biệt thự, đất). */
export const LOAI_HINH: Readonly<Record<string, string>> = TAP_DONG.propertySubType;

/** Dòng chưa biết loại hình (không thấy nguồn) đọc bộ cột như căn hộ — sàn chỉ căn hộ không đổi. */
export const LOAI_MAC_DINH = "Condominium";

/** Cột của Bảng hàng ↔ trường của bảng loại hình. Cột không có ở đây là cột chung, mọi loại hình đều có. */
export const COT_THEO_TRUONG = {
  unitType: "bedroomsTotal",
  livingArea: "livingArea",
  floor: "floor",
  directionFaces: "directionFaces",
  lotSizeArea: "lotSizeArea",
  storiesTotal: "storiesTotal",
  frontageLength: "frontageLength",
  accessRoadWidth: "accessRoadWidth",
} as const;
export type CotLoaiHinh = keyof typeof COT_THEO_TRUONG;

const BANG = PROPERTY_SUBTYPE_FIELDS as Record<string, { fields: readonly string[] }>;

export const laCotLoaiHinh = (id: string): id is CotLoaiHinh => id in COT_THEO_TRUONG;
export const laLoaiHinhBiet = (v: string | null | undefined): v is string => !!v && v in BANG;

/** Loại hình `sub` có dùng trường của cột `id` không. Cột chung luôn dùng; loại hình lạ hay vắng đọc như căn hộ. */
export function loaiDungCot(sub: string | null | undefined, id: string): boolean {
  if (!laCotLoaiHinh(id)) return true;
  const dong = BANG[laLoaiHinhBiet(sub) ? sub : LOAI_MAC_DINH]!;
  return dong.fields.includes(COT_THEO_TRUONG[id]);
}

/** Ô «không có»: dòng biết loại hình và loại hình ấy không dùng trường của cột. Dòng chưa rõ loại hình không bao giờ «không có». */
export const laKhongDung = (d: { propertySubType?: string | null }, id: string) =>
  laLoaiHinhBiet(d.propertySubType) && !loaiDungCot(d.propertySubType, id);

/**
 * Cột loại hình phải ẩn với tập dòng đã lọc: cột mà không loại hình nào có mặt dùng. Tập rỗng đọc như căn hộ (bảng y hôm
 * nay). Cột chung không bao giờ ở đây.
 */
export function cotAnTheoLoaiHinh(dong: readonly { propertySubType?: string | null }[]): Set<CotLoaiHinh> {
  const coMat = new Set(dong.map((d) => (laLoaiHinhBiet(d.propertySubType) ? d.propertySubType : LOAI_MAC_DINH)));
  if (coMat.size === 0) coMat.add(LOAI_MAC_DINH);
  return new Set((Object.keys(COT_THEO_TRUONG) as CotLoaiHinh[]).filter((id) => ![...coMat].some((s) => loaiDungCot(s, id))));
}

/** Có hàng nào khác căn hộ trong dữ liệu của sàn (chưa lọc) — cột Loại hình chỉ hiện khi có, sàn chỉ căn hộ thấy bảng như cũ. */
export const coLoaiKhacCanHo = (dong: readonly { propertySubType?: string | null }[]) =>
  dong.some((d) => laLoaiHinhBiet(d.propertySubType) && d.propertySubType !== LOAI_MAC_DINH);

/** Tiêu đề cột vị trí (Hỏi-1 Cổng Phạm vi): «Toà» khi mọi dòng đã lọc là căn hộ (hay chưa rõ), «Vị trí» khi có loại khác. */
export const tieuDeViTri = (dong: readonly { propertySubType?: string | null }[]) => (coLoaiKhacCanHo(dong) ? "Vị trí" : "Toà");

/**
 * Cột hiện của Bảng hàng: cột người bật (`cot`, giữ thứ tự) trừ cột loại hình mà không loại hình nào trong dòng đã lọc
 * dùng, và trừ cột Loại hình khi dữ liệu của sàn (chưa lọc) chỉ có căn hộ — sàn chỉ căn hộ thấy bảng như trước hàng 79.
 */
export function cotHienTheoLoaiHinh<T extends string>(
  cot: readonly T[],
  dongDaLoc: readonly { propertySubType?: string | null }[],
  dongTatCa: readonly { propertySubType?: string | null }[],
): T[] {
  return cotHienTuBoCot(cot, boCotCua(dongDaLoc), dongTatCa);
}

/** Phần bộ cột đi theo dòng đang xem: cột loại hình bị ẩn và tiêu đề cột vị trí. Giữ cột ẩn, nên bật tắt cột vẫn có tác dụng. */
export type BoCot = { an: readonly CotLoaiHinh[]; viTri: string };

export const boCotCua = (dong: readonly { propertySubType?: string | null }[]): BoCot => ({ an: [...cotAnTheoLoaiHinh(dong)], viTri: tieuDeViTri(dong) });

export function cotHienTuBoCot<T extends string>(cot: readonly T[], boCot: BoCot, dongTatCa: readonly { propertySubType?: string | null }[]): T[] {
  const an = new Set<string>(boCot.an);
  const coLoai = coLoaiKhacCanHo(dongTatCa);
  return cot.filter((id) => !an.has(id) && (id !== "propertySubType" || coLoai));
}

/** Nhãn mặc định của một loại hình; giá trị lạ giữ nguyên chữ RESO. */
export const nhanLoaiHinh = (sub: string) => LOAI_HINH[sub] ?? sub;

/** Chữ hiện của một loại hình: tên riêng của sàn, vắng thì nhãn mặc định (hàng loai-hinh-trong-cach-goi). */
export const tenLoaiHinh = (tv: TuVung | null | undefined, sub: string) => nhanGiaTri(tv, "propertySubType", sub, nhanLoaiHinh(sub));
