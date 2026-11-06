import type { DungLuong } from "./claude";

/** Giá Claude Opus 5.5 (USD mỗi token) — vào 4, ra 20, đọc đệm 0,2, ghi đệm 5 (×1,25) mỗi triệu token. */
export const GIA = { vao: 4e-6, ra: 20e-6, docDem: 0.2e-6, ghiDem: 5e-6 } as const;

/** Tiền một lần gọi, làm tròn 6 chữ số (khớp cột `numeric(10, 6)` của `ai_usage`). */
export function tinhTien(u: DungLuong): number {
  const t = u.input_tokens * GIA.vao + u.output_tokens * GIA.ra + (u.cache_read_input_tokens ?? 0) * GIA.docDem + (u.cache_creation_input_tokens ?? 0) * GIA.ghiDem;
  return Math.round(t * 1e6) / 1e6;
}
