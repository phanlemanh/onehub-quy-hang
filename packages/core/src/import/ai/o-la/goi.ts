/**
 * Gói ô lạ (hàng 69, Kiến trúc «Nhập dữ liệu» §5 «Ô lạ còn lại»): sau khi áp kế hoạch, các ô bộ chuẩn hoá không đọc được
 * — giá dải, «thu về 4.2», trạng thái lạ — gửi tới nhà cung cấp AI MỘT lần, mỗi ô kèm lý do mã từ chối. Đây là thứ thứ hai
 * (sau gói đề xuất cột của hàng 68) được rời Quỹ hàng, nên luật chặt như gói ấy:
 * - chỉ ô `needs_person` do bộ chuẩn hoá quyết (`by: "normalize"`) — ô do luật cấp dòng mang giá trị của hai ô cùng dòng;
 * - chỉ cột lớp `catalog`/`shareable_listing` (`LOP_COT`) đã ghép vào trường chuẩn cùng lớp;
 * - ô có dáng dữ liệu cá nhân bị loại (cùng bộ dò của hồ sơ cột);
 * - gộp theo (cột, chữ), tối đa `MAX_O_LA` ô theo thứ tự cột rồi dòng.
 * Mỗi ô mang phép biến đổi của cột (thực đơn đóng, không phải dữ liệu) để máy chủ kiểm nghĩa đề xuất bằng đúng phép ấy.
 */
import type { AppliedRow } from "../../apply";
import type { ColumnClass } from "../../classify";
import { detectPersonal, looksLikePersonName } from "../../detect";
import { FIELD_CLASS, isStandardField, type StandardField } from "../../fields";
import { kiemPhep, type ImportPlan, type PlanError } from "../../plan";
import type { ColumnProfile } from "../../profile";
import type { Transform } from "../../transforms";
import { LOP_COT } from "../goi";

export const MAX_O_LA = 300;
/** Trường được mở cho ô lạ: lớp của trường phải là lớp được gửi giá trị. */
const LOP_TRUONG_MO = new Set(["catalog", "shareable_listing"]);

export type OLa = { id: string; cot: number; tieuDe: string; truong: StandardField; giaTri: string; lyDoMa: string; phep?: Transform };
export type GoiOLa = { o: OLa[] };

/** Chữ khoá của một ô: NFC, gọn khoảng trắng — cùng chữ thì cùng một ô gói. */
export const chuO = (raw: string | number | null): string => (raw === null ? "" : String(raw).normalize("NFC").replace(/\s+/g, " ").trim());

/** Lý do mã bỏ đoạn chép lại chữ của ô («X»: … → «ô»: …): chữ đã ở `giaTri`, chép hai lần chỉ làm gói dài gấp đôi. */
export const lyDoGon = (lyDo: string, giaTri: string) => lyDo.split(`«${giaTri}»`).join("«ô»");

/**
 * Ô lạ là chữ tự do nhiều khi kèm người («chủ Nguyễn Văn An giữ»): dáng họ tên ở BẤT KỲ đoạn 2–5 chữ liền nhau nào của ô
 * (không chỉ cả ô như hồ sơ cột), hay một nhãn ngoặc vuông của bộ dò («[Tên]»), là loại ô.
 */
export function chuaHoTen(s: string): boolean {
  const tu = s.normalize("NFC").trim().split(/\s+/);
  if (tu.some((t) => /^\[[^\]]+\]$/.test(t))) return true;
  for (let i = 0; i < tu.length; i++) for (let n = 2; n <= 5 && i + n <= tu.length; n++) if (looksLikePersonName(tu.slice(i, i + n).join(" "))) return true;
  return false;
}
const laCaNhan = (s: string) => detectPersonal(s) !== null || chuaHoTen(s);

/** Trường của cột có được mở cho ô lạ không — lớp cột (bộ phân loại) VÀ lớp trường (đích của kế hoạch) đều phải được mở. */
export function cotMoOLa(cls: ColumnClass, target: unknown): target is StandardField {
  return LOP_COT[cls].moGiaTri && isStandardField(target) && LOP_TRUONG_MO.has(FIELD_CLASS[target]);
}

