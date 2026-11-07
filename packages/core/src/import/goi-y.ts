/**
 * Gợi ý giá trị chuẩn và từ điển của sàn (hàng 70, ADR-0011 quyết định 12, Kiến trúc «Nhập dữ liệu» §12). Ba trường tập
 * đóng có từ điển ở lõi: trạng thái, điều kiện phí, hướng. Thuần, tất định, không gọi dịch vụ ngoài: chữ gập khớp từ điển
 * của sàn → từ điển dựng sẵn → giá trị chuẩn; không khớp thì gợi tối đa ba giá trị có khoảng cách chữ nhỏ.
 */
import { kiemChuNhan, NHAN_TOI_DA } from "../labels";
import { FEE_INCLUSIONS } from "../listing/events";
import { STANDARD_STATUSES } from "../listing/status";
import { DIRECTIONS, FEE_ALIASES, STATUS_ALIASES, fold, lookupAlias, readDirection, type CompanyAlias } from "./dictionaries";

/** Ba trường có từ điển của sàn. Không trường lớp `source` nào (bảng `company_value_aliases` chặn thêm). */
export const TRUONG_TU_DIEN = ["standardStatus", "feeInclusion", "directionFaces"] as const;
export type TruongTuDien = (typeof TRUONG_TU_DIEN)[number];
export const laTruongTuDien = (v: unknown): v is TruongTuDien => typeof v === "string" && (TRUONG_TU_DIEN as readonly string[]).includes(v);

/** Tập giá trị chuẩn của từng trường. */
export const GIA_TRI_CHUAN: Readonly<Record<TruongTuDien, readonly string[]>> = {
  standardStatus: STANDARD_STATUSES,
  feeInclusion: FEE_INCLUSIONS,
  directionFaces: DIRECTIONS,
};

/** Khoảng cách chữ tối đa cho gợi ý gần đúng, và số gợi ý tối đa. */
export const KHOANG_CACH_TOI_DA = 2;
export const GOI_Y_TOI_DA = 3;

const DUNG_SAN: Readonly<Record<TruongTuDien, ReadonlyMap<string, string> | null>> = {
  standardStatus: STATUS_ALIASES,
  feeInclusion: FEE_ALIASES,
  directionFaces: null,
};

/** Giá trị chuẩn theo từ điển dựng sẵn (không tính từ điển của sàn) — chỗ duy nhất định nghĩa «nghĩa của lõi». */
export function chuanDungSan(field: TruongTuDien, raw: string): string | null {
  const v = lookupAlias(field, raw, DUNG_SAN[field]);
  if (v) return v;
  if (field === "directionFaces") return readDirection(raw);
  const k = fold(raw);
  return GIA_TRI_CHUAN[field].find((c) => fold(c) === k) ?? null;
}

/** Các cặp (chữ gập → giá trị chuẩn) để so gần đúng: cách gõ dựng sẵn, tên chuẩn, và cách gõ đã duyệt của sàn. */
function bangSo(field: TruongTuDien, company: readonly CompanyAlias[]): [string, string][] {
  const ra: [string, string][] = [];
  const dung = DUNG_SAN[field];
  if (dung) for (const [k, v] of dung) ra.push([k, v]);
  if (field === "directionFaces") for (const h of DIRECTIONS) ra.push([fold(h), h]);
  for (const c of GIA_TRI_CHUAN[field]) ra.push([fold(c), c]);
  for (const a of company) if (a.field === field) ra.push([fold(a.raw), a.value]);
  return ra;
}

