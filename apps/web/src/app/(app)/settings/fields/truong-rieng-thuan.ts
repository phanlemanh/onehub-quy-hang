// Phần thuần của màn Trường riêng (hàng 47): bộ trường của màn ↔ thân `PUT /api/v1/company/fields`, lỗi từng ô, máy dò
// trùng nghĩa. Kiểm bằng đúng hàm lõi máy chủ dùng (`kiemChuNhan`, `doTrungNghia`, `lopTruongRieng`), để màn khoá «Lưu»
// đúng khi máy chủ sẽ từ chối.
import type { ContactType } from "@quy-hang/core/contacts";
import {
  TRAN_LUA_CHON,
  TRAN_TRUONG,
  cauTrungNghia,
  doTrungNghia,
  lopTruongRieng,
  type DoiTuong,
  type KieuTruong,
  type TruongGui,
  type TruongRieng,
} from "@quy-hang/core/custom-fields";
import { headerKey } from "@quy-hang/core/import";
import { kiemChuNhan, type TuVung } from "@quy-hang/core/labels";
import { chuSo } from "@quy-hang/core/statuses";

/** Một lựa chọn trên màn: `code` vắng = lựa chọn mới chưa lưu. */
export type OLuaChon = { khoa: string; code?: string; label: string };
/** Một ô trường: `code` vắng = trường mới chưa lưu; `bo` = đã bấm «Bỏ trường» trong lượt này. */
export type OTruong = {
  khoa: string;
  code?: string;
  target: DoiTuong;
  contactTypes: ContactType[];
  kind: KieuTruong;
  label: string;
  /** Tên đã lưu — để biết trường đã có có đổi tên không (đổi tên mới chạy lại máy dò). */
  labelDaLuu?: string;
  options: OLuaChon[];
  bo: boolean;
};
export type ManTruong = { o: OTruong[]; dem: number };

export function manBanDau(bo: readonly TruongRieng[]): ManTruong {
  return {
    o: bo
      .filter((t) => !t.archived)
      .map((t) => ({
        khoa: t.code,
        code: t.code,
        target: t.target,
        contactTypes: [...t.contactTypes],
        kind: t.kind,
        label: t.label,
        labelDaLuu: t.label,
        options: t.options.map((o) => ({ khoa: `${t.code}.${o.code}`, code: o.code, label: o.label })),
        bo: false,
      })),
    dem: 0,
  };
}

const conSong = (o: OTruong) => !o.bo;
const rong = (o: OTruong) => !o.code && o.label.trim() === "";
export const oCua = (m: ManTruong, target: DoiTuong) => m.o.filter((o) => o.target === target && conSong(o));
const demSong = (m: ManTruong) => m.o.filter((o) => conSong(o) && !rong(o)).length;

/** Còn chỗ thêm khi chưa đủ 20 trường còn sống mỗi sàn (sổ #22, gộp hàng và liên hệ). */
export const coTheThem = (m: ManTruong) => m.o.filter(conSong).length < TRAN_TRUONG;

export function themTruong(m: ManTruong, target: DoiTuong): ManTruong {
  if (!coTheThem(m)) return m;
  const khoa = `moi-${m.dem + 1}`;
  return { ...m, dem: m.dem + 1, o: [...m.o, { khoa, target, contactTypes: [], kind: "bool", label: "", options: [], bo: false }] };
}

const sua = (m: ManTruong, khoa: string, f: (o: OTruong) => OTruong): ManTruong => ({ ...m, o: m.o.map((o) => (o.khoa === khoa ? f(o) : o)) });

export const doiChu = (m: ManTruong, khoa: string, label: string) => sua(m, khoa, (o) => ({ ...o, label }));
/** Kiểu, loại liên hệ chỉ chọn được ở trường mới (Hỏi-3). */
export const doiKieu = (m: ManTruong, khoa: string, kind: KieuTruong) =>
  sua(m, khoa, (o) => (o.code ? o : { ...o, kind, options: kind === "bool" ? [] : o.options.length ? o.options : [{ khoa: `${o.khoa}.1`, label: "" }] }));
export const doiLoai = (m: ManTruong, khoa: string, loai: ContactType, co: boolean) =>
  sua(m, khoa, (o) => (o.code ? o : { ...o, contactTypes: co ? [...new Set([...o.contactTypes, loai])] : o.contactTypes.filter((x) => x !== loai) }));

export const coTheThemLuaChon = (o: OTruong) => o.kind === "single_select" && o.options.length < TRAN_LUA_CHON;
export function themLuaChon(m: ManTruong, khoa: string): ManTruong {
  return sua(m, khoa, (o) => (coTheThemLuaChon(o) ? { ...o, options: [...o.options, { khoa: `${o.khoa}.n${o.options.length + 1}`, label: "" }] } : o));
}
export const doiChuLuaChon = (m: ManTruong, khoa: string, kLc: string, label: string) =>
  sua(m, khoa, (o) => ({ ...o, options: o.options.map((x) => (x.khoa === kLc ? { ...x, label } : x)) }));
