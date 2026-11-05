// Mở số chủ của căn mình giữ (hàng 39): gọi cửa mở số chủ của API — mỗi lần máy chủ ghi một vết. Số chỉ sống trong trạng
// thái của dòng, không ghi xuống máy (Tham chiếu luật 32).
import { LOI_MO_SO, type KetQuaMoSo } from "../mo-so";

export const LOI_KHONG_SO = "Căn chưa có số chủ — mở hồ sơ để ghi số.";

/** Gọi `POST /api/v1/listings/{id}/owner/phone-reveal`; `goi` bơm được để bài kiểm thay fetch. */
export async function moSoChu(id: string, goi: typeof fetch = fetch): Promise<KetQuaMoSo> {
  const r = await goi(`/api/v1/listings/${encodeURIComponent(id)}/owner/phone-reveal`, { method: "POST", credentials: "same-origin" }).catch(() => null);
  if (!r) return { ok: false, loi: LOI_MO_SO.matMang };
  if (r.ok) {
    const j = (await r.json().catch(() => null)) as { ownerPhone?: unknown } | null;
    return typeof j?.ownerPhone === "string" && j.ownerPhone ? { ok: true, so: j.ownerPhone } : { ok: false, loi: LOI_KHONG_SO };
  }
  if (r.status === 403 || r.status === 404) return { ok: false, loi: LOI_KHONG_SO };
  if (r.status === 401) return { ok: false, loi: LOI_MO_SO.hetPhien };
  return { ok: false, loi: LOI_MO_SO.khac };
}
