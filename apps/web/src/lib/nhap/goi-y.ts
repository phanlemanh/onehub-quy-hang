// Gợi ý «Ý bạn là» ở bước xem trước (hàng 70): ô «cần người» của ba trường có từ điển (trạng thái, phí, hướng) nhận tối
// đa ba giá trị chuẩn từ lõi (`goiYGiaTri`, cùng từ điển đã duyệt của sàn trong `ctx.companyAliases`). Chọn gợi ý = sửa ô
// như gõ tay (`suaO`) bằng chữ chuẩn lõi đọc được, kèm một đề xuất từ điển (chữ gốc → giá trị chuẩn) gửi máy chủ.
import { cachGoDaDuyet, goiYGiaTri, laTruongTuDien, type CompanyAlias, type DongCachGo, type ImportContext, type TruongTuDien } from "@quy-hang/core/import";
import { TAP_DONG } from "@quy-hang/core/labels";
import { NHAN_TRANG_THAI_MAC_DINH } from "@quy-hang/core/statuses";
import type { Fetch } from "./goi-api";
import { suaO, type TrangThaiNhap } from "./trang-thai";

type Ong = NonNullable<TrangThaiNhap["ong"]>;

/** Chữ chuẩn của một giá trị — chữ người đọc được, và lõi đọc lại đúng giá trị ấy khi sửa ô. */
export function chuGoiY(field: TruongTuDien, value: string): string {
  if (field === "standardStatus") return NHAN_TRANG_THAI_MAC_DINH[value as keyof typeof NHAN_TRANG_THAI_MAC_DINH] ?? value;
  if (field === "feeInclusion") return (TAP_DONG.feeInclusion as Record<string, string>)[value] ?? value;
  return value;
}

export type GoiYO = { field: TruongTuDien; raw: string; goiY: { value: string; chu: string }[] };

/** Gợi ý của một ô ở bước xem trước; ô không «cần người», cột ngoài ba trường, hay không gợi ý được → null. */
export function goiYCuaO(ong: Ong, ctx: Pick<ImportContext, "companyAliases">, source: number, cot: number): GoiYO | null {
  const col = ong.plan.columns[cot];
  const field = col?.target;
  if (!laTruongTuDien(field)) return null;
  const o = ong.dong.find((d) => d.source === source)?.cells.find((c) => c.column === col!.column);
  if (!o || o.mark !== "needs_person" || typeof o.raw !== "string" || !o.raw.trim()) return null;
  const { goiY } = goiYGiaTri(field, o.raw, ctx.companyAliases ?? []);
  if (goiY.length === 0) return null;
  return { field, raw: o.raw.trim(), goiY: goiY.map((value) => ({ value, chu: chuGoiY(field, value) })) };
}

/** Chọn một gợi ý: ô sửa như gõ tay, và trả đề xuất cần gửi máy chủ. */
export function chonGoiY(
  s: TrangThaiNhap,
  source: number,
  cot: number,
  value: string,
  ctx: ImportContext,
): { s: TrangThaiNhap; deXuat: { field: TruongTuDien; raw: string; value: string } | null } {
  if (!s.ong) return { s, deXuat: null };
  const g = goiYCuaO(s.ong, ctx, source, cot);
  const chon = g?.goiY.find((x) => x.value === value);
  if (!g || !chon) return { s, deXuat: null };
  return { s: suaO(s, source, cot, chon.chu, ctx), deXuat: { field: g.field, raw: g.raw, value } };
}

/** Gửi một đề xuất từ điển; lỗi không chặn bước xem trước (ô đã sửa) — trả lý do để màn báo một dòng. */
export async function guiDeXuat(f: Fetch, d: { field: TruongTuDien; raw: string; value: string }): Promise<string | null> {
  try {
    const r = await f("/api/v1/company/value-aliases/proposals", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(d) });
    return r.ok ? null : `Chưa ghi được đề xuất từ điển (${r.status}).`;
  } catch {
    return "Chưa ghi được đề xuất từ điển — kiểm mạng.";
  }
}

/** Cách gõ đã duyệt của sàn, nạp một lần khi mở màn; đọc lỗi thì rỗng (chuẩn hoá theo từ điển dựng sẵn). */
export async function docCachGoDaDuyet(f: Fetch): Promise<CompanyAlias[]> {
  try {
    const r = await f("/api/v1/company/value-aliases");
    if (!r.ok) return [];
    const b = (await r.json()) as { rows?: DongCachGo[] };
    return cachGoDaDuyet(b.rows ?? []);
  } catch {
    return [];
  }
}
