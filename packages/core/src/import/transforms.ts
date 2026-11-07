/**
 * Thực đơn phép biến đổi (Kiến trúc «Nhập dữ liệu» §4) — thực đơn ĐÓNG: kế hoạch chỉ chọn phép và tham số; thêm phép mới
 * là thêm mã có test. Mỗi phép là hàm thuần trả một trong bốn dấu (ADR-0011 quyết định 1):
 * - `keep` — ô đọc thẳng ra giá trị chuẩn theo phép và đơn vị của cột (đổi dạng — chữ số sang số đồng, ngày sang ISO —
 *   không tính là sửa);
 * - `fixed` — phải sửa mới đọc được, kèm một câu lý do hiện trên màn;
 * - `needs_person` — máy không tự quyết, kèm lý do;
 * - `blocked` — giá trị phạm luật lõi, không lựa chọn nào trong ô cứu được.
 */
import { buildCatalogIndex, lookupUnit, type CatalogIndex } from "../catalog/lookup";
import { normalizeCode, readUnitCode, UNIT_CODE_RULES } from "../catalog/code-rule";
import type { CatalogData } from "../catalog/types";
import { normalizePhone } from "../access/owner-input";
import { docGia, GIA_TOI_DA, TRIEU, TY } from "../pricing/doc-gia";
import { FEE_ALIASES, fold, lookupAlias, readDirection, STATUS_ALIASES, type CompanyAlias } from "./dictionaries";
import type { StandardField } from "./fields";

export type Cell = string | number | null;
export type Value = string | number | null;

export type Outcome =
  | { mark: "keep"; value: Value; also?: Partial<Record<StandardField, Value>> }
  | { mark: "fixed"; value: Value; reason: string; also?: Partial<Record<StandardField, Value>> }
  | { mark: "needs_person"; reason: string }
  | { mark: "blocked"; reason: string };
export type Mark = Outcome["mark"];
export const MARKS: readonly Mark[] = ["keep", "fixed", "needs_person", "blocked"];

/** Ngữ cảnh chung — không đồng hồ bên trong: `today` đi vào từ ngoài để cùng đầu vào ra cùng kết quả. */
export type ImportContext = {
  /** Ngày hôm nay `YYYY-MM-DD` — ngày sau hôm nay bị chặn. */
  today: string;
  catalog?: CatalogData;
  companyAliases?: readonly CompanyAlias[];
};

export const PRICE_UNITS = ["ty", "trieu", "dong", "auto"] as const;
export const DATE_ORDERS = ["dmy", "mdy", "auto"] as const;
export const AREA_KINDS = ["thong_thuy", "tim_tuong", "unknown"] as const;

export type Transform =
  | { name: "price"; params: { unit: (typeof PRICE_UNITS)[number] } }
  | { name: "fee_condition"; params?: Record<string, never> }
  | { name: "area"; params?: { kind: (typeof AREA_KINDS)[number] } }
  | { name: "unit_code"; params?: Record<string, never> }
  | { name: "floor"; params?: Record<string, never> }
  | { name: "bedrooms"; params?: Record<string, never> }
  | { name: "direction"; params?: Record<string, never> }
  | { name: "status"; params?: Record<string, never> }
  | { name: "date"; params: { order: (typeof DATE_ORDERS)[number] } }
  | { name: "phone"; params?: Record<string, never> }
  | { name: "text"; params?: Record<string, never> };
export type TransformName = Transform["name"];
export const TRANSFORM_NAMES: readonly TransformName[] = [
  "price",
  "fee_condition",
  "area",
  "unit_code",
  "floor",
  "bedrooms",
  "direction",
  "status",
  "date",
  "phone",
  "text",
];

/** Tham số hợp lệ của từng phép: khoá → giá trị nhận. Khoá lạ bị từ chối ở `validatePlan`. */
export const TRANSFORM_PARAMS: Readonly<Record<TransformName, Readonly<Record<string, readonly string[]>>>> = {
  price: { unit: PRICE_UNITS },
  fee_condition: {},
  area: { kind: AREA_KINDS },
  unit_code: {},
  floor: {},
  bedrooms: {},
  direction: {},
  status: {},
  date: { order: DATE_ORDERS },
  phone: {},
  text: {},
};

