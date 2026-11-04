/**
 * Số đo trên dữ kiện lead (hàng 52): lead → cuộc gọi đầu, lead → Sẵn sàng bán, lead trùng bị chặn. Lead cần gọi là mọi
 * lead nhập trong kỳ trừ căn trùng (tin bổ sung, không có cuộc gọi của lead) và lead đã bỏ — gồm cả lead chưa chia và lead
 * đã trả lại: chỗ dòng vào nghẽn phải hiện trong số «chưa».
 */
import type { GiaTriSoDo, LeadVao } from "./kieu";
import { trongKy, type Ky } from "./hang";

const PHUT_MS = 60 * 1000;
const NGAY_MS = 24 * 60 * PHUT_MS;
const motChuSo = (x: number) => Math.round(x * 10) / 10;

/** Trung vị của một dãy đã xếp tăng; dãy chẵn lấy trung bình hai số giữa, dãy rỗng là `null`. */
export function trungVi(xep: readonly number[]): number | null {
  if (!xep.length) return null;
  const g = Math.floor(xep.length / 2);
  return xep.length % 2 ? xep[g]! : (xep[g - 1]! + xep[g]!) / 2;
}

const truocDen = (ky: Ky, iso: string | null) => iso !== null && Date.parse(iso) < ky.den;

/** Lead cần gọi, xét tại `den`: không phải căn trùng, chưa bỏ trước `den` (bỏ sau `den` vẫn trong nhóm của kỳ). */
export const leadCanGoi = (l: LeadVao, ky: Ky) => l.outcome !== "unit_has_open_listing" && !truocDen(ky, l.discardedAt);

/** Lúc lead về một đầu chủ: mốc chia; lead chủ trùng về đầu chủ ngay lúc nhập nên không có mốc chia. */
const lucChia = (l: LeadVao) => l.routedAt ?? (l.matchedAgentUserId !== null ? l.createdAt : null);

/** Một chủ nhà qua chuỗi gửi lại: lead đầu (lúc nhập của chuỗi), lead cuối (mốc hiện tại) và cuộc gọi đầu sớm nhất. */
export type ChuoiLead = { dau: LeadVao; cuoi: LeadVao; goiDau: string | null };

const somHon = (a: string | null, b: string | null) => (a === null ? b : b === null ? a : Date.parse(b) < Date.parse(a) ? b : a);

/**
 * Chuỗi gửi lại (luật 37 · Ngoài-5 hàng 52): lead trả lại rồi gửi lại nối qua `resubmittedLeadId` là một chủ nhà. Xét tại
 * `den`: lead đã gửi lại trước `den` nối vào lead nó trỏ tới; mỗi chuỗi một phần tử, kèm cuộc gọi đầu sớm nhất của mọi lead
 * trong chuỗi (kể cả cuộc gọi của đầu chủ đã trả lại). Lead trỏ tới không có trong dữ liệu vào thì chuỗi dừng ở lead trước.
 */
export function chuoiGuiLai(lead: readonly LeadVao[], ky: Ky): ChuoiLead[] {
  const theoId = new Map(lead.map((l) => [l.id, l]));
  const tiep = (l: LeadVao) => (l.resubmittedLeadId !== null && truocDen(ky, l.resubmittedAt) ? (theoId.get(l.resubmittedLeadId) ?? null) : null);
  const coTruoc = new Set(lead.map(tiep).filter((n): n is LeadVao => n !== null).map((n) => n.id));
  const ra: ChuoiLead[] = [];
  for (const dau of lead) {
    if (coTruoc.has(dau.id)) continue;
    let cuoi = dau;
    let goiDau = dau.firstCalledAt;
    const da = new Set([dau.id]);
    for (let n = tiep(cuoi); n !== null && !da.has(n.id); n = tiep(cuoi)) {
      da.add(n.id);
      cuoi = n;
      goiDau = somHon(goiDau, n.firstCalledAt);
    }
    ra.push({ dau, cuoi, goiDau });
  }
  return ra;
}

/**
 * Thời lượng từ lúc nhập tới một mốc, mỗi chủ nhà một lần (chuỗi gửi lại): kỳ và gốc thời gian là lúc nhập lead đầu chuỗi,
 * trạng thái lấy ở lead cuối. Mốc vắng hay từ `den` trở đi là chưa tới. «Chưa» tách ba phần — đã trả lại, chưa chia, đã
 * chia — đều xét tại `den` (việc từ `den` trở đi không đổi số), để ngưỡng đặt trên phần nào cũng được.
 */
export function thoiLuongLead(lead: readonly LeadVao[], ky: Ky, moc: (c: ChuoiLead) => string | null, donVi: "phut" | "ngay"): GiaTriSoDo {
  const don = donVi === "phut" ? PHUT_MS : NGAY_MS;
  const giaTri: number[] = [];
  const chiTiet = { chuaChia: 0, daChia: 0, traLai: 0 };
  for (const c of chuoiGuiLai(lead, ky)) {
    const l = c.cuoi;
    if (!trongKy(ky, c.dau.createdAt) || !leadCanGoi(l, ky)) continue;
    const m = moc(c);
    if (m === null || Date.parse(m) >= ky.den) {
      if (truocDen(ky, l.returnedAt)) chiTiet.traLai++;
      else if (truocDen(ky, lucChia(l))) chiTiet.daChia++;
      else chiTiet.chuaChia++;
    }
    else giaTri.push(motChuSo((Date.parse(m) - Date.parse(c.dau.createdAt)) / don));
  }
  giaTri.sort((a, b) => a - b);
  const chua = chiTiet.chuaChia + chiTiet.daChia + chiTiet.traLai;
  return { kieu: "thoi-luong", donVi, n: giaTri.length, trungVi: trungVi(giaTri), giaTri, chua, chiTiet };
}

/** Lead nhập trong kỳ mà kiểm trùng không ra «mới»: căn trùng và chủ trùng đếm riêng. */
export function leadTrungBiChan(lead: readonly LeadVao[], ky: Ky): GiaTriSoDo {
  const chiTiet: Record<string, number> = { unit_has_open_listing: 0, owner_has_agent: 0 };
  for (const l of lead) {
    if (trongKy(ky, l.createdAt) && l.outcome !== "new") chiTiet[l.outcome] = (chiTiet[l.outcome] ?? 0) + 1;
  }
  return { kieu: "dem", so: Object.values(chiTiet).reduce((a, b) => a + b, 0), chiTiet };
}
