/**
 * Bộ kiểm bộ nhóm của sàn (hàng 22, AC-4) và bộ đọc từ `company_settings`. Kiểm chặt: một chỗ sai là cả bộ của sàn bị
 * bỏ, dùng bộ mặc định — không áp nửa bộ. Lỗi gọi tên chỗ sai để màn sửa bộ nhóm (hàng 48) và lối ghi API nói lại.
 */
import { LEAD_SIDE_STATES, LEAD_STAGES } from "../dedupe/lead-stage";
import { STANDARD_STATUSES } from "../listing/status";
import { PROPERTY_SUBTYPE_FIELDS } from "../catalog/property-type";
import type { BoNhom } from "./kieu";
import { LEAD_ACTIONS, LISTING_ACTIONS } from "./kieu";
import { boMacDinh, NHAN_TOI_DA, QUEUE_DAY_RANGES, QUEUE_DEFAULT_DAYS, QUEUE_GROUPS_KEY, QUEUE_LEGACY_KEYS } from "./mac-dinh";

const KHOA_NHOM = ["code", "label", "subject", "enabled", "conditions", "actions"];
const KHOA_DIEU_KIEN: Record<string, string[]> = {
  status_in: ["kind", "in"],
  days_since: ["kind", "anchor", "days"],
  missing_info: ["kind"],
  changed_by_other: ["kind", "since"],
  property_sub_type_in: ["kind", "in"],
  lead_stage_in: ["kind", "in"],
};
const DIEU_KIEN_LEAD = new Set(["lead_stage_in"]);
const ANCHORS = ["price", "confirmed", "active_since", "price_or_confirmed"];
const LEAD_STATES: readonly string[] = [...LEAD_STAGES, ...LEAD_SIDE_STATES];
const SUBTYPES = Object.keys(PROPERTY_SUBTYPE_FIELDS);

/**
 * Chữ do sàn gõ có mang số điện thoại hay email không — nhãn không được thành chỗ ghi số chủ nhà (bất biến 2, ADR-0011).
 * Số: từ 9 chữ số liền nhau sau khi bỏ khoảng trắng, chấm, gạch, ngoặc, dấu cộng. Bộ dò chung là việc của hàng 90.
 */
export function chuaSoHayEmail(s: string): boolean {
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(s)) return true;
  return /\d{9,}/.test(s.replace(/[\s.()+-]/g, ""));
}