/** Phép mặc định của từng trường — cùng bảng cho lần nhập và cửa gõ tay. */
export const FIELD_TRANSFORM: Readonly<Record<StandardField, Transform>> = {
  unitNumber: { name: "unit_code" },
  buildingName: { name: "text" },
  subdivisionName: { name: "text" },
  floor: { name: "floor" },
  livingArea: { name: "area" },
  bedroomsTotal: { name: "bedrooms" },
  directionFaces: { name: "direction" },
  listPrice: { name: "price", params: { unit: "auto" } },
  feeInclusion: { name: "fee_condition" },
  standardStatus: { name: "status" },
  ownerName: { name: "text" },
  ownerPhone: { name: "phone" },
  floorPrice: { name: "price", params: { unit: "auto" } },
  listAgentName: { name: "text" },
  privateRemarks: { name: "text" },
  confirmedDate: { name: "date", params: { order: "auto" } },
};

const keep = (value: Value, also?: Partial<Record<StandardField, Value>>): Outcome => (also ? { mark: "keep", value, also } : { mark: "keep", value });
const fixed = (value: Value, reason: string, also?: Partial<Record<StandardField, Value>>): Outcome =>
  also ? { mark: "fixed", value, reason, also } : { mark: "fixed", value, reason };
const hoi = (reason: string): Outcome => ({ mark: "needs_person", reason });
const chan = (reason: string): Outcome => ({ mark: "blocked", reason });

const chu = (c: Cell): string => (c === null ? "" : typeof c === "number" ? String(c) : c.normalize("NFC").replace(/\s+/g, " ").trim());
const trong = (c: Cell): boolean => chu(c) === "";

// ── Giá ────────────────────────────────────────────────────────────────────────────────────────────────────────────

const DON_VI_COT: Record<Exclude<(typeof PRICE_UNITS)[number], "auto">, { he: number; chu: string; ten: string }> = {
  ty: { he: TY, chu: "tỷ", ten: "tỷ" },
  trieu: { he: TRIEU, chu: "triệu", ten: "triệu" },
  dong: { he: 1, chu: "", ten: "đồng" },
};
const DUOI_PHI = /\s+(kbp|bp|bao phi|khong bao phi|chua phi|gom phi|chua gom phi|da gom phi)$/;
const CO_CHU_DON_VI = /(tỷ|tỉ|ty|ti|triệu|trieu|tr|t)\s*\d{0,3}$/i;

function giaHopLe(dong: number): Outcome | null {
  if (!Number.isFinite(dong) || dong <= 0) return chan("giá phải lớn hơn 0");
  if (dong > GIA_TOI_DA) return chan("giá vượt 1.000 tỷ");
  return null;
}

/** Số trần đọc theo đơn vị của cột; `auto` chỉ nhận số đủ đồng (từ 1 triệu) — số nhỏ không rõ đơn vị thì hỏi người. */
function soTheoDonVi(so: string, unit: (typeof PRICE_UNITS)[number]): number | null {
  if (unit === "auto" || unit === "dong") {
    const r = docGia(so);
    return r.ok ? r.dong : null;
  }
  const r = docGia(`${so} ${DON_VI_COT[unit].chu}`);
  return r.ok ? r.dong : null;
}

