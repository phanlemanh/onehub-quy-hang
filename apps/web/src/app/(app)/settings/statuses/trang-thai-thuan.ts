// Phần thuần của màn Trạng thái (hàng 46): bộ nhãn của màn ↔ thân `PUT /api/v1/company/statuses`, lỗi từng ô, câu hỏi nhãn
// thay khi gỡ nhãn đang dùng. Kiểm chữ bằng đúng hàm lõi máy chủ dùng (`kiemChuNhan`, `chuSo`, nhãn mặc định của lõi), để
// màn khoá «Lưu» đúng khi máy chủ sẽ từ chối.
import { kiemChuNhan } from "@quy-hang/core/labels";
import { STANDARD_STATUSES, type StandardStatus } from "@quy-hang/core/listing";
import { NHAN_TRANG_THAI_MAC_DINH, TRAN_NHAN_MOI_NEO, chuSo, type NhanGui } from "@quy-hang/core/statuses";

/** Một nhãn riêng như `GET /api/v1/company/statuses` trả. */
export type DongNhanMan = { code: string; label: string; inUse: number };
export type DongTrangThaiMan = { status: StandardStatus; default: string; labels: DongNhanMan[] };
export type BoTrangThaiMan = { statuses: DongTrangThaiMan[] };

/** Một ô nhãn trên màn: `code` vắng = nhãn mới chưa lưu; `go` = đã bấm gỡ trong lượt này. */
export type ONhan = { khoa: string; code?: string; anchor: StandardStatus; label: string; inUse: number; go: boolean };
/** Màn: các ô, và nhãn thay đã chọn cho từng mã bị gỡ (`undefined` = chưa chọn, `null` = nhãn mặc định). */
export type ManTrangThai = { o: ONhan[]; thay: Record<string, string | null | undefined>; dem: number };

export function manBanDau(bo: BoTrangThaiMan): ManTrangThai {
  return {
    o: bo.statuses.flatMap((s) => s.labels.map((l) => ({ khoa: l.code, code: l.code, anchor: s.status, label: l.label, inUse: l.inUse, go: false }))),
    thay: {},
    dem: 0,
  };
}

const conSong = (o: ONhan) => !o.go;
export const oCuaNeo = (m: ManTrangThai, s: StandardStatus) => m.o.filter((o) => o.anchor === s && conSong(o));

/** Nhóm còn chỗ thêm khi chưa đủ 3 nhãn còn sống (sổ #21). */
export const coTheThem = (m: ManTrangThai, s: StandardStatus) => oCuaNeo(m, s).length < TRAN_NHAN_MOI_NEO;

export function themNhan(m: ManTrangThai, s: StandardStatus): ManTrangThai {
  if (!coTheThem(m, s)) return m;
  return { ...m, dem: m.dem + 1, o: [...m.o, { khoa: `moi-${m.dem + 1}`, anchor: s, label: "", inUse: 0, go: false }] };
}

export const doiChu = (m: ManTrangThai, khoa: string, label: string): ManTrangThai => ({ ...m, o: m.o.map((o) => (o.khoa === khoa ? { ...o, label } : o)) });

/** Gỡ: nhãn mới chưa lưu thì bỏ hẳn; nhãn đã lưu thì đánh dấu gỡ (Lưu mới gỡ thật). */
export function goNhan(m: ManTrangThai, khoa: string): ManTrangThai {
  const o = m.o.find((x) => x.khoa === khoa);
  if (!o) return m;
  if (!o.code) return { ...m, o: m.o.filter((x) => x.khoa !== khoa) };
  return { ...m, o: m.o.map((x) => (x.khoa === khoa ? { ...x, go: true } : x)) };
}

/** Bỏ gỡ (huỷ hộp hỏi): nhãn còn nguyên, lựa chọn thay bị quên. */
export function boGo(m: ManTrangThai, khoa: string): ManTrangThai {
  const thay = { ...m.thay };
  const o = m.o.find((x) => x.khoa === khoa);
  if (o?.code) delete thay[o.code];
  return { ...m, thay, o: m.o.map((x) => (x.khoa === khoa ? { ...x, go: false } : x)) };
}

/** Gỡ một nhãn đang có căn mang thì phải hỏi nhãn thay. */
export const canHoi = (o: ONhan) => o.go && !!o.code && o.inUse > 0;

export const cauHoi = (o: ONhan) => `${o.inUse} căn đang là «${o.label}». Chuyển chúng sang:`;

/** Lựa chọn nhãn thay: nhãn mặc định của neo, rồi các nhãn ĐÃ LƯU còn sống cùng neo (nhãn mới chưa có mã). */
export function luaChonThay(m: ManTrangThai, khoa: string): { value: string | null; label: string }[] {
  const o = m.o.find((x) => x.khoa === khoa);
  if (!o) return [];
  return [
    { value: null, label: NHAN_TRANG_THAI_MAC_DINH[o.anchor] },
    ...oCuaNeo(m, o.anchor)
      .filter((x) => x.code && x.khoa !== khoa)
      .map((x) => ({ value: x.code as string, label: x.label.trim() })),
  ];
}

export const chonThay = (m: ManTrangThai, code: string, thay: string | null): ManTrangThai => ({ ...m, thay: { ...m.thay, [code]: thay } });

/** Lỗi của một ô còn sống; ô mới rỗng không lỗi (bị bỏ khi lưu). */
export function loiCuaO(m: ManTrangThai, khoa: string): string | null {
  const o = m.o.find((x) => x.khoa === khoa);
  if (!o || o.go) return null;
  if (!o.code && o.label.trim() === "") return null;
  const kq = kiemChuNhan("o", o.label);
  if (!kq.ok) return kq.loi.slice(kq.loi.indexOf(":") + 1).trim().replace(/^./, (c) => c.toUpperCase());
  const mac = STANDARD_STATUSES.find((s) => chuSo(NHAN_TRANG_THAI_MAC_DINH[s]) === chuSo(o.label));
  if (mac) return `Trùng tên trạng thái «${NHAN_TRANG_THAI_MAC_DINH[mac]}»`;
  const kia = m.o.find((x) => x !== o && conSong(x) && x.label.trim() && chuSo(x.label) === chuSo(o.label));
  if (kia) return `Trùng tên nhãn «${kia.label.trim()}»`;
  return null;
}

/** Thân lưu: đủ bộ nhãn còn sống (ô mới rỗng bị bỏ), cộng nhãn thay cho mã bị gỡ mà còn căn mang. */
export function thanLuu(m: ManTrangThai): { labels: NhanGui[]; replace: Record<string, string | null> } {
  return {
    labels: m.o
      .filter((o) => conSong(o) && (o.code || o.label.trim()))
      .map((o) => (o.code ? { code: o.code, label: o.label.trim(), anchor: o.anchor } : { label: o.label.trim(), anchor: o.anchor })),
    replace: Object.fromEntries(m.o.filter(canHoi).map((o) => [o.code as string, m.thay[o.code as string] ?? null])),
  };
}

/** Lưu được khi không ô nào lỗi, ô đã lưu không bị xoá trắng, và mọi nhãn gỡ đang dùng đã chọn nhãn thay. */
export function coTheLuu(m: ManTrangThai): boolean {
  if (m.o.some((o) => loiCuaO(m, o.khoa) !== null)) return false;
  if (m.o.some((o) => conSong(o) && o.code && !o.label.trim())) return false;
  return m.o.filter(canHoi).every((o) => m.thay[o.code as string] !== undefined);
}
