// Mở đúng hàng đợi từ cột thứ hai (hồ sơ va-he-bo-cuc): `/today?nhom=<mã>` — Hôm nay mở nhóm, chọn dòng `nhom:<mã>`,
// cuộn tới, như đường mở lead của hàng 26 (mo-lead.ts). Nhóm không có chỗ thì báo một dòng. Mô-đun thuần, không đọc DOM.
import { type BoNhom } from "@quy-hang/core/today";

/** Khuôn mã nhóm của lõi (packages/core/src/today/kiem.ts) — tham số sai khuôn bị bỏ qua. */
const MA_NHOM = /^[a-z][a-z0-9_]{1,39}$/;

export const KHONG_CO_NHOM = "Không có hàng đợi này ở Hôm nay của bạn";
export const baoNhomTrong = (nhan: string) => `Hôm nay không có việc ở «${nhan}»`;
export const baoChiDauChu = (nhan: string) => `Hàng đợi «${nhan}» chỉ có ở Hôm nay của đầu chủ`;

type NhomBo = Pick<BoNhom[number], "code" | "label" | "enabled">;

/** Mã nhóm từ chuỗi tham số; vắng, sai khuôn, hay có `lead` (đường lead thắng) → null. */
export function docNhomThamSo(qs: string | URLSearchParams): string | null {
  const q = typeof qs === "string" ? new URLSearchParams(qs) : qs;
  if (q.has("lead")) return null;
  const v = q.get("nhom");
  return v && MA_NHOM.test(v) ? v : null;
}

const nhomBat = (bo: readonly NhomBo[], ma: string) => bo.find((n) => n.code === ma && n.enabled) ?? null;

/**
 * Chỗ của nhóm trên Hôm nay của đầu chủ. `dangHien` là các nhóm lưới đang hiện (nhóm có việc); `null` khi lưới còn
 * đang tải — khi ấy chưa có kết quả, để không báo nhầm «không có việc» lúc lưới còn rỗng.
 */
export function timNhom(o: {
  bo: readonly NhomBo[];
  dangHien: readonly { nhom: { code: string } }[] | null;
  ma: string;
}): { nhom: string; dong: string } | { bao: string } | null {
  if (o.dangHien === null) return null;
  const n = nhomBat(o.bo, o.ma);
  if (!n) return { bao: KHONG_CO_NHOM };
  return o.dangHien.some((g) => g.nhom.code === o.ma) ? { nhom: o.ma, dong: `nhom:${o.ma}` } : { bao: baoNhomTrong(n.label) };
}

/** Dòng báo cho người không có Hôm nay của đầu chủ (Hỏi-1: báo rõ); mã sai khuôn → null. */
export function baoNgoaiDauChu(ma: string | null, bo: readonly NhomBo[]): string | null {
  if (ma === null || !MA_NHOM.test(ma)) return null;
  const n = nhomBat(bo, ma);
  return n ? baoChiDauChu(n.label) : KHONG_CO_NHOM;
}

export type MucCot = { label: string; href: string };

/** Mục Hôm nay của cột thứ hai: mỗi nhóm đang bật một mục trỏ `/today?nhom=<mã>`. */
export function mucHomNay(bo: readonly NhomBo[]): MucCot[] {
  return bo.filter((n) => n.enabled).map((n) => ({ label: n.label, href: `/today?nhom=${n.code}` }));
}

/** Mục đang chọn của một danh sách mục cột: khớp đường dẫn, và mục mang `?nhom` thì khớp cả mã nhóm của địa chỉ. */
export function mucDangChon(items: readonly MucCot[], path: string, qs: string | URLSearchParams): string | null {
  const ma = docNhomThamSo(qs);
  for (const { href } of items) {
    const [duong, thamSo] = href.split("?");
    if (duong !== path) continue;
    if (!thamSo) return href;
    if (ma !== null && new URLSearchParams(thamSo).get("nhom") === ma) return href;
  }
  return null;
}