export function price(raw: Cell, params: { unit: (typeof PRICE_UNITS)[number] }): Outcome {
  if (trong(raw)) return keep(null);
  const unit = params.unit;
  if (typeof raw === "number") {
    if (unit === "auto" || unit === "dong") {
      const loi = giaHopLe(raw);
      if (loi) return loi;
      if (!Number.isSafeInteger(raw)) return hoi(`«${raw}» không phải số đồng nguyên`);
      if (raw < TRIEU) return hoi(`«${raw}» quá nhỏ để là số đồng — đơn vị chưa rõ`);
      return keep(raw);
    }
    if (raw <= 0) return chan("giá phải lớn hơn 0");
    const dong = soTheoDonVi(String(raw), unit);
    if (dong === null) return raw * DON_VI_COT[unit].he > GIA_TOI_DA ? chan("giá vượt 1.000 tỷ") : hoi(`không đọc được giá «${raw}»`);
    return keep(dong);
  }
  const s = chu(raw);
  const f = fold(s);
  if (/^(tl|thuong luong|thoa thuan|lien he)$/.test(f)) return hoi(`«${s}»: giá chưa có số`);
  if (/(thu ve|ve tay)/.test(f)) return hoi(`«${s}»: giá về tay chủ — cần người quy ra giá chào (luật 12)`);
  if (/\d\s*(-|–|—|~|đến|den)\s*\d/.test(s.toLowerCase())) return hoi(`«${s}»: dải giá — cần người chọn một giá`);
  let also: Partial<Record<StandardField, Value>> | undefined;
  let phan = s;
  const duoi = DUOI_PHI.exec(f);
  if (duoi) {
    const phi = lookupAlias("feeInclusion", duoi[1]!, FEE_ALIASES);
    if (phi) {
      also = { feeInclusion: phi };
      phan = s.slice(0, s.length - duoi[0].length).trim();
    }
  }
  const coDonVi = CO_CHU_DON_VI.test(fold(phan));
  const docO = coDonVi ? docGia(phan) : null;
  const dong = docO ? (docO.ok ? docO.dong : null) : soTheoDonVi(phan, unit);
  if (dong === null) {
    // Số trần ngoài khoảng của docGia: phân biệt «quá lớn» (chặn) với «không đọc được» (hỏi).
    const n = Number(phan.replace(/[.,\s]/g, ""));
    if (!coDonVi && /^[\d.,\s]+$/.test(phan) && Number.isFinite(n) && n === 0) return chan("giá phải lớn hơn 0");
    return hoi(`không đọc được giá «${s}»`);
  }
  const lyDo: string[] = [];
  if (also) lyDo.push(`tách điều kiện phí «${duoi![1]!.toUpperCase()}» sang cột phí`);
  if (coDonVi && unit !== "auto") {
    const dvO = /(trieu|tr)/.test(fold(phan)) ? "trieu" : "ty";
    if (dvO !== unit) lyDo.push(`ô ghi đơn vị khác cột (${DON_VI_COT[unit].ten}) — đọc theo đơn vị trong ô`);
  }
  return lyDo.length ? fixed(dong, lyDo.join("; "), also) : keep(dong, also);
}

/** Ô đọc theo cách gõ đã duyệt của sàn (hàng 70): máy sửa có lý do, để bước xem trước hiện «chữ gốc → giá trị chuẩn». */
const TU_DIEN_SAN = "theo từ điển của sàn";

// ── Điều kiện phí, trạng thái, hướng ───────────────────────────────────────────────────────────────────────────────

export function feeCondition(raw: Cell, ctx?: Pick<ImportContext, "companyAliases">): Outcome {
  if (trong(raw)) return keep(null);
  const s = chu(raw);
  if (/(thu ve|ve tay)/.test(fold(s))) return hoi(`«${s}»: giá về tay chủ — cần người quy ra giá chào và điều kiện phí (luật 12)`);
  const san = lookupAlias("feeInclusion", s, null, ctx?.companyAliases);
  if (san) return fixed(san, TU_DIEN_SAN);
  const v = lookupAlias("feeInclusion", s, FEE_ALIASES);
  return v ? keep(v) : hoi(`«${s}» không phải điều kiện phí đã biết`);
}

export function status(raw: Cell, ctx?: Pick<ImportContext, "companyAliases">): Outcome {
  if (trong(raw)) return keep(null);
  const s = chu(raw);
  const san = lookupAlias("standardStatus", s, null, ctx?.companyAliases);
  if (san) return fixed(san, TU_DIEN_SAN);
  const v = lookupAlias("standardStatus", s, STATUS_ALIASES);
  return v ? keep(v) : hoi(`«${s}» không phải trạng thái đã biết`);
}

export function direction(raw: Cell, ctx?: Pick<ImportContext, "companyAliases">): Outcome {
  if (trong(raw)) return keep(null);
  const s = chu(raw);
  const san = lookupAlias("directionFaces", s, null, ctx?.companyAliases);
  if (san) return fixed(san, TU_DIEN_SAN);
  const v = readDirection(s);
  return v ? keep(v) : hoi(`«${s}» không phải hướng đã biết`);
}

// ── Diện tích, tầng, phòng ngủ ──────────────────────────────────────────────────────────────────────────────────────

