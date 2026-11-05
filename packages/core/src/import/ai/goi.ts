/**
 * Gói đề xuất — thứ DUY NHẤT rời Quỹ hàng sang nhà cung cấp AI (hàng 68, ADR-0011 quyết định 2, 6). Dựng từ hồ sơ cột đã
 * che (`buildProfile`) và kế hoạch nền: mọi cột mang tiêu đề, lớp tạm, hình dạng; cột đã ghép thêm đích (để AI không ghép
 * trùng); CHỈ cột chưa ghép thuộc lớp `catalog`/`shareable_listing` mang giá trị (đã qua bộ che của hồ sơ, ≤ 300). Cột
 * nguồn, tên người, chữ tự do, chưa rõ: chỉ tiêu đề và hình dạng. Máy chủ kiểm lại khuôn bằng `kiemKhuonGoi` và quét lại
 * bằng `quetGoi` trước khi gửi.
 */
import type { ColumnClass } from "../classify";
import { isStandardField } from "../fields";
import type { ImportPlan, PlanTarget } from "../plan";
import { MAX_PROFILE_VALUES, type ColumnProfile, type ColumnShape } from "../profile";

export type CotGoi = { cot: number; tieuDe: string; lop: ColumnClass; hinhDang: ColumnShape; dich?: PlanTarget; giaTri?: string[] };
export type GoiDeXuat = { cot: CotGoi[] };

/** Mọi lớp tạm của bộ phân loại — khai bằng `Record` để thêm lớp mới vào `ColumnClass` thì kiểm kiểu đỏ ở đây. */
export const LOP_COT: Readonly<Record<ColumnClass, { moGiaTri: boolean }>> = {
  catalog: { moGiaTri: true },
  shareable_listing: { moGiaTri: true },
  source: { moGiaTri: false },
  person_name: { moGiaTri: false },
  free_text: { moGiaTri: false },
  unknown: { moGiaTri: false },
};
export const DANH_SACH_LOP = Object.keys(LOP_COT) as ColumnClass[];

/** Cột chưa ghép = kế hoạch nền để độ tin thấp («Giữ làm ghi chú», cần người chọn). */
export const laChuaGhep = (plan: ImportPlan, cot: number) => plan.columns[cot]?.confidence === "low";

export function dungGoiDeXuat(profile: readonly ColumnProfile[], plan: ImportPlan): GoiDeXuat {
  return {
    cot: profile.map((p): CotGoi => {
      const chuaGhep = laChuaGhep(plan, p.index);
      const cot: CotGoi = { cot: p.index, tieuDe: p.header, lop: p.cls, hinhDang: { ...p.shape } };
      if (!chuaGhep) cot.dich = plan.columns[p.index]!.target;
      else if (LOP_COT[p.cls].moGiaTri && p.values?.length) cot.giaTri = p.values.slice(0, MAX_PROFILE_VALUES);
      return cot;
    }),
  };
}

/** Chỉ số các cột chưa ghép — cột AI được đề xuất. */
export const cotChuaGhep = (goi: GoiDeXuat): number[] => goi.cot.filter((c) => c.dich === undefined).map((c) => c.cot);

const sapXep = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(sapXep) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sapXep((v as Record<string, unknown>)[k])])) : v;

/** Băm sha-256 (hex) của một giá trị JSON, khoá xếp thứ tự — chạy được trên trình duyệt và máy chủ. */
export async function bamJson(v: unknown): Promise<string> {
  const byte = new TextEncoder().encode(JSON.stringify(sapXep(v)));
  const h = await globalThis.crypto.subtle.digest("SHA-256", byte);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
export const bamGoi = (goi: GoiDeXuat) => bamJson(goi);

// ── Khuôn chặt của gói ở máy chủ (khoá lạ bị từ chối, giá trị ở cột sai lớp bị từ chối) ─────────────────────────────

const KHOA_GOI = ["cot"];
const KHOA_COT = ["cot", "tieuDe", "lop", "hinhDang", "dich", "giaTri"];
const KHOA_HINH: Record<keyof ColumnShape, "so" | "chu"> = {
  rows: "so",
  blanks: "so",
  distinct: "so",
  minLength: "so",
  maxLength: "so",
  charClass: "chu",
  leadingZeroPct: "so",
  withheld: "so",
};
const LOP_KY_TU = ["digits", "letters", "mixed", "empty"];
const laDoiTuong = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const dichHopLe = (t: unknown) => isStandardField(t) || t === "keep_as_note" || t === "ignore_with_reason" || (typeof t === "string" && /^custom:\S.{0,59}$/.test(t));

/** Kiểm gói thân lời gọi máy chủ nhận. Sai → lý do (một câu), không sửa hộ. */
export function kiemKhuonGoi(v: unknown): { goi: GoiDeXuat } | { loi: string } {
  if (!laDoiTuong(v)) return { loi: "gói cần một đối tượng" };
  const la = Object.keys(v).find((k) => !KHOA_GOI.includes(k));
  if (la) return { loi: `khoá lạ «${la}»` };
  if (!Array.isArray(v.cot) || v.cot.length === 0 || v.cot.length > 200) return { loi: "cot cần danh sách 1–200 cột" };
  const daCo = new Set<number>();
  for (const [i, c] of v.cot.entries()) {
    const p = `cot[${i}]`;
    if (!laDoiTuong(c)) return { loi: `${p} cần một đối tượng` };
    const k = Object.keys(c).find((x) => !KHOA_COT.includes(x));
    if (k) return { loi: `${p}: khoá lạ «${k}»` };
    if (!Number.isInteger(c.cot) || (c.cot as number) < 0 || daCo.has(c.cot as number)) return { loi: `${p}.cot cần số cột không trùng` };
    daCo.add(c.cot as number);
    if (typeof c.tieuDe !== "string" || c.tieuDe.length > 200) return { loi: `${p}.tieuDe cần chữ ≤ 200 ký tự` };
    if (typeof c.lop !== "string" || !Object.hasOwn(LOP_COT, c.lop)) return { loi: `${p}.lop lạ` };
    if (!laDoiTuong(c.hinhDang)) return { loi: `${p}.hinhDang cần một đối tượng` };
    for (const [kh, kieu] of Object.entries(KHOA_HINH)) {
      const g = c.hinhDang[kh];
      if (kieu === "so" ? typeof g !== "number" || !Number.isFinite(g) : !LOP_KY_TU.includes(g as string)) return { loi: `${p}.hinhDang.${kh} sai kiểu` };
    }
    if (Object.keys(c.hinhDang).some((x) => !Object.hasOwn(KHOA_HINH, x))) return { loi: `${p}.hinhDang có khoá lạ` };
    if (c.dich !== undefined && !dichHopLe(c.dich)) return { loi: `${p}.dich lạ` };
    if (c.giaTri !== undefined) {
      if (c.dich !== undefined) return { loi: `${p}: cột đã ghép không mang giá trị` };
      if (!LOP_COT[c.lop as ColumnClass].moGiaTri) return { loi: `${p}: cột lớp ${c.lop as string} không được mang giá trị` };
      if (!Array.isArray(c.giaTri) || c.giaTri.length > MAX_PROFILE_VALUES || !c.giaTri.every((x) => typeof x === "string" && x.length <= 200))
        return { loi: `${p}.giaTri cần ≤ ${MAX_PROFILE_VALUES} chữ` };
    }
  }
  return { goi: v as GoiDeXuat };
}
