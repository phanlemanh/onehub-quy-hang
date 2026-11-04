/**
 * Giải cấu hình của một sàn (ADR-0018 quyết định 2, 3): mặc định của sổ ⊕ các dòng `{ key, value }` của sàn. Lõi không đọc
 * cơ sở dữ liệu — người gọi đưa dòng vào, luật nhận cấu hình đã giải làm tham số.
 */
import { kiemGiaTri, timDiem } from "./khuon";
import { SO_DIEM, type DiemSo } from "./so";

/** Cấu hình đã giải: khoá → giá trị của các điểm giá trị đơn (không `map`); khoá họ (`labels.field.unitNumber`) có mặt khi sàn đặt. */
export type CauHinhSan = Readonly<Record<string, unknown>>;

const laDiemDon = (d: DiemSo) => d.kieu.loai !== "map" && !d.khoa.includes("<");

function macDinhCua(so: readonly DiemSo[]): CauHinhSan {
  return Object.fromEntries(so.filter(laDiemDon).map((d) => [d.khoa, d.macDinh]));
}

/** Cấu hình của sàn chưa đổi gì — mặc định dựng sẵn của sản phẩm. */
export const CAU_HINH_SAN_MAC_DINH: CauHinhSan = macDinhCua(SO_DIEM);

export type KetQuaGiai = { cauHinh: CauHinhSan; loi: string[] };

/**
 * Dòng hợp lệ thay đúng điểm ấy; dòng hỏng giữ mặc định và thêm một lỗi nêu khoá (một ô hỏng không làm sập luật); khoá
 * lạ thành lỗi; khoá `map` có bộ đọc riêng nên bỏ qua; khoá họ hợp lệ giữ dưới đúng khoá cụ thể.
 */
export function giaiCauHinh(dong: readonly { key: string; value: unknown }[], so: readonly DiemSo[] = SO_DIEM): KetQuaGiai {
  const cauHinh: Record<string, unknown> = { ...macDinhCua(so) };
  const loi: string[] = [];
  const cho: { key: string; value: unknown }[] = [];
  for (const r of dong) {
    const d = timDiem(r.key, so);
    if (!d) loi.push(`${r.key}: không có trong sổ điểm biến thiên`);
    else if (d.kieu.loai !== "map") cho.push(r);
  }
  // Ràng buộc chéo xét trên giá trị đã giải của khoá kia, nên khoá được trỏ tới đặt trước.
  const truoc = (r: { key: string }) => (so.some((d) => d.khongNhoHon === r.key) ? 0 : 1);
  for (const r of [...cho].sort((a, b) => truoc(a) - truoc(b))) {
    const kq = kiemGiaTri(r.key, r.value, cauHinh, so);
    if (kq.ok) cauHinh[r.key] = r.value;
    else loi.push(kq.loi);
  }
  return { cauHinh, loi };
}

/** Số của một điểm trong cấu hình đã giải; điểm không phải số là lỗi của người gọi. */
export function laySo(cauHinh: CauHinhSan, khoa: string): number {
  const v = cauHinh[khoa];
  if (typeof v !== "number") throw new Error(`${khoa}: không phải điểm số trong cấu hình`);
  return v;
}

export function layBool(cauHinh: CauHinhSan, khoa: string): boolean {
  const v = cauHinh[khoa];
  if (typeof v !== "boolean") throw new Error(`${khoa}: không phải điểm có/không trong cấu hình`);
  return v;
}

/** Dòng sổ của một khoá giá trị đơn — cho hằng số đang có lấy mặc định và khoảng. */
export function diemCua(khoa: string): DiemSo {
  const d = SO_DIEM.find((x) => x.khoa === khoa);
  if (!d) throw new Error(`${khoa}: không có trong sổ điểm biến thiên`);
  return d;
}

/** Khoảng của một điểm số. */
export function khoangCua(khoa: string): { min: number; max: number } {
  const k = diemCua(khoa).kieu;
  if (k.loai !== "int" && k.loai !== "decimal") throw new Error(`${khoa}: không phải điểm số`);
  return { min: k.min, max: k.max };
}

export function macDinhSo(khoa: string): number {
  return laySo(CAU_HINH_SAN_MAC_DINH, khoa);
}

export function macDinhBool(khoa: string): boolean {
  return layBool(CAU_HINH_SAN_MAC_DINH, khoa);
}