const DIEN_TICH_TOI_DA = 10_000;

export function area(raw: Cell): Outcome {
  if (trong(raw)) return keep(null);
  let n: number;
  let ghi: string | null = null;
  if (typeof raw === "number") n = raw;
  else {
    const s = chu(raw);
    const m = /^(\d+(?:[.,]\d+)?)\s*(m2|m²|m)?\s*(\((tt|thong thuy|tim tuong|tt\.)\))?$/.exec(fold(s).replace("m²", "m2"));
    if (!m) return hoi(`không đọc được diện tích «${s}»`);
    n = Number(m[1]!.replace(",", "."));
    if (m[4]) ghi = m[4].startsWith("tim") ? "tim tường" : "thông thuỷ";
  }
  if (!(n > 0)) return chan("diện tích phải lớn hơn 0");
  if (n > DIEN_TICH_TOI_DA) return hoi(`diện tích ${n} m² quá lớn — kiểm lại đơn vị`);
  return ghi === "tim tường" ? fixed(n, "diện tích ghi tim tường — danh mục dùng thông thuỷ") : keep(n);
}

export function floor(raw: Cell): Outcome {
  if (trong(raw)) return keep(null);
  if (typeof raw === "number") return Number.isInteger(raw) && raw > -10 && raw < 200 ? keep(raw) : hoi(`tầng «${raw}» không hợp lệ`);
  const s = chu(raw);
  const m = /^(?:t|tang|l|lau)?\s*(\d{1,3})$/.exec(fold(s));
  if (m) return keep(Number(m[1]));
  if (/^\d{1,3}[a-z]$/i.test(s)) return hoi(`tầng «${s}» — dự án bỏ số tầng, cần người đối chiếu danh mục`);
  return hoi(`không đọc được tầng «${s}»`);
}

export function bedrooms(raw: Cell): Outcome {
  if (trong(raw)) return keep(null);
  if (typeof raw === "number") return Number.isInteger(raw) && raw >= 0 && raw <= 20 ? keep(raw) : hoi(`số phòng ngủ «${raw}» không hợp lệ`);
  const s = chu(raw);
  const f = fold(s).replace(/\s+/g, "");
  if (/^(studio|st)$/.test(f)) return keep(0);
  const m = /^(\d{1,2})(?:pn|n|phongngu)?(?:\d{1,2}(?:wc|vs|vsinh))?(\+\d)?$/.exec(f);
  if (!m) return hoi(`không đọc được số phòng ngủ «${s}»`);
  const n = Number(m[1]);
  return m[2] ? fixed(n, `«${s}»: ghi ${n} phòng ngủ, phần «${m[2]}» cần ghi vào ghi chú`) : keep(n);
}

// ── Mã căn ──────────────────────────────────────────────────────────────────────────────────────────────────────────

const chiMuc = new WeakMap<CatalogData, CatalogIndex>();
function chiMucCua(catalog: CatalogData): CatalogIndex {
  let i = chiMuc.get(catalog);
  if (!i) {
    i = buildCatalogIndex(catalog);
    chiMuc.set(catalog, i);
  }
  return i;
}

export function unitCode(raw: Cell, ctx?: Pick<ImportContext, "catalog">): Outcome {
  if (trong(raw)) return keep(null);
  const s = chu(raw);
  if (ctx?.catalog) {
    const r = lookupUnit(chiMucCua(ctx.catalog), s);
    if (r.status === "found") return r.unit.unitNumber === s ? keep(s) : fixed(r.unit.unitNumber, `đọc «${s}» thành ${r.unit.unitNumber}`);
    if (r.status === "not_in_catalog") return hoi(`${r.read[0]!.unitNumber}: chưa có trong danh mục`);
    if (r.status === "ambiguous") return hoi(`«${s}» khớp ${r.candidates.length} căn — cần người chọn toà`);
    return hoi(`không đọc được mã căn «${s}» (mẫu ${r.status === "unreadable" ? (r.examples[0]?.example ?? "") : ""})`);
  }
  for (const rule of UNIT_CODE_RULES) {
    const p = readUnitCode(rule, s);
    if (p) return p.unitNumber === s ? keep(s) : fixed(p.unitNumber, `đọc «${s}» thành ${p.unitNumber}`);
  }
  return hoi(`không đọc được mã căn «${normalizeCode(s)}» theo cách đọc của dự án nào`);
}

