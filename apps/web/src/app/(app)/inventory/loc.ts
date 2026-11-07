/**
 * Lọc và sắp Bảng hàng — chuyển thể `sheet-query.ts` của khối data-grid-editing-6 thành hàm thuần: mỗi ô lọc một điều
 * kiện, các ô AND với nhau; luật số không đọc được thì bỏ qua (ô báo đỏ). Không gọi mạng: chạy trên kho trên máy.
 */
import { parseNumberExpression, type ExpressionResult } from "./bieu-thuc-so";
import type { TuVung } from "@quy-hang/core/labels";
import { COT, COT_THEO_ID, STATUS_LABEL, chuCuaO, giaTriChon, type CotId, type DongBang } from "./cot";
import { laCotRieng } from "./truong-rieng";

export type BoLocCot = Partial<Record<CotId, string>>;
export type QuySap = { id: string; desc: boolean }[];

/** Bỏ dấu, thường hoá — «Đông» khớp «dong», «A-1» khớp «a-1». */
export const boDau = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

export function docBieuThuc(loc: BoLocCot): Map<CotId, ExpressionResult> {
  const m = new Map<CotId, ExpressionResult>();
  for (const c of COT) {
    const raw = loc[c.id];
    if (c.kind === "so" && raw) m.set(c.id, parseNumberExpression(raw));
  }
  return m;
}

/** Cột số có luật gõ sai — ô lọc báo đỏ, không lọc gì. */
export function locSai(loc: BoLocCot): Set<CotId> {
  return new Set([...docBieuThuc(loc)].filter(([, r]) => r.state === "invalid").map(([id]) => id));
}

export function soOLocDangChay(loc: BoLocCot): number {
  const bt = docBieuThuc(loc);
  return COT.filter((c) => loc[c.id] && (c.kind !== "so" || bt.get(c.id)?.state === "valid")).length + Object.keys(loc).filter((k) => laCotRieng(k) && loc[k as CotId]).length;
}

function dieuKien(loc: BoLocCot): ((d: DongBang) => boolean)[] {
  const bt = docBieuThuc(loc);
  // Trường riêng (hàng 47): lọc «chọn» trên chữ thô của giá trị.
  const rieng = Object.entries(loc).flatMap(([k, raw]) => (laCotRieng(k) && raw ? [(d: DongBang) => giaTriChon(d, k) === raw] : []));
  return [...rieng, ...COT.flatMap((c) => {
    const raw = loc[c.id];
    if (!raw) return [];
    if (c.kind === "so") {
      const r = bt.get(c.id);
      if (r?.state !== "valid") return [];
      const scale = c.scale ?? 1;
      return [
        (d: DongBang) => {
          const v = d[c.id];
          return typeof v === "number" && r.test(v / scale);
        },
      ];
    }
    if (c.kind === "chon") return [(d: DongBang) => giaTriChon(d, c.id) === raw];
    const kim = boDau(raw.trim());
    return [(d: DongBang) => boDau(chuCuaO(d, c.id)).includes(kim)];
  })];
}

export function locDong(dong: readonly DongBang[], loc: BoLocCot): DongBang[] {
  const dk = dieuKien(loc);
  return dk.length ? dong.filter((d) => dk.every((f) => f(d))) : [...dong];
}

const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });

/** Sắp theo quy đầu tiên; ô trống luôn xuống cuối. Cột số so số, cột khác so chữ hiện. */
export function sapDong(dong: DongBang[], sap: QuySap, tv?: TuVung | null): DongBang[] {
  const q = sap[0];
  const c = q ? (COT_THEO_ID.get(q.id as CotId) ?? (laCotRieng(q.id) ? ({ id: q.id, kind: "chon" } as const) : undefined)) : undefined;
  if (!q || !c) return dong;
  const huong = q.desc ? -1 : 1;
  return dong
    .map((d) => ({ d, k: c.kind === "so" ? d[c.id] : d[c.id] === null ? null : chuCuaO(d, c.id, tv) }))
    .sort((a, b) => {
      if (a.k === null || a.k === undefined) return b.k === null || b.k === undefined ? 0 : 1;
      if (b.k === null || b.k === undefined) return -1;
      const o = typeof a.k === "number" && typeof b.k === "number" ? a.k - b.k : collator.compare(String(a.k), String(b.k));
      return o * huong;
    })
    .map(({ d }) => d);
}

/** Lựa chọn của ô chọn: giá trị chuẩn có trong dữ liệu (lọc theo giá trị chuẩn), chữ và thứ tự theo chữ hiện của sàn. */
export function luaChon(dong: readonly DongBang[], id: CotId, tv?: TuVung | null): { value: string; label: string }[] {
  const m = new Map<string, string>();
  for (const d of dong) {
    const v = giaTriChon(d, id);
    // Cột Trạng thái: lựa chọn hiện nhãn mặc định của trạng thái chuẩn, không nhãn riêng của căn đầu tiên (hàng 46, Hỏi-4).
    if (v) m.set(v, id === "standardStatus" ? STATUS_LABEL[d.standardStatus] : chuCuaO(d, id, tv));
  }
  return [...m].map(([value, label]) => ({ value, label })).sort((a, b) => collator.compare(a.label, b.label));
}