/** Chỉ lựa chọn MỚI gỡ được; lựa chọn đã lưu chỉ đổi chữ (Hỏi-3). */
export const goLuaChon = (m: ManTruong, khoa: string, kLc: string) => sua(m, khoa, (o) => ({ ...o, options: o.options.filter((x) => x.khoa !== kLc || !!x.code) }));

/** Bỏ trường: trường mới bỏ hẳn; trường đã lưu đánh dấu (Lưu mới bỏ thật — ẩn, giữ giá trị). */
export function boTruong(m: ManTruong, khoa: string): ManTruong {
  const o = m.o.find((x) => x.khoa === khoa);
  if (!o) return m;
  if (!o.code) return { ...m, o: m.o.filter((x) => x.khoa !== khoa) };
  return sua(m, khoa, (x) => ({ ...x, bo: true }));
}
export const giuTruong = (m: ManTruong, khoa: string) => sua(m, khoa, (x) => ({ ...x, bo: false }));

/** Trường của liên hệ có loại chủ → lớp nguồn: màn hiện huy hiệu «Thông tin chủ nhà». */
export const laNguon = (o: Pick<OTruong, "target" | "contactTypes">) => lopTruongRieng(o.target, o.contactTypes) === "source";

/** Câu máy dò: trường mới, hay trường đã có đổi tên, trùng nghĩa một trường chuẩn. */
export function trungNghia(m: ManTruong, khoa: string, tuVung?: TuVung | null): string | null {
  const o = m.o.find((x) => x.khoa === khoa);
  if (!o || o.bo || !o.label.trim()) return null;
  if (o.code && o.labelDaLuu !== undefined && chuSo(o.labelDaLuu) === chuSo(o.label)) return null;
  const t = doTrungNghia(o.label, o.target, { tuVung });
  return t ? cauTrungNghia(t) : null;
}

const vietHoa = (loi: string) => loi.slice(loi.indexOf(":") + 1).trim().replace(/^./, (c) => c.toUpperCase());

/** Lỗi của một ô trường còn sống (không kể máy dò — có câu riêng); ô mới rỗng không lỗi (bị bỏ khi lưu). */
export function loiCuaO(m: ManTruong, khoa: string): string | null {
  const o = m.o.find((x) => x.khoa === khoa);
  if (!o || o.bo || rong(o)) return null;
  const kq = kiemChuNhan("o", o.label);
  if (!kq.ok) return vietHoa(kq.loi);
  const kia = m.o.find((x) => x !== o && conSong(x) && x.target === o.target && x.label.trim() && headerKey(x.label) === headerKey(o.label));
  if (kia) return `Trùng tên trường «${kia.label.trim()}»`;
  if (o.target === "contact" && o.contactTypes.length === 0) return "Chọn ít nhất một loại liên hệ";
  if (o.kind === "single_select") {
    const lc = o.options.filter((x) => x.code || x.label.trim());
    if (lc.length === 0) return "Chọn một cần ít nhất một lựa chọn";
    for (const x of lc) {
      const c = kiemChuNhan("o", x.label);
      if (!c.ok) return `Lựa chọn: ${vietHoa(c.loi).toLowerCase()}`;
      if (lc.some((y) => y !== x && chuSo(y.label) === chuSo(x.label))) return `Hai lựa chọn trùng chữ «${x.label.trim()}»`;
    }
  }
  return null;
}

/** Thân lưu: trường còn sống (ô mới rỗng bị bỏ), cộng trường đã lưu bị bỏ trong lượt này với `archived: true`. */
export function thanLuu(m: ManTruong): { fields: TruongGui[] } {
  return {
    fields: m.o
      .filter((o) => (o.code ? true : conSong(o) && !rong(o)))
      .map((o) => {
        const options = o.kind === "single_select" ? o.options.filter((x) => x.code || x.label.trim()).map((x) => (x.code ? { code: x.code, label: x.label.trim() } : { label: x.label.trim() })) : [];
        const goc: TruongGui = { ...(o.code ? { code: o.code } : {}), target: o.target, ...(o.target === "contact" ? { contactTypes: [...o.contactTypes] } : {}), kind: o.kind, label: o.label.trim(), options };
        return o.bo ? { ...goc, archived: true } : goc;
      }),
  };
}

/** Lưu được khi không ô nào lỗi hay trùng nghĩa, trường đã lưu không bị xoá trắng, và còn trong trần 20. */
export function coTheLuu(m: ManTruong, tuVung?: TuVung | null): boolean {
  if (m.o.some((o) => loiCuaO(m, o.khoa) !== null || trungNghia(m, o.khoa, tuVung) !== null)) return false;
  if (m.o.some((o) => conSong(o) && o.code && !o.label.trim())) return false;
  return demSong(m) <= TRAN_TRUONG;
}