// ── Ngày ────────────────────────────────────────────────────────────────────────────────────────────────────────────

const NGAY_EXCEL_GOC = Date.UTC(1899, 11, 30);
const iso = (y: number, m: number, d: number) => `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
function coThat(y: number, m: number, d: number): boolean {
  const nhuan = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const soNgay = [31, nhuan ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  return y >= 1 && soNgay !== undefined && d >= 1 && d <= soNgay;
}

/** Thứ tự ngày / tháng của cả cột: ô có phần đầu > 12 → ngày trước; phần giữa > 12 → tháng trước; không ô nào → ngày trước (Việt Nam). */
export function inferDateOrder(cells: readonly Cell[]): "dmy" | "mdy" {
  let dmy = false;
  let mdy = false;
  for (const c of cells) {
    if (typeof c !== "string") continue;
    const m = /^(\d{1,2})[/.-](\d{1,2})(?:[/.-]\d{2,4})?$/.exec(c.trim());
    if (!m) continue;
    if (Number(m[1]) > 12) dmy = true;
    if (Number(m[2]) > 12) mdy = true;
  }
  return mdy && !dmy ? "mdy" : "dmy";
}

export function date(raw: Cell, params: { order: (typeof DATE_ORDERS)[number] }, ctx: Pick<ImportContext, "today">): Outcome {
  if (trong(raw)) return keep(null);
  let y: number;
  let m: number;
  let d: number;
  let lyDo: string | null = null;
  if (typeof raw === "number") {
    if (!Number.isInteger(raw) || raw < 1 || raw > 2_958_465) return hoi(`số «${raw}» không phải ngày`);
    const t = new Date(NGAY_EXCEL_GOC + raw * 86_400_000);
    [y, m, d] = [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()];
  } else {
    const s = chu(raw);
    const isoM = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
    const vn = /^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2}|\d{4}))?$/.exec(s);
    if (isoM) [y, m, d] = [Number(isoM[1]), Number(isoM[2]), Number(isoM[3])];
    else if (vn) {
      if (vn[3] === undefined) return hoi(`«${s}» thiếu năm`);
      const [a, b] = [Number(vn[1]), Number(vn[2])];
      const order = params.order === "auto" ? (a > 12 ? "dmy" : b > 12 ? "mdy" : "dmy") : params.order;
      [d, m] = order === "dmy" ? [a, b] : [b, a];
      y = Number(vn[3]);
      if (vn[3].length === 2) {
        y += 2000;
        lyDo = `năm hai chữ số «${vn[3]}» đọc là ${y}`;
      }
    } else return hoi(`không đọc được ngày «${s}»`);
  }
  if (!coThat(y, m, d)) return hoi(`ngày ${iso(y, m, d)} không có thật`);
  const v = iso(y, m, d);
  if (v > ctx.today) return chan(`ngày ${v} sau hôm nay`);
  return lyDo ? fixed(v, lyDo) : keep(v);
}

// ── Số điện thoại, chữ ──────────────────────────────────────────────────────────────────────────────────────────────

export function phone(raw: Cell): Outcome {
  if (trong(raw)) return keep(null);
  const s = chu(raw);
  const n = normalizePhone(s);
  return n ? keep(n) : hoi("số điện thoại không đọc được (cần số Việt Nam 10 chữ số)");
}

export function text(raw: Cell): Outcome {
  return trong(raw) ? keep(null) : keep(chu(raw));
}

/** Chạy một phép của thực đơn. */
export function runTransform(t: Transform, raw: Cell, ctx: ImportContext): Outcome {
  switch (t.name) {
    case "price":
      return price(raw, t.params);
    case "fee_condition":
      return feeCondition(raw, ctx);
    case "area":
      return area(raw);
    case "unit_code":
      return unitCode(raw, ctx);
    case "floor":
      return floor(raw);
    case "bedrooms":
      return bedrooms(raw);
    case "direction":
      return direction(raw, ctx);
    case "status":
      return status(raw, ctx);
    case "date":
      return date(raw, t.params, ctx);
    case "phone":
      return phone(raw);
    case "text":
      return text(raw);
  }
}