export function dungGoiOLa(profile: readonly ColumnProfile[], plan: ImportPlan, rows: readonly AppliedRow[]): GoiOLa {
  const lop = new Map(profile.map((p) => [p.index, p]));
  const o: OLa[] = [];
  const daCo = new Set<string>();
  for (const [cot, col] of plan.columns.entries()) {
    const p = lop.get(cot);
    if (!p || !cotMoOLa(p.cls, col.target)) continue;
    for (const row of rows) {
      if (o.length >= MAX_O_LA) return { o };
      const cell = row.cells[cot];
      if (!cell || cell.mark !== "needs_person" || cell.by !== "normalize") continue;
      const giaTri = chuO(cell.raw);
      const khoa = `${cot}\u0000${giaTri}`;
      if (!giaTri || daCo.has(khoa) || laCaNhan(giaTri)) continue;
      daCo.add(khoa);
      o.push({ id: `o${o.length + 1}`, cot, tieuDe: p.header, truong: col.target as StandardField, giaTri, lyDoMa: lyDoGon(cell.reason ?? "", giaTri), ...(col.transform && { phep: col.transform }) });
    }
  }
  return { o };
}

/** (cột, chữ) → id của ô gói — để màn tìm đề xuất cho mọi ô lưới mang cùng chữ. */
export function chiMucOLa(goi: GoiOLa): Map<string, string> {
  return new Map(goi.o.map((x) => [`${x.cot}\u0000${x.giaTri}`, x.id]));
}
export const khoaOLa = (cot: number, raw: string | number | null) => `${cot}\u0000${chuO(raw)}`;

// ── Khuôn chặt của gói ở máy chủ ───────────────────────────────────────────────────────────────────────────────────────

const KHOA_GOI = ["o"];
const KHOA_O = ["id", "cot", "tieuDe", "truong", "giaTri", "lyDoMa", "phep"];
const laDoiTuong = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const chuNgan = (v: unknown, tran: number) => typeof v === "string" && v.length <= tran;

/** Kiểm gói ô lạ máy chủ nhận. Sai → một câu lý do, không sửa hộ. Phép biến đổi kiểm ở `kiemDeXuatOLa` bằng bộ chạy thật. */
export function kiemKhuonGoiOLa(v: unknown): { goi: GoiOLa } | { loi: string } {
  if (!laDoiTuong(v)) return { loi: "gói cần một đối tượng" };
  const la = Object.keys(v).find((k) => !KHOA_GOI.includes(k));
  if (la) return { loi: `khoá lạ «${la}»` };
  if (!Array.isArray(v.o) || v.o.length === 0 || v.o.length > MAX_O_LA) return { loi: `o cần danh sách 1–${MAX_O_LA} ô` };
  const ids = new Set<string>();
  for (const [i, x] of v.o.entries()) {
    const p = `o[${i}]`;
    if (!laDoiTuong(x)) return { loi: `${p} cần một đối tượng` };
    const k = Object.keys(x).find((y) => !KHOA_O.includes(y));
    if (k) return { loi: `${p}: khoá lạ «${k}»` };
    if (typeof x.id !== "string" || !/^o\d{1,3}$/.test(x.id) || ids.has(x.id)) return { loi: `${p}.id cần mã «o<số>» không trùng` };
    ids.add(x.id);
    if (!Number.isInteger(x.cot) || (x.cot as number) < 0) return { loi: `${p}.cot cần số cột` };
    if (!isStandardField(x.truong) || !LOP_TRUONG_MO.has(FIELD_CLASS[x.truong])) return { loi: `${p}.truong không thuộc lớp được mở` };
    if (!chuNgan(x.tieuDe, 200) || !chuNgan(x.giaTri, 200) || !chuNgan(x.lyDoMa, 400) || !(x.giaTri as string).trim()) return { loi: `${p}: chữ rỗng hay quá dài` };
    // Phép kiểm đúng như kế hoạch nhập (`kiemPhep`): tên trong thực đơn, tham số đóng, không khoá lạ — phép lạ không đi tới
    // Claude, và không làm bộ chạy phép sập sau khi đã gọi (hàng 69 vòng 1: t1, t3, t4).
    if (x.phep !== undefined) {
      const loiPhep: PlanError[] = [];
      kiemPhep(x.phep, `${p}.phep`, loiPhep);
      if (loiPhep.length > 0) return { loi: `${loiPhep[0]!.path}: ${loiPhep[0]!.reason}` };
    }
  }
  return { goi: v as GoiOLa };
}