const laMang = (v: unknown): v is unknown[] => Array.isArray(v);
const laDoiTuong = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Lỗi của một bộ nhóm thô; rỗng là hợp lệ. Mỗi lỗi nêu nhóm (theo vị trí hay mã) và khoá sai. */
export function kiemBoNhom(raw: unknown): string[] {
  const loi: string[] = [];
  if (!laMang(raw) || raw.length === 0) return ["bộ nhóm phải là mảng có ít nhất một nhóm"];
  const ma = new Set<string>();
  let coLead = false;
  raw.forEach((n, i) => {
    const ten = `nhóm ${i + 1}${laDoiTuong(n) && typeof n.code === "string" ? ` (${n.code})` : ""}`;
    if (!laDoiTuong(n)) return void loi.push(`${ten}: không phải đối tượng`);
    for (const k of Object.keys(n)) if (!KHOA_NHOM.includes(k)) loi.push(`${ten}: key lạ «${k}»`);
    if (typeof n.code !== "string" || !/^[a-z][a-z0-9_]{1,39}$/.test(n.code)) loi.push(`${ten}: code phải là chữ thường tiếng Anh, gạch dưới`);
    else if (ma.has(n.code)) loi.push(`${ten}: code trùng «${n.code}»`);
    else ma.add(n.code);
    if (typeof n.label !== "string" || !n.label.trim()) loi.push(`${ten}: label trống`);
    else if (n.label.length > NHAN_TOI_DA) loi.push(`${ten}: label quá ${NHAN_TOI_DA} ký tự`);
    else if (chuaSoHayEmail(n.label)) loi.push(`${ten}: label chứa số điện thoại hay email`);
    if (n.subject !== "listing" && n.subject !== "lead") return void loi.push(`${ten}: subject phải là listing hay lead`);
    if (typeof n.enabled !== "boolean") loi.push(`${ten}: enabled phải là true/false`);
    const laLead = n.subject === "lead";
    if (laLead) coLead = true;
    if (!laMang(n.conditions)) loi.push(`${ten}: conditions phải là mảng`);
    else
      for (const d of n.conditions) {
        if (!laDoiTuong(d) || typeof d.kind !== "string" || !KHOA_DIEU_KIEN[d.kind]) {
          loi.push(`${ten}: kind ngoài từ vựng «${laDoiTuong(d) ? String(d.kind) : "?"}»`);
          continue;
        }
        const khoaHopLe = KHOA_DIEU_KIEN[d.kind] ?? [];
        for (const k of Object.keys(d)) if (!khoaHopLe.includes(k)) loi.push(`${ten}: ${d.kind} có key lạ «${k}»`);
        if (DIEU_KIEN_LEAD.has(d.kind) !== laLead) loi.push(`${ten}: subject ${n.subject} không nhận điều kiện ${d.kind}`);
        if (d.kind === "status_in") {
          if (!laMang(d.in) || !d.in.length || !d.in.every((s) => (STANDARD_STATUSES as readonly unknown[]).includes(s))) loi.push(`${ten}: status_in ngoài sáu trạng thái chuẩn`);
          else if (d.in.every((s) => s === "Closed" || s === "Withdrawn")) loi.push(`${ten}: status_in chỉ gồm Đã bán / Ngừng bán — nhóm luôn rỗng`);
        }
        if (d.kind === "days_since") {
          if (!ANCHORS.includes(d.anchor as string)) loi.push(`${ten}: days_since anchor ngoài từ vựng`);
          const khoang = n.code === "price_adjustment" || n.code === "call_back" ? QUEUE_DAY_RANGES[n.code] : QUEUE_DAY_RANGES.khac;
          if (!Number.isInteger(d.days) || (d.days as number) < khoang.min || (d.days as number) > khoang.max)
            loi.push(`${ten}: days phải là số nguyên ${khoang.min}–${khoang.max}`);
        }
        if (d.kind === "changed_by_other" && d.since !== "yesterday" && d.since !== "today") loi.push(`${ten}: changed_by_other since phải là yesterday hay today`);
        if (d.kind === "property_sub_type_in" && (!laMang(d.in) || !d.in.length || !d.in.every((s) => SUBTYPES.includes(s as string))))
          loi.push(`${ten}: property_sub_type_in ngoài tập mã PropertySubType`);
        if (d.kind === "lead_stage_in" && (!laMang(d.in) || !d.in.length || !d.in.every((s) => LEAD_STATES.includes(s as string))))
          loi.push(`${ten}: lead_stage_in ngoài các nấc lead`);
      }
    const hopLe: readonly string[] = laLead ? LEAD_ACTIONS : LISTING_ACTIONS;
    if (!laMang(n.actions)) loi.push(`${ten}: actions phải là mảng`);
    else for (const a of n.actions) if (!hopLe.includes(a as string)) loi.push(`${ten}: actions «${String(a)}» ngoài thực đơn của subject ${n.subject}`);
  });
  if (!coLead) loi.push("bộ nhóm thiếu nhóm lead");
  return loi;
}

export type BoNhomDangAp = { bo: BoNhom; nguon: "mac-dinh" | "san"; loi: string[] };

const ngayCu = (v: unknown, k: { min: number; max: number }) => (Number.isInteger(v) && (v as number) >= k.min && (v as number) <= k.max ? (v as number) : null);

/** Bộ nhóm đang áp của sàn từ các dòng `company_settings`: bộ của sàn hợp lệ, hay bộ mặc định (ngưỡng từ khoá cũ). */
export function docBoNhom(rows: readonly { key: string; value: unknown }[]): BoNhomDangAp {
  const cu = (k: string) => rows.find((r) => r.key === k)?.value;
  const macDinh = boMacDinh({
    priceAdjustment: ngayCu(cu(QUEUE_LEGACY_KEYS.priceAdjustment), QUEUE_DAY_RANGES.price_adjustment) ?? QUEUE_DEFAULT_DAYS.priceAdjustment,
    callBack: ngayCu(cu(QUEUE_LEGACY_KEYS.callBack), QUEUE_DAY_RANGES.call_back) ?? QUEUE_DEFAULT_DAYS.callBack,
  });
  const dong = rows.find((r) => r.key === QUEUE_GROUPS_KEY);
  if (!dong) return { bo: macDinh, nguon: "mac-dinh", loi: [] };
  const loi = kiemBoNhom(dong.value);
  return loi.length ? { bo: macDinh, nguon: "mac-dinh", loi } : { bo: dong.value as BoNhom, nguon: "san", loi: [] };
}
