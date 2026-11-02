// Gọi từ máy tính (hàng 30): máy tính nhờ điện thoại của chính đầu chủ quay số bằng thông báo của hàng 26; điện thoại chạm
// thông báo tới trang quay số, bấm một nút thì mở số (cửa của mo-so-lead, một vết) rồi đưa trình duyệt tới `tel:`.
// Mô-đun này không ghi gì xuống máy (không localStorage, sessionStorage, IndexedDB) và không đổi nấc lead.
import type { Goi } from "@/lib/sync/types";
import { moSo, telHref, type KetQuaMoSo } from "../../../today/mo-so";

export const BAO_QUAY_SO = {
  daGui: (k: number) => `Đã gửi tới ${k} thiết bị khác — chạm thông báo trên điện thoại để gọi`,
  chuaCo: "Chưa có điện thoại nào bật thông báo lead — trên điện thoại mở Hôm nay, bấm Bật thông báo",
  khongCon: "Lead này không còn của bạn",
  hetPhien: "Hết phiên đăng nhập — đăng nhập lại rồi thử",
  matMang: "Mất mạng — chưa gửi được, thử lại khi có mạng",
  khac: "Chưa gửi được — thử lại",
} as const;

export type KetQuaQuaySo = { ok: true; daGui: boolean; bao: string } | { ok: false; loi: string };

/**
 * Gọi `POST /api/v1/leads/{id}/phone-dial`. `endpoint`: điểm đăng ký thông báo của chính trình duyệt này (nếu đã bật) — máy
 * chủ trừ nó ra khi đếm, nên máy tính chỉ bật thông báo không tự báo «đã gửi». Câu báo theo `otherDevices`.
 */
export async function guiQuaySo(id: string, goi: Goi, endpoint: string | null = null): Promise<KetQuaQuaySo> {
  let r: Awaited<ReturnType<Goi>>;
  try {
    r = await goi("POST", `/api/v1/leads/${encodeURIComponent(id)}/phone-dial`, endpoint ? { endpoint } : {});
  } catch {
    return { ok: false, loi: BAO_QUAY_SO.matMang };
  }
  if (r.status === 200) {
    const k = (r.body as { otherDevices?: unknown } | null)?.otherDevices;
    if (typeof k !== "number") return { ok: false, loi: BAO_QUAY_SO.khac };
    return k > 0 ? { ok: true, daGui: true, bao: BAO_QUAY_SO.daGui(k) } : { ok: true, daGui: false, bao: BAO_QUAY_SO.chuaCo };
  }
  if (r.status === 403 || r.status === 404) return { ok: false, loi: BAO_QUAY_SO.khongCon };
  if (r.status === 401) return { ok: false, loi: BAO_QUAY_SO.hetPhien };
  return { ok: false, loi: BAO_QUAY_SO.khac };
}

/** Điểm đăng ký thông báo của trình duyệt này, nếu đã bật; không có service worker hay chưa bật là `null`. */
export async function diemDangKyMayNay(): Promise<string | null> {
  try {
    if (!("serviceWorker" in navigator)) return null;
    const reg = await navigator.serviceWorker.getRegistration("/");
    return (await reg?.pushManager.getSubscription())?.endpoint ?? null;
  } catch {
    return null;
  }
}

/**
 * Nút «Gọi chủ nhà» của trang quay số: mở số trước (máy chủ ghi một vết), có số rồi mới đưa trình duyệt tới `tel:`. Trình
 * duyệt chặn mở ứng dụng gọi thì trang vẫn có số và nút «Gọi» dự phòng. `goi`, `diToi` bơm được cho bài kiểm.
 */
export async function goiChuNha(id: string, goi: typeof fetch = fetch, diToi: (url: string) => void = (u) => window.location.assign(u)): Promise<KetQuaMoSo> {
  const kq = await moSo(id, goi);
  if (kq.ok) diToi(telHref(kq.so));
  return kq;
}
