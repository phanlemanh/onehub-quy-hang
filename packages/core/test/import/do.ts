/**
 * Bốn số đo của Kiến trúc «Nhập dữ liệu» §9 trên bộ thử, chế độ tất định (không AI) — SỐ NỀN mà Cổng Đáng hàng 68 đọc:
 * - ghepCot: cột ghép đúng đích đáp án / tổng cột;
 * - loiDuocSua: lỗi cấy mà đầu ra sửa đúng hay đưa người / tổng lỗi cấy;
 * - loiLot: ô «giữ nguyên» mà giá trị sai đáp án / tổng ô sẽ ghi (giữ nguyên + máy sửa);
 * - hoiNguoi: ô «cần người» / tổng ô;
 * cộng roNguon: số chuỗi cấm (nguồn, dữ liệu cá nhân) có mặt trong hồ sơ cột — phải 0.
 */
import { applyPlan, type ApplyResult } from "../../src/import/apply";
import { classifyColumns } from "../../src/import/classify";
import { decodeText, parseCsv, readTable, type Table } from "../../src/import/grid";
import { planFromDictionary, type ImportPlan } from "../../src/import/plan";
import { buildProfile, type Profile } from "../../src/import/profile";
import type { ImportContext, Value } from "../../src/import/transforms";
import { danhMucMau, HOM_NAY, sinhBoThu, type DapAn, type TepThu } from "./sinh";

export type TiSo = { tu: number; mau: number };
export type SoDo = { ghepCot: TiSo; loiDuocSua: TiSo; loiLot: TiSo; hoiNguoi: TiSo; roNguon: TiSo };
export type SoNen = { ghi_chu: string; hom_nay: string; tep: Record<string, SoDo>; cong: SoDo };

export type ChayTep = { table: Table; plan: ImportPlan; profile: Profile; applied: ApplyResult };

export function chay(t: TepThu, ctx: ImportContext): ChayTep {
  const grid = t.grid ?? parseCsv(decodeText(t.bytes!));
  const table = readTable(grid);
  const profile = buildProfile(table, classifyColumns(table));
  const plan = planFromDictionary(table);
  return { table, plan, profile, applied: applyPlan(table, plan, ctx) };
}

/** Hai giá trị bằng nhau theo đáp án: số so đúng (diện tích lệch dưới 0,001), chữ so sau NFC và cắt khoảng trắng. */
export function bang(a: Value | undefined, b: Value): boolean {
  if (a === undefined) return false;
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-3;
  if (a === null || b === null) return a === b;
  return String(a).normalize("NFC").trim() === String(b).normalize("NFC").trim();
}

export function doTep(t: TepThu, r: ChayTep): SoDo {
  const da: DapAn = t.dapAn;
  const ghepCot = { tu: da.targets.filter((x, i) => r.plan.columns[i]?.target === x).length, mau: da.targets.length };
  const theoDong = new Map(r.applied.rows.map((x) => [x.source, x]));
  let tong = 0;
  let hoi = 0;
  let ghi = 0;
  let lot = 0;
  da.dong.forEach((src, k) => {
    const row = theoDong.get(src);
    da.targets.forEach((target, cot) => {
      tong++;
      const o = row?.cells[cot];
      if (!o) return;
      if (o.mark === "needs_person") hoi++;
      if (target === "ignore_with_reason") return;
      if (o.mark === "keep" || o.mark === "fixed") {
        ghi++;
        if (o.mark === "keep" && !bang(o.value, da.dung[k]![cot]!)) lot++;
      }
    });
  });
  const sua = da.loiCay.filter((l) => {
    const o = theoDong.get(da.dong[l.dong]!)?.cells[l.cot];
    if (!o) return false;
    if (l.ask) return o.mark === "needs_person" || o.mark === "blocked";
    return o.mark === "needs_person" || ((o.mark === "keep" || o.mark === "fixed") && bang(o.value, l.value ?? null));
  }).length;
  const hoSo = JSON.stringify(r.profile);
  const roNguon = { tu: da.camLo.filter((s) => hoSo.includes(s)).length, mau: da.camLo.length };
  return { ghepCot, loiDuocSua: { tu: sua, mau: da.loiCay.length }, loiLot: { tu: lot, mau: ghi }, hoiNguoi: { tu: hoi, mau: tong }, roNguon };
}

const cong = (a: TiSo, b: TiSo): TiSo => ({ tu: a.tu + b.tu, mau: a.mau + b.mau });

/** Số nền trọn bộ — cùng hàm cho lệnh ghi `so-nen.json` và bài so tệp đã commit. */
export function tinhSoNen(): SoNen {
  const ctx: ImportContext = { today: HOM_NAY, catalog: danhMucMau() };
  const tep: Record<string, SoDo> = {};
  let tongCong: SoDo | null = null;
  for (const t of sinhBoThu()) {
    const s = doTep(t, chay(t, ctx));
    tep[t.ten] = s;
    tongCong = tongCong
      ? { ghepCot: cong(tongCong.ghepCot, s.ghepCot), loiDuocSua: cong(tongCong.loiDuocSua, s.loiDuocSua), loiLot: cong(tongCong.loiLot, s.loiLot), hoiNguoi: cong(tongCong.hoiNguoi, s.hoiNguoi), roNguon: cong(tongCong.roNguon, s.roNguon) }
      : s;
  }
  return {
    ghi_chu: "Số nền chế độ tất định (không AI) của lõi nhập, hàng 64 — tính bằng packages/core/test/import/do.ts; ghi lại bằng `node --import tsx packages/core/test/import/ghi-so-nen.ts`. Ngưỡng do Cổng Đáng hàng 68 đặt.",
    hom_nay: HOM_NAY,
    tep,
    cong: tongCong!,
  };
}

export const SO_NEN_URL = new URL("../../../../_acceptance/nhap-loi-tat-dinh/so-nen.json", import.meta.url);
