import type { DungLuong } from "./claude";

type Gia = { vao: number; ra: number; docDem: number; ghiDem: number };
/** Giá USD mỗi token theo mô hình (ADR-0011 qđ 3): vào, ra, đọc đệm (×0,05), ghi đệm (×1,25). */
export const GIA_THEO_MO_HINH: Readonly<Record<string, Gia>> = {
  "claude-opus-5-5": { vao: 4e-6, ra: 20e-6, docDem: 0.2e-6, ghiDem: 5e-6 },
  "claude-haiku-5-5": { vao: 0.1e-6, ra: 0.5e-6, docDem: 0.005e-6, ghiDem: 0.125e-6 },
};
/** Giá Claude Opus 5.5 — đường đề xuất cột (hàng 68). */
export const GIA = GIA_THEO_MO_HINH["claude-opus-5-5"]!;

/** Bảng giá của mô hình đã gọi — mô hình trả về có thể kèm hậu tố ngày («claude-haiku-5-5-20261001»); lạ thì giá Opus (an toàn: không tính rẻ hơn thật). */
export function giaCua(model: string): Gia {
  const k = Object.keys(GIA_THEO_MO_HINH).find((m) => model === m || model.startsWith(`${m}-`) || model.startsWith(`${m} `));
  return k ? GIA_THEO_MO_HINH[k]! : GIA;
}

/** Tiền một lần gọi theo bảng giá của mô hình, làm tròn 6 chữ số (khớp cột `numeric(10, 6)` của `ai_usage`). */
export function tinhTien(u: DungLuong, model = "claude-opus-5-5"): number {
  const g = giaCua(model);
  const t = u.input_tokens * g.vao + u.output_tokens * g.ra + (u.cache_read_input_tokens ?? 0) * g.docDem + (u.cache_creation_input_tokens ?? 0) * g.ghiDem;
  return Math.round(t * 1e6) / 1e6;
}
