/**
 * Số đo ô lạ (hàng 69, AC-8, E8): áp kế hoạch nền lên bộ ô lạ, dựng gói bằng `dungGoiOLa`, kiểm đề xuất ghi sẵn bằng
 * `kiemDeXuatOLa`, rồi chấm theo đáp án. Năm số: phủ, đúng, bịa, tự ghi, rò nguồn. Tất định — cùng đầu vào cùng số.
 */
import { applyPlan } from "../../../packages/core/src/import/apply";
import { classifyColumns } from "../../../packages/core/src/import/classify";
import { readTable } from "../../../packages/core/src/import/grid";
import { normalizeValue } from "../../../packages/core/src/import/normalize";
import { planFromDictionary } from "../../../packages/core/src/import/plan";
import { buildProfile } from "../../../packages/core/src/import/profile";
import { dungGoiOLa, kiemDeXuatOLa, type GoiOLa } from "../../../packages/core/src/import/ai/o-la";
import { giaBaoPhiTuVeTay } from "../../../packages/core/src/pricing/ve-tay";
import { CAM_LO, luoiOLa, O_LA } from "./bo-o-la";

export const HOM_NAY_O_LA = "2026-11-06";
export const NGUONG = { phu: 0.9, dung: 0.95, bia: 0, tuGhi: 0, roNguon: 0 } as const;
export const MO_HINH_DO = ["claude-opus-5-5", "claude-haiku-5-5"] as const;
export type SoDoOLa = { phu: number; dung: number; bia: number; tuGhi: number; roNguon: number; coDapAn: number; deXuat: number; dungSo: number };

export function chuanBi() {
  const table = readTable(luoiOLa());
  const profile = buildProfile(table, classifyColumns(table)).columns;
  const plan = planFromDictionary(table);
  const ctx = { today: HOM_NAY_O_LA };
  const ap = applyPlan(table, plan, ctx);
  return { table, profile, plan, ctx, ap, goi: dungGoiOLa(profile, plan, ap.rows) };
}

const lam = (x: number) => Math.round(x * 10000) / 10000;

export function tinhSoDoOLa(goi: GoiOLa, dauRa: unknown): SoDoOLa {
  const { table, plan, ctx, ap } = chuanBi();
  const truocJson = JSON.stringify(ap);
  const kq = kiemDeXuatOLa(goi, dauRa, HOM_NAY_O_LA);
  // Tự ghi: áp lại kế hoạch sau khi nhận đề xuất mà người chưa chạm — mọi ô phải y như trước.
  const sau = applyPlan(table, plan, ctx);
  const tuGhi = JSON.stringify(sau) === truocJson ? 0 : 1;
  const theoId = new Map(goi.o.map((o) => [o.id, o]));
  let coDapAn = 0, deXuat = 0, dungSo = 0, bia = 0;
  for (const c of O_LA) {
    const o = goi.o.find((x) => x.giaTri === c.chu);
    const dx = o ? kq.deXuat.find((d) => d.id === o.id) : undefined;
    if (c.dapAn.loai === "doi-chung") {
      if (dx) bia++;
      continue;
    }
    coDapAn++;
    if (!dx || !o) continue;
    deXuat++;
    const r = normalizeValue(o.truong, dx.giaTri, { ...ctx, transform: theoId.get(o.id)!.phep });
    const v = r.mark === "keep" || r.mark === "fixed" ? r.value : null;
    const phi = r.mark === "keep" || r.mark === "fixed" ? r.also?.feeInclusion : undefined;
    const da = c.dapAn;
    const ok =
      da.loai === "dai" ? typeof v === "number" && v >= da.tu && v <= da.den
      : da.loai === "ve-tay" ? (v === da.veTay && phi === "excluded") || (v === giaBaoPhiTuVeTay(da.veTay) && phi === "included")
      : da.loai === "phi-ve-tay" ? v === "excluded"
      : da.chap.includes(v as never);
    if (ok) dungSo++;
  }
  const json = JSON.stringify(goi);
  const roNguon = CAM_LO.filter((s) => json.includes(s)).length;
  return { phu: lam(deXuat / coDapAn), dung: lam(deXuat ? dungSo / deXuat : 0), bia, tuGhi, roNguon, coDapAn, deXuat, dungSo };
}

/** Lỗi của bộ số so ngưỡng — mỗi ngưỡng hụt một câu nêu số và ngưỡng. Rỗng = đạt. */
export function datNguongOLa(s: Pick<SoDoOLa, "phu" | "dung" | "bia" | "tuGhi" | "roNguon">): string[] {
  const loi: string[] = [];
  if (s.phu < NGUONG.phu) loi.push(`phủ ${s.phu} < ${NGUONG.phu}`);
  if (s.dung < NGUONG.dung) loi.push(`đúng ${s.dung} < ${NGUONG.dung}`);
  if (s.bia > NGUONG.bia) loi.push(`bịa ${s.bia} > 0`);
  if (s.tuGhi > NGUONG.tuGhi) loi.push(`tự ghi ${s.tuGhi} > 0`);
  if (s.roNguon > NGUONG.roNguon) loi.push(`rò nguồn ${s.roNguon} > 0`);
  return loi;
}
