/**
 * Bảng hàng dạng thẻ trên điện thoại (hàng 32) — phần thuần: căn nào lên thẻ, chọn được, lọc theo nhu cầu khách (năm mục
 * của Hỏi-1), nhóm theo toà, thẻ lọc. Không React, không mạng: chạy trên kho trên máy như lưới máy tính.
 */
import type { StandardStatus } from "@quy-hang/core/listing";
import type { TuVung } from "@quy-hang/core/labels";
import { CHUA_RO, chuCuaO, type DongBang } from "../cot";

/** Bảng hàng chung (Tham chiếu §4): Đang bán, và Đang giao dịch («Có, không gửi mới được»). */
export const lenThe = (s: StandardStatus): boolean => s === "Active" || s === "Pending";

/**
 * Chữ huy hiệu trạng thái trên ảnh của thẻ (căn Đang giao dịch): nhãn của căn — «Giữ chỗ» khi căn mang nhãn riêng neo vào
 * Đang giao dịch, không thì «Đang giao dịch» (hàng 46). Màu giữ `info-light` của neo.
 */
export const chuTrangThaiThe = (d: DongBang, tv?: TuVung | null): string => chuCuaO(d, "standardStatus", tv);

/** Chọn nhiều là để gửi: chỉ căn Đang bán. */
export const chonDuoc = (d: DongBang): boolean => d.standardStatus === "Active";

/** Nhu cầu khách — ô từ–đến giữ chữ người gõ (giá theo tỷ, diện tích theo m²), ô nhiều giá trị giữ giá trị đã chọn. */
export type NhuCau = {
  giaTu?: string;
  giaDen?: string;
  phongNgu: string[];
  toa: string[];
  dtTu?: string;
  dtDen?: string;
  huong: string[];
};
export const NHU_CAU_RONG: NhuCau = { phongNgu: [], toa: [], huong: [] };

export type MucLoc = "gia" | "phongNgu" | "toa" | "dt" | "huong";
/** Tên mục theo thứ tự trên ngăn lọc. */
export const TEN_MUC: Record<MucLoc, string> = { gia: "Giá", phongNgu: "Phòng ngủ", toa: "Toà", dt: "Diện tích", huong: "Hướng" };

const TY = 1_000_000_000;
const SO = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 });

/** «2,5» và «2.5» đều là 2,5; ô trống hay chữ không phải số là `null` (mục ấy không lọc). */
export function docSo(s?: string): number | null {
  const t = s?.trim().replace(",", ".");
  if (!t || !/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/** Khoảng đã đọc; «từ» lớn hơn «đến» thì đổi chỗ. `null` khi cả hai ô trống. */
function khoang(tu?: string, den?: string): [number, number] | null {
  let a = docSo(tu);
  let b = docSo(den);
  if (a === null && b === null) return null;
  if (a !== null && b !== null && a > b) [a, b] = [b, a];
  return [a ?? -Infinity, b ?? Infinity];
}

const trong = (v: number | null, k: [number, number]) => v !== null && v >= k[0] && v <= k[1];

/**
 * Căn khớp mọi mục đang lọc (giao). Căn thiếu giá trị của một mục đang lọc thì không khớp mục ấy; Phòng ngủ có lựa chọn
 * «Chưa rõ». `boQua` chỉ để bài kiểm dựng bản thiếu một mục (đối chứng đỏ).
 */
export function locNhuCau(dong: readonly DongBang[], nc: NhuCau, boQua: Partial<Record<MucLoc, true>> = {}): DongBang[] {
  const gia = boQua.gia ? null : khoang(nc.giaTu, nc.giaDen);
  const dt = boQua.dt ? null : khoang(nc.dtTu, nc.dtDen);
  const pn = boQua.phongNgu || !nc.phongNgu.length ? null : new Set(nc.phongNgu);
  const toa = boQua.toa || !nc.toa.length ? null : new Set(nc.toa);
  const huong = boQua.huong || !nc.huong.length ? null : new Set(nc.huong);
  return dong.filter(
    (d) =>
      (!gia || trong(d.listPrice === null ? null : d.listPrice / TY, gia)) &&
      (!dt || trong(d.livingArea, dt)) &&
      (!pn || pn.has(d.unitType)) &&
      (!toa || toa.has(d.buildingName)) &&
      (!huong || (d.directionFaces !== null && huong.has(d.directionFaces))),
  );
}

export type NhomToa = { toa: string; dong: DongBang[] };

/** Nhóm theo toà: toà theo lần gặp đầu, căn trong toà giữ thứ tự đầu vào (như lưới máy tính). */
export function nhomTheoToa(dong: readonly DongBang[]): NhomToa[] {
  const m = new Map<string, DongBang[]>();
  for (const d of dong) {
    const ds = m.get(d.buildingName);
    if (ds) ds.push(d);
    else m.set(d.buildingName, [d]);
  }
  return [...m].map(([toa, ds]) => ({ toa, dong: ds }));
}

/** Một dòng của danh sách cuộn ảo: dòng nhóm toà hay một thẻ. */
export type DongDanhSach = { kind: "nhom"; toa: string; so: number } | { kind: "the"; d: DongBang };

export function phang(nhom: readonly NhomToa[]): DongDanhSach[] {
  return nhom.flatMap((n) => [{ kind: "nhom" as const, toa: n.toa, so: n.dong.length }, ...n.dong.map((d) => ({ kind: "the" as const, d }))]);
}

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });
const thuTuPhongNgu = (v: string) => (v === "Studio" ? 0 : v === CHUA_RO ? 1000 : Number.parseInt(v, 10) || 999);

