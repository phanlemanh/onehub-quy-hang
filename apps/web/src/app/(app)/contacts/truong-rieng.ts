// Mục «Trường riêng» ở hồ sơ liên hệ (hàng 47): trường liên hệ còn sống của sàn áp cho loại của người này, chữ giá trị, thân
// lưu. Thuần — bài kiểm đọc được. Ghi qua `PATCH /api/v1/contacts/{id}/custom` (người giữ, trưởng nhóm).
import { boTuThan, chuGiaTri, truongCuaDoiTuong, type TruongRieng } from "@quy-hang/core/custom-fields";

export const CHUA_GHI = "Chưa ghi";

/** Trường áp cho người mang các loại này; không loại nào khớp → rỗng (không hiện mục). */
export const truongCuaNguoi = (bo: readonly TruongRieng[], contactTypes: readonly string[]): TruongRieng[] => truongCuaDoiTuong(bo, "contact", contactTypes);

/** Chữ hiện của một trường ở hồ sơ: giá trị, hay «Chưa ghi». */
export const chuMucTruong = (t: TruongRieng, v: unknown) => chuGiaTri(t, v) || CHUA_GHI;

/** Lựa chọn của ô: giá trị của trường (khoá chữ cho Select) kèm giá trị lưu. */
export function luaChonMuc(t: TruongRieng): { khoa: string; value: boolean | string; label: string }[] {
  return t.kind === "bool"
    ? [{ khoa: "true", value: true, label: "Có" }, { khoa: "false", value: false, label: "Không" }]
    : t.options.map((o) => ({ khoa: o.code, value: o.code, label: o.label }));
}

export const thanPatch = (code: string, v: boolean | string | null) => ({ [code]: v });

type Goi = (u: string, i?: RequestInit) => Promise<Response>;
const goiMacDinh: Goi = (u, i) => fetch(u, { cache: "no-store", ...i });

/** Bộ trường của sàn; đọc lỗi → null (mục không hiện). */
export async function docBoTruong(goi: Goi = goiMacDinh): Promise<TruongRieng[] | null> {
  const r = await goi("/api/v1/company/fields").catch(() => null);
  if (!r?.ok) return null;
  return boTuThan((await r.json().catch(() => null)) as { fields?: unknown[] } | null);
}

export async function ghiTruong(contactId: string, code: string, v: boolean | string | null, goi: Goi = goiMacDinh): Promise<Record<string, unknown> | null> {
  const r = await goi(`/api/v1/contacts/${contactId}/custom`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(thanPatch(code, v)) }).catch(() => null);
  if (!r?.ok) return null;
  return ((await r.json().catch(() => null)) as { custom?: Record<string, unknown> } | null)?.custom ?? null;
}