/** Khoảng cách Levenshtein. */
export function khoangCach(a: string, b: string): number {
  if (a === b) return 0;
  let truoc = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const nay = [i];
    for (let j = 1; j <= b.length; j++) nay[j] = Math.min(truoc[j]! + 1, nay[j - 1]! + 1, truoc[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    truoc = nay;
  }
  return truoc[b.length]!;
}

const coDuLieuCaNhan = (raw: string) => {
  const kq = kiemChuNhan("goi-y", raw.length > NHAN_TOI_DA ? raw.slice(0, NHAN_TOI_DA) : raw);
  return !kq.ok && /số điện thoại|email|số giấy tờ/.test(kq.loi);
};

/**
 * Gợi ý cho một chữ gõ ở trường tập đóng: `khop` là giá trị chuẩn khi chữ khớp đúng (từ điển của sàn trước); không khớp
 * thì `goiY` là tối đa ba giá trị chuẩn có khoảng cách chữ ≤ 2 và ≤ ⌊độ dài/3⌋, xếp theo khoảng cách. Chữ có dữ liệu cá
 * nhân không khớp, không gợi ý.
 */
export function goiYGiaTri(field: TruongTuDien, raw: string, company: readonly CompanyAlias[] = []): { khop: string | null; goiY: string[] } {
  const s = raw.trim();
  if (!s || coDuLieuCaNhan(s)) return { khop: null, goiY: [] };
  const cuaSan = lookupAlias(field, s, null, company);
  const khop = cuaSan ?? chuanDungSan(field, s);
  if (khop) return { khop, goiY: [] };
  const k = fold(s);
  const tran = Math.min(KHOANG_CACH_TOI_DA, Math.floor(k.length / 3));
  if (tran < 1) return { khop: null, goiY: [] };
  const tot = new Map<string, number>();
  for (const [chu, v] of bangSo(field, company)) {
    const d = khoangCach(k, chu);
    if (d <= tran && (tot.get(v) ?? Infinity) > d) tot.set(v, d);
  }
  const thuTu = GIA_TRI_CHUAN[field];
  const goiY = [...tot.entries()]
    .sort((a, b) => a[1] - b[1] || thuTu.indexOf(a[0]) - thuTu.indexOf(b[0]))
    .slice(0, GOI_Y_TOI_DA)
    .map(([v]) => v);
  return { khop: null, goiY };
}

export type CachGoHopLe = { field: TruongTuDien; raw: string; rawFold: string; value: string };

/**
 * Kiểm một đề xuất cách gõ: trường thuộc ba trường, chữ 1–40 ký tự không dữ liệu cá nhân, giá trị thuộc tập chuẩn, và
 * không đụng nghĩa của lõi — chữ đã là cách gõ dựng sẵn hay tên chuẩn thì không thành cách gõ của sàn (Hỏi-4).
 */
export function kiemCachGo(field: unknown, raw: unknown, value: unknown): { ok: true; cachGo: CachGoHopLe } | { ok: false; loi: string } {
  if (!laTruongTuDien(field)) return { ok: false, loi: `trường «${String(field)}» không có từ điển của sàn` };
  const chu = kiemChuNhan("raw", raw);
  if (!chu.ok) return { ok: false, loi: chu.loi };
  if (typeof value !== "string" || !GIA_TRI_CHUAN[field].includes(value)) return { ok: false, loi: `value: «${String(value)}» không phải giá trị chuẩn của ${field}` };
  const loi = chuanDungSan(field, chu.nhan);
  if (loi && loi !== value) return { ok: false, loi: `raw: «${chu.nhan}» đã là cách gõ của «${loi}» — sàn không đổi nghĩa của cách gõ dựng sẵn` };
  if (loi) return { ok: false, loi: `raw: «${chu.nhan}» đã là cách gõ dựng sẵn của «${loi}»` };
  return { ok: true, cachGo: { field, raw: chu.nhan, rawFold: fold(chu.nhan), value } };
}

export type TrangThaiCachGo = "proposed" | "approved" | "rejected";
export type DongCachGo = { field: TruongTuDien; raw: string; value: string; status: TrangThaiCachGo; pickCount: number };

/** Cách gõ đã duyệt → từ điển của sàn cho chuẩn hoá. Đề xuất chưa duyệt và đã bỏ không vào (AC-4). */
export function cachGoDaDuyet(rows: readonly Pick<DongCachGo, "field" | "raw" | "value" | "status">[]): CompanyAlias[] {
  return rows.filter((r) => r.status === "approved" && laTruongTuDien(r.field)).map((r) => ({ field: r.field, raw: r.raw, value: r.value }));
}

export type SucKhoe = { gap: number; daNeo: number; cho: number; daBo: number; lanChon: number };

/** Sức khoẻ dữ liệu theo trường: cách gõ lạ đã gặp, đã neo (duyệt), chờ duyệt, đã bỏ, tổng số lần chọn. */
export function sucKhoeTuDien(rows: readonly Pick<DongCachGo, "field" | "status" | "pickCount">[]): Record<TruongTuDien, SucKhoe> {
  const ra = Object.fromEntries(TRUONG_TU_DIEN.map((f) => [f, { gap: 0, daNeo: 0, cho: 0, daBo: 0, lanChon: 0 }])) as Record<TruongTuDien, SucKhoe>;
  for (const r of rows) {
    if (!laTruongTuDien(r.field)) continue;
    const s = ra[r.field];
    s.gap++;
    s.lanChon += r.pickCount;
    if (r.status === "approved") s.daNeo++;
    else if (r.status === "rejected") s.daBo++;
    else s.cho++;
  }
  return ra;
}