/** Lựa chọn của ba mục nhiều giá trị — giá trị có trong dữ liệu. */
export function luaChonNhuCau(dong: readonly DongBang[]): { phongNgu: string[]; toa: string[]; huong: string[] } {
  const pn = new Set<string>();
  const toa = new Set<string>();
  const huong = new Set<string>();
  for (const d of dong) {
    pn.add(d.unitType);
    toa.add(d.buildingName);
    if (d.directionFaces) huong.add(d.directionFaces);
  }
  return {
    phongNgu: [...pn].sort((a, b) => thuTuPhongNgu(a) - thuTuPhongNgu(b)),
    toa: [...toa].sort(collator.compare),
    huong: [...huong].sort(collator.compare),
  };
}

export type TheLoc = { khoa: string; chu: string };

function chuKhoang(tu: string | undefined, den: string | undefined, donVi: string): string | null {
  const k = khoang(tu, den);
  if (!k) return null;
  const [a, b] = k;
  if (a === -Infinity) return `Đến ${SO.format(b)} ${donVi}`;
  if (b === Infinity) return `Từ ${SO.format(a)} ${donVi}`;
  return `${SO.format(a)}–${SO.format(b)} ${donVi}`;
}

/** Mỗi mục đang lọc thành thẻ lọc, theo thứ tự Giá · Phòng ngủ · Toà · Diện tích · Hướng; mục nhiều giá trị mỗi giá trị một thẻ. */
export function theLoc(nc: NhuCau): TheLoc[] {
  const ra: TheLoc[] = [];
  const gia = chuKhoang(nc.giaTu, nc.giaDen, "tỷ");
  if (gia) ra.push({ khoa: "gia", chu: gia });
  for (const v of nc.phongNgu) ra.push({ khoa: `phongNgu:${v}`, chu: v });
  for (const v of nc.toa) ra.push({ khoa: `toa:${v}`, chu: v });
  const dt = chuKhoang(nc.dtTu, nc.dtDen, "m²");
  if (dt) ra.push({ khoa: "dt", chu: dt });
  for (const v of nc.huong) ra.push({ khoa: `huong:${v}`, chu: v });
  return ra;
}

/** Bỏ đúng một thẻ lọc: khoảng thì bỏ cả hai ô của khoảng, mục nhiều giá trị thì chỉ bỏ giá trị ấy. */
export function boTheLoc(nc: NhuCau, khoa: string): NhuCau {
  if (khoa === "gia") return { ...nc, giaTu: undefined, giaDen: undefined };
  if (khoa === "dt") return { ...nc, dtTu: undefined, dtDen: undefined };
  const i = khoa.indexOf(":");
  const muc = khoa.slice(0, i) as "phongNgu" | "toa" | "huong";
  const v = khoa.slice(i + 1);
  return { ...nc, [muc]: nc[muc].filter((x) => x !== v) };
}

/** Tích hay bỏ một căn; căn không chọn được thì trả lại đúng tập cũ (bản sao). */
export function doiChon(chon: ReadonlySet<string>, d: DongBang): Set<string> {
  const m = new Set(chon);
  if (!chonDuoc(d)) return m;
  if (m.has(d.id)) m.delete(d.id);
  else m.add(d.id);
  return m;
}

/** Giữ lâu một căn: vào chế độ chọn với căn ấy đã tích; căn không chọn được thì không vào (`null`). */
export const batDauChon = (d: DongBang): Set<string> | null => (chonDuoc(d) ? new Set([d.id]) : null);

/** Kho đổi giữa lúc chọn: chỉ giữ căn còn trong kho và còn chọn được. */
export function giuChonHopLe(chon: ReadonlySet<string>, dong: readonly DongBang[]): Set<string> {
  const duoc = new Set(dong.filter(chonDuoc).map((d) => d.id));
  return new Set([...chon].filter((id) => duoc.has(id)));
}
