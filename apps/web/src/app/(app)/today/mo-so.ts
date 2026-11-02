// Mở số của lead ở Hôm nay (hàng mo-so-lead): gọi cửa mở số của API, viết số theo nhóm, dựng liên kết gọi. Số chỉ sống
// trong trạng thái của dòng — mô-đun này không ghi gì xuống máy (không localStorage, sessionStorage, IndexedDB).

/** Số `0xxxxxxxxx` từ mọi dạng người hay máy viết (dấu cách, +84, 84). Không nhận ra thì chuỗi gốc bỏ khoảng trắng. */
function soChuan(so: string): string {
  const s = so.replace(/[\s.-]/g, "");
  if (/^\+84\d{9}$/.test(s)) return `0${s.slice(3)}`;
  if (/^84\d{9}$/.test(s)) return `0${s.slice(2)}`;
  return s;
}

/** Viết số theo nhóm 4 · 3 · 3 cho dễ đọc khi gọi: `0900 000 011`. */
export function chuSo(so: string): string {
  const s = soChuan(so);
  return /^0\d{9}$/.test(s) ? `${s.slice(0, 4)} ${s.slice(4, 7)} ${s.slice(7)}` : s;
}

/** Liên kết gọi: điện thoại mở bàn phím gọi, máy tính mở ứng dụng gọi mặc định. */
export const telHref = (so: string) => `tel:${soChuan(so)}`;

export type KetQuaMoSo = { ok: true; so: string } | { ok: false; loi: string };

export const LOI_MO_SO = {
  matMang: "Mất mạng — chưa mở được số, thử lại khi có mạng.",
  khongCon: "Lead này không còn của bạn.",
  hetPhien: "Hết phiên đăng nhập — đăng nhập lại rồi thử.",
  khac: "Chưa mở được số — thử lại.",
} as const;

/** Gọi `POST /api/v1/leads/{id}/phone-reveal`; `goi` bơm được để bài kiểm thay fetch. Mỗi lần gọi máy chủ ghi một vết. */
export async function moSo(id: string, goi: typeof fetch = fetch): Promise<KetQuaMoSo> {
  const r = await goi(`/api/v1/leads/${encodeURIComponent(id)}/phone-reveal`, { method: "POST", credentials: "same-origin" }).catch(() => null);
  if (!r) return { ok: false, loi: LOI_MO_SO.matMang };
  if (r.ok) {
    const j = (await r.json().catch(() => null)) as { ownerPhone?: unknown } | null;
    return typeof j?.ownerPhone === "string" ? { ok: true, so: j.ownerPhone } : { ok: false, loi: LOI_MO_SO.khac };
  }
  if (r.status === 403 || r.status === 404) return { ok: false, loi: LOI_MO_SO.khongCon };
  if (r.status === 401) return { ok: false, loi: LOI_MO_SO.hetPhien };
  return { ok: false, loi: LOI_MO_SO.khac };
}
